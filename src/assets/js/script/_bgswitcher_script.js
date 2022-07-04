//https://fit-jp.com/bgswitcher/
// 第一引数でエフェクト用の要素を受け取れます。
$.BgSwitcher.switchHandlers.extraSlide = function($el) {
  $el.animate({right: -$el.width()}, this.config.duration, this.config.easing);
};
$(".box").bgswitcher({
    images: ["../images/mv_poligon_3.jpg", "../images/mv_poligon.jpg", "../images/mv_poligon_4.jpg"],
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