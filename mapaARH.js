/* 
* Mapa de ARH con OpenLayers
*/

if (typeof Ocmi == "undefined" || !Ocmi) {
    var Ocmi = {};
}

//Asignar el crs para capas de OCMI
Proj4js.defs["EPSG:4258"] = "+proj=longlat +ellps=GRS80 +no_defs";

//Api para el mapa Bing
var apiKey = "AqTGBsziZHIJYYxgivLBf0hVdrAk9mWO5cQcb8Yux8sW5M8c8opEC2lZqKR1ZZXf";

//Map OL
var map = null;

var AutoSizeAnchored = OpenLayers.Class(OpenLayers.Popup.Anchored, { 'autoSize': true });
var ddlCultivo;
var highlightLayer, featureLayer, ctrlLayerSwitcher;

function resetAmbito(select, tipo) {
    var codigo = select.options[select.selectedIndex].value;
    var ddlGerencias = $('select[id$=ddlGerencias]');
    var ddlProvincias = $('select[id$=ddlProvincias]');
    var ddlDelegaciones = $('select[id$=ddlDelegaciones]');
    var ddlMunicipios = $('select[id$=ddlMunicipios]');

    if (codigo == 0) {
        switch (tipo) {
            case "R":
                ddlGerencias.val("0");
                ddlProvincias.val("0");
                ddlDelegaciones.val("0");
                ddlMunicipios.val("0");
                hacerZoomMBR(0, 0, 0, 0);
                break;
            case "G":
                ddlProvincias.val("0");
                ddlDelegaciones.val("0");
                ddlMunicipios.val("0");
                break;
            case "P":
                ddlDelegaciones.val("0");
                ddlMunicipios.val("0");
                break;
            case "D":
                ddlMunicipios.val("0");
                break;
        }
    }
    else if (tipo == "R") {
        ddlGerencias.val("0");
        ddlProvincias.val("0");
        ddlDelegaciones.val("0");
        ddlMunicipios.val("0");
    }
    __doPostBack(select.id, '');
}

function hacerZoomMBR(xmin, ymin, xmax, ymax) {

    if ((xmin + ymin + xmax + ymax) != 0) {
        var cooBotmLeft = new OpenLayers.LonLat(xmin, ymin);
        var cooTopRight = new OpenLayers.LonLat(xmax, ymax);

        Ocmi.currentMBR = new OpenLayers.Bounds(cooBotmLeft.lon, cooBotmLeft.lat, cooTopRight.lon, cooTopRight.lat).transform(Ocmi.projOcmiETRS89, map.getProjectionObject());
        map.zoomToExtent(Ocmi.currentMBR, true);
    }
    else {
        Ocmi.currentMBR = null;
        map.zoomToExtent(Ocmi.bounds);
    }

}

function getLayerCATASTRO() {
    var urlCatastro = "http://ovc.catastro.meh.es/Cartografia/WMS/ServidorWMS.aspx";

    var capa = new OpenLayers.Layer.WMS(
                'Catastro',
                urlCatastro,
                { layers: 'CATASTRO',
                    srs: 'EPSG:3785',
                    version: '1.1.1',
                    format: 'image/png',
                    transparent: true
                },
                { isBaseLayer: false,
                    transparent: true,
                    visibility: false,
                    buffer: 0,
                    singleTile: true,
                    ratio: 1.5
                });

    return capa;
}

function getLayerAMBITO() {
    var capa = new OpenLayers.Layer.WMS(
			    'Límites Administrativos',
			    Ocmi.URL_WMS, {
			        layers: 'OCMI_CCAA_IGN,OCMI_PROVINCIAS_IGN,OCMI_MUNICIPIOS_IGN',
			        service: 'wms',
			        version: '1.3.0',
			        format: 'image/png',
			        transparent: true,
			        projection: 'EPSG:4258'
			        //                    reproject: 'true'
			    }, {
			        isBaseLayer: false,
			        transparent: true,
			        visibility: false,
			        buffer: 0,
			        singleTile: false,
			        ratio: 1.5
			        //			        sphericalmercatoralias: Ocmi.projOcmiETRS89
			    });

    var options =
                { wmsparams: { 'MAP_TYPE': 'AMBITO'
                }
                };
    capa.mergeNewParams(options.wmsparams);

    return capa;
}

function getLayerARHGeo() {
    var capa = new OpenLayers.Layer.WMS(
		    'ARH',
		    Ocmi.URL_WMS, {
		        layers: 'OCMI_ARH_GEO,Labels_OCMI_ARH_GEO',
		        service: 'wms',
		        version: '1.3.0',
		        format: 'image/png',
		        transparent: true
		    }, {
		        isBaseLayer: false,
		        transparent: true,
		        visibility: false,
		        buffer: 0,
		        singleTile: false,
		        ratio: 1.5
		    });

    var options = { wmsparams: {
        'MAP_TYPE': 'ARH'
    }
    };
    capa.mergeNewParams(options.wmsparams);

    capa.events.register('loadstart', this, showLabelsCultivos);
    //capa.events.register('loadend', this, onloadend);

    return capa;
}

function getLabelInfoARH() {
    //SERVICE=WMS&REQUEST=GETMAP&VERSION=1.3.0&STYLES=&
    var capa = new OpenLayers.Layer.Vector("Cultivos", {
        strategies: [new OpenLayers.Strategy.BBOX()],
        protocol: new OpenLayers.Protocol.HTTP({
            url: [Ocmi.URL_JSON, '?MAP_TYPE=ARH&LAYERS=OCMI_ARH_GEO&QUERY_LAYERS=OCMI_ARH_GEO&ONLY_DATA=TRUE'].join(''),
            format: new OpenLayers.Format.GeoJSON()
        }),
        displayInLayerSwitcher: false, isBaseLayer: false
    });

    return capa;
}

function showLabelsCultivos(event) {
    var idlayer = map.layers.length - 2;
    var layer = map.layers[idlayer];
    if (map.layers[idlayer-1].visibility == false)
        return false;

    var cultivo = $('select[id$=ddlCultivos]').find(":selected").val();

    limpiarLabels(layer);

    if (cultivo != "0") {
        var theFeatures = layer.features;

        for (var i = 0; i < theFeatures.length; i++) {
            var objBounds = theFeatures[i];

            var id = theFeatures[i].attributes["ARH"];
            var vBasico = theFeatures[i].attributes[cultivo];
            var vMedio = theFeatures[i].attributes[cultivo + "_VCM"];
            if (!vBasico)
                vBasico = "---";
            if (!vMedio)
                vMedio = "---";

            var x = parseFloat(theFeatures[i].attributes["pX"]);
            var y = parseFloat(theFeatures[i].attributes["pY"]);
            var ll = new OpenLayers.LonLat(x, y);
            ll.transform(Ocmi.projOcmiETRS89, map.getProjectionObject());
            var objid = OpenLayers.Util.createUniqueID("LABEL_" + i + "_");
            popupClass = AutoSizeAnchored;
            popupContentHTML = '<span id="' + objid + '" class="mypopuphtml"><b>ARH: ' + id + ' (' + cultivo + ') </b></br><b>B:</b> ' + vBasico + ' | <b>M:</b> ' + vMedio + '</span>';

            addLabel(ll, layer, map, popupClass, popupContentHTML);
            layer.popupFlag = true;
        }
    }

}

function addLabel(ll, layer, map, popupClass, popupContentHTML, closeBox, overflow) {

    var feature = new OpenLayers.Feature(layer, ll);
    feature.closeBox = closeBox;
    feature.popupClass = popupClass;
    feature.data.popupContentHTML = popupContentHTML;
    feature.data.overflow = (overflow) ? "auto" : "hidden";

    feature.popup = feature.createPopup(feature.closeBox);
    feature.popup.name = "LABEL_" + layer.id;
    map.addPopup(feature.popup);
    feature.popup.show();
    //opener.document.getElementById(feature.popup.id).onmousedown="dragStart(event, this.div)";
    document.getElementById(feature.popup.id).style.display = "block";
    document.getElementById(feature.popup.id).style.cursor = "pointer";
    document.getElementById(feature.popup.id).style.backgroundColor = "transparent";
    document.getElementById(feature.popup.id).name = feature.popup.name;

    //    feature.popup.events.register("mousedown", feature.popup, function (e) {
    //        dragStart(e, this.id);
    //    });

}

function limpiarLabels(layer) {
    var theFeatures = layer.features;

    if (layer.popupFlag == true) {
        var obj = map.popups;

        var arrLabels = [];
        for (var i = 0; i < obj.length; i++)
            if (obj[i].name == "LABEL_" + layer.id)
                arrLabels[arrLabels.length] = obj[i];

        for (var i = 0; i < arrLabels.length; i++)
            eval(arrLabels[i]).destroy();

        layer.popupFlag = false;
    }
}

function toggleLabels(flag, layer) {
    var obj = map.popups;

    var arrLabels = [];
    for (var i = 0; i < obj.length; i++)
        if (obj[i].name == "LABEL_" + layer.id && flag == 1)                     //"SHOW"
            document.getElementById(obj[i].id).style.display = "block";
        else if (obj[i].name == "LABEL_" + layer.id && flag == -1)                //"HIDE"
            document.getElementById(obj[i].id).style.display = "none";
        else if (obj[i].name == "LABEL_" + layer.id && flag == 0)                //"TOGGLE"
            document.getElementById(obj[i].id).style.display = document.getElementById(obj[i].id).style.display == "block" ? "none" : "block";

}

function ArhSelected(layer) {
    var sel = new OpenLayers.Control.WMSGetFeatureInfo({
        url: Ocmi.URL_WMS,
        title: 'Seleccionar ARH haciendo click',
        layers: [layer],
        //        drillDown: true,
        //        hover: true,
        queryVisible: true,
        format: new OpenLayers.Format.GeoJSON(),
        eventListeners: {
            getfeatureinfo: showInfo
        }
    });

    //Para configurar parametros con WMSGetFeatureInfo utilizaremos vendorParams
    sel.vendorParams = {
        'QUERY_LAYERS': 'OCMI_ARH_GEO',
        'MAP_TYPE': 'ARH',
        'INFO_FORMAT': 'text/json'
    };
    return sel;
}

function showInfo(evt) {
    var datosArh = new OpenLayers.Format.JSON().read(evt.text);
    //debugger;
    if (evt.features && evt.features.length) {
        //console.log(evt.features);
        highlightLayer.destroyFeatures();
        highlightLayer.addFeatures(evt.features);
        highlightLayer.redraw();

        renderDatosARH(datosArh.features[0].properties);
    }
    //else highlightLayer.destroyFeatures();

}

function getCultivo(id) {
    var cultivo = $('select[id$=ddlCultivos]').find("[value='" + id + "']").text();
    return cultivo;
}

function renderDatosARH(values) {
    var html = "<tr><td>Cultivos</td><td>Básico</td><td>Medio</td></tr>";
    var ahr = "";
    for (var key in values) {
        if (key == "ARH") {
            arh = values[key];
        }
        else if (key == "NINTERNO") {
            ninterno = values[key];
        }
        else if (key != "POPDENS" && key.indexOf("_VCM") == -1) {
            html += "<tr><td><b>(" + key + ")</b> " + getCultivo(key) + "</td><td>" + values[key] + "</td>";
        }
        else if (key.indexOf("_VCM") > 0) {
            html += "<td>" + values[key] + "</td></tr>";
            //console.log(key.indexOf("_VCM"));
        }

    }
    document.getElementById('responseText').innerHTML = "<b>ARH: " + arh+ "   NINTERNO: " + ninterno+ "</b><table>" + html + "</table>";
}

function refreshSpanActiveLayer() {
    document.getElementById("activeLyr").innerHTML = 'layer:'+ map.aktLayer + ': '+ map.layers[map.aktLayer].name;
}

function moveLayer(moveFlag, idx) {

    console.log(map.aktLayer);

    if (map.layers[map.aktLayer].isBaseLayer) {
        alert("moving baselayer is not allowed");
        return;
    }
    //setDefaultEditControl();
    var radios = document.getElementsByName('input_aktLayer');


    idx = idx - ctrlLayerSwitcher.baseLayers.length;
    //Achtung : Anpassung bei Verwendung eines BaseLayers!!!
    if (moveFlag == -1 && idx != (radios.length - ctrlLayerSwitcher.baseLayers.length) - 1) { //map.layers.length
        map.setLayerIndex(map.layers[map.aktLayer], map.aktLayer + 1);
        idx = map.aktLayer + 1;
    }
    else if (moveFlag == 1 && idx != 0) {

        map.setLayerIndex(map.layers[map.aktLayer], map.aktLayer - 1);
        idx = map.aktLayer - 1;
    }
    else {return; }

    // map.aktLayer 
    map.aktLayer = idx;
    if (map.layers[map.aktLayer].displayInLayerSwitcher)
        document.getElementsByName('input_aktLayer')[map.aktLayer].checked = true;
        
    //setDefaultEditControl();
}

//var shade = null;
//var maxOpacity = 0.9;
//var minOpacity = 0.1;
//function changeLayerOpacity(e) {
//    debugger;
//    //changeLayerOpacity(byOpacity)
//    shade = map.layers[map.aktLayer];
//    var newOpacity = 100; // (parseFloat(OpenLayers.Util.getElement('opacity').value) + byOpacity).toFixed(1);
//    newOpacity = Math.min(maxOpacity,
//                                  Math.max(minOpacity, newOpacity));
//    //OpenLayers.Util.getElement('opacity').value = newOpacity;
//    shade.setOpacity(newOpacity);
//}


//window.onunload = function () { map.unloadDestroy(); };

window.onload = function () {
    'use strict'; // En esta función el modo estricto está activado

    /* SETUP object OCMI */
    // Url del WMS OCMI
    Ocmi.URL_WMS = "http://localhost:49363/wms.ashx";
    Ocmi.URL_JSON = "http://localhost:49363/Json.ashx";
    // World Geodetic System 1984 projection
    Ocmi.projWGS84 = new OpenLayers.Projection("EPSG:4326");
    // ETRS89 OCMI projection            
    Ocmi.projOcmiETRS89 = new OpenLayers.Projection("EPSG:4258");
    // WGS84 Mercator projection
    Ocmi.projMercator = new OpenLayers.Projection("EPSG:3785");
    //Bounds Spain Map 
    Ocmi.bounds = new OpenLayers.Bounds(-1500000, 3950000, 520000, 5600000);
    //Resolutions Zoom
    Ocmi.resolutions = OpenLayers.Layer.Bing.prototype.serverResolutions.slice(5, 19);
    //Maxima Resolution
    Ocmi.maxResolution = 4891.9698095703125;
    //Actual BBOX
    Ocmi.currentMBR = null;

    /* Configurar libreria OpenLayers */
    OpenLayers.Lang.setCode("es");
    OpenLayers.Lang.es.overlays = 'Capas OCMI';
    OpenLayers.Lang.es.baseLayer = "Capas Base"
    //    OpenLayers.ProxyHost = 'http://localhost:49363';

    /****
    INICIALIZA MAPA
    ****/

    //creates a new openlayers map in the <div> html element id map
    map = new OpenLayers.Map("map", {
        controls: [
        //allows the user pan ability
                    new OpenLayers.Control.Navigation(),
        //displays the pan/zoom bar tools
                    new OpenLayers.Control.PanZoomBar(),
        //displays a layer switcher
        //            new OpenLayers.Control.LayerSwitcher(),
        //allows the user Zoom Window
        //            new OpenLayers.Control.NavToolbar(),
        //displays the scala line 
                    new OpenLayers.Control.ScaleLine(),
        //displays the scala 
        //            new OpenLayers.Control.Scale(),
        //displays the mouse position's coordinates in a <div> html element with
                    new OpenLayers.Control.MousePosition({
                        div: document.getElementById("mapMousePosition"), numdigits: 5
                    })
                ],
        units: 'm',
        projection: Ocmi.projMercator,
        displayProjection: Ocmi.projWGS84
    });
    map.maxExtent = Ocmi.bounds;

    //Url OpenStreetMap
    var url = [
            "http://a.tile.openstreetmap.org/${z}/${x}/${y}.png",
            "http://b.tile.openstreetmap.org/${z}/${x}/${y}.png",
            "http://c.tile.openstreetmap.org/${z}/${x}/${y}.png"
            ];


    /* Creación de capas para el mapa */
    //Capas Base
    var osm = new OpenLayers.Layer.OSM("Cartografía", url,
        { numZoomLevels: 19, isBaseLayer: true, displayInLayerSwitcher: true, zoomOffset: 5, resolutions: Ocmi.resolutions,
            attribution: "&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a>", buffer: 0, transitionEffect: "resize"
        });

    var gsat = new OpenLayers.Layer.Google("Google SATELITE", { type: google.maps.MapTypeId.SATELLITE, 'sphericalMercator': true, minZoomLevel: 4 });

    //Capas Superpuestas
    var wmsCAT = getLayerCATASTRO();
    var wmsAmbito = getLayerAMBITO();
    var wmsARH = getLayerARHGeo();
    var wmsLabels = getLabelInfoARH();

    //Equal Projections
    gsat.projection = osm.projection = wmsCAT.projection = Ocmi.projMercator;




    highlightLayer = new OpenLayers.Layer.Vector("Highlighted Features", {
        displayInLayerSwitcher: false,
        isBaseLayer: false
    });
    /*
    featureLayer = new OpenLayers.Layer.Vector("Features", {
        displayInLayerSwitcher: false,
        isBaseLayer: false,
        styleMap: new OpenLayers.StyleMap({
            pointRadius: "4",
            fillColor: "#666666"
        })
    });
    */

    //Asigna Capas
    map.addLayers([osm, gsat, wmsCAT, wmsAmbito, wmsARH, wmsLabels, highlightLayer]);
/*
    featureLayer.events.on({
        "featureselected": function (event) {
            alert('selected');
        },
        "featureunselected": function (event) {
            alert('unselected');
        }
    });
    */

    //Asigna Controles
    var CtrlSelect = ArhSelected(wmsARH);
    map.addControl(CtrlSelect);
    CtrlSelect.activate();


    var layerSwitcher = new OpenLayers.Control.LayerSwitcher();
    layerSwitcher.ascending = false;
    //layerSwitcher.useLegendGraphics = true;
    map.addControl(layerSwitcher);


    ctrlLayerSwitcher = new OpenLayers.Control.LayerSwitcherRadio();
    ctrlLayerSwitcher.onChangeActiveLayer = function () { refreshSpanActiveLayer() };
    map.addControl(ctrlLayerSwitcher);

    map.events.register("changeactivelayer", map, function () {
        refreshSpanActiveLayer();
    });


//    var slider = new Ext.Slider({
//        renderTo: "slider-id",
//        value: 100,
//        listeners: {
//            change: function (el, val) {
//                base.setOpacity(val / 100);
//            }
//        }
//    });

    

        /***/
    var options = "";
    var toolbar = OpenLayers.Class(OpenLayers.Control.NavToolbar, {
        initialize: function () {
            OpenLayers.Control.NavToolbar.prototype.initialize.apply(this, [options]);
            this.addControls([CtrlSelect]);
        }
    });
    map.addControl(new toolbar());
    map.addControl(new OpenLayers.Control.Scale('mapScale'));
    document.getElementById('mapProjection').innerHTML = map.displayProjection;

    //Asigna Eventos
    map.events.register("changelayer", map, function () {
        var lARH = map.getLayersByName("ARH")[0];
        var lCul = map.getLayersByName("Cultivos")[0];

        if (lARH.visibility == false) {
            toggleLabels(-1, lCul);
        } else { toggleLabels(1, lCul); };
    });

    /* Posiciona Inicio del mapa*/
    map.zoomToExtent(Ocmi.bounds);

    /****
    FINALIZA MAPA
    ****/

}
