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