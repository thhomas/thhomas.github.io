/*! ign-angular - v0.1.0 - 2016-02-10 */'use strict';

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

'use strict';

/**
 * @ngdoc module
 * @name ign.angular.layer
 * @description
 * # 
 */
angular.module('ign.angular.layer', ['ui.bootstrap', 'angularSpinner'])
  
  /**
   * @ngdoc factory
   * @name Layer
   * @description Provides a factory to handler Layer model
   */
  .factory('Layer', function() {
    
    /**
     * @param {Object} config Configuration properties for the layer.
     * 
     * Required config properties:
     * protocol - {String} The layer protocol.
     * identifier - {String} The layer identifier.
     * title - {String} The layer title.
     * bbox - {Array.<Number>} The bbox [xmin, ymin, xmax, ymax] of the layer.
     * 
     * Optional config properties:
     * url - {String} The layer url used by openlayers to access data.
     */
    function Layer(config) { //protocol, url, wmtsCap, config) {

      this.protocol = config.protocol;
      this.identifier = config.identifier;
      this.url = config.url;
      this.title = config.title;
      this.bbox = config.bbox;
      this.wmtsSourceOptions = config.wmtsSourceOptions;
      this.attributions = config.attributions;

      if (this.identifier.split('.')[0] === 'ORTHOIMAGERY') {
        this.type = 'Photos';
      } else if (this.identifier.split('.')[0] === 'GEOGRAPHICALGRIDSYSTEMS') {
        this.type = 'Carte';
      } else {
        this.type = 'Autre';
      }

    }

    /**
     * @return {string} url
     */
    Layer.prototype.getUrl = function() {
      return this.url;
    };

    /**
     * @return {string} title
     */
    Layer.prototype.getTitle = function() {
      return this.title;
    };

    /**
     * @return {string} type
     */
    Layer.prototype.getType = function() {
      return this.type;
    };
    
    Layer.prototype.getIdentifier = function() {
      return this.identifier;
    };
    
    /**
     * @return {number[]} [xmin, ymin, xmax, ymax] in EPSG:4326
     */
    Layer.prototype.getExtent = function() {
      return this.bbox;
    };
    
    /**
     * @return {number[]} Coordinates [long,lat] EPSG:4326 of layer extent center
     */
    Layer.prototype.getCenter = function() {
      return [ (this.bbox[0] + this.bbox[2]) / 2, (this.bbox[1] + this.bbox[3]) / 2 ];
    };
    
    /**
     * @return {number} Width of layer extent in degrees 
     */
    Layer.prototype.getWidth = function() {
      return this.bbox[2] - this.bbox[0];
    };

    /**
     * @return {number} Height of layer extent in degrees 
     */
    Layer.prototype.getHeight = function() {
      return this.bbox[3] - this.bbox[1];
    };
    
    /**
     * @return {Object} Tile Matrix Set
     */
    Layer.prototype.getTileMatrixSet = function() {
      return this.tileMatrixSet;
    };
    
    /**
     * @return {string} Image format 
     */
    Layer.prototype.getFormat = function() {
      return this.format;
    };
    
    /**
     * @return {string} Service style
     */
    Layer.prototype.getStyle = function() {
      return this.style;
    };
    
    /**
     * @return {array} Layer attributions
     */
    Layer.prototype.getAttributions = function() {
      return this.attributions;
    };
    
    /**
     * @return {ol.Layer} Openlayers layer object
     */
    Layer.prototype.createOlLayer = function() {

      if(this.protocol === 'WMTS') {
        this.wmtsSourceOptions.crossOrigin = 'anonymous';
        this.olLayer = new ol.layer.Tile({
          title: this.title,
          useInterimTilesOnError: true,
          source: new ol.source.WMTS(this.wmtsSourceOptions),
          //minResolution: this.wmtsSourceOptions.tileGrid.getResolution(this.wmtsSourceOptions.tileGrid.getMaxZoom()),
          maxResolution: this.wmtsSourceOptions.tileGrid.getResolution(this.wmtsSourceOptions.tileGrid.getMinZoom())*2
        });
      } else if (this.protocol === 'WMS') {
        
        this.olLayer = new ol.layer.Tile({
          title: this.title,
          extent: ol.proj.transformExtent(this.bbox, 'EPSG:4326', 'EPSG:3857'),
          source: new ol.source.TileWMS({
            url: this.url,
            attributions: this.attributions,
            crossOrigin: 'anonymous',
            params: {
              LAYERS: this.identifier,
              VERSION: '1.3.0',
              STYLE: this.style
            }
          })
        });
      } else if(this.identifier === 'osm') {
        this.olLayer = new ol.layer.Tile({
          title: this.title,
          source: new ol.source.OSM({
            attributions: [
              ol.source.OSM.ATTRIBUTION
            ],
            crossOrigin: 'http://openlayers.org',
            url: 'http://b.tile.openstreetmap.org/{z}/{x}/{y}.png'
          })
        });
      } else if(this.identifier === 'bing') {
        this.olLayer = new ol.layer.Tile({
          title: this.title,
          preload: Infinity,
          source: new ol.source.BingMaps({
            key: 'Ak-dzM4wZjSqTlzveKz5u0d4IQ4bRzVI309GxmkgSVr1ewS6iPSrOvOKhA-CJlm3',
            imagerySet: 'Aerial',
            // use maxZoom 19 to see stretched tiles instead of the BingMaps
            // "no photos at this zoom level" tiles
            maxZoom: 19
          })
        });
      } else if(this.identifier === 'mapbox') {
        this.olLayer = new ol.layer.Tile({
          title: this.title,
          source: new ol.source.XYZ({
            url: 'http://api.tiles.mapbox.com/v4/thhomas.mm528k4p/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoidGhob21hcyIsImEiOiJoS2tBb3lRIn0.Q76NgVSZUo4RO-F8HKIXOQ',
            crossOrigin: 'anonymous',
            attributions: [new ol.Attribution({
              html: '<a href="https://www.mapbox.com/about/maps/" target="_blank">Maps &copy; Mapbox &copy;</a>'
            })],
          })
        });
      } else if(this.identifier === 'mapquest') {
        this.olLayer = new ol.layer.Tile({
          title: this.title,
          source: new ol.source.MapQuest({
            layer: 'sat'
          })
        });
      } else if(this.identifier === 'google') {
        this.olLayer = new ol.layer.Tile({
          source: new ol.source.XYZ({
            title: this.title,
            url: 'https://khms0.google.com/kh?v=175&hl=fr-FR&x={x}&y={y}&z={z}&token=124915',
            crossOrigin: 'anonymous'
          })
        });
      }

      this.olLayer.set('ngLayer', this);
      return this.olLayer;
    };
    
    /**
     * @return {ol.Layer} Openlayers layer object
     */
    Layer.prototype.getOlLayer = function() {
      if(this.olLayer === null) {
        this.createOlLayer();
      }
      return this.olLayer;
    };


    return Layer;
  })
  .factory('Capability', ['Layer', function(Layer) {
    /**
     * @param {Object} jsonCapability Capabily json object obtained from OpenLayers 3
     * @constructor
     */
    function Capability(protocol, jsonCapability) {

      this.protocol = protocol;
      this.url = '';
      this.layers = [];
      var layersCap = [];

      if(this.protocol === 'WMTS') {
        this.url = jsonCapability['OperationsMetadata']['GetCapabilities']['DCP']['HTTP']['Get'][0]['href'];
        layersCap = jsonCapability['Contents']['Layer'];
      } else if (this.protocol === 'WMS') {
        this.url = jsonCapability['Capability']['Request']['GetCapabilities']['DCPType'][0]['HTTP']['Get']['OnlineResource'];
        layersCap = jsonCapability['Capability']['Layer']['Layer'];
      } else if (this.protocol === 'WFS') {
        this.url = jsonCapability['WFS_Capabilities']['OperationsMetadata']['Operation'][2]['DCP']['HTTP']['Get']['href'];
        layersCap = jsonCapability['WFS_Capabilities']['FeatureTypeList']['FeatureType'];
      } else if (this.protocol === 'Static') {
        layersCap = jsonCapability['Contents']['Layer'];
      }
      
      
      layersCap.forEach(function(layerCap) {
        var layer;
        if(this.protocol === 'WMTS') {
          var wmtsSourceOptions = ol.source.WMTS.optionsFromCapabilities(jsonCapability, {
            layer: layerCap['Identifier'],
            matrixSet: layerCap['TileMatrixSetLink'][0]['TileMatrixSet']
          });
          layer = new Layer({
            protocol: this.protocol,
            url: this.url,
            identifier: layerCap['Identifier'],
            title: layerCap['Title'],
            bbox: layerCap['WGS84BoundingBox'],
            style: layerCap['Style'][0]['Identifier'],
            format: layerCap['Format'][0],
            wmtsSourceOptions: wmtsSourceOptions
          });
        } else if (this.protocol === 'WMS') {
          layer = new Layer({
            protocol: this.protocol,
            url: this.url,
            identifier: layerCap['Name'],
            title: layerCap['Title'],
            bbox: (layerCap['EX_GeographicBoundingBox'] !== undefined) ? layerCap['EX_GeographicBoundingBox'] :layerCap['BoundingBox'][0]['extent'],
            style: layerCap['Style'][0]['Name'],
            attributions: layerCap['Attribution']
          });
        } else if (this.protocol === 'WFS') {
        } else if (this.protocol === 'Static') {
          layer = new Layer({
            protocol: this.protocol,
            identifier: layerCap['Identifier'],
            title: layerCap.Title,
            bbox: [-180, -90, 180, 90]
          });
        }
        
        this.layers.push(layer);
      },this);
    }
    /**
     * @return {array} A list of layers 
     */
    Capability.prototype.getLayers = function() {
      return this.layers;
    };
    
    /**
     * @return {string} The Capability protocol ('OGC WMTS', 'OGC WMS', ...) 
     */
    Capability.prototype.getProtocol = function() {
      return this.protocol;
    };
    
    /**
     * @return {string} The URL used to retrieve data (used by ol.layer object)
     */
    Capability.prototype.getUrl = function() {
      return this.url;
    };
    
    return Capability;
  }]);
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

'use strict';

angular.module('ign.angular.layer')
/**
  * @ngdoc service
  * @name LayerService
  * @return getWMTSLayersFromCapabilities
  * @return getLayerForExtent
  * @return getLayerByIdentifier
  * @return getWMSLayersFromCapabilities
  * @return getWFSLayersFromUrl
  * @return getStaticLayersFromList
  */
  .service('LayerService', ['$http', '$q', 'Capability', function($http, $q, Capability) {

  /**
   * Parse getCapabilities request from WMTS urls and fill a capabilities object
   * @param {string[]} urls An array of GetCapabilities url
   * @param {Object[]} capabilities An array of Openlayers 3 capability objects
   * @return {promise} A promise object when requests are done
   */
  var getWMTSLayersFromCapabilities = function(urls, capabilities) {
    if(urls === undefined) {
      return $q.when(capabilities);
    }
    var self = this;

    // urls could be an array or a string, selfs.urls should be an array
    self.urls = [];
    if (angular.isArray(urls)) {
      self.urls = urls;
    } else {
      self.urls.push(urls);
    }

    var requests = [];
    for ( var i = 0; i < self.urls.length; i++) {
      requests[i] = $http.get(self.urls[i]);
    }

    return $q.all(requests).then(function(responses) {
      var parser = new ol.format.WMTSCapabilities();
      for ( var i = 0; i < responses.length; i++) {
        capabilities.push(new Capability('WMTS', parser.read(responses[i].data)));
      }
    });
  };

  /**
   * Parse getCapabilities request from WMS urls and fill a capabilities object
   * @param {array} urls An array of GetCapabilities url
   * @return {promise} A promise object when requests are done
   */
  var getWMSLayersFromCapabilities = function(urls, capabilities) {
    if(urls === undefined) {
      return $q.when(capabilities);
    }
    var self = this;
    // urls could be an array or a string, selfs.urls should be an array
    self.urls = [];
    if (angular.isArray(urls)) {
      self.urls = urls;
    } else {
      self.urls.push(urls);
    }

    var requests = [];
    for ( var i = 0; i < self.urls.length; i++) {
      requests[i] = $http.get(self.urls[i]);
    }

    return $q.all(requests).then(function(responses) {
      var parser = new ol.format.WMSCapabilities();
      for ( var i = 0; i < responses.length; i++) {
        capabilities.push(new Capability('WMS', parser.read(responses[i].data)));
      }
    });
  };

  /**
   * Fill add a WFS capability object from url and layerName
   */
  var getWFSLayersFromUrl = function(urls, capabilities) {
    var self = this;
    self.urls = [];
    if ($.isArray(urls)) {
      self.urls = urls;
    } else {
      self.urls.push(urls);
    }

    var requests = [];
    
    /*var beforeSend = function(xhrObj) {
      xhrObj.setRequestHeader('Access-Control-Allow-origin','*');
    };*/
    
    for ( var i = 0; i < self.urls.length; i++) {
      requests[i] = $.ajax({
        url: self.urls[i],
        //beforeSend: beforeSend,
        dataType: 'xml'
      });
    }
    
    return $.when.apply($, requests).done(function(response) {
      var json = $.xml2json(response.childNodes[0]);
      capabilities.push({
        url: json['wfs:WFS_Capabilities']['ows:OperationsMetadata']['ows:Operation'][2]['ows:DCP']['ows:HTTP']['ows:Get']['$']['xlink:href'],
        ogcType: 'WFS',
        layers: json['wfs:WFS_Capabilities'].FeatureTypeList.FeatureType
      });
    });
    
  };

  var getStaticLayersFromList = function(list, capabilities) {
    var _layers = [];
    angular.forEach(list, function(staticLayer) {
      if(staticLayer === 'osm') {
        _layers.push({
          Identifier: 'osm',
          Title: 'OpenStreetMap'
        });
      } else if(staticLayer === 'bing') {
        _layers.push({
          Identifier: 'bing',
          Title: 'Bing Maps Aerial'
        });
      } else if(staticLayer === 'mapbox') {
        _layers.push({
          Identifier: 'mapbox',
          Title: 'MapBox Satellite'
        });
      } else if(staticLayer === 'mapquest') {
        _layers.push({
          Identifier: 'mapquest',
          Title: 'MapQuest Aerial'
        });
      } else if(staticLayer === 'google') {
        _layers.push({
          Identifier: 'google',
          Title: 'GoogleMaps Earth'
        });
      }
    });
    if(_layers.length > 0) {
      capabilities.push(new Capability('Static', {
        Contents: {
          Layer: _layers
        }
      }));
    }
  };


  /**
   * Return a list of layer available for a given extent
   * @param {object} capabilities A capabilities object
   * @param {object} extent An extent object ([xmin, xmax, ymin, ymax])
   * @return {array} An array of layer object
   */
  var getLayersForExtent = function(capabilities, extent) {
    var layersIntersecting = [];
    var extentCenter = [ (extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2 ];
    var extentWidth = extent[2] - extent[0];
    var extentHeight = extent[3] - extent[1];
    
    capabilities.forEach(function(capability) {
      var layersCap = capability.getLayers();
      layersCap.forEach(function(layer) {
        if (2 * Math.abs(extentCenter[0] - layer.getCenter()[0]) < (extentWidth + layer.getWidth()) && 2 * Math.abs(extentCenter[1] - layer.getCenter()[1]) < (extentHeight + layer.getHeight())) {
          layersIntersecting.push(layer);
        }
      });
    });
    return layersIntersecting;
  };


  /**
   * Search into a capabilities array for layer identifier
   * @param {Object[]} capabilities An array of Openlayers 3 capability objects
   * @param {string} identifier A layer identifier
   * @return {object} A layer object
   */
  var getLayerByIdentifier = function(capabilities, identifier) {
    var result;
    capabilities.forEach(function(capability) {
      capability.getLayers().forEach(function(capabilityLayer) {
        if (capabilityLayer.getIdentifier() === identifier) {
          result = capabilityLayer;
        }
      });
    });
    return result;

  };

  return {
    getLayersForExtent : getLayersForExtent,
    getLayerByIdentifier : getLayerByIdentifier,
    getWMTSLayersFromCapabilities : getWMTSLayersFromCapabilities,
    getWMSLayersFromCapabilities : getWMSLayersFromCapabilities,
    getWFSLayersFromUrl: getWFSLayersFromUrl,
    getStaticLayersFromList : getStaticLayersFromList
  };
}]);
'use strict';

angular.module('ign.angular.map', [])

  /**
   * PermalinkControl A control to display the permalink to user
   * @description
   * # 
   */
  .factory('PermalinkControl', [function () {
    
    var handleClick = function() {
      
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
    
    
    function PermalinkControl(params) {
      var me = this;
            
      var options = params || {};

      var permalinkButton = angular.element('<button id="permalinkButton" title="Permalien"><span class="glyphicon glyphicon-link"></span></button>');
      
      var menu = angular.element('<div class="ol-permalink-menu navbar" style="visibility: hidden;"></div>');
      var menuList = angular.element('<ul class="nav navbar-nav"></ul>');
      menuList.append('<input class="ol-permalink-input">');
      
      menu.append(menuList);
      
      var permalinkControl = angular.element('<div class="ol-permalink-control ol-unselectable ol-control"></div>');
      permalinkControl.append(permalinkButton);
      permalinkControl.append(menu);
            
      $(permalinkButton).on('click', handleClick);
            
      ol.control.Control.call(me, {
        element: permalinkControl[0],
        target: options.target
      });

    }

    ol.inherits(PermalinkControl, ol.control.Control);

    return PermalinkControl;
  }])
  
  /**
   * MouseInfoControl A control to display information depending on mouse position
   */
  .factory('MouseInfoControl', [function() {

    function MouseInfoControl(params, scope) {
      var me = this;
      
      var options = params || {};
      
      var infoDiv = angular.element('<div id="' + params.id + '" class="ol-mouseinfo-control ol-unselectable ol-control"></div>');
      ol.control.Control.call(me, {
        element: infoDiv[0],
        target: options.target
      });
    }

    ol.inherits(MouseInfoControl, ol.control.Control);
    
    MouseInfoControl.prototype.setMap = function(map) {
      var me = this;
      ol.control.Control.prototype.setMap.call(this, map);
      if(map) {
        var viewport = map.getViewport();
        var infoDiv = $(this.element);
        viewport.addEventListener('mousemove', function() {
          infoDiv.text(me.text);
        }, this);
        viewport.addEventListener('mouseout', function() {
          infoDiv.text('');
        }, this);
      }
    };
    MouseInfoControl.prototype.setText = function(text) {
      this.text = text;
    };

    return MouseInfoControl;
  }])

  /**
   * GlobeControl A control to activate globe display (using ol3-cesium)
   */
  .factory('GlobeControl', [function () {

    var handleClick = function(event) {

      var mapObject = event.data;
      var button = $(event.target);
      var control = button.parent('div');
      var bool = null;
      if(control.attr('enabled') === 'false') {
        control.attr('enabled', 'true');
        bool = true;
      } else {
        control.attr('enabled', 'false');
        bool = false;
      }

      mapObject.enable3d(bool);

    };


    function GlobeControl(params, scope) {
      var me = this;

      var options = params || {};

      var globeButton = angular.element('<button id="globeButton" title="3D">3D</button>');

      var globeControl = angular.element('<div class="ol-globe-control ol-unselectable ol-control" enabled="false"></div>');
      globeControl.append(globeButton);

      $(globeButton).on('click', params.map, handleClick);

      ol.control.Control.call(me, {
        element: globeControl[0],
        target: options.target
      });


    }
    
    ol.inherits(GlobeControl, ol.control.Control);


    return GlobeControl;
  }])

  /**
   * DisplayControl A control adding comparison tools.
   */
  .factory('DisplayControl', [function () {
    
    var handleClick = function(event) {
      
      var mapObject = event.data.map;
      var scope = event.data.scope;
      var span = {};
      // event target can be either span or button
      if($(event.target).is('button')) {
        span = $(event.target).children('span');
      } else if($(event.target).is('span')) {
        span = $(event.target);
      } else {
        return;
      }

      var groupControl = span.parents('div.ol-display-group-control');
      var vSlider = $('#vertical-slider');
      var hSlider = $('#horizontal-slider');
      
      var clickedMode = '';
      if(span.hasClass('glyphicon-search')) {
        vSlider.css('visibility', 'hidden');
        hSlider.css('visibility', 'hidden');
        mapObject.disableDoubleMap();
        clickedMode = 'scope';

      } else if(span.hasClass('glyphicon-resize-vertical')) {
        if(vSlider.css('visibility') !== 'visible') {
          vSlider.css('visibility', 'visible');
        } else {
          vSlider.css('visibility', 'hidden');
        }
        hSlider.css('visibility', 'hidden');
        mapObject.disableDoubleMap();
        clickedMode = 'vSlider';

      } else if(span.hasClass('glyphicon-resize-horizontal')) {
        if(hSlider.css('visibility') !== 'visible') {
          hSlider.css('visibility', 'visible');
        } else {
          hSlider.css('visibility', 'hidden');
        }
        vSlider.css('visibility', 'hidden');
        mapObject.disableDoubleMap();
        clickedMode = 'hSlider';
        
      } else if(span.hasClass('glyphicon-eye-open')) {
        vSlider.css('visibility', 'hidden');
        hSlider.css('visibility', 'hidden');
        mapObject.disableDoubleMap();
        clickedMode = 'clipLayer';
      } else if(span.hasClass('glyphicon-pause')) {
        vSlider.css('visibility', 'hidden');
        hSlider.css('visibility', 'hidden');
        if(mapObject.getClonedMap() === undefined) {
          mapObject.enableDoubleMap(scope);
        } else {
          mapObject.disableDoubleMap();
        }
        clickedMode = 'doubleMap';
      }
      
      // remove 'ol-button-clicked' class from buttons
      groupControl.children().removeClass('ol-button-clicked');
      // set eye icon to open
      groupControl.children().children('.glyphicon-eye-open').removeClass('glyphicon-eye-close');
      
      // if mode has changed
      if(mapObject.getDisplayMode() !== clickedMode) {
        mapObject.setDisplayMode(clickedMode);
        span.parent('button').addClass('ol-button-clicked');
        if(span.hasClass('glyphicon-eye-open')) {
          span.addClass('glyphicon-eye-close');
        }
      } else {
        mapObject.setDisplayMode('');
        span.parent('button').blur();
      }

      mapObject.enableWebGl($.inArray(mapObject.getDisplayMode(), ['hSlider','vSlider']));
      mapObject.clipTopLayer(mapObject.getDisplayMode() === 'clipLayer' || mapObject.getDisplayMode() === 'doubleMap');

      // to make clic directly effective on map
      mapObject.getOlMap().render();

    };

    function DisplayControl(params, scope) {
      var me = this;

      var options = params || {};

      var scopeButton = angular.element('<button id="scopeButton" class="ol-scope" title="Loupe"><span class="glyphicon glyphicon-search"></span></button>');
      var verticalSliderButton = angular.element('<button id="verticalSliderButton" class="ol-display-group-control" title="Comparaison verticale"><span class="glyphicon glyphicon-resize-vertical"></span></button>');
      var horizontalSliderButton = angular.element('<button id="horizontalSliderButton" class="ol-display-group-control" title="Comparaison horizontale"><span class="glyphicon glyphicon-resize-horizontal"></span></button>');
      var clipButton = angular.element('<button id="clipLayerButton" class="ol-clip-layer" title="Masquer"><span class="glyphicon glyphicon-eye-open"></span></button>');
      var doubleMapButton = angular.element('<button id="doubleMapButton" class="ol-double-map-control" title="Double affichage"><span class="glyphicon glyphicon-pause"></span></button>');

      var groupControl = angular.element('<div class="ol-display-group-control ol-unselectable ol-control" mode=""></div>');
      groupControl.append(scopeButton);
      groupControl.append(verticalSliderButton);
      groupControl.append(horizontalSliderButton);
      groupControl.append(clipButton);
      groupControl.append(doubleMapButton);
      
      var mapObject = params.map;

      $(groupControl).on('click', {
        map: mapObject,
        scope: scope
      }, handleClick);

      if(params.firstLayerIndex !== undefined && params.lastLayerIndex !== undefined) {
        groupControl.attr('leftLayerIndex', params.firstLayerIndex);
        groupControl.attr('rightLayerIndex', params.lastLayerIndex);
      }

      ol.control.Control.call(me, {
        element: groupControl[0],
        target: options.target
      });


    }

    ol.inherits(DisplayControl, ol.control.Control);

    
    DisplayControl.prototype.initMode = function(mode) {
      var button = null;
      if(mode === 'scope') {
        button = this.element.childNodes.item(0);
      } else if (mode === 'vSlider') {
        button = this.element.childNodes.item(1);
      } else if (mode === 'hSlider') {
        button = this.element.childNodes.item(2);
      } else if (mode === 'clipLayer') {
        button = this.element.childNodes.item(3);
      } else if (mode === 'doubleMap') {
        button = this.element.childNodes.item(4);
      }
      if(button) {
        button.click();
      }
    };
    
    return DisplayControl;
  }])

  .factory('TuningControl', [function () {
    
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
      
      var mapObject = event.data;
      var tuningMenu = $('.ol-tuning-menu');
      var tuningUl= $('.ol-tuning-ul');
      
      if(tuningMenu.css('visibility') !== 'visible') {
        $(tuningUl).empty();
        for ( var i = 0; i < mapObject.getOlMap().getLayers().getArray().length; i++) {
          var item = angular.element('<li></li>');
          item.append('<a>' + mapObject.getOlMap().getLayers().getArray()[i].get('title') + '</a>');
          var resetButton = angular.element('<button><span class="glyphicon glyphicon-repeat"></span></button>');
          $(resetButton).on('click', {
            map: mapObject,
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
            map: mapObject,
            index: i
          }, handleInput);
          item.append(slidersDiv);
          
          tuningUl.append(item);
        }
      }
      tuningMenu.css('visibility', $('.ol-tuning-menu').css('visibility') === 'hidden' ? 'visible' : 'hidden');
    };
    
    function TuningControl(params, scope) {
      
      var tuningButton = angular.element('<button title="Tuning"><span class="glyphicon glyphicon-chevron-down"></span></button>');
      
      $(tuningButton).on('click', params.map, handleClick);
      
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
  }]);

'use strict';


/**
 * @ngdoc module
 * @name ign.angular.map
 * @description
 * # 
 */
angular.module('ign.angular.map')

  .factory('map', ['DisplayControl', 'TuningControl', 'PermalinkControl', 'GlobeControl', 'MouseInfoControl', function (DisplayControl, TuningControl, PermalinkControl, GlobeControl, MouseInfoControl) {

    function Map(element, params, scope) {
      var me = this;

      // if main controller scope defines center and zoom, it is used to initialize map
      var center = [267540.85, 5873745.79];
      var zoom = 6;
      if(params.center !== undefined) {
        center = ol.proj.transform(params.center, 'EPSG:4326', 'EPSG:3857');
      }
      if(params.zoom !== undefined) {
        zoom = params.zoom;
      }
      me.renderer = 'canvas';
      if(params.renderer !== undefined) {
        me.renderer = params.renderer;
      }
      var olMapInteractions = ol.interaction.defaults();
      if(params.interactions !== undefined) {
        olMapInteractions = ol.interaction.defaults(params.interactions);
      }

      me.mapId = params.mapId;
      if(me.mapId === undefined) {
        me.mapId = 'mapDiv';
      }

      var mapRowElement = $(element.children()[0]);

      var mapDiv = angular.element('<div id="'+me.mapId+'"></div>');

      mapRowElement.append(mapDiv);

      var sliderRowElement = element.children()[1];

      if(!ol.has.WEBGL) {
        me.renderer = 'canvas';
      }

      var view = params.view;
      if(view === undefined) {
        view = new ol.View({
          center: center,
          zoom: zoom,
          maxZoom: 20
        });
      }

      me.olMap = new ol.Map({
        target: mapDiv[0],
        renderer: me.renderer,
        view: view,
        //layers: params.layers,
        interactions: olMapInteractions,
        controls: [
          new ol.control.Zoom({
            zoomInTipLabel: 'Zoom avant',
            zoomOutTipLabel: 'Zoom arrière'
          }),
          new ol.control.Rotate(),
          new ol.control.Attribution()
        ]
      });
      $('.ol-viewport').css('float', 'left');


      me.mousePosition = null;

      // define slide callback
      function slideCallback() {
        me.olMap.render();
      }

      // parse options object
      // init controls
      var olMapControls = [];
      if(params !== null && angular.isObject(params)) {

        if(params.controls !== undefined && angular.isArray(params.controls)) {
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
              $('#vertical-slider').css({
                'visibility': 'hidden',
                'float': 'left',
                'position': 'absolute',
                'height': $(mapRowElement).height() + 'px',
                'margin-left': '-15px',
              });

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
              $('#horizontal-slider').css({
                'visibility': 'hidden',
                'width': $(mapRowElement).width() + 'px',
                'margin-top': '-30px'
              });

              horizontalSlider.on('slide', slideCallback);
              verticalSlider.on('slide', slideCallback);

              // create ol control
              var displayControl = new DisplayControl({
                firstLayerIndex: 0,
                lastLayerIndex: 1,
                map: me
              }, scope);
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
            } else if(params.controls[int] === '3d') {
              var globeControl = new GlobeControl({
                map: me
              }, scope);
              olMapControls.push(globeControl);
            } else if(params.controls[int] === 'mousewheelzoom') {
              me.olMap.addInteraction(new ol.interaction.MouseWheelZoom());
            }

          }
        }

      }

      olMapControls.push(new ol.control.MousePosition({
          projection: 'EPSG:4326',
          coordinateFormat: ol.coordinate.createStringXY(4)
        }),
        new MouseInfoControl({
          map: me,
          id: me.mapId + '-mouseInfoDiv'
        }, scope),
        new ol.control.ZoomToExtent({
          extent: [-667987.0760388413, 5163825.976944365, 1033145.0621032928, 6664835.260509959],
          tipLabel: 'Zoom France entière'
        })
      );

      for ( var i = 0; i < olMapControls.length; i++) {
        var control = olMapControls[i];
        me.olMap.addControl(control);
      }

      me.mode = scope.mode;

    }


    Map.prototype = {
      getOlMap : function() {
        return this.olMap;
      },

      getClonedMap: function() {
        return this.olMap2;
      },

      renderMap: function() {
        this.olMap.render();
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

      getClonedLayerByIdentifier : function(identifier) {
        if(this.olMap2 !== undefined) {
          for(var i=0;i<this.olMap2.getLayers().getLength();i++) {
            var olLayer = this.olMap2.getLayers().item(i);
            if(olLayer.get('identifier') === identifier) {
              return olLayer;
            }
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
        this.olMap.getView().fit(extent, this.olMap.getSize());
      },

      clipTopLayer : function(visibility) {
        this.olMap.getLayers().item(1).setVisible(!visibility);
      },
      
      addLayer : function(layer) {
        this.olMap.addLayer(layer.createOlLayer());

        // if doubleMap mode
        if(this.getDisplayMode() === 'doubleMap') {
          this.olMap2.addLayer(layer.createOlLayer());
        }

      },
      
      updateLayerAt : function(layer, index) {
        if(angular.isString(index)) {
          index = parseInt(index,10);
        }
        
        this.olMap.getLayers().setAt(index, layer.createOlLayer());
        
        // if doubleMap mode
        if(this.getDisplayMode() === 'doubleMap') {
          if(index >= 1) {
            var olLayer1 = layer.createOlLayer();
            this.olMap2.getLayers().setAt(0, olLayer1);
            this.olMap2.getLayers().setAt(0, olLayer1);
          }
          this.olMap.getLayers().item(1).setVisible(false);
        } else {
          if(index === this.olMap.getLayers().getLength() - 1) {
            this.initWebGl(layer.getOlLayer());
          }
        }
      },
      
      removeLayer: function(layer) {
        this.olMap.removeLayer(layer.getOlLayer());
      },

      onprecompose: function(event) {
        var me = this;
        var pixelRatio = event.frameState.pixelRatio;
        var hSwipeValue = 0;
        var vSwipeValue = 100;
        
        var displayControlMode = me.getDisplayMode();
        
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
              ctx.strokeStyle = 'rgba(0,0,0,0)';
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

      enable3d: function(bool) {
        if(this.ol3d === undefined) {
          this.ol3d = new olcs.OLCesium({
            map: this.olMap
          });

          var scene = this.ol3d.getCesiumScene();

          var terrainUrl = '//assets.agi.com/stk-terrain/world';

          var terrainProvider = new Cesium.CesiumTerrainProvider({
            url: terrainUrl,
            requestVertexNormals : true
          });
          scene.terrainProvider = terrainProvider;
        }
        
        this.ol3d.setEnabled(bool);
      },

      enableWebGl: function(bool) {

        for ( var iLayer = 0; iLayer < this.olMap.getLayers().getLength(); iLayer++) {
          var layer = this.olMap.getLayers().item(iLayer);

          if(bool === false) {
            layer.un('precompose', this.onprecompose);
            layer.un('postcompose', this.onpostcompose);
          } else {
            if (iLayer === 1) {
              this.initWebGl(layer);
            }
          }
        }
      },

      initWebGl: function(layer) {
        layer.on('precompose', this.onprecompose, this);
        layer.on('postcompose', this.onpostcompose, this);
      },

      initDisplayControls : function(mode) {
        var displayControl = this.getDisplayControl();
        displayControl.initMode(mode);
      },

      getDisplayControl: function() {
        var controls = this.olMap.getControls();
        var elementReturned = null;
        controls.forEach(function(element) {
          if(element instanceof DisplayControl) {
            elementReturned = element;
          }
        });
        return elementReturned;
      },

      displayMouseInfoControl: function(display, mapId) {
        var me = this;
        if(mapId === me.mapId) {
          var controls = this.olMap.getControls();
        } else if(mapId === me.mapId + '-cloned') {
          var controls = this.olMap2.getControls();
        }
        controls.forEach(function(control) {
          if(control instanceof MouseInfoControl) {
            if(display === true) {
              $(control.element).show();
            } else {
              $(control.element).hide();
            }
          }
        });
      },
      setMouseInfoControlText: function(text, mapId) {
        var me = this;
        if(mapId === me.mapId) {
          var controls = this.olMap.getControls();
        } else if(mapId === me.mapId + '-cloned') {
          var controls = this.olMap2.getControls();
        }
        controls.forEach(function(element) {
          if(element instanceof MouseInfoControl) {
            element.setText(text);
          }
        });
      },

      getDisplayMode : function() {
        return this.mode;
      },

      setDisplayMode: function(mode) {
        this.mode = mode;
      },

      getNgLayers: function() {

        var me = this;
        var layers = [];

        me.getOlMap().getLayers().forEach(function(layer, index, array) {
          if(layer.get('ngLayer') !== undefined) {
            layers.push(layer);
          }
        });

        return layers;
      },

      getLayerVisibleUnderMouse: function(olEvent) {

        var me = this;
        var layers = [];
        var visibleLayer;

        var pixel = olEvent.map.getEventPixel(olEvent.originalEvent);
        
        olEvent.map.forEachLayerAtPixel(pixel, function(layer, index, array) {
          if(layer.get('ngLayer') !== undefined) {
            layers.push(layer);
          }
        }, me);
        visibleLayer = layers[0];

        var displayControlMode = me.getDisplayMode();
        var hSwipeValue = 0;
        var vSwipeValue = 100;
        if(displayControlMode === 'hSlider') {
          hSwipeValue = $('#horizontal-input').attr('value');
          if(pixel[0] <= me.getOlMap().getSize()[0]*hSwipeValue/100) {
            if(layers[0] !== undefined && layers[0].get('ngLayer').getIdentifier() === me.getNgLayers()[1].get('ngLayer').getIdentifier()) {
              visibleLayer = layers[1];
            }
          }
        } else if(displayControlMode === 'vSlider') {
          vSwipeValue = $('#vertical-input').attr('value');
          if(pixel[1] <= me.getOlMap().getSize()[1]*vSwipeValue/100) {
            if(layers[0] !== undefined && layers[0].get('ngLayer').getIdentifier() === me.getNgLayers()[1].get('ngLayer').getIdentifier()) {
              visibleLayer = layers[1];
            }
          }
        } 


        return visibleLayer;
      },

      addMarkerForDoubleMap: function(event) {

        var me = this;

        if(event.map.getTarget().id === me.mapId) {
          if(!me.olMap2.getOverlayById('marker2')) {
            me.olMap2.addOverlay(me.marker2);
          }
          me.marker2.setPosition(event.coordinate);
        } else if(event.map.getTarget().id === me.mapId + '-cloned'){
          if(!me.olMap.getOverlayById('marker')) {
            me.olMap.addOverlay(me.marker);
          }
          me.marker.setPosition(event.coordinate);
        }

      },

      enableDoubleMap : function(scope) {

        var me = this;

        var mapId = me.mapId;
        if(mapId === undefined) {
          mapId = 'mapDiv';
        }
        var mapRow = $('#' + mapId + 'Row');
        var mapDiv2 = angular.element('<div id="' + mapId + '-cloned" class="mapDouble"></div>');
        var mapDiv = $('#' + mapId);
        mapDiv.addClass('mapDouble');
        mapRow.append(mapDiv2);
        
        // add cursor overlay to DOM
        var overlayElement = angular.element('<div id="marker" class="ign-marker"></div>');
        var overlayElement2 = angular.element('<div id="marker2" class="ign-marker"></div>');
        mapRow.append(overlayElement);
        mapRow.append(overlayElement2);

        // create second map
        // first map: hide "comparedto" layer (with index=1) and show others
        // second map: add "comparedto" layer (with index=1) and all covering ones (with index>1)
        var layersMap2 = [];
        var layersMap1 = me.getNgLayers();
        if(layersMap1.length < 2) {
          alert('Oups, problème.'); 
        }
        var olLayer1 = layersMap1[1];
        //var olLayer1 = me.olMap.getLayers().item(1);
        olLayer1.setVisible(false);
        var layer1 = olLayer1.get('ngLayer');
        var olLayer2 = layer1.createOlLayer();
        olLayer2.setVisible(true);
        layersMap2.push(olLayer2);
        for(var i=2; i<layersMap1.length; i++) {
          olLayer1 = layersMap1[i];
        //for(var i=2; i<me.olMap.getLayers().getLength(); i++) {
          //olLayer1 = me.olMap.getLayers().item(i);
          olLayer1.setVisible(true);
          layer1 = olLayer1.get('ngLayer');
          olLayer2 = layer1.createOlLayer();
          layer1.getOlLayer().setVisible(true);
          layersMap2.push(olLayer2);
        }

        // cloned map creation
        me.olMap2 = new ol.Map({
          target: mapDiv2[0],
          renderer: me.renderer,
          interactions: me.olMap.getInteractions(),
          view: me.olMap.getView(),
          layers: layersMap2,
          controls: [
            new ol.control.Zoom({
              zoomInTipLabel: 'Zoom avant',
              zoomOutTipLabel: 'Zoom arrière'
            }),
            new ol.control.Rotate(),
            new ol.control.Attribution(),
            new ol.control.MousePosition({
              projection: 'EPSG:4326',
              coordinateFormat: ol.coordinate.createStringXY(4)
            }),
            new MouseInfoControl({
              map: me,
              id: me.mapId + '-cloned' + '-mouseInfoDiv'
            })
          ]
        });

        me.marker2 = new ol.Overlay({
          id: 'marker2',
          position: me.olMap.getView().getCenter(),
          positioning: 'center-center',
          element: $('#marker2')[0]
        });

        me.marker = new ol.Overlay({
          id: 'marker',
          position: me.olMap.getView().getCenter(),
          positioning: 'center-center',
          element: $('#marker')[0]
        });

        // move markers according to mouse pointer
        me.olMap.on('pointermove', me.addMarkerForDoubleMap, me);
        me.olMap2.on('pointermove', me.addMarkerForDoubleMap, me);
        me.olMap2.on('pointermove', function(olEvent) {
          var me = this;
          scope.$broadcast('pointermove', me, olEvent, me.mapId + '-cloned');
        }, me);

        // remove marker when mouse out of map
        $(mapRow).mouseout(function() {
          me.olMap.removeOverlay(me.olMap.getOverlayById('marker'));
          me.olMap2.removeOverlay(me.olMap2.getOverlayById('marker2'));
        });

        $(mapDiv2).css({'height': mapDiv.height() + 'px'});

        me.olMap.updateSize();
        me.olMap2.updateSize();

      },

      disableDoubleMap: function() {

        var me = this;

        var mapId = me.mapId;
        if(mapId === undefined) {
          mapId = 'mapDiv';
        }
        var mapDiv = $('#' + mapId);
        var mapRow = $('#' + mapId + 'Row');
        mapDiv.removeClass('mapDouble');
        if(me.olMap2 !== undefined) {
          me.olMap2.setTarget(null);
          me.olMap2 = undefined;
        }

        me.olMap.un('pointermove', me.addMarkerForDoubleMap, me);
        $(mapRow).off('mouseout');

        $('#' + mapId + '-cloned').remove();
        $('#marker').remove();
        $('#marker2').remove();

        var layer1 = me.olMap.getLayers().item(1);
        layer1.setVisible(true);

        me.olMap.updateSize();
      },

      enableMouseInfo: function(olEvent) {

        var me = this;
        // get mouse position used in scope display mode
        me.mousePosition = me.olMap.getEventPixel(olEvent.originalEvent);
        me.olMap.render();
      }

    };

    return Map;
  }])
  
  .directive('olMap', ['Layer', 'map', '$rootScope', function(Layer, Map, $rootScope) {

      return {
        restrict: 'AE',
        scope: false,
        controller: 'OlMapController',
        link: {
          pre: function preLink(scope, elm, attrs) {
            var options = {};
            var controls = [];
            var interactions = [];
            if(attrs.controls !== undefined && angular.isArray($rootScope.$eval(attrs.controls)) === true && attrs.controls.length > 0) {
              controls = $rootScope.$eval(attrs.controls);
            }
            if(attrs.interactions !== undefined && angular.isObject($rootScope.$eval(attrs.interactions)) === true) {
              interactions = $rootScope.$eval(attrs.interactions);
            }

            var mapId = 'mapDiv';
            if(attrs.mapId !== undefined && attrs.mapId !== null) {
              mapId = attrs.mapId;
            }

            var center;
            var zoom;
            var renderer;
            if(scope.center !== undefined && scope.center !== null) {
              center = scope.center;
            } else if(attrs.center !== undefined && attrs.center !== null) {
              center = $rootScope.$eval(attrs.center);
            }

            if(scope.zoom!== undefined && scope.zoom !== null) {
              zoom = scope.zoom;
            } else if(attrs.zoom !== undefined && attrs.zoom !== null) {
              zoom = $rootScope.$eval(attrs.zoom);
            }

            if(scope.renderer !== undefined && scope.renderer !== null) {
              renderer = scope.renderer;
            } else if(attrs.renderer !== undefined && attrs.renderer !== null) {
              renderer = $rootScope.$eval(attrs.renderer);
            }

            var mapRow = angular.element('<div class="row" id="'+mapId+'Row"></div>');
            var sliderRow = angular.element('<div class="row" id="'+mapId+'SliderRow"></div>');

            elm.append(mapRow);
            elm.append(sliderRow);
            
            if(scope.map === undefined) {
              scope.map = [];
            }
            
            var mapObject = new Map(elm, {
              mapId: attrs.mapId,
              center: center,
              zoom: zoom,
              renderer: renderer,
              controls: controls,
              interactions: interactions,
              options: options
            }, scope);
            scope.map.push(mapObject);

            mapObject.olMap.on('moveend', function(olEvent) {
              var me = this;
              scope.$broadcast('moveend', me, olEvent, mapId);
            });
            mapObject.olMap.on('pointermove', function(olEvent) {
              var me = this;
              scope.$broadcast('pointermove', me, olEvent, mapId);
            }, mapObject);
            mapObject.olMap.on('pointermove', mapObject.enableMouseInfo, mapObject);

            scope.$broadcast('mapready', mapId);

            // add responsiveness to ol3 map
            function setHeight(mapId) {
              var mapHeight = $(elm).height();
              var mapWidth = $(elm).width();

              $(elm[0]).find('#' + mapId).css({'height': mapHeight + 'px'});
              if($(elm[0]).find('#'+mapId + '-cloned') !== undefined) {
                $(elm[0]).find('#'+mapId + '-cloned').css({'height': mapHeight + 'px'});
              }
              
              setTimeout(function() {
                mapHeight = mapObject.olMap.getSize()[1];
                mapWidth = mapObject.olMap.getSize()[0];
                if(mapObject.getDisplayMode() === 'doubleMap') {
                  mapWidth = mapWidth + mapObject.getClonedMap().getSize()[0];
                }
                $(elm[0]).find('#vertical-slider').css({'height': mapHeight + 'px'});
                $(elm[0]).find('#horizontal-slider').css({'width': mapWidth + 'px'});
              }, 500);

              mapObject.olMap.updateSize();

            }
            $(window).resize(function() {
              setHeight(mapId);
            });
            
            setHeight(mapId);
          }
        }
      };

    }])
  .controller('OlMapController', ['$scope', function($scope) {

    $scope.getMap = function(mapId) {
      var mapObject;
      if(mapId === undefined) {
        mapId = 'mapDiv';
      }
      $scope.map.forEach(function(elt) {
        if(elt.mapId === mapId) {
          mapObject = elt;
        }
      });
      return mapObject;
    };
    
    $scope.$on('layerAdded', function(event, layer, index,  mapId) {

      var mapObject = $scope.getMap(mapId);

      var index = index;
      if(angular.isString(index)) {
        index = parseInt(index, 10);
      }

      // reorder layers
      var _olLayerArray = mapObject.getOlMap().getLayers().getArray();
      if(_olLayerArray.length > 1) {
        var layerIndexToRemove;
        mapObject.getOlMap().getLayers().getArray().forEach(function(_layer, _index) {
          if(_layer.get('ngLayer').getIdentifier() === layer.getIdentifier()) {
            layerIndexToRemove = _index;
          }
        });
        if(_olLayerArray[index].get('ngLayer').getIdentifier() !== layer.getIdentifier()) {
          mapObject.getOlMap().getLayers().removeAt(layerIndexToRemove);
          mapObject.getOlMap().getLayers().insertAt(index, layer.olLayer);
        }
      }
    });

  }]);
