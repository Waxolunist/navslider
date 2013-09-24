define(['jquery', 'jquery-mobile', 'underscore', 'javascript-state-machine'], function($, Mobile, _, StateMachine) {
  'use strict';
  var NavSlider = (function () {

    //private static
    var _config = {
      width: 80,
      time: 200,
      threshold: 0.5,
      appSelector: '#app',
      strategy: 'swipe',
      navClass: 'nav-slide',
      touchSensitivity: 5,
      touchStartSensitivity: 30
    };

    var _getX = function(e) {
      return e.originalEvent.changedTouches[0].clientX;
    };

    var cls = function (config) {
      config = _.extend(_config, config);
      //TODO validate config
    
      var tmp = {
        startX: undefined,
        currentNav: undefined
      };

      /* State callbacks */
      var init = function(event, from, to) {
        console.log('init');
        initStyles();
        initEvents();
        resetTransform();
        resetZIndex();
        tmp.multiplNavs = hasMultipleNavs();
        if(!tmp.multiplNavs) {
          if(existsNav('right')) {
            tmp.currentNav = 'right';
          } else if(existsNav('left')) {
            tmp.currentNav = 'left';
          }
        }
        tmp.width = $(config.appSelector).outerWidth();
      };

      this.reinit = function(newconfig) {
        config = _.extend(config, newconfig);
        $(window).off('.slider');
        init();
      };

      var resetTransform = function(event, from, to) {
        console.log('resetTransform: ' + fsm.current);
        $(config.appSelector).css('transform', 'translateX(0)');
      };
  
      var resetZIndex = function(event, from, to) {
        console.log('resetZIndex: ' + fsm.current);
        $('.' + config.navClass).css('z-index', 1);
      };

      var prepareNav = function(event, from, to, e) {
        console.log('prepareNav: ' + fsm.current);
        var x = _getX(e);   
        if(e.type === 'touchstart') {
          tmp.startX = x;
          tmp.lastX = x;
          if(tmp.multiplNavs) {
            tmp.currentNav = undefined;
            resetZIndex();
          }
        } else if (e.type === 'touchmove' && _.isUndefined(tmp.currentNav)) {
          if(x < tmp.startX) {
            if(tmp.multiplNavs) {
              tmp.currentNav = 'right'; 
              $('.' + config.navClass + '-' + tmp.currentNav).css('z-index', 2);
            }
          } else if(x > tmp.startX) {
            if(tmp.multiplNavs) {
              tmp.currentNav = 'left'; 
              $('.' + config.navClass + '-' + tmp.currentNav).css('z-index', 2);
            }
          }
        }
      };

      var moveNav = function(event, from, to, e) {
        console.log('moveNav: ' + fsm.current + ' - ' + e.type);
        var x = _getX(e);
        if(_.isUndefined(tmp.startX)) { 
          tmp.startX = x; 
        }
        if(_.isUndefined(tmp.lastX)) { 
          tmp.lastX = x; 
        }
        var distance = x - tmp.startX;
        var maxdistance = tmp.width * config.width / 100;
        if(e.type === 'touchmove') {
          if(Math.abs(distance) < maxdistance &&
             Math.abs(x - tmp.lastX) > config.touchSensitivity &&
             Math.abs(distance) > config.touchStartSensitivity &&
            ((distance > 0 && tmp.currentNav === 'left') || 
             (distance < 0 && tmp.currentNav === 'right'))) {
            $(config.appSelector).css('transform', 'translateX(' + distance + 'px)');
            tmp.lastX = x;
          }
        } else if(e.type === 'touchend' && from === 'moving') {
          if(Math.abs(distance) < maxdistance * config.threshold &&
            ((distance < 0 && tmp.currentNav === 'left') || 
             (distance > 0 && tmp.currentNav === 'right'))) {
            fsm.close();  
          } else {
            fsm.open();
            tmp.startX = undefined;
            tmp.lastX = undefined;
          }
        } else if(e.type === 'touchend' && from === 'opened') {
          fsm.open();
          tmp.startX = undefined;
          tmp.lastX = undefined;
        }
      };

      var _openLeft = function() {
        $(config.appSelector).css('transform', 'translateX(' + config.width + '%)');
      };

      var _openRight = function() {
        $(config.appSelector).css('transform', 'translateX(-' + config.width + '%)');
      };

      var openNav = function(event, from, to, dir, e) {
        console.log('openNav: ' + fsm.current);
        if(config.strategy === 'swipe') {
          if(e.type === 'swiperight' && dir === 'left' && tmp.currentNav === 'left') {
            _openLeft();
          } else if(e.type === 'swipeleft' && dir === 'right' && tmp.currentNav === 'right') {
            _openRight();
          } else {
            return false;
          }
          return true;
        } else if (config.strategy === 'touch') {
          if(tmp.currentNav === 'left') {
            _openLeft();
          } else if(tmp.currentNav === 'right') {
            _openRight();
          }  
        }
      };

      var closeNav = function(event, from, to, dir, e) {
        console.log('closeNav: ' + fsm.current);
        if(config.strategy === 'swipe') {
          if((e.type === 'swiperight' && dir === 'right' && tmp.currentNav === 'right') || 
             (e.type === 'swipeleft' && dir === 'left' && tmp.currentNav === 'left')) {
            resetTransform();
            return true;
          } else {
            return false;
          }
        } else if(config.strategy === 'touch') {
          resetTransform();
          return true;
        }
      };

      /* Init helper */
      var initStyles = function() {
        $('.' + config.navClass).width(config.width + '%');
        $(config.appSelector).css('transition-duration', config.time + 'ms');
      };

      var initEvents = function() {
        $(window).on('touchstart.slider', $.proxy(fsm.prepare, fsm)); 
        $(window).on('touchmove.slider', $.proxy(fsm.prepare, fsm)); 
        if(config.strategy === 'swipe') {
          if(existsNav('left')) {
            $(window).on('swiperight.slider', $.proxy(fsm.open, fsm, 'left')); 
            $(window).on('swipeleft.slider', $.proxy(fsm.close, fsm, 'left')); 
          }
          if(existsNav('right')) {
            $(window).on('swipeleft.slider', $.proxy(fsm.open, fsm, 'right')); 
            $(window).on('swiperight.slider', $.proxy(fsm.close, fsm, 'right')); 
          }
        } else if(config.strategy === 'touch') {
          $(window).on('touchmove.slider', $.proxy(fsm.move, fsm)); 
          $(window).on('touchend.slider', $.proxy(fsm.move, fsm)); 
        }
      };

      var existsNav = function(dir) {
        return $('.' + config.navClass + '-' + dir).length > 0;
      };

      var hasMultipleNavs = function() {
        return existsNav('right') && existsNav('left');
      };

      /* FSM */
      var createFSM = function () {
        var fsm = StateMachine.create({
          initial: { state: 'closed', event: 'init', defer: true },
          error: function(eventName, from, to, args, errorCode, errorMessage) {
            return 'event ' + eventName + ' was naughty :- ' + errorMessage;
          },
          events: [
            { name: 'prepare',  from: ['closed', 'prepared'], to: 'prepared' },
            { name: 'move',     from: ['opened', 'prepared', 'moving'], to: 'moving' },
            { name: 'open',     from: ['prepared', 'moving'], to: 'opened' },
            { name: 'close',    from: ['opened', 'moving'],   to: 'closed' }
          ],
          callbacks: {
            oninit: init,
            onprepare: prepareNav,
            onmove: moveNav,
            onbeforeopen: openNav,
            onbeforeclose: closeNav,
            onafterclose: closeNav
          }
        });

        return fsm;
      };

      var fsm = createFSM();
      fsm.init();
    };

    return cls;
  })();

  return NavSlider;
});
