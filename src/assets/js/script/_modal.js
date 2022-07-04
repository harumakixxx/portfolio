$(function(){
    $('.top_works__contents img').on('click',function(){
        $('#body').css('overflow', 'hidden');
    });
    $('#lightbox,#lightboxOverlay,.lb-close').on('click',function(){
            $('#body').css('overflow', 'visible');
    });
});
