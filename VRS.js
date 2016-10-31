/**
 * Created by 1231 on 2016/7/26.
 */
var XML_D = {
    /**放置场景中的数据**/
    data : {
        /**放置vr场景文件的数据**/
        vr_xml : {},
        /**当前户型的数据**/
        current_vr : {
            panorama : {
                node : null
            }
        },

        /**保存和事件相关的信息
         * isVRModel : 标记是当前是否进入vr观看模式
         * isUserInteracting ：记录是否按下鼠标（鼠标移动是是否进行操作，默认无操作）
         * onMouseDownMouseX : 记录按下鼠标时,X轴坐标
         * onMouseDownMouseY ：记录按下鼠标时,Y轴坐标
         * hoverDir : 鼠标移动的方向
         * speed : 自动播放全景的速度
         * isPlay : 判断是否自动播放
         * lat : 角度在-80到85之间的值，默认为0
         * lon :
         * onPointerDownLon : 保存lon值
         * onPointerDownLat ：保存lat值**/
        eventData : {
            isVRModel : false,
            isUserInteracting : false,
            onMouseDownMouseX : 0,
            onMouseDownMouseY : 0,
            hoverDir : true,
            speed : 0.05,
            isPlay : true,

            lat : 0,
            lon : 0,
            onPointerDownLon : 0,
            onPointerDownLat : 0,
        }
    },
    /* 初始化数据和事件 */
    init : {
        /**初始化路径*/
        initURL: {
            //http://192.168.0.134:2899/Web3D/VRS.html
            //http://www.tuotuohome.com/vr/vr.html
            url: "img/VR/1236.jpg",

            xmlurl : "XML/test2.xml",
        },
    }
};

//A B C D E F G H I J K L M N O P Q R S T U V W X Y Z

/**ajax请求的函数**/
XML_D.Ajax ={
    request : function(url,callback1,callback2){
        $.ajax({
            url: url,
            success: function (data) {
                callback1(data);
                callback2();
                console.log("加载xml场景文件成功！");
            },
            error : function(){
                console.error("你访问的场景文件路径失败！！");
            }
        });
    }
};

/**获得浏览器的相关信息**/
XML_D.Broweser =  {
    //版本信息
    versions : function(){
        var u = navigator.userAgent, app = navigator.appVersion;
        return {         //移动终端浏览器版本信息
            trident: u.indexOf('Trident') > -1, //IE内核
            presto: u.indexOf('Presto') > -1, //opera内核
            webKit: u.indexOf('AppleWebKit') > -1, //苹果、谷歌内核
            gecko: u.indexOf('Gecko') > -1 && u.indexOf('KHTML') == -1, //火狐内核
            mobile: !!u.match(/AppleWebKit.*Mobile.*/), //是否为移动终端
            ios: !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/), //ios终端
            android: u.indexOf('Android') > -1 || u.indexOf('Linux') > -1, //android终端或uc浏览器
            iPhone: u.indexOf('iPhone') > -1 , //是否为iPhone或者QQHD浏览器
            iPad: u.indexOf('iPad') > -1, //是否iPad
            webApp: u.indexOf('Safari') == -1 //是否web应该程序，没有头部与底部
        };
    }(),

    //返回语言
    language : (navigator.browserLanguage || navigator.language).toLowerCase(),

    //测试使用broweser
    // 页面添加 ：<div id="testid"></div>
    test : function(){
        var html=[];
        html[html.length]="语言版本: "+ this.language+"<br/>";
        html[html.length]=" 是否为移动终端: "+this.versions.mobile+"<br/>";
        html[html.length]=" ios终端: "+this.versions.ios+"<br/>";
        html[html.length]=" android终端: "+this.versions.android+"<br/>";
        html[html.length]=" 是否为iPhone: "+this.versions.iPhone+"<br/>";
        html[html.length]=" 是否iPad: "+this.versions.iPad+"<br/>";
        html[html.length]= navigator.userAgent+"<br/>";
        html[html.length]= navigator.appVersion + "<br/>";
        document.getElementById("testid").innerHTML = html.join("");
    },

    /**判断页面是否激活
     * 1.如果页面最小化，获取打开其他的页面，表明窗口未激活
     * 2.窗口打开，并显示当前页，窗口激活
     * return : 窗口激活 true，窗口未激活 false **/
    isWindowActivation : function(){
        var hiddenProperty = 'hidden' in document ? 'hidden' :
            'webkitHidden' in document ? 'webkitHidden' :
                'mozHidden' in document ? 'mozHidden' :
                    null;
        var visibilityChangeEvent = hiddenProperty.replace(/hidden/i, 'visibilitychange');
        var onVisibilityChange = function(){
            if (!document[hiddenProperty]) {
                console.log('页面非激活');
            }else{
                console.log('页面激活')
            }
        }
        document.addEventListener(visibilityChangeEvent, onVisibilityChange);
    }
};

/**遮盖层
 * 使用：
 * 1. 写HTML文件
 * 2. 写css文件
 * 3. 写js文件**/
XML_D.Cover = function(){

    /*****创建遮罩层*************/
    //<!-- 遮罩层DIV -->
    //<div id="overlay" class="hidden"></div>
    //    <!-- Loading提示 DIV -->
    //<div id="loadingTip">
    //    <img src="images/loading.gif" />
    //    </div>
    var cover = document.createElement( 'div' );
    document.body.appendChild( cover );
    cover.id = "overlay";
    $(cover).append("<div id='loadingTip'><img src='img/cover.png' /></div>");
    /*****创建遮罩层*************/

    var total_num = 0;
    var load_succss = 0;
    var load_error = 0;

    THREE.DefaultLoadingManager.onProgress = function ( item, loaded, total ) {
        //console.log( item, loaded, total );
        total_num = total;
        load_succss = loaded;

        if(total_num <= (load_succss + load_error)){
            hideLoading();
        }else{
            showLoading();
        }
    };

    THREE.DefaultLoadingManager.onError = function ( item) {
        console.warn( item + "没有找到");
        load_error++;
        if(total_num <= (load_succss + load_error)){
            hideLoading();
        }else{
            showLoading();
        }
        //console.log("total_num"+total_num)
        //console.log("load_succss"+load_succss)
        //console.log("load_error"+load_error)

    };

    showLoading();
    $(document).ajaxStart(function(){
        console.log("所有 AJAX 请求已开始");
    });
    $(document).ajaxStop(function(){
        console.log("所有 AJAX 请求已完成");
    });

    // 浏览器兼容 取得浏览器可视区高度
    function getWindowInnerHeight() {
        var winHeight = window.innerHeight
            || (document.documentElement && document.documentElement.clientHeight)
            || (document.body && document.body.clientHeight);
        return winHeight;
    }
    // 浏览器兼容 取得浏览器可视区宽度
    function getWindowInnerWidth() {
        var winWidth = window.innerWidth
            || (document.documentElement && document.documentElement.clientWidth)
            || (document.body && document.body.clientWidth);
        return winWidth;
    }

    /**显示遮罩层*/
    function showOverlay() {
        // 遮罩层宽高分别为页面内容的宽高
        $("#overlay").width(getWindowInnerWidth());
        $("#overlay").height(getWindowInnerHeight());
        $("#overlay").css({
            position: "fixed",
            "display":"block",
            backgroundColor: "white",
            zIndex : 5
        });
    }

    /**显示Loading提示*/
    function showLoading() {
        // 先显示遮罩层
        showOverlay();

        // Loading提示窗口居中
        $("#loadingTip").css({
            position: "fixed",
            width: "200px",
            height: "200px",
            top: "50%",
            left: "50%",
            margin: "-100px 0 0 -100px",
        });

        $("#loadingTip img").css({
            width: "100%",
            height: "100%",
        });
        $("#loadingTip").show();
        $(document).scroll(function() {
            return false;
        });
    }

    function hideLoading(){
        $("#loadingTip").hide();
        $("#overlay").hide();
    }
};

/**操作数据**/
XML_D.data.fun = {
    /**根据房间的id，从户型中查找房间的信息
     * 如果不存在roomId所在的房间，返回第一个房间**/
    findCurrentPanorama : function(roomId){
        //所有的户型
        var panoramas = XML_D.data.vr_xml.panoramas;
        //当前显示房间
        var current_panorama;
        for(var i = 0; i < panoramas.length; i++){
            if(panoramas[i].node == roomId){
                current_panorama = panoramas[i];
            }
        }

        if(current_panorama == null && XML_D.data.vr_xml.panoramas.length > 0){
            current_panorama = panoramas[0];
        }

        return current_panorama;
    }
};

//事件的函数
XML_D.Event = {
    /**初始化事件**/
    initEvent : function(){
        //当用户重置窗口大小时添加事件监听
        window.addEventListener( 'resize', XML_D.Event.onWindowResize, false );

        /**添加鼠标事件**/
        XML_D.Three.container.addEventListener( 'mousedown', XML_D.Event.onDocumentMouseDown, false );
        XML_D.Three.container.addEventListener( 'mousemove', XML_D.Event.onDocumentMouseMove, false );
        window.addEventListener( 'mouseup', XML_D.Event.onDocumentMouseUp, false );

        XML_D.Three.container.addEventListener( 'mousewheel', XML_D.Event.onDocumentMouseWheel, false );
        XML_D.Three.container.addEventListener( 'MozMousePixelScroll', XML_D.Event.onDocumentMouseWheel, false);

        XML_D.Three.container.addEventListener( 'touchstart', XML_D.Event.onDocumentTouchStart, false );
        XML_D.Three.container.addEventListener( 'touchmove', XML_D.Event.onDocumentTouchMove, false );
        window.addEventListener( 'touchend', XML_D.Event.onDocumentTouchEnd, false );
    },
    /**窗口重置事件**/
    onWindowResize : function(){
        XML_D.Three.camera.aspect = window.innerWidth / window.innerHeight;
        XML_D.Three.camera.updateProjectionMatrix();

        XML_D.Three.renderer.setSize( window.innerWidth, window.innerHeight );
    },

    onDocumentMouseDown : function ( event ) {
        event.preventDefault();

        //显示退出VR模式按钮
        if(XML_D.data.eventData.isVRModel) {
            $(".exit").show();
            var w = $(window).width() / 2 - $(".exit").width() / 2;
            $(".exit").css({'left': w});
            setTimeout(function () {
                $(".exit").hide();
            }, 3000);
        };

        /**查找sprite
         * 如果返回为空，那么没有选中精灵，标记鼠标按下**/
        if(XML_D.SwitchPanorama.findSprite(event) == null){
            XML_D.data.eventData.isUserInteracting = true;
        };

        //记录鼠标按下时鼠标的位置
        XML_D.data.eventData.onMouseDownMouseX = event.clientX;
        XML_D.data.eventData.onMouseDownMouseY = event.clientY;

        //保存上一个动作的角度和弧度值
        XML_D.data.eventData.onPointerDownLon = XML_D.data.eventData.lon;
        XML_D.data.eventData.onPointerDownLat = XML_D.data.eventData.lat;
    },
    onDocumentMouseMove : function ( event ) {
        //如果按下鼠标，进行全景浏览
        if ( XML_D.data.eventData.isUserInteracting) {
            //设置旋转方向
            XML_D.Event.setHoverDir(event);

            //当前的角度制和弧度制加上原来的角度值和弧度值
            XML_D.data.eventData.lon = ( XML_D.data.eventData.onMouseDownMouseX - event.clientX ) * 0.1 + XML_D.data.eventData.onPointerDownLon;
            XML_D.data.eventData.lat = ( event.clientY - XML_D.data.eventData.onMouseDownMouseY ) * 0.1 + XML_D.data.eventData.onPointerDownLat;

            //动画加速
            if(XML_D.data.eventData.speed < 0.5){
                XML_D.data.eventData.speed += 0.01;
            }

            //如果没有自动播放，重行渲染一次
            if(!XML_D.data.eventData.isPlay){
                XML_D.Three.renderScene();
            }
        };
    },
    onDocumentMouseUp : function ( event ) {
        //设置鼠标键弹起
        XML_D.data.eventData.isUserInteracting = false;
    },

    /**设置旋转的方向**/
    setHoverDir : function(event){
        if(XML_D.data.eventData.onMouseDownMouseX - event.clientX > 0){
            XML_D.data.eventData.hoverDir = true;
        }else{
            XML_D.data.eventData.hoverDir = false;
        }
    },

    onDocumentMouseWheel : function ( event ) {
        // WebKit
        if ( event.wheelDeltaY ) {
            if(event.wheelDeltaY < 0){
                if(XML_D.Three.camera.fov < 90) {
                    XML_D.Three.camera.fov -= event.wheelDeltaY * 0.05;
                }
            }else{
                if(XML_D.Three.camera.fov > 30) {
                    XML_D.Three.camera.fov -= event.wheelDeltaY * 0.05;
                }
            }
            // Opera / Explorer 9
        } else if ( event.wheelDelta ) {
            if(event.wheelDeltaY < 0){
                if(XML_D.Three.camera.fov < 90) {
                    XML_D.Three.camera.fov -= event.wheelDelta * 0.05;
                }
            }else{
                if(XML_D.Three.camera.fov > 30) {
                    XML_D.Three.camera.fov -= event.wheelDelta * 0.05;
                }
            }

            // Firefox
        } else if ( event.detail ) {
            if(event.detail < 0){
                if(XML_D.Three.camera.fov < 90) {
                    XML_D.Three.camera.fov -= event.detail * 0.05;
                }
            }else{
                if(XML_D.Three.camera.fov > 30) {
                    XML_D.Three.camera.fov -= event.detail * 0.05;
                }
            }
        };
        XML_D.Three.camera.updateProjectionMatrix();
    },

    onDocumentTouchStart : function ( event ) {
        event.preventDefault();
        //显示退出VR按钮
        if(XML_D.data.eventData.isVRModel) {

            $(".exit").show();
            var w = $(window).width() / 2 - $(".exit").width() / 2;
            $(".exit").css({'left': w});
            setTimeout(function () {
                $(".exit").hide();
            }, 3000);
        }

        if ( event.touches.length == 1 ) {
            XML_D.Three.isTimerMove = false;
            event.preventDefault();

            XML_D.data.eventData.onMouseDownMouseX = event.touches[ 0 ].pageX;
            XML_D.data.eventData.onMouseDownMouseY = event.touches[ 0 ].pageY;

            XML_D.data.eventData.onPointerDownLon = XML_D.data.eventData.lon;
            XML_D.data.eventData.onPointerDownLat = XML_D.data.eventData.lat;
        }

    },
    onDocumentTouchMove : function ( event ) {
        event.preventDefault();
        if ( event.touches.length == 1 ) {
            XML_D.Event.setHoverDir(event.touches[0]);

            XML_D.Three.isTimerMove = false;
            event.preventDefault();
            XML_D.data.eventData.lon = ( XML_D.data.eventData.onMouseDownMouseX - event.touches[0].pageX ) * 0.1 + XML_D.data.eventData.onPointerDownLon;
            XML_D.data.eventData.lat = ( event.touches[0].pageY - XML_D.data.eventData.onMouseDownMouseY ) * 0.1 + XML_D.data.eventData.onPointerDownLat;

            //如果没有自动播放，重行渲染一次
            if(!XML_D.data.eventData.isPlay){
                XML_D.Three.renderScene();
            }
        }
    },
    onDocumentTouchEnd : function( event ){
        //查找sprite
        XML_D.SwitchPanorama.findSprite(event);
    },

    /**手指点击分屏按钮
     * 1.影藏分屏按钮
     * 2.显示退出分屏按钮
     * 3.进项分屏**/
    onDivideTouchStart : function(){
        $(this).hide();
        XML_D.Three.initEffect();
        XML_D.Three.initControls();

        $(".exit").show();
        var w = $(window).width()/2 - $(".exit").width()/2;
        $(".exit").css({'left':w});

        setTimeout(function(){
            $(".exit").hide();
        },3000);
        XML_D.data.eventData.isVRModel = true;
    },
    /**手指点击退出分屏按钮
     * 1.销毁分屏时的控制器
     * 2.取消分屏
     * 3.隐藏退出分屏按钮，显示分屏按钮**/
    onExitTouchStart : function(){
        //销毁控制器
        XML_D.Three.controls.dispose();

        XML_D.Three.effect = {};
        $(".divide").show();
        $(this).hide();
        XML_D.data.eventData.isVRModel = false;

        XML_D.Three.renderScene();
    },
    /** 全屏 **/
    fullscreen : function(){
        var elem = document.body;
        if(elem.webkitRequestFullScreen){
            elem.webkitRequestFullScreen();
        }else if(elem.mozRequestFullScreen){
            elem.mozRequestFullScreen();
        }else if(elem.requestFullScreen){
            elem.requestFullscreen();
        }else{
            //浏览器不支持全屏API或已被禁用
        }
    },
    /** 退出全屏 **/
    exitFullscreen :function(){
        var elem=document;
        if(elem.webkitCancelFullScreen){
            elem.webkitCancelFullScreen();
        }else if(elem.mozCancelFullScreen){
            elem.mozCancelFullScreen();
        }else if(elem.cancelFullScreen){
            elem.cancelFullScreen();
        }else if(elem.exitFullscreen){
            elem.exitFullscreen();
        }else{
            //浏览器不支持全屏API或已被禁用
        }
    }
};

/**操作**/
XML_D.GUI = {
    /** 初始化GUI**/
    initGUI : function(){
        //根据不同的设备，加载不同的GUI
        if (XML_D.Broweser.versions.mobile) {
            $(".divide").each(function(){
                $(this).unbind("touchstart");
                $(this).bind("touchstart",XML_D.Event.onDivideTouchStart);
            });
            $(".exit").each(function(){
                $(this).unbind("touchstart");
                $(this).bind("touchstart",XML_D.Event.onExitTouchStart);
            });
            $("#fullScreen").unbind("touchstart");
            $("#fullScreen").bind("touchstart",function(){
                XML_D.Event.fullscreen();
            });
        } else {
            /**分享**/
            this.share();

            $(".divide").each(function(){
                $(this).unbind("click");
                $(this).bind("click",XML_D.Event.onDivideTouchStart);
            });
            $(".exit").each(function(){
                $(this).unbind("click");
                $(this).bind("click",XML_D.Event.onExitTouchStart);
            });
            $("#fullScreen").unbind("click");
            $("#fullScreen").bind("click",function(){
                XML_D.Event.fullscreen();
            })
        };

        //设置页面的导航图
        XML_D.GUI.NavigationMap();

        /**控制页面是否慢慢转动**/
        XML_D.GUI.isPlay();
    },
    /**控制画面是否自动播放**/
    isPlay : function(){
        $("#isplay").unbind("click",showPlay);
        $("#isplay").bind("click",showPlay);

        $("#isplay").unbind("touchstart",showPlay);
        $("#isplay").bind("touchstart",showPlay);

        function showPlay(){
            XML_D.data.eventData.isPlay = !XML_D.data.eventData.isPlay;
            //如果不是自动播放，重行渲染一次
            if(XML_D.data.eventData.isPlay){
                XML_D.Three.renderScene();
            }
        }
    },

    /**给页面添加导航图**/
    NavigationMap : function(){

        //判断户型图是否存在
        if(XML_D.data.vr_xml.map){
            //设置地图
            $(".navigation_map .map").css({
                backgroundImage : "url("+ XML_D.data.vr_xml.map.url+")"
            });

            /**创建地图外部的div
             * 添加到body中**/
            var data = {
                width : $(".navigation_map").width() + 4
            };
            //添加点击事件
            if(XML_D.Broweser.versions.mobile){
                $(".navigation_map").find(".map_icon").unbind("touchstart",f2);
                $(".navigation_map").find(".map_icon").bind("touchstart",data,f2);
                function f1(){
                    $(".navigation_map").css({
                        transform:"translate(" + data.width + "px, -1px)"
                    });
                    $(".navigation_map").find(".map_icon").unbind("touchstart",f1);
                    $(".navigation_map").find(".map_icon").bind("touchstart",data,f2);
                }
                function f2(){
                    $(".navigation_map").css({
                        transform:"translate(0px, -1px)"
                    });

                    $(".navigation_map").find(".map_icon").unbind("touchstart",f2);
                    $(".navigation_map").find(".map_icon").bind("touchstart",data,f1);
                }
            }else{
                $(".navigation_map").find(".map_icon").unbind("click",f2);
                $(".navigation_map").find(".map_icon").bind("click",data,f2);
                function f1(){
                    $(".navigation_map").css({
                        transform:"translate(" + data.width + "px, -1px)"
                    });
                    $(".navigation_map").find(".map_icon").unbind("click",f1);
                    $(".navigation_map").find(".map_icon").bind("click",data,f2);
                }
                function f2(){
                    $(".navigation_map").css({
                        transform:"translate(0px, -1px)"
                    });

                    $(".navigation_map").find(".map_icon").unbind("click",f2);
                    $(".navigation_map").find(".map_icon").bind("click",data,f1);
                }
            }

            /*********** 添加热点 *******************/
            var Sprite_icons = XML_D.data.vr_xml.map.sprites;
            for(var i in Sprite_icons){
                //创建热点，并添加到地图上
                var map_Sprite = $("<div class='map_Sprite' nextNode='"+Sprite_icons[i].nextNode+"'></div>");
                map_Sprite.css({
                    transform: "translate("+ Sprite_icons[i].translate +") rotateX(10deg)",
                });
                $(".navigation_map .map").append(map_Sprite);

                if(XML_D.Broweser.versions.mobile){
                    //给热点添加点击事件
                    map_Sprite.bind("touchstart",function(){
                        XML_D.SwitchPanorama.changeScene($(this).attr("nextNode"));
                    });
                }else{
                    //给热点添加点击事件
                    map_Sprite.bind("click",function(){
                        XML_D.SwitchPanorama.changeScene($(this).attr("nextNode"));
                    });
                }
            }
        }else{
            $(".navigation_map").hide();
        }
    },

    /**分享**/
    share : function(){
        //户型名称
        $(".share_panorama .panoramas_name").append(XML_D.data.vr_xml.name);
        //添加名称
        if(XML_D.data.current_vr.panorama.node){
            var current_panorama = XML_D.data.fun.findCurrentPanorama(XML_D.data.current_vr.panorama.node);
            $(".share_panorama .panorama_name").append(current_panorama.name);
        }
        //添加链接
        $(".share_panorama .share_foot").append(window.location.href);
        //$(".share_panorama .share_foot").html(window.location.href);


        /**生成二维码**/
        XML_D.QrCode();

        $(".share").bind("click",function(){
            $(".share_panorama").show();
        });
        $(".share_panorama section .close").bind("click",function(){
            $(this).parent().parent().hide();
        });
    }
};

/**二维码**/
XML_D.QrCode = function(){

    //创建存放二维码的存放位置
    //var qr = document.createElement( 'div' );
    //document.body.appendChild( qr );
    //qr.id = "qr";
    //$(qr).css({
    //    "position":"absolute",
    //    "left": "52px",
    //    "top": "45px",
    //    background: "white",
    //    padding: "10px",
    //    boxShadow: "rgba(249, 244, 244, 0.498039) 0px 0px 5px 5px",
    //    backgroundColor: "rgba(251, 248, 248, 0.8)"
    //});

    /**设置二维码**/
    //生成的二维码宽高要相等
    var side = 380;
    $(".qrcode").qrcode({
        render : "canvas",    //设置渲染方式，有table和canvas，使用canvas方式渲染性能相对来说比较好
        text : window.location.href,    //这是修改了官文的js文件，此时生成的二维码支持中文和LOGO,扫描二维码后显示的内容,可以直接填一个网址，扫描二维码后自动跳向该链接
        width : side,               //二维码的宽度
        height : side,              //二维码的高度
        background : "#ffffff",       //二维码的后景色
        foreground : "#000000",        //二维码的前景色
        src: 'img/qrcode/logo.png'             //二维码中间的图片
    });

    //$(qr).append("<br/><span>扫一扫 把我拿走</span>").css({
    //    "position":"absolute",
    //    "text-align":"center"
    //});
};

/**射线查找**/
XML_D.Raycaster = {
    /**给定坐标，得到射线与物体的焦点
     * event ： 事件反回值
     * recursive ：是否遍历子节点
     * visible : 是否检出影藏的物体**/
    getRaycaster : function(event,recursive,visible){
        /**获得鼠标的位置
         * clientX : 获得屏幕位置坐标x
         * clientY : 获得屏幕位置坐标y */
        var mouse = new THREE.Vector2();
        var clientX = event.clientX || event.changedTouches[0].clientX;
        var clientY = event.clientY || event.changedTouches[0].clientY;
        mouse.x = ( clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( clientY / window.innerHeight ) * 2 + 1;

        var raycaster = new THREE.MyRaycaster();
        raycaster.visible = visible;
        raycaster.setFromCamera( mouse, XML_D.Three.camera );
        return raycaster.intersectObjects( XML_D.Three.scene.children,recursive);
    }
};

/**操作字符窜**/
XML_D.String = {
    /**
     *  把给定的字符窜,切割成数组(默认用逗号分隔)
     *
     *  str: 字符串
     *  sep: 分隔符 */
    splitToArray : function(str,sep){
        var arr = new Array(); //定义一数组
        if(sep){
            arr = str.split(sep); //字符分割
        }else{
            arr = str.split(","); //字符分割
        }
        return arr;
    }
};

/**变换全景图的操作**/
XML_D.SwitchPanorama = {
    /**添加热点
     * Sprites:热点集合
     * roomId:房间的id**/
    addSprite : function(Sprites,roomId){
        $(".map .map_Sprite").each(function(){
            if($(this).attr("nextnode") == roomId){
                $(this).css({
                    background: "url('img/hs.png') 33px 0px"
                });
                $(this).siblings().css({
                    background: "url('img/hs.png') 0px 0px"
                });
            }
        });
        var loader = new THREE.TextureLoader();
        for(var i = 0;i < Sprites.length;i++){
            var map = loader.load(Sprites[i].img_url);
            var Sprite_material = new THREE.SpriteMaterial( {map: map, color: 0xffffff, fog: false , opacity : 0.5});
            var sprite = new THREE.Sprite( Sprite_material );

            //设置当前热点的目标
            sprite.nextNode = Sprites[i].nextNode;
            //设置当前热点的类型
            sprite.type = Sprites[i].type;
            //设置热点的位置
            var arr = XML_D.String.splitToArray(Sprites[i].pos,",");
            sprite.position.set(arr[0],arr[1],arr[2]);
            sprite.scale.set(30,30,30);

            te(sprite);
            function te(sprite_1){
                window.setInterval(function(){
                    if(XML_D.data.eventData.isPlay){
                        sprite_1.visible = !sprite_1.visible;
                    }else{
                        if(sprite_1.visible == false){
                            sprite_1.visible = true;
                            XML_D.Three.renderScene();
                        }
                    }
                },300);
            }

            XML_D.Three.scene.add( sprite );
        }
    },

    /**查找精灵
     * event : 事件**/
    findSprite : function(event){
        var intersects = XML_D.Raycaster.getRaycaster(event,false,true);
        if(intersects.length > 0 && intersects[0].object.constructor == THREE.Sprite){
            //下一个全景图的id或者是柜体的路径
            var nextNode = intersects[0].object.nextNode;
            var type1 = intersects[0].object.type;
            if(type1 == 1){
               this.changeScene(nextNode);
            }else{
                XML_D.data.eventData.isUserInteracting = false;
                window.open(nextNode);
            };
            return intersects[0].object;
        }
        return null;
    },

    /**变换当前的全景
     * id ：下一个场景的id**/
    changeScene : function(nextNode){
        /**1.遍历所有的场景，获得当前要跳转的的场景
         * 2.完成场景的跳转
         * 3.删除场景中所有的热点
         * 4.添加新的热点  **/
        var panoramas = XML_D.data.vr_xml.panoramas;
        for(var i in panoramas){
            if(panoramas[i].node == nextNode){
                var loader = new THREE.TextureLoader();
                loader.load(panoramas[i].url, function (texture) {
                    XML_D.Three.mesh.material.map = texture;
                    XML_D.Three.renderScene();
                });

                /******删除场景中所有的热点*****/
                for(var j = 0; j <  XML_D.Three.scene.children.length; j++){
                    if(XML_D.Three.scene.children[j].constructor == THREE.Sprite){
                        XML_D.Three.scene.remove(XML_D.Three.scene.children[j]);
                        j-- ;
                    }
                }

                //更改当前房间的名称
                $(".share_panorama .panorama_name").html(panoramas[i].name);
                /******************添加热点*************************/
                this.addSprite(panoramas[i].sprites,panoramas[i].node);
            }
        }
    }
};

//threejs的相关操作
XML_D.Three = {
    isTimerMove : true,

    container : {},
    renderer : {},
    initRenderer : function () {
        var container = document.createElement( 'div' );
        document.body.appendChild( container );
        this.container = container;

        var renderer = new THREE.WebGLRenderer({
            antialias : true
        });
        renderer.setClearColor(0xAAAAAA, 1.0);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight);

        container.appendChild(renderer.domElement);
        this.renderer = renderer;
    },

    controls : {},
    initControls : function(){
        var controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        controls.rotateUp(Math.PI / 4);
        controls.target.set(
            camera.position.x + 0.01,
            camera.position.y,
            camera.position.z
        );
        controls.noZoom = true;
        controls.noPan = true;
        function setOrientationControls(e) {
            if (!e.alpha) {
                return;
            }
            controls = new THREE.DeviceOrientationControls(this.camera, true);
            controls.connect();
            controls.update();
            XML_D.Three.renderer.domElement.addEventListener('click', fullscreen, false);
            window.removeEventListener('deviceorientation', setOrientationControls, true);
        }
        window.addEventListener('deviceorientation', setOrientationControls, true);

        function fullscreen() {
            if (XML_D.Three.container.requestFullscreen) {
                XML_D.Three.container.requestFullscreen();
            } else if (XML_D.Three.container.msRequestFullscreen) {
                XML_D.Three.container.msRequestFullscreen();
            } else if (XML_D.Three.container.mozRequestFullScreen) {
                XML_D.Three.container.mozRequestFullScreen();
            } else if (XML_D.Three.container.webkitRequestFullscreen) {
                XML_D.Three.container.webkitRequestFullscreen();
            }
        }
        this.controls = controls;
    },
    effect : {},
    initEffect : function(){
        var effect = new THREE.StereoEffect( this.renderer );
        effect.eyeSeparation = 10;
        effect.setSize( window.innerWidth, window.innerHeight );
        this.effect = effect;
    },
    camera : {},
    initCamera : function () {

        if(window.innerWidth > window.innerHeight){
            camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 1100 );
        }else{
            camera = new THREE.PerspectiveCamera( 80, window.innerWidth / window.innerHeight, 1, 1100 );
        }
        camera.target = new THREE.Vector3( 0, 0, 0 );
        this.camera = camera;

    },
    scene : {},
    initScene : function () {
        var scene = new THREE.Scene();

        //辅助原点箭头
        //var axes = new THREE.AxisHelper(2000);
        //axes.position.set(-250,-250,-250);
        //scene.add(axes);

        //scene.fog = new THREE.Fog( 0xffffff, 500, 10000 );

        this.scene = scene;
    },

    mesh : {},
    initObject:   function () {

        //设置当前进入房间
        var current_panorama = XML_D.data.fun.findCurrentPanorama(XML_D.data.current_vr.panorama.node);

        var geometry = new THREE.SphereGeometry( 500, 60, 40 );
        geometry.scale( - 1, 1, 1 );
        var material = new THREE.MeshBasicMaterial( {
            map: new THREE.TextureLoader().load( current_panorama.url )
        });
        var mesh = new THREE.Mesh( geometry, material );
        this.mesh = mesh;
        this.scene.add( mesh );

        /***************添加热点*************************/
        //获得存放热点的数组
        var Sprites = current_panorama.sprites;
        XML_D.SwitchPanorama.addSprite(Sprites,current_panorama.node);
        /***************添加热点*************************/
    },

    /* 实现多次动态加载 */
    renderScene : function(){
        XML_D.Three.renderer.clear();
        if(XML_D.data.eventData.isPlay){
            requestAnimationFrame( XML_D.Three.renderScene );
        };

        if($.isEmptyObject(XML_D.Three.effect)){

            //没有按下鼠标
            if ( XML_D.data.eventData.isUserInteracting === false ) {
                if(XML_D.data.eventData.hoverDir){
                    XML_D.data.eventData.lon += XML_D.data.eventData.speed;
                }else{
                    XML_D.data.eventData.lon -= XML_D.data.eventData.speed;
                }

                //动画减速
                if(XML_D.data.eventData.speed > 0.05){
                    XML_D.data.eventData.speed -= 0.005;
                }
            }

            //角度从-85到85之间
            XML_D.data.eventData.lat = Math.max( - 85, Math.min( 85, XML_D.data.eventData.lat));
            //弧度数 （90-lat）
            var phi = THREE.Math.degToRad( 90 - XML_D.data.eventData.lat );
            var theta = THREE.Math.degToRad( XML_D.data.eventData.lon );

            XML_D.Three.camera.target.x = 500 * Math.sin( phi ) * Math.cos( theta );
            XML_D.Three.camera.target.y = 500 * Math.cos( phi );
            XML_D.Three.camera.target.z = 500 * Math.sin( phi ) * Math.sin( theta );

            XML_D.Three.camera.lookAt(  XML_D.Three.camera.target );

            XML_D.Three.renderer.setSize(window.innerWidth, window.innerHeight);
            XML_D.Three.renderer.render( XML_D.Three.scene,  XML_D.Three.camera );
        }else{
            var width = window.innerWidth;
            var height = window.innerHeight;

            XML_D.Three.camera.aspect = width / height;
            XML_D.Three.camera.updateProjectionMatrix();

            XML_D.Three.renderer.setSize(width, height);

            XML_D.Three.effect.render( XML_D.Three.scene,  XML_D.Three.camera );
        }
    },

    /* 启动three程序 */
    threeStart : function () {
        this.initRenderer();
        this.initCamera();
        this.initScene();
        this.initObject();
        this.renderScene();

        if(localStorage.getItem("key") == "0"){
            $(".divide").hide();
            XML_D.Three.initEffect();
            XML_D.Three.initControls();

            $(".exit").show();
            var w = $(window).width()/2 - $(".exit").width()/2;
            $(".exit").css({'left':w});

            setTimeout(function(){
                $(".exit").hide();
            },3000);
            XML_D.data.eventData.isVRModel = true;
        }
    }
};

XML_D.URL = {
    /**转换参数的到的xml文件访问路径**/
    transform_XML_URL : function(){
        //全景图的名称
        var id = this.GetQueryString("id");
        //titel名称
        var name = this.GetQueryString("name");
        //xml名称
        var xml_name = this.GetQueryString("xml_name");

        //房间号
        var RoomId = this.GetQueryString("RoomId");
        if(RoomId){
            XML_D.data.current_vr.panorama.node = RoomId;
        }

        if(id){
            //XML_D.init.initURL.url = "http://www.tuotuohome.com/CloudProduct/source/jpg/" + id;
            XML_D.init.initURL.url = "img/VR/" + id;
        }
        if(name){
            $("title").html(name);
        }
        if(xml_name){
            XML_D.init.initURL.xmlurl = "obj/Debug/PanXml/" + xml_name;
        }

    },
    /**获取地址栏中对应的参数
     * name ： 参数名称**/
    GetQueryString : function(name){
        var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
        var r = decodeURIComponent(window.location.search).substr(1).match(reg);
        if(r != null){
            return  unescape(r[2]);
        }else{
            return null;
        }
    },
};

XML_D.XML = {
    /**把XML文件数据转换为json数据对象
     * 解析组合柜体的文件信息 */
    transformXMLToJson : function(xmlhttp){

        //在读取的数据文件中读取xml结构对象
        var xmlDoc = xmlhttp.responseXML || xmlhttp;
        //读取xml根目录vr
        var vr_xml_data = XML_D.data.vr_xml;
        var xml_VR = xmlDoc.getElementsByTagName("VR")[0];

        var xml_panoramas_1 = xml_VR.getElementsByTagName("panoramas")[0];
        vr_xml_data.name = xml_panoramas_1.attributes['name'].value;
        vr_xml_data.id = xml_panoramas_1.attributes['node'].value;

        /**********读取XML文件的所有户型的全景图******************/
        var xml_panoramas = xml_VR.getElementsByTagName("panorama");
        vr_xml_data.panoramas = [];
        //遍历每一个全景图，并设置
        for(var i = 0; i < xml_panoramas.length;i++){
            var panorama = {};
            panorama.node = xml_panoramas[i].attributes['node'].value;
            panorama.url = xml_panoramas[i].attributes['url'].value;
            panorama.name = xml_panoramas[i].attributes['name'].value;

            //获得全景图中的热点
            var xml_sprites = xml_panoramas[i].getElementsByTagName("sprite");
            panorama.sprites = [];
            /*遍历全景中所有的热点，并设置热点的属性*/
            for(var j = 0;j < xml_sprites.length;j++){
                var sprite = {};

                sprite.type = xml_sprites[j].attributes['type'].value;
                sprite.pos = xml_sprites[j].attributes['pos'].value;
                if(xml_sprites[j].attributes['nextNode']){
                    sprite.nextNode = xml_sprites[j].attributes['nextNode'].value;
                }
                if(xml_sprites[j].attributes['url']){
                    sprite.nextNode = xml_sprites[j].attributes['url'].value;
                }
                sprite.img_url = xml_sprites[j].attributes['img_url'].value;

                panorama.sprites.push(sprite);
            }
            vr_xml_data.panoramas.push(panorama);
        }

        /***********************设置场景的户型图**************************/
        //判断是否有户型图
        if(xml_VR.getElementsByTagName("map")[0]){
            var xml_map = xml_VR.getElementsByTagName("map")[0];
            vr_xml_data.map = {};
            vr_xml_data.map.url = xml_map.attributes['url'].value;

            var xml_sprites = xml_map.getElementsByTagName("sprite");
            vr_xml_data.map.sprites = [];
            for(var j = 0;j < xml_sprites.length;j++){
                var sprite = {};
                sprite.translate = xml_sprites[j].attributes['translate'].value;
                sprite.nextNode = xml_sprites[j].attributes['nextNode'].value;
                vr_xml_data.map.sprites.push(sprite);
            }
        }
    }
};

$(function(){

    if(Detector.webgl) {

        //设置遮盖层
        XML_D.Cover();

        //接收参数
        XML_D.URL.transform_XML_URL();

        //请求xml文件
        XML_D.Ajax.request(XML_D.init.initURL.xmlurl,XML_D.XML.transformXMLToJson,start);

        function start(){

            /**初始化GUI**/
            XML_D.GUI.initGUI();
            //加载threejs
            XML_D.Three.threeStart();
            //初始化事件
            XML_D.Event.initEvent();

            /**判断屏幕的宽度发生变化后，重行加载画面**/
            var width = XML_D.Three.container.children[0].width;
            window.setInterval(function(){
                if(width != XML_D.Three.container.children[0].width){
                    if($.isEmptyObject(XML_D.Three.effect)){
                        localStorage.setItem("key","1")
                    }else{
                        localStorage.setItem("key","0")
                    }
                    window.location.reload();//刷新当前页面.
                }
            },1000);
        };

    }else{
        XML_D.QrCode();
        Detector.addGetWebGLMessage("123");
        throw "你的浏览器不支持webGL，建议使用谷歌浏览器！";
    }
});
