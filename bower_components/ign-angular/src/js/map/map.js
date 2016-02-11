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
