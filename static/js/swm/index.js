/**
 * Created by yuyu on 14/12/26.
 */
(function($){
    var searchBtn = $('#searchBtn'),
        peapleSearchBtn = $('#peapleSearchBtn'),
        keywords = $('#keywords'),
        usage = $('#content').data('usage'),
        url = '/'+usage+'/list',
        peapleSearchUrl = '/'+usage+'/peapleSearchList',
        bindEvents = function(){
            keywords.on('change',function(e){
                var el = $(this),
                    userId = el.val();
                searchBtn.attr('href',url+'/'+userId);
                peapleSearchBtn.attr('href',peapleSearchUrl+'/'+userId);

            });
            keywords.on('keyup',function(e){
                var key = e.keyCode;
                if(key === 13){
                    $(location).attr('href',searchBtn.attr('href'));
                }
            });
        },
        init = function(){
            keywords.focus();
            bindEvents();
    }();
})(jQuery);