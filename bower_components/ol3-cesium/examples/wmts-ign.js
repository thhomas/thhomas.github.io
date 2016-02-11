var parser = new ol.format.WMTSCapabilities();
var map;

// API key valid for 'openlayers.org' and 'localhost'.
// Expiration date is 06/29/2018.
var key = '2mqbg0z6cx7ube8gsou10nrt';

fetch('http://wxs.ign.fr/' + key + '/wmts?Service=WMTS&request' +
    '=GetCapabilities').then(function(response) {
  return response.text();
}).then(function(text) {

  // Building limited layer from capabilities
  var result = parser.read(text);
  var bdOrthoIgn_options = ol.source.WMTS.optionsFromCapabilities(result,
      {layer: 'ORTHOIMAGERY.ORTHOPHOTOS', matrixSet: 'EPSG:3857'});
  bdOrthoIgn_options.crossOrigin = 'anonymous';
  var planIgn_options = ol.source.WMTS.optionsFromCapabilities(result,
      {layer: 'GEOGRAPHICALGRIDSYSTEMS.MAPS', matrixSet: 'EPSG:3857'});
  planIgn_options.crossOrigin = 'anonymous';

  var bdOrthoIgn_layer = new ol.layer.Tile({
    opacity: 1,
    source: new ol.source.WMTS(bdOrthoIgn_options),
    maxResolution: bdOrthoIgn_options.tileGrid.getResolution(
        bdOrthoIgn_options.tileGrid.getMinZoom()) * 2,
    attributions: [new ol.Attribution({
      html: '<a href="http://www.geoportail.fr/" target="_blank">' +
          '<img src="http://api.ign.fr/geoportail/api/js/latest/' +
          'theme/geoportal/img/logo_gp.gif"></a>'
    })]
  });

  var planIgn_layer = new ol.layer.Tile({
    opacity: 1,
    source: new ol.source.WMTS(planIgn_options),
    maxResolution: planIgn_options.tileGrid.getResolution(
        planIgn_options.tileGrid.getMinZoom()) * 2,
    attributions: [new ol.Attribution({
      html: '<a href="http://www.geoportail.fr/" target="_blank">' +
          '<img src="http://api.ign.fr/geoportail/api/js/latest/' +
          'theme/geoportal/img/logo_gp.gif"></a>'
    })]
  });

  map = new ol.Map({
    layers: [
      bdOrthoIgn_layer
    ],
    //renderer: 'webgl',
    target: 'map2d',
    view: new ol.View({
      center: [261465.47, 6250023.51],
      zoom: 8
    })
  });
  

  var ol3d = new olcs.OLCesium({map: map, target: 'map3d'});
  var scene = ol3d.getCesiumScene();
  var terrainProvider = new Cesium.CesiumTerrainProvider({
      url : '//assets.agi.com/stk-terrain/world'
  });
  scene.terrainProvider = terrainProvider;

  ol3d.setEnabled(true);
  
  var layerSelector = document.getElementById('layerSelector');
  layerSelector.addEventListener('change', function() {
    if (layerSelector.value === 'planIgn') {
      map.getLayers().setAt(0, planIgn_layer);
    } else {
      map.getLayers().setAt(0, bdOrthoIgn_layer);
    }
  });

});
