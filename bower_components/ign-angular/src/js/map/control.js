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
