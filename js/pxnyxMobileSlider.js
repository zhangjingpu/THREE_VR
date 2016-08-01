(function($){
    $.fn.yxMobileSlider = function(settings){
        var defaultSettings = {
            width: 640, //容器宽度
            height: 320, //容器高度
            during: 5000, //间隔时间
            speed:30, //滑动速度
            number:1, //屏幕显示图片数
            blank :0,//图片间的空隙
        };
        //合并两个参数
        settings = $.extend(true,{}, defaultSettings, settings);
        return this.each(function(){
            var _this = $(this), s = settings;
            var startX = 0, startY = 0; //触摸开始时手势横纵坐标
            var temPos; //滚动元素当前位置
            var iCurr = 0; //当前滚动屏幕数
            var timer = null; //计时器
            var oMover = $("ul", _this); //滚动元素
            var oLi = $("li", oMover); //滚动单元
            var num = Math.ceil(oLi.length/ s.number); //滚动屏幕数
            var oPosition = {}; //触点位置
            var moveWidth = s.width; //滚动宽度

            //初始化主体样式
            _this.width(s.width).height(s.height).css({
                position: 'absolute',
                overflow: 'hidden',
                bottom: 0,
				margin:'0 auto'
                //background : 'black'
            }); //设定容器宽高及样式
            oMover.css({
                position: 'absolute',
                left: 0
            });
            oLi.css({
                display: 'inline',
                float: 'left'
            });
            $("img", oLi).css({
                width: '100%',
                height: '100%'
            });
            //初始化焦点容器及按钮
            _this.append('<div class="focus"><div></div></div>');
            var oFocusContainer = $(".focus");

            for (var i = 0; i < num; i++) {
                $("div", oFocusContainer).append("<span></span>");
            }
            var oFocus = $("span", oFocusContainer);
            oFocusContainer.css({
                minHeight: $(this).find('span').height(),
                position: 'absolute',
                bottom: 0
            });
            $("span", oFocusContainer).css({
                display: 'block',
                float: 'left',
                cursor: 'pointer'
            });
            $("div", oFocusContainer).width(oFocus.outerWidth(true) * num).css({
                position: 'absolute',
                right: 10,
                top: '50%',
                marginTop: -$(this).find('span').width()
            });
            oFocus.first().addClass("current");

            //执行函数
            main();
            function main(){
                if (isMobile()) {
                    mobileSettings();
                    bindTochuEvent();
                }
                /**设定滚动单元宽高
                 * 宽 ：用屏幕的宽度/一行放置的图片数 - 图片间的空隙**/
                oLi.width(_this.width()/ s.number - s.blank).height(_this.height());
                /**设置ul的宽高
                 * 宽度 ：所有li宽度的总和
                 * 高度 ：容器的高度**/
                oMover.width(oLi.length * (oLi.width() + s.blank)).height(_this.height());
                oFocusContainer.width(_this.width()).height(_this.height() * 0.15).css({
                    zIndex: 2
                });//设定焦点容器宽高样式
                _this.fadeIn(150);
            }

            //页面加载完毕BANNER自动滚动
            autoMove();

            //PC机下焦点切换
            if (!isMobile()) {
                oFocus.hover(function(){
                    iCurr = $(this).index() - 1;
                    stopMove();
                    doMove();
                }, function(){
                    autoMove();
                })
            }

            //自动运动
            function autoMove(){
                timer = setInterval(doMove, s.during);
            }

            //停止自动运动
            function stopMove(){
                clearInterval(timer);
            }

            //运动效果
            function doMove(){
                //当只有一个单元的数据时，把图片移动到中间
                if(num == 1 ){
                    var p_num = oLi.length % s.number;
                    doAnimate((-moveWidth * (iCurr - 1) + -moveWidth / s.number * p_num)/2);
                }else{
                    iCurr = iCurr >= num - 1 ? 0 : iCurr + 1;

                    /**当没有移动到最后一个时，
                     * 移动一个屏幕的宽度，
                     * 当移动到最后一个时，
                     * 计算出移动的距离**/
                    if(iCurr < num-1){
                        doAnimate(-moveWidth * iCurr);
                    }else{
                        /**
                         * 1. 当p_num为0时，表示最后一行正好放满
                         * 2. 当P_num部位不为0时，表示最后一行没有放满**/
                        var p_num = oLi.length % s.number;
                        if(p_num == 0){
                            doAnimate(-moveWidth * iCurr);
                        }else{
                            doAnimate(-moveWidth * (iCurr - 1) + -moveWidth / s.number * p_num);
                        }
                    }
                    oFocus.eq(iCurr).addClass("current").siblings().removeClass("current");
                }
            }

            //绑定触摸事件
            function bindTochuEvent(){
                oMover.get(0).addEventListener('touchstart', touchStartFunc, false);
                oMover.get(0).addEventListener('touchmove', touchMoveFunc, false);
                oMover.get(0).addEventListener('touchend', touchEndFunc, false);
            }

            //获取触点位置
            function touchPos(e){
                var touches = e.changedTouches, l = touches.length, touch, tagX, tagY;
                for (var i = 0; i < l; i++) {
                    touch = touches[i];
                    tagX = touch.clientX;
                    tagY = touch.clientY;
                }
                oPosition.x = tagX;
                oPosition.y = tagY;
                return oPosition;
            }

            //触摸开始
            function touchStartFunc(e){
                clearInterval(timer);
                touchPos(e);
                startX = oPosition.x;
                startY = oPosition.y;
                temPos = oMover.position().left;
            }

            //触摸移动
            function touchMoveFunc(e){
                touchPos(e);
                var moveX = oPosition.x - startX;
                var moveY = oPosition.y - startY;

                if (Math.abs(moveY) < Math.abs(moveX)) {
                    e.preventDefault();
                    oMover.css({
                        left: temPos + moveX
                    });
                }
            }


            //触摸结束,设置UL的left
            function touchEndFunc(e){
                touchPos(e);
                var moveX = oPosition.x - startX;
                var moveY = oPosition.y - startY;
                if (Math.abs(moveY) < Math.abs(moveX)) {
                    if (moveX > 0) {
                        if(num == 1){
                            var p_num = oLi.length % s.number;
                            doAnimate((-moveWidth * (iCurr - 1) + -moveWidth / s.number * p_num)/2,autoMove);
                        }else {
                            iCurr--;
                            if (iCurr >= 0) {
                                /**当没有移动到最后一个时，
                                 * 移动一个屏幕的宽度，
                                 * 当移动到最后一个时，
                                 * 计算出移动的距离**/
                                if(iCurr < num-1){
                                    doAnimate(-moveWidth * iCurr,autoMove);
                                }else{
                                    setMoveWidth();
                                }
                            }
                            else {
                                doAnimate(0, autoMove);
                                iCurr = 0;
                            }
                        }
                    }
                    else {
                        if(num == 1){
                            var p_num = oLi.length % s.number;
                            doAnimate((-moveWidth * (iCurr - 1) + -moveWidth / s.number * p_num)/2,autoMove);
                        }else {
                            iCurr++;
                            if (iCurr < num && iCurr >= 0) {
                                /**当没有移动到最后一个时，
                                 * 移动一个屏幕的宽度，
                                 * 当移动到最后一个时，
                                 * 计算出移动的距离**/
                                if (iCurr < num - 1) {
                                    doAnimate(-moveWidth * iCurr, autoMove);
                                } else {
                                    setMoveWidth();
                                }
                            }
                            else {
                                iCurr = num - 1;
                                setMoveWidth();
                            }
                        }
                    }
                    oFocus.eq(iCurr).addClass("current").siblings().removeClass("current");

                    //获取实际移动的宽度
                    function setMoveWidth(){
                        var p_num = oLi.length % s.number;
                        if(p_num == 0){
                            doAnimate(-moveWidth * iCurr,autoMove);
                        }else{
                            doAnimate(-moveWidth * (iCurr - 1) + -moveWidth / s.number * p_num,autoMove);
                        }
                    }
                }
            }

            //移动设备基于屏幕宽度设置容器宽高
            function mobileSettings(){
                moveWidth = $(window).width();
                var iScale = $(window).width() / s.width;
                _this.height(s.height * iScale).width($(window).width());
                oMover.css({
                    left: -iCurr * moveWidth
                });
            }

            //动画效果
            function doAnimate(iTarget, fn){
                oMover.stop().animate({
                    left: iTarget
                }, _this.speed , function(){
                    if (fn)
                        fn();
                });
            }

            //判断是否是移动设备
            function isMobile(){
                if (navigator.userAgent.match(/Android/i) || navigator.userAgent.indexOf('iPhone') != -1 || navigator.userAgent.indexOf('iPod') != -1 || navigator.userAgent.indexOf('iPad') != -1) {
                    return true;
                }
                else {
                    return false;
                }
            }
        });
    }
})(jQuery);
