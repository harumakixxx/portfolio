/*!
 * jQuery.BgSwitcher
 *
 * @version  0.4.3
 * @author   rewish <rewish.org@gmail.com>
 * @license  MIT License (https://github.com/rewish/jquery-bgswitcher/blob/master/LICENSE.md)
 * @link     https://github.com/rewish/jquery-bgswitcher
 */
(function($) {
    'use strict';
  
    var loadedImages = {},
  
        slice = Array.prototype.slice,
        toString = Object.prototype.toString,
  
        corners = ['Top', 'Right', 'Bottom', 'Left'],
        backgroundProperties = [
          'Attachment', 'Color', 'Image', 'Repeat',
          'Position', 'Size', 'Clip', 'Origin'
        ];
  
    $.fn.bgswitcher = function() {
      var args = arguments,
          instanceKey = BgSwitcher.keys.instance;
  
      return this.each(function() {
        var instance = $.data(this, instanceKey);
  
        if (!instance) {
          instance = new BgSwitcher(this);
          $.data(this, instanceKey, instance);
        }
  
        instance.dispatch.apply(instance, args);
      });
    };
  
    // Backward Compatibility
    $.fn.bgSwitcher = $.fn.bgswitcher;
  
    /**
     * BgSwitcher
     *
     * @param {HTMLElement} el
     * @constructor
     */
    function BgSwitcher(el) {
      this.$el = $(el);
      this.index = 0;
      this.config = $.extend({}, BgSwitcher.defaultConfig);
  
      this._setupBackgroundElement();
      this._listenToResize();
    }
  
    $.extend(BgSwitcher.prototype, {
      /**
       * Dispatch
       *
       * @param {string|Array} one
       */
      dispatch: function(one) {
        switch (toString.call(one)) {
          case '[object Object]':
            this.setConfig(one);
            break;
          case '[object String]':
            this[one].apply(this, slice.call(arguments, 1));
            break;
          default:
            throw new Error('Please specify a Object or String');
        }
      },
  
      /**
       * Set config
       *
       * @param {Object} config
       */
      setConfig: function(config) {
        this.config = $.extend(this.config, config);
  
        if (typeof this.config.random !== 'undefined') {
          this.config.shuffle = this.config.random;
        }
  
        this.refresh();
      },
  
      /**
       * Set images
       *
       * @param {Array} images
       */
      setImages: function(images) {
        this.imageList = new this.constructor.ImageList(images);
  
        if (this.config.shuffle) {
          this.imageList.shuffle();
        }
      },
  
      /**
       * Set switch handler
       *
       * @param {Function} fn
       */
      setSwitchHandler: function(fn) {
        this.switchHandler = $.proxy(fn, this);
      },
  
      /**
       * Default switch handler
       *
       * @param {string} type
       * @returns {Function}
       */
      getBuiltInSwitchHandler: function(type) {
        return this.constructor.switchHandlers[type || this.config.effect];
      },
  
      /**
       * Refresh
       */
      refresh: function() {
        this.setImages(this.config.images);
        this.setSwitchHandler(this.getBuiltInSwitchHandler());
        this._prepareSwitching();
  
        if (this.config.start) {
          this.start();
        }
      },
  
      /**
       * Start switching
       */
      start: function() {
        if (!this._timerID) {
          this._timerID = setTimeout($.proxy(this, 'next'), this.config.interval);
        }
      },
  
      /**
       * Stop switching
       */
      stop: function() {
        if (this._timerID) {
          clearTimeout(this._timerID);
          this._timerID = null;
        }
      },
  
      /**
       * Toggle between start/stop
       */
      toggle: function() {
        if (this._timerID) {
          this.stop();
        } else {
          this.start();
        }
      },
  
      /**
       * Reset switching
       */
      reset: function() {
        this.index = 0;
        this._prepareSwitching();
      },
  
      /**
       * Go to next switching
       */
      next: function() {
        var max = this.imageList.count();
  
        if (!this.config.loop && this.index + 1 === max) {
          return;
        }
  
        if (++this.index === max) {
          this.index = 0;
        }
  
        this.switching();
      },
  
      /**
       * Go to previous switching
       */
      prev: function() {
        if (!this.config.loop && this.index === 0) {
          return;
        }
  
        if (--this.index === -1) {
          this.index = this.imageList.count() - 1;
        }
  
        this.switching();
      },
  
      /**
       * Select the switching at index
       *
       * @param {number} index
       */
      select: function(index) {
        if (index === -1) {
          index = this.imageList.count() - 1;
        }
  
        this.index = index;
        this.switching();
      },
  
      /**
       * Switching the background image
       */
      switching: function() {
        var started = !!this._timerID;
  
        if (started) {
          this.stop();
        }
  
        this._createSwitchableElement();
        this._prepareSwitching();
        this.switchHandler(this.$switchable);
  
        if (started) {
          this.start();
        }
      },
  
      /**
       * Destroy...
       */
      destroy: function() {
        this.stop();
        this._stopListeningToResize();
  
        if (this.$switchable) {
          this.$switchable.stop();
          this.$switchable.remove();
          this.$switchable = null;
        }
  
        if (this.$bg) {
          this.$bg.remove();
          this.$bg = null;
        }
  
        this.$el.removeAttr('style');
        this.$el.removeData(this.constructor.keys.instance);
        this.$el = null;
      },
  
      /**
       * Adjust rectangle
       */
      _adjustRectangle: function() {
        var corner,
            i = 0,
            length = corners.length,
            offset = this.$el.position(),
            copiedStyles = {
              top: offset.top,
              left: offset.left,
              width: this.$el.innerWidth(),
              height: this.$el.innerHeight()
            };
  
        for (; i < length; i++) {
          corner = corners[i];
          copiedStyles['margin' + corner] = this.$el.css('margin' + corner);
          copiedStyles['border' + corner] = this.$el.css('border' + corner);
        }
  
        this.$bg.css(copiedStyles);
      },
  
      /**
       * Setup background element
       */
      _setupBackgroundElement: function() {
        this.$bg = $(document.createElement('div'));
        this.$bg.css({
          position: 'absolute',
          zIndex: (parseInt(this.$el.css('zIndex'), 10) || 0) - 1,
          overflow: 'hidden'
        });
  
        this._copyBackgroundStyles();
        this._adjustRectangle();
  
        if (this.$el[0].tagName === 'BODY') {
          this.$el.prepend(this.$bg);
        } else {
          this.$el.before(this.$bg);
          this.$el.css('background', 'none');
        }
      },
  
      /**
       * Create switchable element
       */
      _createSwitchableElement: function() {
        if (this.$switchable) {
          this.$switchable.remove();
        }
  
        this.$switchable = this.$bg.clone();
        this.$switchable.css({top: 0, left: 0, margin: 0, border: 'none'});
        this.$switchable.appendTo(this.$bg);
      },
  
      /**
       * Copy background styles
       */
      _copyBackgroundStyles: function () {
        var prop,
            copiedStyle = {},
            i = 0,
            length = backgroundProperties.length,
            backgroundPosition = 'backgroundPosition';
  
        for (; i < length; i++) {
          prop = 'background' + backgroundProperties[i];
          copiedStyle[prop] = this.$el.css(prop);
        }
  
        // For IE<=9
        if (copiedStyle[backgroundPosition] === undefined) {
          copiedStyle[backgroundPosition] = [
            this.$el.css(backgroundPosition + 'X'),
            this.$el.css(backgroundPosition + 'Y')
          ].join(' ');
        }
  
        this.$bg.css(copiedStyle);
      },
  
      /**
       * Listen to the resize event
       */
      _listenToResize: function() {
        var that = this;
        this._resizeHandler = function() {
          that._adjustRectangle();
        };
        $(window).on('resize', this._resizeHandler);
      },
  
      /**
       * Stop listening to the resize event
       */
      _stopListeningToResize: function() {
        $(window).off('resize', this._resizeHandler);
        this._resizeHandler = null;
      },
  
      /**
       * Prepare the Switching
       */
      _prepareSwitching: function() {
        this.$bg.css('backgroundImage', this.imageList.url(this.index));
      }
    });
  
    /**
     * Data Keys
     * @type {Object}
     */
    BgSwitcher.keys = {
      instance: 'bgSwitcher'
    };
  
    /**
     * Default Config
     * @type {Object}
     */
    BgSwitcher.defaultConfig = {
      images: [],
      interval: 5000,
      start: true,
      loop: true,
      shuffle: false,
      effect: 'fade',
      duration: 1000,
      easing: 'swing'
    };
  
    /**
     * Built-In switch handlers (effects)
     * @type {Object}
     */
    BgSwitcher.switchHandlers = {
      fade: function($el) {
        $el.animate({opacity: 0}, this.config.duration, this.config.easing);
      },
  
      blind: function($el) {
        $el.animate({height: 0}, this.config.duration, this.config.easing);
      },
  
      clip: function($el) {
        $el.animate({
          top: parseInt($el.css('top'), 10) + $el.height() / 2,
          height: 0
        }, this.config.duration, this.config.easing);
      },
  
      slide: function($el) {
        $el.animate({top: -$el.height()}, this.config.duration, this.config.easing);
      },
  
      drop: function($el) {
        $el.animate({
          left: -$el.width(),
          opacity: 0
        }, this.config.duration, this.config.easing);
      },
  
      hide: function($el) {
        $el.hide();
      }
    };
  
    /**
     * Define effect
     *
     * @param {String} name
     * @param {Function} fn
     */
    BgSwitcher.defineEffect = function(name, fn) {
      this.switchHandlers[name] = fn;
    };
  
    /**
     * BgSwitcher.ImageList
     *
     * @param {Array} images
     * @constructor
     */
    BgSwitcher.ImageList = function(images) {
      this.images = images;
      this.createImagesBySequence();
      this.preload();
    };
  
    $.extend(BgSwitcher.ImageList.prototype, {
      /**
       * Images is sequenceable
       *
       * @returns {boolean}
       */
      isSequenceable: function() {
        return typeof this.images[0] === 'string' &&
            typeof this.images[1] === 'number' &&
            typeof this.images[2] === 'number';
      },
  
      /**
       * Create an images by sequence
       */
      createImagesBySequence: function() {
        if (!this.isSequenceable()) {
          return;
        }
  
        var images = [],
            base = this.images[0],
            min = this.images[1],
            max = this.images[2];
  
        do {
          images.push(base.replace(/\.\w+$/, min + '$&'));
        } while (++min <= max);
  
        this.images = images;
      },
  
      /**
       * Preload an images
       */
      preload: function() {
        var path,
            length = this.images.length,
            i = 0;
  
        for (; i < length; i++) {
          path = this.images[i];
          if (!loadedImages[path]) {
            loadedImages[path] = new Image();
            loadedImages[path].src = path;
          }
        }
      },
  
      /**
       * Shuffle an images
       */
      shuffle: function() {
        var j, t,
            i = this.images.length,
            original = this.images.join();
  
        if (!i) {
          return;
        }
  
        while (i) {
          j = Math.floor(Math.random() * i);
          t = this.images[--i];
          this.images[i] = this.images[j];
          this.images[j] = t;
        }
  
        if (this.images.join() === original) {
          this.shuffle();
        }
      },
  
      /**
       * Get the image from index
       *
       * @param {number} index
       * @returns {string}
       */
      get: function(index) {
        return this.images[index];
      },
  
      /**
       * Get the URL with function of CSS
       *
       * @param {number} index
       * @returns {string}
       */
      url: function(index) {
        return 'url(' + this.get(index) + ')';
      },
  
      /**
       * Count of images
       *
       * @returns {number}
       */
      count: function() {
        return this.images.length;
      }
    });
  
    $.BgSwitcher = BgSwitcher;
  }(jQuery));
!function(a){"function"==typeof define&&define.amd?define(["jquery"],a):"object"==typeof exports?module.exports=a(require("jquery")):a(jQuery)}(function(a){function i(){var b,c,d={height:f.innerHeight,width:f.innerWidth};return d.height||(b=e.compatMode,(b||!a.support.boxModel)&&(c="CSS1Compat"===b?g:e.body,d={height:c.clientHeight,width:c.clientWidth})),d}function j(){return{top:f.pageYOffset||g.scrollTop||e.body.scrollTop,left:f.pageXOffset||g.scrollLeft||e.body.scrollLeft}}function k(){if(b.length){var e=0,f=a.map(b,function(a){var b=a.data.selector,c=a.$element;return b?c.find(b):c});for(c=c||i(),d=d||j();e<b.length;e++)if(a.contains(g,f[e][0])){var h=a(f[e]),k={height:h[0].offsetHeight,width:h[0].offsetWidth},l=h.offset(),m=h.data("inview");if(!d||!c)return;l.top+k.height>d.top&&l.top<d.top+c.height&&l.left+k.width>d.left&&l.left<d.left+c.width?m||h.data("inview",!0).trigger("inview",[!0]):m&&h.data("inview",!1).trigger("inview",[!1])}}}var c,d,h,b=[],e=document,f=window,g=e.documentElement;a.event.special.inview={add:function(c){b.push({data:c,$element:a(this),element:this}),!h&&b.length&&(h=setInterval(k,250))},remove:function(a){for(var c=0;c<b.length;c++){var d=b[c];if(d.element===this&&d.data.guid===a.guid){b.splice(c,1);break}}b.length||(clearInterval(h),h=null)}},a(f).on("scroll resize scrollstop",function(){c=d=null}),!g.addEventListener&&g.attachEvent&&g.attachEvent("onfocusin",function(){d=null})});

//https://fit-jp.com/bgswitcher/
// 第一引数でエフェクト用の要素を受け取れます。
$.BgSwitcher.switchHandlers.extraSlide = function($el) {
  $el.animate({right: -$el.width()}, this.config.duration, this.config.easing);
};
$(".box").bgswitcher({
    images: ["../images/mv_poligon_3.jpg", "../images/mv_poligon_2.jpg", "../images/mv_poligon.jpg"],
    effect: "fade"
  });

  //スマホ最下部スクロール時、見えるのを防ぐ
  $(window).scroll(function () {
    var top = $("#top_works").offset().top; // ターゲットの位置取得
    var position = top - $(window).height();  // 発火させたい位置
    if ($(window).scrollTop() > position) {
      $('.box__wrap').css('display','none');
    }else{
      $('.box__wrap').css('display','block');

    }
  });
//https://coco-factory.jp/ugokuweb/move01/4-1-4/
//logoの表示
$(window).on('load',function(){
    $('#body').css('overflow', 'hidden');//追加部分 スクロール禁止
    $("#splash").delay(1500).fadeOut('slow');//ローディング画面を1.5秒（1500ms）待機してからフェードアウト
    $("#splash_logo").delay(1200).fadeOut('slow');//ロゴを1.2秒（1200ms）待機してからフェードアウト
    $('#body').delay(1500).queue(function(){//追加部分 スクロール解除
      $(this).css('overflow', 'visible');
      });
  });

{
    const globalMenuButton = document.querySelector('#global-menu-button');
    const globalMenuImg    = document.querySelector('#global-menu-img');
    const main = document.querySelector('main');
    const globalMenuOverlay    = document.querySelector('#global-menu-overlay');
    const body = document.querySelector('body');

    let openLabel   = globalMenuButton.dataset.openLabel;
    let closeLabel  = globalMenuButton.dataset.closeLabel;

    let overlayMenu = document.querySelector(`#${globalMenuButton.getAttribute('aria-controls')}`);
    let menuTitle   = document.querySelector(`#${globalMenuImg.getAttribute('aria-labelledby')}`);

    const toggleRegion = () => {
        if (globalMenuButton.getAttribute('aria-expanded') == 'false') {
            globalMenuButton.setAttribute('aria-expanded', 'true');
            overlayMenu.setAttribute('aria-hidden', 'false');
            menuTitle.innerHTML = closeLabel;
            globalMenuButton.focus();
            body.classList.add('clip');
        } else {
            globalMenuButton.setAttribute('aria-expanded', 'false');
            overlayMenu.setAttribute('aria-hidden', 'true');
            menuTitle.innerHTML = openLabel;
            body.classList.remove('clip');
        }
    };
    //開いているときmainを押したら閉じる
    const toggleRegion_check = () => {
        if (globalMenuButton.getAttribute('aria-expanded') == 'false') {
        } else {
            globalMenuButton.setAttribute('aria-expanded', 'false');
            overlayMenu.setAttribute('aria-hidden', 'true');
            menuTitle.innerHTML = openLabel;
            body.classList.remove('clip'); 
        }
    };
    globalMenuButton.addEventListener('click', toggleRegion);
    //追加 ボタン押したらtoggleregionでボタン状態（展開状態見る）
    globalMenuOverlay.addEventListener('click', toggleRegion);
    main.addEventListener('click', toggleRegion_check);
}
//追加部分（発火タイミング）-------------
var animationFlag = false;
$(window).scroll(function () {
  var top = $(".top_skill__flex").offset().top; // ターゲットの位置取得
  var position = top - $(window).height();  // 発火させたい位置
  if ($(window).scrollTop() > position) {
    if(!animationFlag) { //Flagをたてて2回目停止
      animationFlag = true;
  //-------------

    var metar = $('.meter');
    for (var i = 0; i < metar.length; i++) {
      a(i);

      function a(i) {
        var metarClass = metar.eq(i).attr('class');
        var classArray = metarClass.split(' ');
        var classMatch = [];

        for (var n = 0; n < classArray.length; n++) {
          if (classArray[n].match(/meter-/)) {
            classMatch.push(classArray[n]);
          }
        }
        var num = classMatch.join(',');
        var metarNum = num.slice(-2);
        if (metarNum == 00) {
          var metarNum = 100;
        }
        function action() {
          $('.meter-line-inner').eq(i).animate({
            width: metarNum + '%'
          }, 4000, 'swing');

          $('.meter-percent').eq(i).animate({
            left: metarNum + '%'
          }, 4000, 'swing');
        }
        action();
        function numCount() {
          var num = 0;
          var speed = 10;
          var count = setInterval(function () {
            $('.meter-num').eq(i).text(num);
            num++;
            if (num > metarNum) {
              clearInterval(count);
            }
          }, speed);
        }
        numCount();

      }
    }

//追加部分（発火タイミング）-------------
  }
  } else {
    // それ以外の動き
  }
})
//------------------------------
//Vue
//https://python.ms/transition/#_4-%E8%A3%9C%E8%B6%B3
  new Vue({
    el: '#top_works',
    data: {
      show: '0',
    }
  })