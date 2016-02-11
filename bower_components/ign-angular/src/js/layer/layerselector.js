'use strict';

angular.module('ign.angular.layer')
    
  /**
  * @ngdoc directive
  * @name layerSelector
  * @param {string} map the map object name in main scope
  * @param {string} index the index of layer 
  * @param {string} wmtsUrl a WMTS GetCapabilities URL where the layer is described
  * @param {string} wmsUrl a WMS GetCapabilities URL where the layer is described
  * @param {string} wfsUrl a WFS GetCapabilities URL where the layer is described
  * @param {string} staticLayer a static layer identifier ['google', 'osm', 'mapbox']
  * @param {string} layerName the layer name
  * @description Provides a combo box allowing the user to select a layer
  * # 
  */
  .directive('layerSelector', [function() {

    return  {
      restrict: 'AE',
      scope: {
        mapId: '@mapId',
        index: '@index',
        wmtsUrl: '@wmtsUrl',
        wmsUrl: '@wmsUrl',
        staticLayer: '@staticLayer'
      },
      controller: 'LayerSelectorController',
      template: '<select class="form-control ign-layerselector" ng-options="layer.getTitle() group by layer.getType() for layer in layersForCurrentExtent" ng-model="layer" ng-change="onLayerChange(layer)"></select>' +
                '<span us-spinner="{radius:30, width:8, length: 16}" spinner-key="spinner-{{index}}" spinner-start-active="true"></span>',
      link: {
      }
    };
  }])

  /**
  * @ngdoc controller
  * @name LayerSelectorController
  * @description Controller for layerSelector directive
  * # 
  */
  .controller('LayerSelectorController', ['$scope', '$attrs', '$parse', 'LayerService', 'usSpinnerService', function($scope, $attrs, $parse, LayerService, usSpinnerService) {
    var spinnerKey = 'spinner-' + $attrs.index;
    var index = $attrs.index;
    $scope.capabilities = [];
    $scope.layersForCurrentExtent = [];
    
    var mapId = $attrs.mapId;
    if(mapId === undefined) {
      mapId = 'mapDiv';
    }

    LayerService.getWMTSLayersFromCapabilities($scope.$eval($scope.wmtsUrl), $scope.capabilities).then(function() {
      LayerService.getWMSLayersFromCapabilities($scope.$eval($scope.wmsUrl), $scope.capabilities).then(function() {
        LayerService.getStaticLayersFromList($scope.$eval($scope.staticLayer), $scope.capabilities);
        $scope.$broadcast('layersLoadedFromCapabilities');
      }, $scope);
    }, $scope);


    $scope.$on('layersLoadedFromCapabilities', function(event) {
      
      var mapObject = $scope.$parent.getMap(mapId);
      
      usSpinnerService.stop(spinnerKey);

      var extent = mapObject.getExtent();
      $scope.layersForCurrentExtent = LayerService.getLayersForExtent($scope.capabilities, ol.proj.transformExtent(extent, 'EPSG:3857', 'EPSG:4326'));
      
      // if main controller scope defines layerIds object, it is used to initialize layers
      if($scope.$parent.layerIds !== undefined && $scope.$parent.layerIds[index] !== undefined) {
        $scope.layer = LayerService.getLayerByIdentifier($scope.capabilities, $scope.$parent.layerIds[index]);
      } else {
        $scope.layer =  $scope.layersForCurrentExtent[0];
      }

      $scope.initLayer($scope.layer);
      
      $scope.$parent.$broadcast('layersLoaded', $scope.layer, index, mapId);

    });


    $scope.$on('moveend', function(event, olMap, olEvent, mapId) {
      var mapObject = $scope.$parent.getMap(mapId);
      var extent = mapObject.getExtent();
      $scope.layersForCurrentExtent = LayerService.getLayersForExtent($scope.capabilities, ol.proj.transformExtent(extent, 'EPSG:3857', 'EPSG:4326'));
      $scope.$apply();
    });


    $scope.initLayer = function(layerObject) {
      var mapObject = $scope.$parent.getMap(mapId);
      
      mapObject.addLayer(layerObject, index);

      $scope.$parent.$broadcast('layerAdded', $scope.layer, index,  mapId);
    };


    $scope.onLayerChange = function(layerObject) {
      var mapObject = $scope.$parent.getMap(mapId);
      mapObject.updateLayerAt(layerObject, index);

      var layerExtent = layerObject.getExtent();
      
      // if current layer extent contained into current extent, move to current layer extent
      var currentExtent = ol.proj.transformExtent(mapObject.getExtent(), 'EPSG:3857', 'EPSG:4326');
      if(ol.extent.getWidth(layerExtent) < ol.extent.getWidth(currentExtent) && ol.extent.getHeight(layerExtent) < ol.extent.getHeight(currentExtent)) {
        mapObject.moveToExtent(ol.proj.transformExtent(layerExtent, 'EPSG:4326', 'EPSG:3857'));
      }

      $scope.$parent.$broadcast('layerChange', $scope.layer, index,  mapId);

    };
        
  }])
  


;
