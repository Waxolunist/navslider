require.config({
  paths: {
    'underscore': '../components/underscore-amd/underscore',
    'jquery': '../components/jquery/jquery.min',
    'jquery-mobile': '../components/jquery-mobile-bower/js/jquery.mobile-1.3.2',
    'javascript-state-machine': '../components/javascript-state-machine/state-machine'
  }, 
  shim: {
    'underscore': {
      exports: '_'
    },
    'javascript-state-machine': {
      exports: 'StateMachine'
    }
  }
});

require(['nav-slide/navSlider'], function(NavSlider) {
  var navslider = new NavSlider({
    strategy: 'touch',
    time: 300,
    appSelector: '.ui-page',
    touchSensitivity: 5,
    touchPixelRatio: 1
  });

  var reinit = function() {
    navslider.reinit({
      strategy: $('#strategy').val()
    }); 
  };

  var addNav = function(dir) {
    $('.ui-page').before('<nav class="nav-slide nav-slide-' + dir + '">' + dir + '</nav>'); 
  };

  $('#strategy').change(reinit);
  $('#rightnav').change(function(e) {
    if(e.target.value === 'off') {
      $('.nav-slide-right').remove();
    } else {
      addNav('right');
    }
    reinit();
  });
  $('#leftnav').change(function(e) {
    if(e.target.value === 'off') {
      $('.nav-slide-left').remove();
    } else {
      addNav('left');
    }
    reinit();
  });

  addNav('left'); 
  addNav('right'); 
  reinit();

});
