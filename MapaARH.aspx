<asp:Content ID="c1" ContentPlaceHolderID="HeadContent" runat="server">

    <style type="text/css">
        #map
        {
            width: 820px;
            height: 670px;
            border: solid 1px #999;
        }
        .mypopuphtml
        {
            padding-left: 5px;
            padding-top: 0px;
            padding-bottom: 0px;
            padding-right: 5px;
            font-family: Arial;
            font-size: 8pt;
            background-color: white;
        }
        #mapStatus
        {
            background-color: #e1e1e1;
            border-left: solid 1px #999;
            border-right: solid 1px #999;
            border-bottom: solid 1px #999;
            float: left;
            font-size: 10px;
            width: 820px;
        }
        #mapStatus div
        {
            float: left;
            display: inline-block;
            padding: 4px 6px 4px 6px;
        }
        #mapOutput sup
        {
            height: 0;
            line-height: 1;
            vertical-align: text-top;
            _vertical-align: text-top;
            position: relative;
            font-size: 8px;
        }
        #slider-id {
            width: 52px;
            margin: 1px;
        }       
    </style>
    
    <link rel="stylesheet" type="text/css" href="js/ext/resources/css/ext-all.css" />
</asp:Content>
<asp:Content ID="C2" ContentPlaceHolderID="MainContent" runat="server">
    <div class="cajaGrisPeque">
        <asp:UpdatePanel ID="UpdatePanel1" runat="server">
            <ContentTemplate>
                <uc:sa ID="ucSeleccionAmbito" runat="server" />
                <div class="fright">
                    <asp:DropDownList ID="ddlCultivos" runat="server" AppendDataBoundItems="true">
                    </asp:DropDownList>
                </div>
            </ContentTemplate>
        </asp:UpdatePanel>
    </div>
    <div id="contenido">
        <div id="divIzquierda" class="fleft">
            <div id="map">
            </div>
            <div id="mapStatus">
                <div id="mapScale" style="border-right: solid 1px #999">
                </div>
                <div id="mapMousePosition" style="min-width: 135px; border-right: solid 1px #999;
                    text-align: center">
                    0.00000, 0.00000</div>
                <div id="mapProjection" style="border-right: solid 1px #999">
                </div>
                <div id="mapOutput">
                </div>
            </div>
        </div>
        <div id="divDerecha" class="fright">
            <div id="info" class="fright">
                active layer : <span id="activeLyr"></span>
                <%--<div id="slider-id"></div>--%>
                <div id="mybuttons" style="background-color: #BBBBBB; border-bottom: 0px solid gray;
                    position: relative; top: 0px; left: 0px; width: 100%;">
                    <center>
                        <table>
                            <tbody>
                                <tr>

                                    <td>
                                        <img id="LayerUp" class="ico" src="imagenes/mapa/dark_arrow1_n.gif" width="16" onclick="moveLayer( 1, map.aktLayer)"
                                            title="active layer one up">
                                    </td>
                                    <td>
                                        <img id="LayerDown" class="ico" src="imagenes/mapa/dark_arrow1_s.gif" width="16" onclick="moveLayer(-1, map.aktLayer)"
                                            title="active layer one down">
                                    </td>
                                    
                                </tr>
                            </tbody>
                        </table>
                    </center>
                </div>                
                <div id="responseText" class="CSSTableGenerator">
                </div>
            </div>
        </div>
    </div>
</asp:Content>
<asp:Content ID="C3" ContentPlaceHolderID="FootContent" runat="server">
    <%--<script src="http://cdn.sencha.io/try/extjs/4.0.7/ext-all.js"></script>--%>
    <script type="text/javascript" charset="utf-8" src="http://cdn.sencha.io/ext/gpl/4.2.1/ext-all-debug.js" ></script>
    <script type="text/javascript" src="http://hslayers.org/lib/source/HS.js"></script>
    <%--<script type="text/javascript" charset="utf-8" src="js/GeoExt.js" ></script>--%>

    <!-- OpenLayers core js -->
    <script language="javascript" type="text/javascript" src="js/OpenLayers-2.13.1/OpenLayers.js"></script>
    <!-- OpenLayers spanish language js -->
    <script language="javascript" type="text/javascript" src="js/OpenLayers-2.13.1/lib/OpenLayers/Lang/es.js"></script>
    <!-- OpenLayers Layers -->
    <%--<script language="javascript" type="text/javascript" src="js/OpenLayers-2.13.1/LayerSwitcher.js"></script>--%>
    <script language="javascript" type="text/javascript" src="js/OpenLayers-2.13.1/LayerSwitcherRadioReg.js"></script>    
    <!-- OpenStreetMap base layer js -->
    <script type="text/javascript" src="http://www.openstreetmap.org/openlayers/OpenStreetMap.js"></script>
    <!-- Google Maps -->
    <script type="text/javascript" src="http://maps.google.com/maps/api/js?v=3.3&sensor=false"></script>
    <!-- Proj4js SpatialReference -->
    <script type="text/javascript" src="js/proj4js-compressed.js"></script>
    
    <!-- Script del Mapa ARH -->
    <script language="javascript" type="text/javascript" src="js/mapaARH.js"></script>
    

</asp:Content>
