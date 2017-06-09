/**
 * Created by yuyu on 14-6-23.
 */
(function($){
    var wraps = $('.wrap'),
        body = $(document.body),
        currentIndex = [0,0,0],
        count,
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
                html = ['','',''];
            for(var i= 0,l= a.length;i<l;i++){
                item = a[i];
                html[i%3] += buildGoodsItem(item);
                if(parseInt(i/3) === 0){
                    wraps.eq(parseInt(i%3)).find('.te-cover').html(buildGoodsItem(item));
                }
            }

            for(var i= 0,l=html.length;i<l;i++){
                wraps.eq(i).find('.goods-container').html(html[i]);

            }

            count = parseInt(a.length/3);
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
            body.delegate('.wrap','webkitAnimationStart', function (e) {
                var el = $(this);
                el.data('is-in-animation',true);
            });
            body.delegate('.wrap','webkitAnimationEnd', function (e) {
                var el = $(this),
                    index = el.data('index'),
                    nextWrap = wraps.eq(parseInt(index)+1),
                    currentLoop = nextWrap.attr('data-current-loop');
                el.find('.te-cover').removeClass('te-hide');
                el.removeClass('te-perspective');
                el.find('.te-transition').removeClass('te-show');
                el.data('is-in-animation',false);
                console.info(currentLoop);
                console.info(wraps.eq(0).data('current-loop'));
                if((index==0 || index==1) && currentLoop!=wraps.eq(0).attr('data-current-loop')){
                    nextWrap.trigger('flip.booth');
                }
            });
            body.delegate('.wrap','flip.booth',function(e){
                var el = $(this);
                showNext(el);
            });
            body.on('keyup',function(e){
                var key = e.keyCode,
                    isInAnimation = false;
                for(var i= 0,l=wraps.length;i<l;i++){
                    if(wraps.eq(i).data('is-in-animation')==true){
                        isInAnimation = true;
                        break;
                    }
                }
                if(key === 32 && isInAnimation===false){
                    wraps.eq(0).trigger('flip.booth');
                }
            });
        },
        showNext = function (el) {
            el.addClass('te-perspective');
            el.find('.te-transition').addClass('te-show');
            el.find('.te-cover').addClass('te-hide');
            updateShowInfo(el);
        },
        updateShowInfo = function (el) {
            var lastIndex,
                last,
                current,
                index = parseInt(el.data('index'));
            if(currentIndex[index] === count-1){
                lastIndex = count-1;
                currentIndex[index] = 0;
            }
            else{
                lastIndex = currentIndex[index];
                ++currentIndex[index];
            }
            console.info(index);
            console.info(currentIndex);
            last = el.find('.goods-item').eq(lastIndex);
            current = el.find('.goods-item').eq(currentIndex[index]);

            el.find('.te-front').empty().append(last.clone());
            el.find('.te-back').empty().append(current.clone());

            el.find('.te-cover').empty().append(current.clone());

            el.attr('data-current-loop',currentIndex[index]);
        },
        init = function () {
            getGoodsData();
            bindEvents();
        }();
})(jQuery);