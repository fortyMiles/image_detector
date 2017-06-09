/**
 * Created by yuyu on 14-6-23.
 */
(function($){
    var goodsContainer = $('.goods-container'),
        cover = $('#cover'),
        content = $('#content'),
        body = $(document.body),
        transition = $('.te-transition'),
        front = $('.te-front'),
        back = $('.te-back'),
        currentIndex = 0,
        count,
        goodsGroups,
        isInAnimation = false,
        getGoodsData = function () {
            $.ajax({
                url : 'love.json',
                dataType : 'json'
            }).done(buildGoodsList)
                .fail(function(o){
                    console.info('请求失败');
                });
        },
        buildGoodsList = function(a){
            var item,
                html = '';
            for(var i= 0,l= a.length;i<l;i++){
                item = a[i];
                if(i%3 === 0){
                    html += '<div class="goods-group clear-float">';
                }
                html += buildGoodsItem(item);
                if(i%3 === 2){
                    html += '</div>';
                }
                if(i === 2){
                    cover.html(html);
                }
            }
            goodsContainer.html(html);
            goodsGroups = goodsContainer.find('.goods-group');
            count = goodsGroups.length;
        },
        createGoodsUrl = function (id) {
            return 'http://item.taobao.com/item.htm?id='+id;
        },
        createImgUrl = function (s) {
            return 'http://img04.taobaocdn.com/bao/uploaded/'+s+'_270x270xz.jpg';
        },
        buildGoodsItem = function (o) {
            var auctionId,
                cnt,
                picUrl,
                price,
                title,
                html = '',
                url,
                imgUrl;
            auctionId = o.auctionId;
            cnt = o.cnt;
            picUrl = o.picUrl;
            price = o.price;
            title = o.title;
            url = createGoodsUrl(auctionId);
            imgUrl = createImgUrl(picUrl);
            html += '<dl class="goods-item">';
            html += '<dt>';
            html += '<a href="';
            html += url;
            html += '" title="';
            html += title;
            html += '">';
            html += '<img src="';
            html += imgUrl;
            html += '" alt="';
            html += title;
            html += '"/>';
            html += '</a>';
            html += '</dt>';
            html += '<dd>';
            html += '<a href="';
            html += url;
            html += '" title="';
            html += title;
            html += '">';
            html += title;
            html += '</a>';
            html += '</dd>';
            html += '<dd class="clear-float">';
            html += '<span class="price"><i class="cny">&yen;</i>';
            html += price;
            html += '</span>';
            html += '<span class="score">选品分值：';
            html += parseFloat(cnt).toFixed(2);
            html += '</span>';
            html += '</dd>';
            html += '</dl>';

            return html;
        },
        bindEvents = function () {
            content.on({
                'webkitAnimationStart' : function( event ) {
                    isInAnimation = true;
                },
                'webkitAnimationEnd'   : function( event ) {
                    cover.removeClass('te-hide');
                    content.removeClass('te-perspective');
                    transition.removeClass('te-show');
                    isInAnimation = false;
                }
            });
            body.on('keyup',function(e){
                var key = e.keyCode;
                if(isInAnimation === true){
                    return;
                }
                if(key===32||key===13||key===39){
                    showNext();
                }
                else if(key === 37){
                    showPrevious();
                }
            });
        },
        showNext = function () {
            transition.removeClass('te-rotation2');
            transition.addClass('te-rotation1');
            content.addClass('te-perspective');
            transition.addClass('te-show');
            cover.addClass('te-hide');
            updateShowInfo();
        },
        showPrevious = function () {
            transition.removeClass('te-rotation1');
            transition.addClass('te-rotation2');
            content.addClass('te-perspective');
            transition.addClass('te-show');
            cover.addClass('te-hide');
            updateShowInfo(true);
        },
        updateShowInfo = function (isPrevious) {
            var lastIndex,
                lastGroup,
                currentGroup;
            if(isPrevious){
                if(currentIndex === 0){
                    currentIndex = count-1;
                    lastIndex = 0;
                }
                else{
                    lastIndex = currentIndex;
                    --currentIndex;
                }

                lastGroup = goodsGroups.eq(lastIndex);
                currentGroup = goodsGroups.eq(currentIndex);
                front.empty().append(currentGroup.clone());
                back.empty().append(lastGroup.clone());
            }
            else{
                if(currentIndex === count-1){
                    lastIndex = count-1;
                    currentIndex = 0;
                }
                else{
                    lastIndex = currentIndex;
                    ++currentIndex;
                }

                lastGroup = goodsGroups.eq(lastIndex);
                currentGroup = goodsGroups.eq(currentIndex);
                front.empty().append(lastGroup.clone());
                back.empty().append(currentGroup.clone());
            }


            cover.empty().append(currentGroup.clone());
        },
        init = function () {
            getGoodsData();
            bindEvents();
        }();
})(jQuery);