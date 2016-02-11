'use strict';

/**
 * @ngdoc overview
 * @name example-2
 * @description # example-2
 * 
 * Main module of the example-2.
 */
angular
  .module('example2', [
    'ign.angular.layer',
    'ign.angular.map',
    'ign.angular.geocoder'
  ])
  .controller('MainCtrl', ['$rootScope', '$scope', 'LayerService', function($rootScope, $scope, LayerService) {
    
    $scope.$on('mapready', function(evt, map) {
      var capabilities = [];
      LayerService.getWMTSLayersFromCapabilities('http://wxs.ign.fr/2mqbg0z6cx7ube8gsou10nrt/wmts?Service=WMTS&request=GetCapabilities', capabilities).then(function() {
        if(map.mapId === '1') {
          var layer11 = LayerService.getLayerByIdentifier(capabilities, 'GEOGRAPHICALGRIDSYSTEMS.MAPS');
          map.addLayer(layer11, 0);
          $scope.$broadcast('layerAdded', {
            mapId: '1',
            layer: layer11,
            index: 0
          });

          var layer21 = LayerService.getLayerByIdentifier(capabilities, 'ORTHOIMAGERY.ORTHOPHOTOS');
          map.addLayer(layer21, 1);
          $scope.$broadcast('layerAdded', {
            mapId: '1',
            layer: layer21,
            index: 1
          });
        } else if(map.mapId === '2') {
          var layer12 = LayerService.getLayerByIdentifier(capabilities, 'GEOGRAPHICALGRIDSYSTEMS.MAPS');
          map.addLayer(layer12, 1);
          $scope.$broadcast('layerAdded', {
            mapId: '2',
            layer: layer12,
            index: 1
          });
          
          var layer22 = LayerService.getLayerByIdentifier(capabilities, 'ORTHOIMAGERY.ORTHOPHOTOS');
          map.addLayer(layer22, 0);
          $scope.$broadcast('layerAdded', {
            mapId: '2',
            layer: layer22,
            index: 0
          });
        }
      });
    });
    
}]);
