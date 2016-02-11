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