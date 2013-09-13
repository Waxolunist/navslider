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
      if(navSlide.state.multipleNavs) {
        navSlide.state.leftNav.addClass('nav-slide-open');
        navSlide.state.rightNav.removeClass('nav-slide-open');
      }
      navSlide.state.appDiv.vendor('transform', 'translateX(' + navSlide.config.width + ')');
      navSlide.state.leftOpen = true;
    }
  },

  showRightMenu: function() {
    if(!navSlide.state.leftOpen && !navSlide.state.rightOpen) {
      if(navSlide.state.multipleNavs) {
        navSlide.state.leftNav.removeClass('nav-slide-open');
        navSlide.state.rightNav.addClass('nav-slide-open');
      }
      navSlide.state.appDiv.vendor('transform', 'translateX(-' + navSlide.config.width + ')');
      navSlide.state.rightOpen = true;
    }
  },

  closeLeftMenu: function() {
    if(navSlide.state.leftOpen && !navSlide.state.rightOpen) {
      navSlide.state.appDiv.vendor('transform', 'translateX(0)');
      if(navSlide.state.multipleNavs) {
        setTimeout(function () { 
          navSlide.state.leftOpen = false; 
        }, navSlide.config.time + 50);
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
        navSlide.state.rightNav.removeClass('nav-slide-open');
        navSlide.state.leftNav.addClass('nav-slide-open');
        navSlide.state.rightOpen = false;
        }, navSlide.config.time + 50);
      } else {
        navSlide.state.rightOpen = false;
      }
    }
  },

  //init methods
  initEvents: function() {
    if($$('.nav-slide-right').length == 1) {
      if(!navSlide.state.multipleNavs) {
        this.state.rightNav.addClass('nav-slide-open');
      }
      $$('body').swipeLeft(this.showRightMenu);
      $$('body').swipeRight(this.closeRightMenu);
    }

    if($$('.nav-slide-left').length == 1) {
      this.state.leftNav.addClass('nav-slide-open');
      $$('body').swipeRight(this.showLeftMenu);
      $$('body').swipeLeft(this.closeLeftMenu);
    }
  },

  initStyles: function() {
    $$('.nav-slide').style('width', this.config.width);
    this.state.appDiv.vendor('transition-duration', this.config.time + 'ms');
    setTimeout(function(){$$('.nav-slide').style('display', 'block');},500);
  },

  init: function(config) {
    this.config = config;
    this.state.leftNav = $$('.nav-slide-left');
    this.state.rightNav = $$('.nav-slide-right');
    this.state.appDiv = $$('#' + config.appId);
    this.state.multipleNavs = $$('.nav-slide').length > 1;
    this.initStyles();
    this.initEvents();
  }
};

$$(document).ready(function () {
  var config = {
    width: '70%',
    time: 300,
    appId: 'app'
  };
  navSlide.init(config);
});
