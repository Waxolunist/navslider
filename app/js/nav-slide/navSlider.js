define(['jquery', 'jquery-mobile', 'underscore', 'javascript-state-machine'], function($, Mobile, _, StateMachine) {
  'use strict';
  var NavSlider = (function () {

    //private static
    var _config = {
      width: 80,
      time: 300,
      threshold: 0.5,
      appSelector: '#app',
      strategy: 'swipe',
      navClass: 'nav-slide',
      touchSensitivity: 5,
      touchStartSensitivity: 30,
      touchPixelRatio: 1.5
    };

    var _getX = function(e) {
      return e.originalEvent.changedTouches[0].clientX;
    };

    var cls = function (config) {
      config = _.extend(_config, config);
      //TODO validate config
    
      var tmp = {
        startX: undefined,
        lastX: undefined,
        currentNav: undefined,
        multiplNavs: false,
        width: 0,
        openwidth: 0
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
        tmp.openwidth =  tmp.width * config.width / 100;
      };

      this.reinit = function(newconfig) {
        config = _.extend(config, newconfig);
        $(window).off('.slider');
        init();
      };

      var resetTransform = function(event, from, to) {
        console.log('resetTransform: ' + fsm.current);
        $(config.appSelector).css('transform', 'translate3d(0,0,0)');
      };
  
      var resetZIndex = function(event, from, to) {
        console.log('resetZIndex: ' + fsm.current);
        $('.' + config.navClass).css('z-index', 1);
      };

      var prepareNav = function(event, from, to, e) {
        e.preventDefault();
        var x = _getX(e);   
        if(e.type === 'touchstart') {
          console.log('prepareNav: ' + fsm.current);
          tmp.startX = x;
          tmp.lastX = x;
          if(tmp.multiplNavs) {
            tmp.currentNav = undefined;
            resetZIndex();
          }
        } else if (e.type === 'touchmove' && _.isUndefined(tmp.currentNav)) {
          console.log('prepareNav: ' + fsm.current);
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

      var moveNav = function(e) {
        console.log('moveNav: ' + fsm.current + ' - ' + e.type);
        e.preventDefault();
        var x = _getX(e);
        var distance = x - (tmp.startX || 0);
        if(e.type === 'touchstart') {
          tmp.startX = x; 
        } else if(e.type === 'touchmove') {
          if(Math.abs(distance) > config.touchSensitivity &&
             Math.abs(x - tmp.lastX) > config.touchSensitivity) {
            if(distance < 0 && ((tmp.currentNav === 'right' && fsm.current === 'closed') || (tmp.currentNav === 'left' && fsm.current === 'opened'))) {
              $(config.appSelector).css('transform', 'translate3d(' + Math.min(Math.max(distance / config.touchPixelRatio, tmp.openwidth * -1), 0) + 'px,0,0)');
            } else if(distance > 0 && ((tmp.currentNav === 'right' && fsm.current === 'opened') || (tmp.currentNav === 'left' && fsm.current === 'closed'))) {
              $(config.appSelector).css('transform', 'translate3d(' + Math.max(Math.min(distance / config.touchPixelRatio, tmp.openwidth), 0) + 'px,0,0)');
            }
            tmp.lastX = x;
          }
        } else if(e.type === 'touchend') {
          if(Math.abs(distance) > tmp.width * config.threshold) {
            if(fsm.current === 'closed') {
              fsm.open(undefined, e);
            } 
          } else {
            fsm.close(undefined, e);
          }
        }
        /*
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
        */
      };

      var _openLeft = function() {
        var distance = tmp.width * config.width / 100;
        $(config.appSelector).css('transform', 'translate3d(' + distance + 'px,0,0)');
      };

      var _openRight = function() {
        var distance = tmp.width * config.width / 100;
        $(config.appSelector).css('transform', 'translate3d(-' + distance + 'px,0,0)');
      };

      var openNav = function(event, from, to, dir, e) {
        e.preventDefault();
        console.log('openNav: ' + fsm.current);
        if(config.strategy === 'swipe' && from === 'closed') {
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
        return false;
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
          $(window).on('touchstart.slider', moveNav); 
          $(window).on('touchmove.slider', moveNav); 
          $(window).on('touchend.slider', moveNav); 
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
          initial: { state: 'initial', event: 'init', defer: true },
          error: function(eventName, from, to, args, errorCode, errorMessage) {
            return 'event ' + eventName + ' was naughty :- ' + errorMessage;
          },
          events: [
            { name: 'prepare',  from: ['initial', 'closed'], to: 'closed' },
            { name: 'open',     from: ['closed'], to: 'opened' },
            { name: 'close',    from: ['opened', 'closed'],   to: 'closed' }
          ],
          callbacks: {
            oninit: init,
            onprepare: prepareNav,
            onbeforeopen: openNav,
            onbeforeclose: closeNav
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
