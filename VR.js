/**
 * Created by 1231 on 2016/7/26.
 */
var XML_D = {
    /* 初始化数据和事件 */
    init : {
        /**初始化路径*/
        initURL: {
            url: "img/VR/1236.jpg",
        }
    },
    initDate : {
        event_tag : false
    }
};

//A B C D E F G H I J K L M N O P Q R S T U V W X Y Z
/**获得浏览器的相关信息**/
XML_D.broweser = {
    //版本信息
    versions:function(){
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
    language:(navigator.browserLanguage || navigator.language).toLowerCase(),

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
        document.getElementById("testid").innerHTML=html.join("");
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
            width: "100px",
            height: "100px",
            top: "50%",
            left: "50%",
            margin: "-50px 0 0 -50px",
        });

        $("#loadingTip img").css({
            width: "100px",
            height: "100px",
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

//事件的函数
XML_D.Event = {
    onWindowResize : function(){

        XML_D.Three.camera.aspect = window.innerWidth / window.innerHeight;
        XML_D.Three.camera.updateProjectionMatrix();

        XML_D.Three.renderer.setSize( window.innerWidth, window.innerHeight );

    },

    onDocumentMouseDown : function ( event ) {
        event.preventDefault();

        if(XML_D.initDate.event_tag) {

            $(".exit").show();
            var w = $(window).width() / 2 - $(".exit").width() / 2;
            $(".exit").css({'left': w});
            setTimeout(function () {
                $(".exit").hide();
            }, 3000);
        }

        XML_D.Three.isUserInteracting = true;

        XML_D.Three.onPointerDownPointerX = event.clientX;
        XML_D.Three.onPointerDownPointerY = event.clientY;

        XML_D.Three.onPointerDownLon = XML_D.Three.lon;
        XML_D.Three.onPointerDownLat = XML_D.Three.lat;
    },

    onDocumentMouseMove : function ( event ) {

        if ( XML_D.Three.isUserInteracting === true ) {
            XML_D.Three.lon = ( XML_D.Three.onPointerDownPointerX - event.clientX ) * 0.1 + XML_D.Three.onPointerDownLon;
            XML_D.Three.lat = ( event.clientY - XML_D.Three.onPointerDownPointerY ) * 0.1 + XML_D.Three.onPointerDownLat;
        }
    },

    onDocumentMouseUp : function ( event ) {
        XML_D.Three.isUserInteracting = false;
    },

    onDocumentMouseWheel : function ( event ) {
        // WebKit
        if ( event.wheelDeltaY ) {
            XML_D.Three.camera.fov -= event.wheelDeltaY * 0.05;
            // Opera / Explorer 9
        } else if ( event.wheelDelta ) {
            XML_D.Three.camera.fov -= event.wheelDelta * 0.05;
            // Firefox
        } else if ( event.detail ) {
            XML_D.Three.camera.fov += event.detail * 1.0;
        }
        XML_D.Three.camera.updateProjectionMatrix();
    },

    onDocumentTouchStart : function ( event ) {
        event.preventDefault();
        //显示退出VR按钮
        if(XML_D.initDate.event_tag) {

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

            XML_D.Three.onPointerDownPointerX = event.touches[ 0 ].pageX;
            XML_D.Three.onPointerDownPointerY = event.touches[ 0 ].pageY;

            XML_D.Three.onPointerDownLon = XML_D.Three.lon;
            XML_D.Three.onPointerDownLat = XML_D.Three.lat;
        }
    },

    onDocumentTouchMove : function ( event ) {
        event.preventDefault();
        if ( event.touches.length == 1 ) {
            XML_D.Three.isTimerMove = false;
            event.preventDefault();
            XML_D.Three.lon = ( XML_D.Three.onPointerDownPointerX - event.touches[0].pageX ) * 0.1 + XML_D.Three.onPointerDownLon;
            XML_D.Three.lat = ( event.touches[0].pageY - XML_D.Three.onPointerDownPointerY ) * 0.1 + XML_D.Three.onPointerDownLat;
        }


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
        XML_D.initDate.event_tag = true;
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
        XML_D.initDate.event_tag = false;

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

/**二维码**/
XML_D.QrCode = function(){

    //创建存放二维码的存放位置
    var qr = document.createElement( 'div' );
    document.body.appendChild( qr );
    qr.id = "qr";
    $(qr).css({
        "position":"absolute",
        "left": "52px",
        "top": "45px"
    });

    /**设置二维码**/

    //生成的二维码宽高要相等
    var side = 100;
    $('#qr').qrcode({
        width :side,
        height : side,
        text : window.location.href
    });

    $(qr).append("<br/><span/>扫一扫 把我拿走</span>").css({
        "position":"absolute",
        "text-align":"center"
    });
};

//threejs的相关操作
XML_D.Three = {
    renderer : {},
    container : {},

    isUserInteracting : false,
    onMouseDownMouseX : 0,
    onMouseDownMouseY : 0,
    onMouseDownLon : 0,
    onMouseDownLat : 0,
    lon : 0,
    lat : 0,
    phi : 0,
    theta : 0,
    isTimerMove : true,

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
            camera.position.x = 0.01,
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
            renderer.domElement.addEventListener('click', fullscreen, false);
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

        ////辅助原点箭头
        //var axes = new THREE.AxisHelper(2000);
        //scene.add(axes);

        //scene.fog = new THREE.Fog( 0xffffff, 500, 10000 );

        this.scene = scene;
    },

    initObject:   function () {
        var geometry = new THREE.SphereGeometry( 500, 60, 40 );
        geometry.scale( - 1, 1, 1 );

        var material = new THREE.MeshBasicMaterial( {
            map: new THREE.TextureLoader().load( XML_D.init.initURL.url )
        });

        var mesh = new THREE.Mesh( geometry, material );
        this.scene.add( mesh );
    },

    /* 实现多次动态加载 */
    renderScene : function(){
        XML_D.Three.renderer.clear();
        requestAnimationFrame( XML_D.Three.renderScene );
        /*
         // distortion
         XML_D.Three.camera.position.copy(  XML_D.Three.camera.target ).negate();
         */

        if($.isEmptyObject(XML_D.Three.effect)){


            if ( XML_D.Three.isUserInteracting === false ) {
                XML_D.Three.lon += 0.1;
            }

            XML_D.Three.lat = Math.max( - 85, Math.min( 85, XML_D.Three.lat ) );
            phi = THREE.Math.degToRad( 90 - XML_D.Three.lat );
            theta = THREE.Math.degToRad( XML_D.Three.lon );

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

    /* 初始化事件 */
    initEvent : function(){

        /**添加鼠标事件**/
        document.addEventListener( 'mousedown', XML_D.Event.onDocumentMouseDown, false );
        document.addEventListener( 'mousemove', XML_D.Event.onDocumentMouseMove, false );
        document.addEventListener( 'mouseup', XML_D.Event.onDocumentMouseUp, false );
        document.addEventListener( 'mousewheel', XML_D.Event.onDocumentMouseWheel, false );
        document.addEventListener( 'MozMousePixelScroll', XML_D.Event.onDocumentMouseWheel, false);

        document.addEventListener( 'touchstart', XML_D.Event.onDocumentTouchStart, false );
        document.addEventListener( 'touchmove', XML_D.Event.onDocumentTouchMove, false );

        //当用户重置窗口大小时添加事件监听
        window.addEventListener( 'resize', XML_D.Event.onWindowResize, false );
    },

    /* 启动three程序 */
    threeStart : function () {
        this.initRenderer();
        this.initCamera();
        this.initScene();
        this.initObject();
        this.initEvent();
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
            XML_D.initDate.event_tag = true;
        }
    }
};

XML_D.URL = {
    /**转换参数的到的xml文件访问路径**/
    transform_XML_URL : function(){
        var id = this.GetQueryString("id");

        console.log(id);

        if(id){
            XML_D.init.initURL.url = "http://www.tuotuohome.com/CloudProduct/source/jpg/" + id;
        }
    },
    /**获取地址栏中对应的参数
     * name ： 参数名称**/
    GetQueryString : function(name){
        var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if(r != null){
            return  unescape(r[2]);
        }else{
            return null;
        }
    },
}

$(function(){

    if(Detector.webgl) {

        //设置遮盖层
        XML_D.Cover();

        XML_D.URL.transform_XML_URL();
        //根据不同的设备，加载不同的GUI
        if (XML_D.broweser.versions.mobile) {

            $(".divide").each(function(){
                $(this).unbind("touchstart");
                $(this).bind("touchstart",XML_D.Event.onDivideTouchStart);
            });

            $(".exit").each(function(){
                $(this).unbind("touchstart");
                $(this).bind("touchstart",XML_D.Event.onExitTouchStart);
            });

        } else {
            XML_D.QrCode();

            $(".divide").each(function(){
                $(this).unbind("click");
                $(this).bind("click",XML_D.Event.onDivideTouchStart);
            });

            $(".exit").each(function(){
                $(this).unbind("click");
                $(this).bind("click",XML_D.Event.onExitTouchStart);
            });
        }
        //加载threejs
        XML_D.Three.threeStart();

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

        $("#fullScreen").unbind("click");
        $("#fullScreen").bind("click",function(){
            XML_D.Event.fullscreen();
        });

        $("#fullScreen").unbind("touchstart");
        $("#fullScreen").bind("touchstart",function(){
            XML_D.Event.fullscreen();
        });

    }else{
        Detector.addGetWebGLMessage("123");
        throw "你的浏览器不支持webGL，建议使用谷歌浏览器！";
    }
});