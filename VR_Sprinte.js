/**
 * Created by 1231 on 2016/7/26.
 */
var XML_D = {
    /* 初始化数据和事件 */
    init : {
        /**初始化路径*/
        initURL: {
            //http://www.tuotuohome.com/vr/vr.html
            url: "img/VR/20160728190439.jpg",
        }
    },
    data :{
        //当前选中的精灵对象
        current_sprite : {},

        position : new THREE.Vector3(),
    },
};

//A B C D E F G H I J K L M N O P Q R S T U V W X Y Z

//事件的函数
XML_D.Event = {
    onWindowResize : function(){

        XML_D.Three.camera.aspect = window.innerWidth / window.innerHeight;
        XML_D.Three.camera.updateProjectionMatrix();

        XML_D.Three.renderer.setSize( window.innerWidth * 0.8, window.innerHeight * 0.8 );

    },

    onDocumentMouseDown : function ( event ) {
        event.preventDefault();

        var intersects = XML_D.Raycaster.getRaycaster_1(event,false,true);
        //var intersects = XML_D.Raycaster.getRaycaster(event,false,true);
        if(intersects.length > 2){
            //遍历当前选中对象
            for(var i = 0;i < intersects.length; i++){
                //获得当前选中的精灵
                if(intersects[i].object.constructor == THREE.Sprite){
                    XML_D.data.current_sprite = intersects[i].object;
                }
            }
        }else{
            XML_D.Three.isUserInteracting = true;

            XML_D.Three.onPointerDownPointerX = event.clientX;
            XML_D.Three.onPointerDownPointerY = event.clientY;

            XML_D.Three.onPointerDownLon = XML_D.Three.lon;
            XML_D.Three.onPointerDownLat = XML_D.Three.lat;
        }
    },

    onDocumentMouseMove : function ( event ) {

        /**判断当前是否选中精灵
         * 1. 如果选中精灵，对精灵进行移动操作
         * 2. 如果未选中精灵，浏览画面**/
        if($.isEmptyObject(XML_D.data.current_sprite)){
            if ( XML_D.Three.isUserInteracting === true ) {
                XML_D.Three.lon = ( XML_D.Three.onPointerDownPointerX - event.clientX ) * 0.1 + XML_D.Three.onPointerDownLon;
                XML_D.Three.lat = ( event.clientY - XML_D.Three.onPointerDownPointerY ) * 0.1 + XML_D.Three.onPointerDownLat;
                XML_D.Three.renderScene();
            }
        }else{
            var intersects = XML_D.Raycaster.getRaycaster_1(event,false,true);
            var Object = {};
            var position = new THREE.Vector3();
            //遍历当前选中对象
            for(var i = 0;i < intersects.length; i++){
                if(intersects[i].object.constructor == THREE.Mesh){
                    //获得内层球对象
                    if($.isEmptyObject(Object)){
                        Object = intersects[i];
                    }else{
                        if(Object.distance > intersects[i].distance){
                            Object = intersects[i];
                        }
                    }
                }
            }

            position.copy(Object.point);
            XML_D.data.current_sprite.position.copy(position);
            XML_D.data.position.copy(position);
            XML_D.Three.renderScene();
        }
    },

    onDocumentMouseUp : function ( event ) {
        XML_D.Three.isUserInteracting = false;
        //释放当前的精灵
        XML_D.data.current_sprite = {};
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
        }
        XML_D.Three.camera.updateProjectionMatrix();
        XML_D.Three.renderScene();
    },

    disposeEvent:function(){
        /**添加鼠标事件**/
        document.removeEventListener( 'mousedown', XML_D.Event.onDocumentMouseDown, false );
        document.removeEventListener( 'mousemove', XML_D.Event.onDocumentMouseMove, false );
        document.removeEventListener( 'mouseup', XML_D.Event.onDocumentMouseUp, false );

        document.removeEventListener( 'mousewheel', XML_D.Event.onDocumentMouseWheel, false );
        document.removeEventListener( 'MozMousePixelScroll', XML_D.Event.onDocumentMouseWheel, false);

        //当用户重置窗口大小时添加事件监听
        window.removeEventListener( 'resize', XML_D.Event.onWindowResize, false );
    }
};

/**射线查找**/
XML_D.Raycaster = {
    /**给定坐标，得到射线与物体的焦点
     * event ： 事件反回值值
     * recursive ：是否遍历子节点
     * visible : 是否检出影藏的物体**/
    getRaycaster : function(event,recursive,visible){
        /**获得鼠标的位置*/
        var mouse = new THREE.Vector2();
        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

        var raycaster = new THREE.MyRaycaster();
        raycaster.visible = visible;
        raycaster.setFromCamera( mouse, XML_D.Three.camera );
        return raycaster.intersectObjects( XML_D.Three.scene.children,recursive);
    },

    /**给定坐标，得到射线与物体的焦点,全景图没有铺满全屏
     * event ： 事件反回值值
     * recursive ：是否遍历子节点
     * visible : 是否检出影藏的物体**/
    getRaycaster_1 : function(event,recursive,visible){
        if($("canvas").length>0){
            /**获得鼠标的位置*/
            var mouse = new THREE.Vector2();
            var offLeft = XML_D.Three.container.getElementsByTagName("canvas")[0].offsetLeft;
            var offTop = XML_D.Three.container.getElementsByTagName("canvas")[0].offsetTop;
            mouse.x = ( (event.clientX - offLeft) / (window.innerWidth * 0.8)) * 2 - 1;
            mouse.y = - ( (event.clientY - offTop) / (window.innerHeight * 0.8) ) * 2 + 1;

            var raycaster = new THREE.MyRaycaster();
            raycaster.visible = visible;
            raycaster.setFromCamera( mouse, XML_D.Three.camera );
            return raycaster.intersectObjects( XML_D.Three.scene.children,recursive);
        }
    }
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
        //var container = document.createElement( 'div' );
        //document.body.appendChild( container );
        var container = document.getElementById("container");
        this.container = container;

        var renderer = new THREE.WebGLRenderer({
            antialias : true
        });
        renderer.setClearColor(0xAAAAAA, 1.0);
        //renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth * 0.8, window.innerHeight * 0.8);
        //renderer.setSize(XML_D.three_data.width, XML_D.three_data.height);

        container.appendChild(renderer.domElement);
        this.renderer = renderer;
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
        /*************************外面的球体************************************/
        var loader = new THREE.TextureLoader();
        var texture = loader.load( XML_D.init.initURL.url,function(){
            XML_D.Three.renderScene();
        });
        var geometry = new THREE.SphereGeometry( 500, 60, 40 );
        geometry.scale( - 1, 1, 1 );
        var material = new THREE.MeshBasicMaterial( {
            map: texture
        });
        var mesh = new THREE.Mesh( geometry, material );
        this.mesh = mesh;
        this.scene.add( mesh );

        /*************************内部的球体************************************/
        var geometry_1 = new THREE.SphereGeometry( 400, 60, 40 );
        geometry_1.scale( - 1, 1, 1 );
        var material1 = new THREE.MeshBasicMaterial( {
            color: 0xffffff,
            opacity: 0,
            transparent: true,
        });
        var mesh1 = new THREE.Mesh( geometry_1, material1 );
        mesh1.visible = false;
        this.scene.add( mesh1 );


        var loader = new THREE.TextureLoader();
        var map = loader.load("img/front.png");
        var material = new THREE.SpriteMaterial( { map: map, color: 0xffffff, fog: false ,opacity : 0.5} );
        var sprite = new THREE.Sprite( material );
        sprite.scale.set(10,10,10);
        sprite.position.set(-208.26909733320136,-10.95262701925466,-340.5277395366886);
        XML_D.Three.scene.add( sprite );
    },

    /* 实现多次动态加载 */
    renderScene : function(){
        XML_D.Three.renderer.clear();

        XML_D.Three.lat = Math.max( - 85, Math.min( 85, XML_D.Three.lat ) );
        phi = THREE.Math.degToRad( 90 - XML_D.Three.lat );
        theta = THREE.Math.degToRad( XML_D.Three.lon );

        XML_D.Three.camera.target.x = 500 * Math.sin( phi ) * Math.cos( theta );
        XML_D.Three.camera.target.y = 500 * Math.cos( phi );
        XML_D.Three.camera.target.z = 500 * Math.sin( phi ) * Math.sin( theta );

        XML_D.Three.camera.lookAt(  XML_D.Three.camera.target );

        XML_D.Three.renderer.setSize(window.innerWidth * 0.8, window.innerHeight * 0.8);
        //XML_D.Three.renderer.setSize(XML_D.three_data.width, XML_D.three_data.height);

        XML_D.Three.renderer.render( XML_D.Three.scene,  XML_D.Three.camera );

    },

    /* 初始化事件 */
    initEvent : function(){

        /**添加鼠标事件**/
        document.addEventListener( 'mousedown', XML_D.Event.onDocumentMouseDown, false );
        document.addEventListener( 'mousemove', XML_D.Event.onDocumentMouseMove, false );
        document.addEventListener( 'mouseup', XML_D.Event.onDocumentMouseUp, false );

        document.addEventListener( 'mousewheel', XML_D.Event.onDocumentMouseWheel, false );
        document.addEventListener( 'MozMousePixelScroll', XML_D.Event.onDocumentMouseWheel, false);

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
    }
};

XML_D.URL = {
    /**转换参数的到的xml文件访问路径**/
    transform_XML_URL : function(){
        var id = this.GetQueryString("id");
        var name = this.GetQueryString("name");

        console.log(id);
        console.log(name);

        if(id){
            XML_D.init.initURL.url = "http://www.tuotuohome.com/CloudProduct/source/jpg/" + id;
        }

        if(name){
            $("title").html(name);
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

$(function(){
    //显示模态框
    $(".modal-dialog").unbind("click");
    $(".modal-dialog").bind("click",function(){
        $("#modal-overlay").css("visibility","visible");

        if(Detector.webgl) {

            //加载threejs
            XML_D.Three.threeStart();
        }else{
            Detector.addGetWebGLMessage("123");
            throw "你的浏览器不支持webGL，建议使用谷歌浏览器！";
        }
    });

    $(".modal-data").find("a").unbind("click");
    $(".modal-data").find("a").bind("click",function(){
        //把添加的事件删除
        XML_D.Event.disposeEvent();
        //删除canvas标签
        $("#container").find("canvas").remove();
        //隐藏model
        var e1 = document.getElementById('modal-overlay');
        e1.style.visibility =  (e1.style.visibility == "visible"  ) ? "hidden" : "visible";

        $(".x").val(XML_D.data.position.x)
        $(".y").val(XML_D.data.position.y)
        $(".z").val(XML_D.data.position.z)
    });

});
