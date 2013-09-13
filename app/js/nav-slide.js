var navSlide = {
  
  state: {
    leftOpen: false,
    rightOpen: false
  },

  config: {
    
  },

  //Event methods
  showLeftMenu: function() {
    if(!navSlide.state.leftOpen && !navSlide.state.rightOpen) {
      navSlide.state.leftOpen = true;
      if(navSlide.state.multipleNavs) {
        navSlide.state.rightNav.style('z-index', '0');
      }
      navSlide.state.appDiv.vendor('transform', 'translateX(' + navSlide.config.width + ')');
    }
  },

  showRightMenu: function() {
    if(!navSlide.state.leftOpen && !navSlide.state.rightOpen) {
      navSlide.state.rightOpen = true;
      if(navSlide.state.multipleNavs) {
        navSlide.state.rightNav.style('z-index', '2');
      }
      navSlide.state.appDiv.vendor('transform', 'translateX(-' + navSlide.config.width + ')');
    }
  },

  closeLeftMenu: function() {
    if(navSlide.state.leftOpen && !navSlide.state.rightOpen) {
      navSlide.state.appDiv.vendor('transform', 'translateX(0)');
      if(navSlide.state.multipleNavs) {
        setTimeout(function () { 
          navSlide.state.leftOpen = false; 
        }, navSlide.config.time - 100);
      } else {
        navSlide.state.leftOpen = false; 
      }
    }
  },

  closeRightMenu: function() {
    if(navSlide.state.rightOpen && !navSlide.state.leftOpen) {
      navSlide.state.appDiv.vendor('transform', 'translateX(0)');
      if(navSlide.state.multipleNavs) {
        setTimeout(function() {
          //after closing rearrange left and right menu
          navSlide.state.rightNav.style('z-index', '0');
          navSlide.state.rightOpen = false;
        }, navSlide.config.time - 200);
      } else {
        navSlide.state.rightOpen = false;
      }
    }
  },

  prepareMovement: function(e) {
    //if both are closed
    if(!navSlide.state.rightOpen && !navSlide.state.leftOpen) {
      var currentX = e.changedTouches[0].clientX;
      if(navSlide.state.lastX < currentX) {
        //Touch goes to the right
        navSlide.state.rightNav.style('z-index', '0');
      } else {
        navSlide.state.rightNav.style('z-index', '2');
      }
      navSlide.state.lastX = currentX; 
    }
  },

  prepareMovementStart: function(e) {
    navSlide.state.lastX = e.changedTouches[0].clientX;
  },

  //init methods
  initEvents: function() {
    if($$('.nav-slide-right').length == 1) {
      if(navSlide.state.multipleNavs) {
        document.body.addEventListener('touchmove', navSlide.prepareMovement);
        document.body.addEventListener('touchstart', navSlide.prepareMovementStart);
      }
      $$('body').swipeLeft(this.showRightMenu);
      $$('body').swipeRight(this.closeRightMenu);
    }

    if($$('.nav-slide-left').length == 1) {
      $$('body').swipeRight(this.showLeftMenu);
      $$('body').swipeLeft(this.closeLeftMenu);
    }
  },

  initStyles: function() {
    $$('.nav-slide').style('width', this.config.width);
    this.state.appDiv.vendor('transition-duration', this.config.time + 'ms');
  },

  init: function(config) {
    this.config = config;
    //save all elements
    this.state.leftNav = $$('.nav-slide-left');
    this.state.rightNav = $$('.nav-slide-right');
    this.state.appDiv = $$('#' + config.appId);
    this.state.multipleNavs = $$('.nav-slide').length > 1;
    this.initStyles();
    this.initEvents();
  }
};

$$(window).on('load', function () {
  var config = {
    width: '70%',
    time: 300,
    appId: 'app'
  };
  navSlide.init(config);
});
