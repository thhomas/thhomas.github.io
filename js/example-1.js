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
    'ign.angular.control',
    'ign.angular.layer',
    'ign.angular.map',
    'ign.angular.geocoder'
  ])
  .controller('MainCtrl', ['$rootScope', '$scope', '$location', '$http', '$timeout', 'Layer', 'LayerService', 'usSpinnerService', function($rootScope, $scope, $location, $http, $timeout, Layer, LayerService, usSpinnerService) {
	    	
  	
 
}]);
