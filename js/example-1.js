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
  .controller('MainCtrl', ['$rootScope', '$scope', '$location', '$http', '$timeout', 'Layer', 'LayerService', 'usSpinnerService', function($rootScope, $scope, $location, $http, $timeout, Layer, LayerService, usSpinnerService) {
  $scope.layerIds = ['google', 'mapbox'];
  $scope.displayMode = 'doubleMap';
	    	
  $scope.$on('layerAdded', function(event, layer, index, mapId) {
    if(index === '1') {
      $scope.getMap().initDisplayControls($scope.displayMode);
    }
  });

 
}]);
