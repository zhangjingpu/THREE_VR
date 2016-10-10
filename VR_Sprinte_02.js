/**
 * Created by 1231 on 2016/7/26.
 */
var XML_D = {
    data : {
        //当前户型的
        panoramas : [],

        /**当前进入房间的信息
         * url ：房间全景图的id
         * RoomIds : 其他房间的id集合**/
        current_panorama :{
            parId : 1,
            node : 1,
            url: "img/VR/2016-9-23woshi-qj.jpg",
        },

        //保存最新操作的热点
        current_sprite : {
            img_url : "img/sprite/forward.png",
            position : new THREE.Vector3(),
            type : 1,
            nextNode : 1,
            url : null
        },

        //当前选中的精灵
        current_sprite_object : {}
    },
};

//A B C D E F G H I J K L M N O P Q R S T U V W X Y Z

//事件的函数
XML_D.Event = {
    onWindowResize : function(){

        XML_D.Three.camera.aspect = window.innerWidth / window.innerHeight;
        XML_D.Three.camera.updateProjectionMatrix();

        XML_D.Three.renderer.setSize( window.innerWidth, window.innerHeight);

    },

    onDocumentMouseDown : function ( event ) {
        event.preventDefault();

        var intersects = XML_D.Raycaster.getRaycaster(event,false,true);
        //var intersects = XML_D.Raycaster.getRaycaster(event,false,true);
        if(intersects.length > 2){
            //遍历当前选中对象
            for(var i = 0;i < intersects.length; i++){
                //获得当前选中的精灵
                if(intersects[i].object.constructor == THREE.Sprite){
                    XML_D.data.current_sprite_object = intersects[i].object;
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
        if($.isEmptyObject(XML_D.data.current_sprite_object)){
            if ( XML_D.Three.isUserInteracting === true ) {
                XML_D.Three.lon = ( XML_D.Three.onPointerDownPointerX - event.clientX ) * 0.1 + XML_D.Three.onPointerDownLon;
                XML_D.Three.lat = ( event.clientY - XML_D.Three.onPointerDownPointerY ) * 0.1 + XML_D.Three.onPointerDownLat;
                XML_D.Three.renderScene();
            }
        }else{
            var intersects = XML_D.Raycaster.getRaycaster(event,false,true);
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
            XML_D.data.current_sprite_object.position.copy(position);
            XML_D.Three.renderScene();
        }
    },

    onDocumentMouseUp : function ( event ) {
        XML_D.Three.isUserInteracting = false;
        //释放当前的精灵
        XML_D.data.current_sprite_object = {};
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

/**操作**/
XML_D.GUI = {
    initSpriteGUI : function(){

        //添加保存按钮事件
        $("#save").unbind("click",this.save);
        $("#save").bind("click",this.save);

        //点击热点图标事件
        $("#sprite").unbind("click",this.sprite);
        $("#sprite").bind("click",this.sprite);

        //选择热点的类型
        $("#sprite_menu").find("a").unbind("click",this.sprite_type);
        $("#sprite_menu").find("a").bind("click",this.sprite_type);

        //跳转到选择热点的界面
        $("#setSprite").unbind("click",this.setSprite);
        $("#setSprite").bind("click",this.setSprite);

        /**点击添加按钮，根据不同的文字显示不同的div
         * 包括选择场景和添加柜体**/
        $(".add_sprite").unbind("click",this.add_sprite);
        $(".add_sprite").bind("click",this.add_sprite);

        /********************** 选择切换 ***************************************/

        /**选中热点，改变当前选中热点的颜色，并保存当前热点**/
        $(".select_sprite div").unbind("click",this.sprite_01);
        $(".select_sprite div").bind("click",this.sprite_01);

        /** 选择热点样式中的下一步 **/
        $(".select_sprite .next").unbind("click",this.next);
        $(".select_sprite .next").bind("click",this.next);

        //点击设置热点中的的关闭按钮
        $(".sprites_contex_02 .close").unbind("click",this.close_02);
        $(".sprites_contex_02 .close").bind("click",this.close_02);

        //点击选择场景中的下一步
        $(".sprites_contex_02 .next").unbind("click",this.next_02);
        $(".sprites_contex_02 .next").bind("click",this.next_02);

        //点击选择场景中的单个场景
        $("#sprites_contex_02 div").unbind("click",this.selectScene);
        $("#sprites_contex_02 div").bind("click",this.selectScene);

        //跳转到选择热点的界面
        $("#setScene").unbind("click",this.setScene);
        $("#setScene").bind("click",this.setScene);


        $("input").keyup(function(){
            if(this.name.indexOf("name") > -1){
                XML_D.data.current_sprite.name = this.value;
            }
            if(this.name.indexOf("url") > -1){
                XML_D.data.current_sprite.url = this.value;
            }
        });
    },
    /**保存热点数据**/
    save : function() {

        var sprites = [];
        for(var item in XML_D.Three.scene.children){
            if(XML_D.Three.scene.children[item].constructor == THREE.Sprite){
                var sprite = {};
                sprite.img_url = XML_D.Three.scene.children[item].img_url;
                sprite.position = XML_D.Three.scene.children[item].position.x + "," + XML_D.Three.scene.children[item].position.y + "," + XML_D.Three.scene.children[item].position.z;
                sprite.nextNode = XML_D.Three.scene.children[item].nextNode;
                sprites.push(sprite);
            }
        }

        XML_D.data.current_panorama.sprites = sprites;
        console.log(sprites);
        $.ajax({
            type: "post",
            dataType: "text",
            data: { dwd: JSON.stringify(XML_D.data.current_panorama) },
            url: "Views/AddSprites.ashx",
            success: function (data) { 
                if (data) {
                    alert("添加成功");
                } else {  
                    alert("添加失败");
                }
            },
            error : function(){
                console.error("你访问的场景文件路径失败！！");
            }
        });
    },
    sprite : function(){
        if($("#sprite_menu").is(":visible")){
            $("#sprite_menu").hide("slow");
        }else{
            $("#sprite_menu").show("slow");
        }
    },
    add_sprite : function(){
        $(".setSprite").css({backgroundColor : "#1b1818"});
        $(".select_sprite").show();
        $(".sprites_contex_02").hide();

        if($(this).siblings().html().indexOf("全景") >-1 ){
            $("#setScene").css({backgroundColor : "#4d90fe"});
            $("#chang_scene").show();
        }else{
            $("#setLink").css({backgroundColor : "#4d90fe"});
            $("#furniture").show();
        }

    },
    close_02 : function(){
        $(this).parent().parent().hide();
    },
    sprite_01 : function(){
        $(this).children("img").css({backgroundColor : "#e6a0a0"});
        $(this).siblings().find("img").css({backgroundColor : "#1b1818"});
        XML_D.data.current_sprite.img_url = $(this).find("img")[0].alt;
    },
    next : function(){
        $(this).parent().parent().find(".setSprite").css({backgroundColor : "#4d90fe"});
        $(this).parent().parent().find(".next").css({backgroundColor : "#1b1818"});
        $(this).parent().siblings(".sprites_contex_02").show();
        $(this).parent().hide();
    },
    next_02 : function(){
        $(this).parent().parent().hide();

        XML_D.Sprite.add();
    },
    selectScene : function(){
        $(this).css({border:"1px solid #5a7fba"});
        $(this).siblings().css({border:"0px"});
        XML_D.data.current_sprite.nextNode = $(this).attr("id");
    },
    setSprite : function(){
        $("#setSprite").css({backgroundColor : "#1b1818"});
        $("#setSprite").siblings().css({backgroundColor : "#4d90fe"});

        $("#sprites_contex").show();
        $("#sprites_contex_02").hide();
    },
    setScene : function(){
        $("#setSprite").css({backgroundColor : "#4d90fe"});
        $("#setScene").css({backgroundColor : "#1b1818"});
        $("#sprites_contex").hide();
        $("#sprites_contex_02").show();
    },
    sprite_type : function(){
        $(this).css({backgroundColor : "#b97316"});
        $(this).siblings("a").css({backgroundColor : "#1b1818"});

        if(this.text == "全景切换"){
            $("#sprite_chang").show();
            $("#link").hide();
            $("#setLink").hide();
            $("#setScene").show();

            XML_D.data.current_sprite.type = 1;
        }else if(this.text == "超链接"){
            $("#link").show();
            $("#sprite_chang").hide();
            $("#setScene").hide();
            $("#setLink").show();

            XML_D.data.current_sprite.type = 2;
        }
    },
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
    },

    /**给定坐标，得到射线与物体的焦点
     * event ： 事件反回值值
     * recursive ：是否遍历子节点
     * visible : 是否检出影藏的物体**/
    getRaycaster_2 : function(event,recursive,visible){
        /**获得鼠标的位置*/
        var mouse = new THREE.Vector2();
        mouse.x = 2 - 1;
        mouse.y = -2 + 1;

        var raycaster = new THREE.MyRaycaster();
        raycaster.visible = visible;
        raycaster.setFromCamera( mouse, XML_D.Three.camera );
        return raycaster.intersectObjects( XML_D.Three.scene.children,recursive);
    },
};

XML_D.Sprite = {
  add : function(){
      /************************* 热点 ************************************/
      var loader = new THREE.TextureLoader();
      var map = loader.load(XML_D.data.current_sprite.url);
      var material = new THREE.SpriteMaterial( { map: map, color: 0xffffff, fog: false ,opacity : 0.5} );
      var sprite = new THREE.Sprite( material );
      sprite.scale.set(40,40,40);

      sprite.position.set(-208.26909733320136,-10.95262701925466,-340.5277395366886);
      sprite.img_url = XML_D.data.current_sprite.url;
      sprite.nextNode = XML_D.data.current_sprite.nextNode;

      XML_D.Three.scene.add( sprite );
      XML_D.Three.renderScene();
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
        renderer.setSize(window.innerWidth, window.innerHeight);

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

    initObject:   function () {
        /*************************外面的球体************************************/
        var loader = new THREE.TextureLoader();
        var texture = loader.load( XML_D.data.current_panorama.url,function(){
            XML_D.Three.renderScene();
        });
        var geometry = new THREE.SphereGeometry( 500, 60, 40 );
        geometry.scale( - 1, 1, 1 );
        var material = new THREE.MeshBasicMaterial( {
            map: texture
        });
        var mesh = new THREE.Mesh( geometry, material );
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

        XML_D.Three.renderer.setSize(window.innerWidth, window.innerHeight);
        //XML_D.Three.renderer.setSize(XML_D.three_data.width, XML_D.three_data.height);

        XML_D.Three.renderer.render( XML_D.Three.scene,  XML_D.Three.camera );

    },

    /* 初始化事件 */
    initEvent : function(){

        /**添加鼠标事件**/
        this.container.addEventListener( 'mousedown', XML_D.Event.onDocumentMouseDown, false );
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

        var roomid = this.GetQueryString("roomid");
        var panid = this.GetQueryString("panid");

        console.log(panid);
        console.log(roomid);

        if(roomid){
            XML_D.data.current_panorama.node = roomid;
        }

        if(panid){
            XML_D.data.current_panorama.parId = panid;
        };
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

    if(Detector.webgl) {
        //解析URL中的数据
        XML_D.URL.transform_XML_URL();

        $.ajax({
            type: "post",
            dataType: "text",
            data : { id : XML_D.data.current_panorama.parId },
            url : "Views/SpritesManager.ashx",
            success: function (data) {
                te(JSON.parse(data));
            },
            error : function(){
                var str ="[{\"RoomId\":\"34\",\"RoomName\":\"房间1\",\"UrlPic\":\"upload/Url/1236.jpg\",\"PanoramasId\":\"44\"},{\"RoomId\":\"31\",\"RoomName\":\"房间1\",\"UrlPic\":\"upload/Url/1236.jpg\",\"PanoramasId\":\"44\"},{\"RoomId\":\"33\",\"RoomName\":\"房间1\",\"UrlPic\":\"upload/Url/1236.jpg\",\"PanoramasId\":\"44\"}]";
                te(JSON.parse(str));
                console.error("你访问数据出错，启用默认值！");
            }
        });
        function te(data){
            XML_D.data.panoramas = data;

            for(var item in data){
                if(XML_D.data.current_panorama.node == data[item].RoomId){
                    XML_D.data.current_panorama.url = data[item].UrlPic;

                }else{

                    var divNode = document.createElement("div");
                    divNode.id = data[item].RoomId;

                    var imgNode = document.createElement("img");
                    imgNode.src = "img/GUI/tupian.png";
                    $(divNode).append(imgNode);

                    var SpanNode = document.createElement("span");
                    SpanNode.innerHTML = data[item].RoomName;
                    $(divNode).append(SpanNode);

                    $("#sprites_contex_02").prepend(divNode);
                }
            }

            //保存热点数据
            XML_D.GUI.initSpriteGUI();

            //加载threejs
            XML_D.Three.threeStart();
        }

    }else{
        Detector.addGetWebGLMessage("123");
        throw "你的浏览器不支持webGL，建议使用谷歌浏览器！";
    }

});
