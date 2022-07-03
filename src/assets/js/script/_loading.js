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