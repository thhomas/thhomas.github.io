'use strict';

/**
 * @ngdoc overview
 * @name example-1
 * @description # example-1
 * 
 * Main module of the example-1.
 */
angular
  .module('example1', [
    'angularSpinner',
    'ign.angular.layer',
    'ign.angular.map',
    'ign.angular.geocoder'
  ])
  .controller('MainCtrl', ['$rootScope', '$scope', function($rootScope, $scope) {
    $scope.wmtsUrl2 = '\'ign-wmtscapabilities.xml\'';
//    $scope.wmtsUrl2 = '\'http://wxs-i.ign.fr/ifdag24bifbn3mavuxsp5bh4/geoportail/wmts?Service=WMTS&request=GetCapabilities\'';
    //$scope.wmtsUrl2 = '[\'http://services.arcgisonline.com/arcgis/rest/services/World_Imagery/MapServer/WMTS/1.0.0/WMTSCapabilities.xml\', \'http://services.arcgisonline.com/arcgis/rest/services/World_Shaded_Relief/MapServer/WMTS/1.0.0/WMTSCapabilities.xml\']';
    //$scope.wmsUrl1 = '[\'http://wxs-i.ign.fr/ifdag24bifbn3mavuxsp5bh4/geoportail/r/wms?service=WMS&request=GetCapabilities\']';
    var nbLayersSource = 2;
    var iLayerSource = 0;
    $scope.renderer = 'canvas';
    $scope.$on('layersLoaded', function(event, params) {
      if(iLayerSource === nbLayersSource - 1) {
        $scope.getMap().initDisplayControls('vSlider');
        $scope.$on('pointermove', function(event, mapObject, olEvent, mapId) {
          var layerVisible = mapObject.getLayerVisibleUnderMouse(olEvent);
          var layerVisibleName = '';
          if(layerVisible !== undefined && layerVisible.get('ngLayer') !== undefined) {
            layerVisibleName = layerVisible.get('ngLayer').getIdentifier();
          } 
          mapObject.setMouseInfoControlText(layerVisibleName, mapId);
        });
      } else {
        iLayerSource++;
      }
    });

}]);
