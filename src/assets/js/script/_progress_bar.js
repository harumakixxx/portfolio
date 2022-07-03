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