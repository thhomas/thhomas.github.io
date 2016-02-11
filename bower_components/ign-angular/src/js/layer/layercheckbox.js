'use strict';

angular.module('ign.angular.layer')
  
  /**
  * @ngdoc directive
  * @name layerCheckbox
  * @param {string} map the map object name in main scope
  * @param {string} index the index of layer 
  * @param {string} wmtsUrl a WMTS GetCapabilities URL where the layer is described
  * @param {string} wmsUrl a WMS GetCapabilities URL where the layer is described
  * @param {string} wfsUrl a WFS GetCapabilities URL where the layer is described
  * @param {string} staticLayer a static layer identifier ['google', 'osm', 'mapbox']
  * @param {string} layerName the layer name
  * @description Provides a checkbox allowing the user to display a layer.
  * # 
  */
  .directive('layerCheckbox', [function() {
    
    return {
      restrict: 'AE',
      scope: {
        mapId: '@mapId',
        index: '@index',
        wmtsUrl: '@wmtsUrl',
        wmsUrl: '@wmsUrl',
        wfsUrl: '@wfsUrl',
        staticLayer: '@staticLayer',
        layerName: '@layerName',
      },
      controller: 'LayerCheckboxController',
      template: '<label class="checkbox"><input type="checkbox" ng-model="layerChecked" ng-change="onLayerCheck(layerChecked)">{{layer.Title}}</label>',
      link: {}
    };
  }])

  /**
  * @ngdoc controller
  * @name LayerCheckboxController
  * @description Controller for layerCheckbox directive
  * # 
  */
  .controller('LayerCheckboxController', ['$scope', 'LayerService', 'usSpinnerService', function($scope, LayerService, usSpinnerService) {
    var wmtsUrl = $scope.$eval($scope.wmtsUrl);
    var wmsUrl = $scope.$eval($scope.wmsUrl);
    var wfsUrl = $scope.$eval($scope.wfsUrl);
    var staticLayer = $scope.$eval($scope.staticLayer);
    $scope.capabilities = [];
    $scope.layersForCurrentExtent = [];


    if(wmtsUrl !== undefined) {
      LayerService.getWMTSLayersFromCapabilities(wmtsUrl, $scope.capabilities).then(function() {
        $scope.$broadcast('layersLoadedFromCapabilities');
      });
    }
    if(wmsUrl !== undefined) {
      LayerService.getWMSLayersFromCapabilities(wmsUrl, $scope.capabilities).then(function() {
        $scope.$broadcast('layersLoadedFromCapabilities');
      });
    }
    if(staticLayer !== undefined) {
      LayerService.getStaticLayerFromList(staticLayer, $scope.capabilities);
      $scope.$broadcast('layersLoadedFromCapabilities');
    }
    if(wfsUrl !== undefined) {
      LayerService.getWFSLayersFromUrl(wfsUrl, $scope.capabilities).then(function() {
        $scope.$broadcast('layersLoadedFromCapabilities');
      });
    }


    $scope.$on('layersLoadedFromCapabilities', function(event) {
      usSpinnerService.stop('layercheckbox');
      // if main controller scope defines layerIds object, it is used to initialize layers
      if($scope.layerName !== undefined) {
        $scope.layer = LayerService.getLayerByIdentifier($scope.capabilities, $scope.layerName);
      }
      
      var extent = event.currentScope.map.getExtent();
      $scope.layersForCurrentExtent = LayerService.getLayersForExtent($scope.capabilities, ol.proj.transformExtent(extent, 'EPSG:3857', 'EPSG:4326'));
      //$scope.$apply();

      // if layer undefined the first layer in the available list is used
      if ($scope.layer === undefined) {
        $scope.layer = $scope.layersForCurrentExtent[0];
      }
      
      $scope.$parent.$broadcast('layersLoaded', {});
    });

    $scope.onLayerCheck = function (bool) {
      if(bool) {
        $scope.map.addLayer($scope.layer);
      } else {
        $scope.map.removeLayer($scope.layer);
      }
    };


  }]);
