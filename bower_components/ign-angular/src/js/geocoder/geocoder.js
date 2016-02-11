'use strict';

/**
 * @ngdoc module
 * @name ign.angular.geocoder
 * @description
 * # geocoder
 */
angular.module('ign.angular.geocoder', ['ui.bootstrap.typeahead'])

  
  .directive('geocoder', [function() {

    return  {

      restrict: 'AE',
      scope: {
        mapId: '@mapId',
        map: '=mapObject'
      },
      controller: 'GeocoderController',
      template: '<input type="text" class="form-control" placeholder="Rechercher un lieu" uib-typeahead="poi.fulltext for poi in updatePoi($viewValue)" typeahead-on-select="moveToPoi($item, $model, $label)" ng-model="pointOfInterest">',

      link: {
      }
      
    };
  }])
  
  .controller('GeocoderController', ['$attrs', '$http', '$scope', function($attrs, $http, $scope) {
    $scope.updatePoi = function(viewValue) {
      return $http.jsonp($attrs.geocoderurl, {
        params: {
          text: viewValue,
          type: 'PositionOfInterest',
          callback: 'JSON_CALLBACK'
        }
      }).then(function(res){
        var addresses = [];
        angular.forEach(res.data.results, function(item){
          addresses.push(item);
        });
        return addresses;
      });
    };
    
    $scope.moveToPoi = function(item) {
      var scope = this;
      var mapObject = scope.$parent.getMap($attrs.mapId);
      mapObject.moveTo(item.x, item.y, 15);
    };
    
    
  }]);
