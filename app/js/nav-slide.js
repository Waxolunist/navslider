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
      navSlide.state.appDiv.vendor('transform', 'translateX(' + navSlide.config.width + '%)');
    }
  },

  showRightMenu: function() {
    if(!navSlide.state.leftOpen && !navSlide.state.rightOpen) {
      navSlide.state.rightOpen = true;
      if(navSlide.state.multipleNavs) {
        navSlide.state.rightNav.style('z-index', '2');
      }
      navSlide.state.appDiv.vendor('transform', 'translateX(-' + navSlide.config.width + '%)');
    }
  },

  moveLeftMenu: function(e) {
    if(!(e instanceof TouchEvent)) {
      return;
    }
    //if both are closed
    if(!navSlide.state.rightOpen && !navSlide.state.movingRight) {
      var currentX = e.changedTouches[0].clientX;
      if(navSlide.state.startX < currentX) {
        //Touch goes to the right
        navSlide.state.movingLeft = true;
        navSlide.state.movingRight = false;
        var distance = currentX - navSlide.state.startX;
        //if(window.innerWidth * navSlide.config.width / 100 - 10 < distance) {
        //  navSlide.showLeftMenu();
        //} else {
          navSlide.state.appDiv.vendor('transform', 'translateX(' + distance + 'px)');
        //}
      }
    }
  },

  moveRightMenu: function(e) {
    if(!(e instanceof TouchEvent)) {
      return;
    }
    //if both are closed
    if(!navSlide.state.leftOpen && !navSlide.state.movingLeft) {
      var currentX = e.changedTouches[0].clientX;
      if(navSlide.state.startX > currentX) {
        //Touch goes to the left
        navSlide.state.movingRight = true;
        navSlide.state.movingLeft = false;
        var distance = navSlide.state.startX - currentX;
        //if(window.innerWidth * navSlide.config.width / 100 - 10 < distance) {
        //  navSlide.showRightMenu();
        //} else {
          navSlide.state.appDiv.vendor('transform', 'translateX(-' + distance + 'px)');
        //}
      }
    }
  },

  resetMoveLeftMenu: function(e) {
    if(!(e instanceof TouchEvent)) {
      return;
    }
    //if both are closed
    if(!navSlide.state.rightOpen && !navSlide.state.movingRight && navSlide.state.movingLeft) {
      var currentX = e.changedTouches[0].clientX;
      //Touch goes to the left
      var distance = navSlide.state.startX - currentX;
      if(window.innerWidth * navSlide.config.width / 100 * navSlide.config.threshold < distance) {
        navSlide.showLeftMenu();
      } else {
        navSlide.closeLeftMenu();
      }
      navSlide.state.movingLeft = false;
      navSlide.state.movingRight = false;
    }
  },

  resetMoveRightMenu: function(e) {
    if(!(e instanceof TouchEvent)) {
      return;
    }
    //if both are closed
    if(!navSlide.state.leftOpen && !navSlide.state.movingLeft && navSlide.state.movingRight) {
      var currentX = e.changedTouches[0].clientX;
      //Touch goes to the left
      var distance = navSlide.state.startX - currentX;
      if(window.innerWidth * navSlide.config.width / 100 * navSlide.config.threshold < distance) {
        navSlide.showRightMenu();
      } else {
        navSlide.closeRightMenu();
      }
      navSlide.state.movingLeft = false;
      navSlide.state.movingRight = false;
    }
  },

  closeLeftMenu: function() {
    if((navSlide.state.leftOpen && !navSlide.state.rightOpen) || navSlide.state.movingLeft )  {
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
    if((navSlide.state.rightOpen && !navSlide.state.leftOpen) || navSlide.state.movingRight) {
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
    if(!(e instanceof TouchEvent)) {
      return;
    }
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
    if(!(e instanceof TouchEvent)) {
      return;
    }
    navSlide.state.lastX = e.changedTouches[0].clientX;
    navSlide.state.startX = e.changedTouches[0].clientX;
  },

  //init methods
  initEvents: function() {
    if($$('.nav-slide-right').length == 1) {
      if(this.state.multipleNavs) {
        $$('body').on('touchmove', this.prepareMovement);
        $$('body').on('touchstart', this.prepareMovementStart);
      }
      if(this.config.strategy == 'swipe') {
        $$('body').swipeLeft(this.showRightMenu);
        $$('body').swipeRight(this.closeRightMenu);
      } else if (this.config.strategy == 'touch') {
        $$('body').on('touchmove', this.moveRightMenu);
        $$('body').on('touchend', this.resetMoveRightMenu);
        navSlide.state.movingRight = false;
        //Register only if not already registered
        if(!this.state.multipleNavs) {
          $$('body').on('touchstart', this.prepareMovementStart);
        }
      }
      this.state.rightOpen = false;
    }

    if($$('.nav-slide-left').length == 1) {
      if(this.config.strategy == 'swipe') {
        $$('body').swipeRight(this.showLeftMenu);
        $$('body').swipeLeft(this.closeLeftMenu);
      } else if (this.config.strategy == 'touch') {
        $$('body').on('touchmove', this.moveLeftMenu);
        $$('body').on('touchend', this.resetMoveLeftMenu);
        this.state.movingLeft = false;
        //Register only if not already registered
        if(!this.state.multipleNavs) {
          $$('body').on('touchstart', this.prepareMovementStart);
        }
      }
      this.state.leftOpen = false;
    }
  },

  initStyles: function() {
    $$('.nav-slide').style('width', this.config.width + '%');
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
