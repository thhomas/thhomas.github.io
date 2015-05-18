/*! ign-angular - v0.1.0 - 2015-05-18 */
'use strict';

/**
 * @ngdoc module
 * @name ign.angular.control
 * @description
 * # 
 */
angular.module('ign.angular.control', [])
  .factory('PermalinkControl', ['$compile', function ($compile) {
    
    var handleClick = function(event) {
      
      $('.ol-permalink-menu').css('visibility', $('.ol-permalink-menu').css('visibility') === 'hidden' ? 'visible' : 'hidden');
      if($('.ol-permalink-menu').css('visibility') === 'visible') {
        $('.ol-permalink-button').addClass('ol-button-clicked');
      } else {
        $('.ol-permalink-button').removeClass('ol-button-clicked');
      }
      $('.ol-permalink-button').blur();
      $('.ol-permalink-input').val(document.URL);
      $('.ol-permalink-input').select();
      
    };
    
    
    function PermalinkControl(params, scope) {
      var me = this;
            
      var options = params || {};    

      var permalinkButton = angular.element('<button title="Permalien"><span class="glyphicon glyphicon-link"></span></button>');
      
      var menu = angular.element('<div class="ol-permalink-menu" style="visibility:hidden;"></div>');
      menu.append('<input class="ol-permalink-input">');
      
      var permalinkControl = angular.element('<div class="ol-permalink-control ol-unselectable ol-control"></div>');
      permalinkControl.append(permalinkButton);
      permalinkControl.append(menu);
            
      $(permalinkControl).on('click', handleClick);
            
      ol.control.Control.call(me, {
        element: permalinkControl[0],
        target: options.target
      });
      

    }
    
    ol.inherits(PermalinkControl, ol.control.Control);
    
    
    return PermalinkControl;
  }])
  
  .factory('DisplayControl', ['$compile', function ($compile) {
    
    var handleClick = function(event) {
      
      var scope = event.data;
      var span = {};
      // event target can be either span or button
      if($(event.target).is('button')) {
        span = $(event.target).children('span');
      } else if($(event.target).is('span')) {
        span = $(event.target);
      }

      var groupControl = span.parents('div.ol-display-group-control');
      var vSlider = $('#vertical-slider');
      var hSlider = $('#horizontal-slider');
      
      var clickedMode = '';
      if(span.hasClass('glyphicon-search')) {
        vSlider.css('visibility', 'hidden');
        hSlider.css('visibility', 'hidden');
        clickedMode = 'scope';
        
      } else if(span.hasClass('glyphicon-resize-vertical')) {
        if(vSlider.css('visibility') !== 'visible') {
          vSlider.css('visibility', 'visible');
        } else {
          vSlider.css('visibility', 'hidden');
        }
        hSlider.css('visibility', 'hidden');
        clickedMode = 'vSlider';
        
                
      } else if(span.hasClass('glyphicon-resize-horizontal')) {
        if(hSlider.css('visibility') !== 'visible') {
          hSlider.css('visibility', 'visible');
        } else {
          hSlider.css('visibility', 'hidden');
        }
        vSlider.css('visibility', 'hidden');
        clickedMode = 'hSlider';
        
      } else if(span.hasClass('glyphicon-eye-open')) {
        vSlider.css('visibility', 'hidden');
        hSlider.css('visibility', 'hidden');
        clickedMode = 'clipLayer';
      }
      
      // remove 'ol-button-clicked' class from buttons
      groupControl.children().removeClass('ol-button-clicked');
      // set eye icon to open
      groupControl.children().children('.glyphicon-eye-open').removeClass('glyphicon-eye-close');
      
      if(groupControl.attr('mode') !== clickedMode) {
        groupControl.attr('mode', clickedMode);
        span.parent('button').addClass('ol-button-clicked');
        if(span.hasClass('glyphicon-eye-open')) {
          span.addClass('glyphicon-eye-close');
        }
      } else {
        groupControl.attr('mode', '');
        span.parent('button').blur();
      }
      
      scope.map.enableWebGl((groupControl.attr('mode') === clickedMode));
      scope.map.clipTopLayer(groupControl.attr('mode') === 'clipLayer');
      
      // to make clic directly effective on map
      scope.map.getOlMap().render();
    
    };
    
    
    function DisplayControl(params, scope) {
      var me = this;
            
      var options = params || {};

      var scopeButton = angular.element('<button class="ol-scope" title="Scope"><span class="glyphicon glyphicon-search"></span></button>');
      var verticalSliderButton = angular.element('<button class="ol-display-group-control" title="Swipe vertical"><span class="glyphicon glyphicon-resize-vertical"></span></button>');
      var horizontalSliderButton = angular.element('<button class="ol-display-group-control" title="Swipe horizontal"><span class="glyphicon glyphicon-resize-horizontal"></span></button>');
      var clipButton = angular.element('<button class="ol-clip-layer" title="Masquage"><span class="glyphicon glyphicon-eye-open"></span></button>');
      
      var groupControl = angular.element('<div class="ol-display-group-control ol-unselectable ol-control" mode=""></div>');
      groupControl.append(scopeButton);
      groupControl.append(verticalSliderButton);
      groupControl.append(horizontalSliderButton);
      groupControl.append(clipButton);
      
      $(groupControl).on('click', scope, handleClick);
            
      ol.control.Control.call(me, {
        element: groupControl[0],
        target: options.target
      });
      

    }
    
    ol.inherits(DisplayControl, ol.control.Control);
    
    
    return DisplayControl;
}])

.factory('TuningControl', ['$compile', function ($compile) {
    
    var handleResetClick = function(event) {
      var map = event.data.map;
      var index = event.data.index;
      var layer = map.getOlMap().getLayers().getArray()[index];
      layer.setOpacity(1);
      layer.setBrightness(0);
      layer.setContrast(1);
      layer.setHue(0);
      layer.setSaturation(1);
    };
        
    var handleInput = function(event) {
      var map = event.data.map;
      var index = event.data.index;
      var layer = map.getOlMap().getLayers().getArray()[index];
      if(event.target.id === 'opacitySlider' + index) {
        layer.setOpacity(event.target.value);
      } else if(event.target.id === 'brightnessSlider' + index) {
        layer.setBrightness(event.target.value);
      } else if(event.target.id === 'contrastSlider' + index) {
        layer.setContrast(event.target.value);
      } else if(event.target.id === 'hueSlider' + index) {
        layer.setHue(event.target.value);
      } else if(event.target.id === 'saturationSlider' + index) {
        layer.setSaturation(event.target.value);
      }
    };
        
    var handleClick = function(event) {
      
      var scope = event.data;
      var tuningMenu = $('.ol-tuning-menu');
      var tuningUl= $('.ol-tuning-ul');
      
      if(tuningMenu.css('visibility') !== 'visible') {
        $(tuningUl).empty();
        for ( var i = 0; i < scope.map.getOlMap().getLayers().getArray().length; i++) {
          var item = angular.element('<li></li>');
          item.append('<a>' + scope.map.getOlMap().getLayers().getArray()[i].get('title') + '</a>');
          var resetButton = angular.element('<button><span class="glyphicon glyphicon-repeat"></span></button>');
          $(resetButton).on('click', {
            map: scope.map,
            index: i
          }, handleResetClick);
          item.append(resetButton);
          
          var slidersDiv = angular.element('<div id="tuningSliders' + i + '"></div>');
          slidersDiv.append('<label>Opacité</label>');
          slidersDiv.append('<input id="opacitySlider' + i + '" type="range" min="0" max="1" step="0.01" value="1">');
          slidersDiv.append('<label>Luminosité</label>');
          slidersDiv.append('<input id="brightnessSlider' + i + '" type="range" min="-1" max="1" step="0.01" value="0">');
          slidersDiv.append('<label>Contraste</label>');
          slidersDiv.append('<input id="contrastSlider' + i + '" type="range" min="0" max="2" step="0.01">');
          slidersDiv.append('<label>Teinte</label>');
          slidersDiv.append('<input id="hueSlider' + i + '" type="range" min="-3.141592653589793" max="3.141592653589793" step="0.01" value="0">');
          slidersDiv.append('<label>Saturation</label>');
          slidersDiv.append('<input id="saturationSlider' + i + '" type="range" min="0" max="5" step="0.01" value="1">');
          
          $(slidersDiv).on('input', {
            map: scope.map,
            index: i
          }, handleInput);
          item.append(slidersDiv);
          
          tuningUl.append(item);
        }
      }
      tuningMenu.css('visibility', $('.ol-tuning-menu').css('visibility') === 'hidden' ? 'visible' : 'hidden');
    };
    
    function TuningControl(params, scope) {
      var me = this;
      
      var tuningButton = angular.element('<button title="Tuning"><span class="glyphicon glyphicon-chevron-down"></span></button>');
      
      $(tuningButton).on('click', scope, handleClick);
      
      var menu = document.createElement('ul');
      menu.className = 'ol-tuning-ul';
      
      var tuningControl = angular.element('<div class="ol-tuning-group-control ol-unselectable ol-control"></div>');
      tuningControl.append(tuningButton);
      var tuningMenu = angular.element('<div class="ol-tuning-menu" style="visibility:hidden;"></div>');
      tuningMenu.append(menu);
      tuningControl.append(tuningMenu);

      ol.control.Control.call(this, {
        element: tuningControl[0],
        target: params.target
      });
    }

    ol.inherits(TuningControl, ol.control.Control);

    return TuningControl;
}])

;

'use strict';

/**
 * @ngdoc module
 * @name ign.angular.geocoder
 * @description
 * # geocoder
 */
angular.module('ign.angular.geocoder', ['ui.bootstrap.typeahead'])

  
  .directive('geocoder', [ '$http', function($http) {

    return  {

      restrict: 'AE',
      scope: {
      	map: '=mapObject'
      },
      controller: 'GeocoderController',
      template: '<input type="text" class="form-control" placeholder="Rechercher un lieu" typeahead="poi.fulltext for poi in updatePoi($viewValue)" typeahead-on-select="moveToPoi($item, $model, $label)" ng-model="pointOfInterest">',

      link: {
        post: function(scope, iElement, iAttrs)  {
        }
  
        
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
    
    $scope.moveToPoi = function(item, model, label) {
      var me = this;
      me.map.moveTo(item.x, item.y, 15);
    };
    
    
  }]);

'use strict';

/**
 * @ngdoc module
 * @name ign.angular.layer
 * @description
 * # 
 */
angular.module('ign.angular.layer', ['ui.bootstrap', 'angularSpinner'])
  
  .directive('layerSelector', ['$http', 'LayerService', 'usSpinnerService', function($http, LayerService, usSpinnerService) {

    return  {
      restrict: 'AE',
      scope: {
      	map: '=mapObject',
      	index: '=index'
      },
      controller: 'LayerController',
      template: '<select style="width:200px;" class="form-control" ng-options="layer.Title group by layer.type for layer in layersSelect" ng-model="layer" ng-change="onLayerChange(layer)"></select>' +
                '<span us-spinner="{radius:30, width:8, length: 16}" spinner-key="spinner-{{index}}" spinner-start-active="true"></span>',
      link: {
        post: function(scope, element, attrs) {
                 
        }
      }
    };
  }])

  .controller('LayerController', ['$scope', '$attrs', '$parse', 'LayerService', 'Layer', 'usSpinnerService', function($scope, $attrs, $parse, LayerService, Layer, usSpinnerService) {
    
    var self = this;
    var spinnerKey = 'spinner-' + $attrs.index;
    var url = $scope.$eval($attrs.url);
    var index = $attrs.index;
    $scope.layers = [];
    $scope.layersSelect = [];

    
    LayerService.getWMTSLayersFromCapabilities(url, $scope.layers).then(function(layers) {
      $scope.$broadcast('layersLoaded');
    });
        
    $scope.$on('layersLoaded', function(event) {
      usSpinnerService.stop(spinnerKey);
      self.layers = $scope.layers[0];
      if($attrs.index === '0') {
        $scope.layer = LayerService.getLayerByIdentifier($scope.layers, 'ORTHOIMAGERY.ORTHOPHOTOS');
      }
      if($attrs.index === '1') {
        $scope.layer = LayerService.getLayerByIdentifier($scope.layers, 'GEOGRAPHICALGRIDSYSTEMS.MAPS');
      }
      if($scope.layer === false) {
        $scope.layer = $scope.layers[0].layers[0];
      }
      var extent = event.currentScope.map.getExtent();
      $scope.layersSelect = LayerService.getLayerForExtent(ol.proj.transformExtent(extent, 'EPSG:3857', 'EPSG:4326'), $scope.layers);
      $scope.$apply();
      
      $scope.initLayer($scope.layer);
    });
    
    $scope.$on('moveend', function(event) {
      var extent = event.currentScope.map.getExtent();
      $scope.layersSelect = LayerService.getLayerForExtent(ol.proj.transformExtent(extent, 'EPSG:3857', 'EPSG:4326'), $scope.layers);
      $scope.$apply();
    });
    
    $scope.initLayer = function(layerObject) {
      $scope.map.addLayerFromJson(layerObject, index);
      $scope.map.rearrangeLayers();
    };
    
    $scope.onLayerChange = function(layerObject) {
            
      $scope.map.setLayerFromJson(layerObject, index);
      
      var layerExtent = [layerObject.WGS84BoundingBox[0], layerObject.WGS84BoundingBox[1], layerObject.WGS84BoundingBox[2], layerObject.WGS84BoundingBox[3]];
      var mapExtent = ol.proj.transformExtent($scope.map.getExtent(), 'EPSG:3857', 'EPSG:4326');
      
      // if current layer extent contained into current extent, move to current layer extent
      var currentExtent = ol.proj.transformExtent($scope.map.getExtent(), 'EPSG:3857', 'EPSG:4326');
      if(ol.extent.getWidth(layerExtent) < ol.extent.getWidth(currentExtent) && ol.extent.getHeight(layerExtent) < ol.extent.getHeight(currentExtent)) {
        $scope.map.moveToExtent(ol.proj.transformExtent(layerExtent, 'EPSG:4326', 'EPSG:3857'));
      }
            
    };
        
  }])

  .factory('Layer', function () {
     
    var projection = ol.proj.get('EPSG:3857');
    var size = ol.extent.getWidth(projection.getExtent()) / 256;
    var resolutions = new Array(20);
    var matrixIds = new Array(20);
    for (var z = 0; z < 20; ++z) {
      // generate resolutions and matrixIds arrays for this WMTS
      resolutions[z] = size / Math.pow(2, z);
      matrixIds[z] = z;
    }

    function Layer(layerData, index) {
      if(layerData) {
        this.setData(layerData);

        if(layerData.TileMatrixSetLink !== undefined && layerData.TileMatrixSetLink.length > 0) {
          if(layerData.crs !== undefined) {
            projection = ol.proj.get(layerData.crs);
          }
          this.olLayer = new ol.layer.Tile({
            title: layerData.Title,
            extent: ol.proj.transformExtent(layerData.WGS84BoundingBox, 'EPSG:4326', 'EPSG:3857'),
            useInterimTilesOnError: true,
            source: new ol.source.WMTS({
              url: layerData.url,
              crossOrigin: 'anonymous',
              layer: layerData.Identifier,
              matrixSet: layerData.TileMatrixSetLink[0].TileMatrixSet,
              format: layerData.Format[0],
              projection: projection,
              tileGrid: new ol.tilegrid.WMTS({
                origin: ol.extent.getTopLeft(projection.getExtent()),
                resolutions: resolutions,
                matrixIds: matrixIds
              }),
              style: layerData.Style[0].Identifier,
              attributions: [new ol.Attribution({
                html: '<a href="http://ign.fr"><img src="http://wxs.ign.fr/static/logos/IGN/IGN.gif"></a>'
              })],
            })
          });
          this.olLayer.set('identifier', layerData.Identifier);
        } else {
          this.olLayer = new ol.layer.Tile({
            title: layerData.Title,
            source: new ol.source.TileWMS({
              url: layerData.url,
              attributions: layerData.Attributions,
              crossOrigin: 'anonymous',
              params: {
                LAYERS: layerData.Name,
                VERSION: '1.3.0',
                STYLE: layerData.Style[0].Name
              }
            })
          });
          
          this.olLayer.set('identifier', layerData.Name);
        }
        
        this.olLayer.set('index', index);
          
      }
    }

    Layer.prototype = {

      setData: function(layerData) {
        angular.extend(this, layerData);
      },

      get: function(key) {
        if(key === 'name') {
          return this.name;
        }
      },
      
      setTuning: function(property, value) {
        var me = this;
        var layer = me.olLayer;
        if(property === 'brightness') {
            //layer.setBrightness(2*(value/100) - 1);
          layer.setBrightness(value);
        } else if(property === 'hue') {
          //layer.setHue(value/20);
          layer.setHue(value);
        } else if(property === 'saturation') {
          //layer.setSaturation(value/5);
          layer.setSaturation(value);
        } else if(property === 'contrast') {
          //layer.setContrast(value/20);
          layer.setContrast(value);
        } else if(property === 'opacity') {
          //layer.setOpacity(value/100);
          layer.setOpacity(value);
        }
      },
      
      
    };

    return Layer;
})

.service('LayerService', ['$http', function($http) {

  var getWMTSLayersFromCapabilities = function(urls, layers, callback) {
    var self = this;
    self.urls = [];
    if (angular.isArray(urls)) {
      self.urls = urls;
    } else {
      self.urls.push(urls);
    }

    var requests = [];
    for ( var i = 0; i < self.urls.length; i++) {
      requests[i] = $.ajax(self.urls[i]);
    }

    return $.when.apply($, requests).done(function() {
      var parser = new ol.format.WMTSCapabilities();
      var result = {};
      if (arguments[0] instanceof Document === true) {
        var response = arguments;
        result = parser.read(response[0]);
        layers.push({
          url : result.OperationsMetadata.GetTile.DCP.HTTP.Get[result.OperationsMetadata.GetTile.DCP.HTTP.Get.length - 1].href,
          tileMatrixSet: result.Contents.TileMatrixSet,
          layers : result.Contents.Layer
        });
      } else {
        var responses = arguments;
        for ( var i = 0; i < responses.length; i++) {
          result = parser.read(responses[i][0]);
          layers.push({
            url : result.OperationsMetadata.GetTile.DCP.HTTP.Get[result.OperationsMetadata.GetTile.DCP.HTTP.Get.length - 1].href,
            tileMatrixSet: result.Contents.TileMatrixSet,
            layers : result.Contents.Layer
          });
        }
      }
    });
  };

  var getWMSLayersFromCapabilities = function(urls, callback) {
    var self = this;
    self.urls = [];
    if ($.isArray(urls)) {
      self.urls = urls;
    } else {
      self.urls.push(urls);
    }

    var requests = [];
    for ( var i = 0; i < self.urls.length; i++) {
      requests[i] = $.ajax(self.urls[i]);
    }

    return $.when.apply($, requests).done(function() {
      var parser = new ol.format.WMSCapabilities();
      var result = {};
      if (self.urls.length > 1) {
        var responses = arguments;
        for ( var i = 0; i < responses.length; i++) {
          result = parser.read(responses[i][0]);
          self.layers.push({
            url : result.Capability.Request.GetCapabilities.DCPType[0].HTTP.Get.OnlineResource,
            layers : result.Capability.Layer.Layer
          });
        }
      } else {
        var response = arguments;
        result = parser.read(response[0]);
        self.layers.push({
          url : result.Capability.Request.GetCapabilities.DCPType[0].HTTP.Get.OnlineResource,
          layers : result.Capability.Layer.Layer
        });

      }
    });
  };

  var getLayerForPoint = function(layers, coordinate) {
    var layersIntersecting = [];
    for ( var i = 0; i < layers.length; i++) {
      if (coordinate[0] > layers[i].boundingBox[0] && coordinate[0] < layers[i].boundingBox[2] && coordinate[1] > layers[i].boundingBox[1] && coordinate[1] < layers[i].boundingBox[3]) {
        layersIntersecting.push(layers[i]);
      }
    }
    return layersIntersecting;
  };

  var getLayerForExtent = function(extent, layers) {
    var layersIntersecting = [];
    var extentCenter = [ (extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2 ];
    var extentWidth = extent[2] - extent[0];
    var extentHeight = extent[3] - extent[1];
    angular.forEach(layers, function(capabilities, key, obj) {
      var layersCap = capabilities.layers;
      for ( var i = 0; i < layersCap.length; i++) {
        var layerCenter = [];
        var layerWidth = 0;
        var layerHeight = 0;
        var layerIdentifier = '';
        
        if (layersCap[i].Identifier === undefined) {
          // if WMS layer
          layerCenter = [ (layersCap[i].BoundingBox[0].extent[0] + layersCap[i].BoundingBox[0].extent[2]) / 2, (layersCap[i].BoundingBox[0].extent[1] + layersCap[i].BoundingBox[0].extent[3]) / 2 ];
          layerWidth = layersCap[i].BoundingBox[0].extent[2] - layersCap[i].BoundingBox[0].extent[0];
          layerHeight = layersCap[i].BoundingBox[0].extent[3] - layersCap[i].BoundingBox[0].extent[1];
          layerIdentifier = layersCap[i].Name;
        } else if (layersCap[i].Identifier !== undefined && layersCap[i].Identifier !== null) {
          // if WMTS layer

          if(layersCap[i].WGS84BoundingBox === undefined) {
            layersCap[i].WGS84BoundingBox = [-180, -90, 180, 90];
          }
          layerCenter = [ (layersCap[i].WGS84BoundingBox[0] + layersCap[i].WGS84BoundingBox[2]) / 2, (layersCap[i].WGS84BoundingBox[1] + layersCap[i].WGS84BoundingBox[3]) / 2 ];
          layerWidth = layersCap[i].WGS84BoundingBox[2] - layersCap[i].WGS84BoundingBox[0];
          layerHeight = layersCap[i].WGS84BoundingBox[3] - layersCap[i].WGS84BoundingBox[1];
          layerIdentifier = layersCap[i].Identifier;
        }
        // if(layersCap[i].boundingBox[0] > extent[2] &&
        // layersCap[i].boundingBox[1] < extent[3] &&
        // layersCap[i].boundingBox[2] > extent[0] &&
        // layersCap[i].boundingBox[3] > extent[0]) {
        if (2 * Math.abs(extentCenter[0] - layerCenter[0]) < (extentWidth + layerWidth) && 2 * Math.abs(extentCenter[1] - layerCenter[1]) < (extentHeight + layerHeight)) {
          if (layerIdentifier.split('.')[0] === 'ORTHOIMAGERY') {
            layersCap[i].type = 'Image';
          } else if (layerIdentifier.split('.')[0] === 'GEOGRAPHICALGRIDSYSTEMS') {
            layersCap[i].type = 'Carte';
          } else {
            layersCap[i].type = 'Autre';
          }
          layersCap[i].url = capabilities.url;
          //layersCap[i].crs = capabilities.tileMatrixSet[0].SupportedCRS;
          layersIntersecting.push(layersCap[i]);
        }
      }
    });

    return layersIntersecting;
  };

  var getLayerByIdentifier = function(layers, identifier) {
    for ( var i = 0; i < layers.length; i++) {
      for ( var j = 0; j < layers[i].layers.length; j++) {
        var identifierLocal = '';
        if (layers[i].layers[j].Identifier !== undefined && layers[i].layers[j].Identifier !== null) {
          // WMTS Layer
          identifierLocal = layers[i].layers[j].Identifier;
        } else if (layers[i].layers[j].Name !== undefined && layers[i].layers[j].Name !== null) {
          // WMS Layer
          identifierLocal = layers[i].layers[j].Name;
        }
        if (identifierLocal === identifier) {
          return layers[i].layers[j];
        }
      }
    }
    return false;

  };

  return {
    getLayerForPoint : getLayerForPoint,
    getLayerForExtent : getLayerForExtent,
    getLayerByIdentifier : getLayerByIdentifier,
    getWMTSLayersFromCapabilities : getWMTSLayersFromCapabilities,
    getWMSLayersFromCapabilities : getWMSLayersFromCapabilities
  };
}])

;

'use strict';


/**
 * @ngdoc module
 * @name ign.angular.map
 * @description
 * # 
 */
angular.module('ign.angular.map', ['ign.angular.layer', 'ign.angular.control'])
  .factory('map', ['Layer', 'DisplayControl', 'TuningControl', 'PermalinkControl', '$compile', function (Layer, DisplayControl, TuningControl, PermalinkControl, $compile) {
  
    function Map(element, params, scope) {
      var me = this;
      
      var center = [267540.85, 5873745.79];
      var zoom = 6;
      var globe = false;
      
      
      var mapRowElement = element.children()[0];
      var sliderRowElement = element.children()[1];

      var renderer = 'webgl';
      if(!ol.has.WEBGL) {
        renderer = 'canvas';
      }
      
      me.olMap = new ol.Map({
        target: mapRowElement,
        renderer: renderer,
        view: new ol.View({
          center: center,
          zoom: zoom,
          maxZoom: 20
        })
      });
      $('.ol-viewport').css('float', 'left');
      
      me.mousePosition = null;
      $(me.olMap.getViewport()).on('mousemove', function(evt) {
        me.mousePosition = me.olMap.getEventPixel(evt.originalEvent);
        me.olMap.render();
      });
      
      // parse options object
      // init controls
      var olMapControls = []; 
      if(params !== null && angular.isObject(params)) {
  
        for ( var int = 0; int < params.controls.length; int++) {
          if (params.controls[int] === 'display') {
            
            // add sliders            
            var vElement = document.createElement('input');
            $(vElement).attr('id', 'vertical-input');
            $(mapRowElement).append(vElement);
            var verticalSlider = $(vElement).slider({
              id: 'vertical-slider',
              orientation: 'vertical',
              handle: 'square',
              min: 0,
              value: 50,
              max: 100,
              step: 0.5,
              reversed: true,
              tooltip: 'hide'
            });
            $('#vertical-slider').css('visibility', 'hidden');
            $('#vertical-slider').css('float', 'left');
            $('#vertical-slider').css('position', 'absolute');
            $('#vertical-slider').css('height', $(mapRowElement).height() + 'px');
  
            var hElement = document.createElement('input');
            $(hElement).attr('id', 'horizontal-input');
            $(sliderRowElement).append(hElement);
            var horizontalSlider = $(hElement).slider({
              id: 'horizontal-slider',
              orientation: 'horizontal',
              handle: 'square',
              min: 0,
              value: 50,
              max: 100,
              step: 0.5,
              tooltip: 'hide'
            });
            $('#horizontal-slider').css('visibility', 'hidden');
            $('#horizontal-slider').css('width', $(mapRowElement).width() + 'px');
            
            horizontalSlider.on('slide', function() {
              me.olMap.render();
            });
            verticalSlider.on('slide', function() {
              me.olMap.render();
            });
            
            
            // create ol control
            var displayControl = new DisplayControl({}, scope);
            olMapControls.push(displayControl);
          } else if(params.controls[int] === 'tuning') {
            var tuningControl = new TuningControl({
              map: me
            }, scope);
            olMapControls.push(tuningControl);
          } else if(params.controls[int] === 'permalink') {
            var permalinkControl = new PermalinkControl({
              map: me
            }, scope);
            olMapControls.push(permalinkControl);
          }
          
        }
  
        if(params.center !== undefined && params.center !== null) {
          center = params.center;
        }
        if(params.zoom !== undefined && params.zoom !== null) {
          zoom = params.zoom;
        }
      }
  
      olMapControls.push(new ol.control.MousePosition({
          projection: 'EPSG:4326',
          coordinateFormat: ol.coordinate.createStringXY(4)
        }),
        new ol.control.ZoomToExtent({
          extent: [-667987.0760388413, 5163825.976944365, 1033145.0621032928, 6664835.260509959],
          tipLabel: 'Zoom France entière'
        })
      );
      
      for ( var i = 0; i < olMapControls.length; i++) {
        var control = olMapControls[i];
        me.olMap.addControl(control);
      }
      
      if(params.options.globe !== undefined ) {
        this.ol3d = new olcs.OLCesium({
          map: me.olMap
        });
        
        var scene = this.ol3d.getCesiumScene();
        
        var terrainUrl = 'http://cesiumjs.org/stk-terrain/tilesets/world/tiles';
        if(params.options !== null && !$.isEmptyObject(params)) {
          if(params.options.terrainUrl !== undefined && params.options.terrainUrl !== null) {
            terrainUrl = params.terrainUrl;
          }
        
          this.ol3d.setEnabled(true);
        }
        var terrainProvider = new Cesium.CesiumTerrainProvider({
          url: terrainUrl
        });
        scene.terrainProvider = terrainProvider;
  
      }
    }
    

    
  
    Map.prototype = {
      getOlMap : function() {
        return this.olMap;
      },
  
      getLayerByIdentifier : function(identifier) {
        for(var i=0;i<this.olMap.getLayers().getLength();i++) {
          var olLayer = this.olMap.getLayers().item(i);
          if(olLayer.get('identifier') === identifier) {
            return olLayer;
          }
        }
        return false;
      },
  
      getExtent: function() {
        return this.olMap.getView().calculateExtent(this.olMap.getSize());
      },
  
      moveTo : function(x, y, z) {
        var coordinate =  ol.proj.transform([x, y], 'EPSG:4326', 'EPSG:3857');
        this.olMap.getView().setCenter(coordinate);
        this.olMap.getView().setZoom(z);
      },
  
      moveToExtent: function(extent) {
        this.olMap.getView().fitExtent(extent, this.olMap.getSize());
      },
  
      clipTopLayer : function(visibility) {
        this.olMap.getLayers().item(this.olMap.getLayers().getLength()- 1).setVisible(!visibility);
      },
  
      addLayerFromJson : function(jsonLayer, index) {
        if(angular.isString(index)) {
          index = parseInt(index);
        }
        var layer = new Layer(jsonLayer, index);        
        this.olMap.addLayer(layer.olLayer);
                  
      },
      
      setLayerFromJson: function(jsonLayer, index) {
        if(angular.isString(index)) {
          index = parseInt(index);
        }
        var layer = new Layer(jsonLayer, index);
        this.olMap.getLayers().setAt(layer.olLayer.get('index'), layer.olLayer);
        if(index === this.olMap.getLayers().getLength() - 1) {
          this.initWebGl(layer.olLayer);
        }
      },
      
      rearrangeLayers: function(event) {
        var _olLayerArray = this.olMap.getLayers().getArray().slice();
        for(var i=0; i<_olLayerArray.length; i++) {
          var _olLayer = _olLayerArray[i];
          if(_olLayer.get('index') < this.olMap.getLayers().getLength()) {
            this.olMap.getLayers().setAt(_olLayer.get('index'), _olLayer);
          }
        }
      },
      
      onprecompose: function(event) {
        var me = this;
        var pixelRatio = event.frameState.pixelRatio;
        var hSwipeValue = 0;
        var vSwipeValue = 100;
        
        var displayControlMode = $('div.ol-display-group-control').attr('mode');
        
        if(displayControlMode === 'hSlider') {
          hSwipeValue = $('#horizontal-input').attr('value');
        } else if(displayControlMode === 'vSlider') {
          vSwipeValue = $('#vertical-input').attr('value');
        }

        if(event.context !== null) {
          // canvas
          var ctx = event.context;

          ctx.save();
          ctx.beginPath();

          if(displayControlMode !== 'scope') {
            var width = 0;
            var height = 0;
            if(displayControlMode === 'hSlider') {
              width = ctx.canvas.width * (hSwipeValue / 100);
            } else if (displayControlMode === 'vSlider') {
              height = ctx.canvas.height * (1 - vSwipeValue / 100);
            }
            ctx.rect(width, height, ctx.canvas.width - width, ctx.canvas.height - height);
          } else {
            var radius = ctx.canvas.height/4;
            if (me.mousePosition) {
              // only show a circle around the mouse
              ctx.arc(me.mousePosition[0] * pixelRatio, me.mousePosition[1] * pixelRatio,
                  radius * pixelRatio, 0, 2 * Math.PI);
              ctx.lineWidth = 0;
              ctx.strokeStyle = 'rgba(0,0,0,0.5)';
              ctx.stroke();
            }

          }
          ctx.clip();
        } else if (event.glContext !== null) {
          // WebGL
          var context = event.glContext;
          var gl = context.getGL();
          var program = gl.createProgram();
          var fragmentShaderSource = [
            'precision mediump float;',
            'void main() {',
            '}'
          ].join('');

          var vertexShaderSource = [
            'attribute vec2 a_position;',
            'void main() {',
            '  gl_Position = vec4(a_position, 0, 1);',
            '}'
          ].join('');

          var vertexShader = gl.createShader(gl.VERTEX_SHADER);
          gl.shaderSource(vertexShader, vertexShaderSource);
          gl.compileShader(vertexShader);
          gl.attachShader(program, vertexShader);

          var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
          gl.shaderSource(fragmentShader, fragmentShaderSource);
          gl.compileShader(fragmentShader);
          gl.attachShader(program, fragmentShader);

          gl.linkProgram(program);
          context.useProgram(program);

          var positionLocation = gl.getAttribLocation(program, 'a_position');

          gl.enable(gl.STENCIL_TEST);
          gl.colorMask(false, false, false, false);
          gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);
          gl.stencilFunc(gl.ALWAYS, 1, 0xff);

          var buffer = gl.createBuffer();
          gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

          if(displayControlMode !==  'scope') {
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
              (hSwipeValue - 50) / 50, -1.0, (hSwipeValue - 50) / 50, (vSwipeValue - 50)/50, 1.0, (vSwipeValue - 50)/50,
              (hSwipeValue - 50) / 50, -1.0, 1.0, (vSwipeValue - 50)/50, 1.0, -1.0,
            ]), gl.STATIC_DRAW);
            gl.enableVertexAttribArray(positionLocation);
            gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
            gl.drawArrays(gl.TRIANGLES, 0, 6);
          } else if(displayControlMode === 'scope') {

            if (me.mousePosition) {
              var webGLMousePosition = new Float32Array(2);
              webGLMousePosition[0] = (me.mousePosition[0] * 2)/gl.canvas.width - 1;
              webGLMousePosition[1] = 1 - (me.mousePosition[1] * 2)/gl.canvas.height;
              var vertices = new Float32Array(2160);
              for(var i=0;i<2160;i+=6) {
                var j = i/6;
                vertices[i] = webGLMousePosition[0];
                vertices[i+1] = webGLMousePosition[1];
                vertices[i+2] = webGLMousePosition[0] + Math.cos(Math.PI * j / 180.0)/(2*gl.canvas.width/gl.canvas.height);
                vertices[i+3] = webGLMousePosition[1] + Math.sin(Math.PI * j / 180.0)/2;
                vertices[i+4] = webGLMousePosition[0] + Math.cos(Math.PI * (j+1) / 180.0)/(2*gl.canvas.width/gl.canvas.height);
                vertices[i+5] = webGLMousePosition[1] + Math.sin(Math.PI * (j+2) / 180.0)/2;
              }
              gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
              gl.enableVertexAttribArray(positionLocation);
              gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
              gl.drawArrays(gl.TRIANGLES, 0, 1080);
            }
          }

          gl.bindBuffer(gl.ARRAY_BUFFER, null);
          gl.deleteBuffer(buffer);

          gl.colorMask(true, true, true, true);
          gl.stencilFunc(gl.NOTEQUAL, 0, 0xff);
          gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);


        }
      },
      
      onpostcompose : function(event) {
        if(event.context !== null) {
          var ctx = event.context;
//          if(scope.activateConvolve === true) {
//            var sharpen = [
//              0, -1, 0,
//              -1, 5, -1,
//              0, -1, 0
//            ];
//            var kernel = scope.normalize(sharpen);
//            scope.convolve(ctx, kernel);
//          }
          ctx.restore();
        } else if(event.glContext !== null) {
          var context = event.glContext;
          var gl = context.getGL();
          gl.disable(gl.STENCIL_TEST);
        }
      
        
      },
      
      enableWebGl: function(bool) {

        for ( var iLayer = 0; iLayer < this.olMap.getLayers().getLength(); iLayer++) {
          var layer = this.olMap.getLayers().item(iLayer);

          if(bool === false) {
            layer.un('precompose', this.onprecompose);
            layer.un('postcompose', this.onpostcompose);
          } else {
            if (iLayer === this.olMap.getLayers().getLength() - 1) {
              this.initWebGl(layer);
            } 
          } 
        }
      },
      
      
      initWebGl: function(layer) {

        layer.on('precompose', this.onprecompose, this);
        layer.on('postcompose', this.onpostcompose, this);
       
      }
  
    };
  
    return Map;
  }]).
  
  
    directive('olMap', ['Layer', 'map', '$rootScope', '$parse', '$compile', function(Layer, Map, $rootScope, $parse, $compile) {
  
      return {
        restrict: 'AE',
        scope: false,
        link: {
          pre: function preLink(scope, elm, attrs) {
            var options = {};
            var controls = [];
            if(attrs.controls !== undefined && angular.isArray($rootScope.$eval(attrs.controls)) === true && attrs.controls.length > 0) {
              controls = $rootScope.$eval(attrs.controls);
            }
            
            if(attrs.tuningControl !== undefined && attrs.tuningControl !== null) {
              options.tuningControl = true;
            }
            if(attrs.globe !== undefined && attrs.globe !== null) {
              options.globe = true;
            }
            
            var mapRow = angular.element('<div class="row" id="mapRow"></div>');
            var sliderRow = angular.element('<div class="row" id="sliderRow"></div>');
            
            elm.append(mapRow);
            elm.append(sliderRow);
            
            scope.map = new Map(elm, {
                center: scope.center,
                zoom: scope.zoom,
                controls: controls,
                options: options
            }, scope);
            
            scope.map.olMap.on('moveend', function(event) {
              scope.$broadcast('moveend');
            });
      
          }
  
        }
      };
  
    }]);
