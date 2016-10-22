/**
 * Created by 1231 on 2016/7/26.
 */
var XML_D = {
    data : {
        /**整个户型的所有信息**/
        VR : {
            id : "1",
            panoramas : [
                {
                    name : "房间一",
                    node : "1",
                    url : "img/VR/2016-9-20keting-qj.jpg",
                    sprites : [
                        {
                            type : "1",
                            pos : "-285.7397448715704,-29.392684292767772,277.53946340019417",
                            nextNode : "2",
                            img_url : "img/sprite/forward.png",
                            name : "房间一"
                        },
                        {
                            type : "2",
                            pos : "-390.9257313655525,35.76029194619428,74.09076971814397",
                            url : "http://www.itthome.com/3DCloudDesign/3DF/furniture.html?id=Z-Y-X-J-00386&amp;type=2",
                            img_url : "img/sprite/sprite_01.png",
                            name : "热点一"
                        }
                    ]
                },
                {
                    name : "房间二",
                    node : "2",
                    url : "img/VR/2016-9-23woshi-qj.jpg",
                    sprites : [
                        {
                            img_url : "img/sprite/sprite_01.png",
                            type : "1",
                            pos : "330.2152227252353,-33.4392608299774,222.23100519043626",
                            nextNode : "1",
                            name : "房间二"
                        },
                    ]
                }
            ],
            map : {
                url : "img/map/huxing5.jpg",
                sprites : [
                    {
                        translate:"80px, 120px",
                        nextNode : "1",
                        name : "热点一"
                    },
                    //{
                    //    translate:"190px, 120px",
                    //    nextNode : "2",
                    //    name : "热点二"
                    //},
                ]
            }
        },

        /**当前操作户型
         * id:户型的id **/
        current_VR : {
            id : 1,
            /**当前操作房间
             * node:房间号**/
            panorama :{
                node : 1,
                sprite : {
                    img_url : "img/sprite/forward.png",
                    position : new THREE.Vector3(),
                    type : 1,
                    nextNode : 1,
                    url : "",
                    name: ""
                }
            },
            //户型图
            map : {
                /**保存当前操作场景地图的热点的基本信息
                 * nextNode ：下一个全景图
                 * html_sprite ：当前选中的页面中map上的节点
                 * name : 全景图的名称
                 * source_clientX ：到浏览器右边的距离
                 * source_clientY ：到浏览器上边的距离**/
                sprite : {
                    nextNode : null,
                    height : 80,
                    width :100,
                    source_clientX : 451,
                    source_clientY : 171,
                    tag : false,
                    html_sprite : null,
                    name : null
                }
            },
        },

        /**改完后保存数据格式**/
        save_VR : {
            id : null,
            panoramas : [
                {
                    id : 1,
                    sprites : []
                }
            ],
            map : {
                sprites : []
            }
        },

        //当前选中的精灵
        current_sprite_object : {}
    }
};

//A B C D E F G H I J K L M N O P Q R S T U V W X Y Z

XML_D.Cover = function(){

    /*****创建遮罩层*************/
    //<!-- 遮罩层DIV -->
    //<div id="overlay" class="hidden"></div>
    var cover = document.createElement( 'div' );
    document.body.appendChild( cover );
    cover.id = "overlay";
    /*****创建遮罩层*************/

    showOverlay();
    // 浏览器兼容 取得浏览器可视区高度
    function getWindowInnerHeight() {
        var winHeight = window.innerHeight
            || (document.documentElement && document.documentElement.clientHeight)
            || (document.body && document.body.clientHeight);
        return winHeight;
    };
    // 浏览器兼容 取得浏览器可视区宽度
    function getWindowInnerWidth() {
        var winWidth = window.innerWidth
            || (document.documentElement && document.documentElement.clientWidth)
            || (document.body && document.body.clientWidth);
        return winWidth;
    };

    /**显示遮罩层*/
    function showOverlay() {
        // 遮罩层宽高分别为页面内容的宽高
        $("#overlay").width(getWindowInnerWidth());
        $("#overlay").height(getWindowInnerHeight());
        $("#overlay").css({
            position: "absolute",
            top: "0px",
            right: "0px",
            zIndex: 10,
            backgroundColor: "rgba(93, 87, 87, 0.6)"
        });
    };
};

/**操作数据**/
XML_D.data.fun = {
    /**根据房间的id，从户型中查找房间的信息**/
    findCurrentPanorama : function(roomId){
        //所有的户型
        var panoramas = XML_D.data.VR.panoramas;
        //当前显示房间
        var current_panorama;
        for(var i = 0; i < panoramas.length; i++){
            if(panoramas[i].node == roomId){
                current_panorama = panoramas[i];
            }
        }

        return current_panorama;
    }
};

//事件的函数
XML_D.Event = {
    onWindowResize : function(){
        /**刷新全景**/
        XML_D.Three.camera.aspect = window.innerWidth / window.innerHeight;
        XML_D.Three.camera.updateProjectionMatrix();
        XML_D.Three.renderer.setSize(window.innerWidth, window.innerHeight);
        XML_D.Three.renderScene();

        /**设置遮罩层的大小**/
        if($("#overlay").length > 0){
            $("#overlay").css({
                width : window.innerWidth,
                height: window.innerHeight
            });
        }
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

        //不移动精灵
        XML_D.data.current_VR.map.sprite.tag = false;
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
    /**初始化GUI**/
    initGUI : function(){
        /**初始化GUI的数据
         * 1.全景图数据
         * 2.全景图中热点的数据*/
        this.initGUIData();

        /**初始化GUI的事件*/
        this.initEvent();
    },

    /**初始化GUI数据**/
    initGUIData : function(){
        /********************** 加载全景图 *******************************/
        var panoramas = XML_D.data.VR.panoramas;
        //当前进入房间
        var current_panorama = null;
        /**显示所有房间全景**/
        for(var item in panoramas){
            var divNode = document.createElement("div");
            divNode.setAttribute("data-nextNode",panoramas[item].node);

            var imgNode = document.createElement("img");
            imgNode.src = "img/GUI/tupian.png";
            $(divNode).append(imgNode);

            var SpanNode = document.createElement("span");
            SpanNode.innerHTML = panoramas[item].name;
            $(divNode).append(SpanNode);

            $("#map_chang_scen .select_scene").prepend(divNode);

            if(XML_D.data.current_VR.panorama.node == panoramas[item].node){
                //设置当前房间
                current_panorama = panoramas[item];
            }else{
                var divNode_02 = $(divNode).clone();
                $("#sprites_contex_02").prepend(divNode_02);
            }
        };

        /**设置沙盘上的图、热点**/
        addNavigationMapAndSprite();
        /**设置沙盘上的图、热点**/
        function addNavigationMapAndSprite(){
            //判断户型图是否存在
            if(XML_D.data.VR.map.url){
                //设置地图
                $(".navigation_map .map").css({
                    backgroundImage : "url(" + XML_D.data.VR.map.url + ")"
                });
                /*********** 添加已有的热点 *******************/
                var Sprite_icons = XML_D.data.VR.map.sprites;
                //判断当前房间的热点是否创建
                var tag = false;
                for(var i in Sprite_icons){
                    //创建热点，并添加到地图上
                    var map_Sprite = $("<div class='map_Sprite' data-nextNode='"+ Sprite_icons[i].nextNode +"'></div>");
                    map_Sprite.attr("data-name",Sprite_icons[i].name);
                    map_Sprite.attr("translate",Sprite_icons[i].translate);
                    map_Sprite.css({
                        transform: "translate("+ Sprite_icons[i].translate +") rotateX(10deg)",
                    });

                    //设置选中当前房间上的全景热点
                    if(XML_D.data.current_VR.panorama.node == Sprite_icons[i].nextNode){
                        //设置当前添加热点的颜色
                        map_Sprite.css({
                            backgroundPosition: "33px 0px"
                        });
                        //设置当前户型对应的map上的精灵
                        XML_D.data.current_VR.map.sprite.html_sprite = map_Sprite;
                        tag = true;
                    };
                    $(".navigation_map .map").append(map_Sprite);
                };

                /********** 地图上创建一个新的热点 ***********/
                if(!tag){
                    //当前显示房间
                    var current_panorama = XML_D.data.fun.findCurrentPanorama(XML_D.data.current_VR.panorama.node);

                    var mapSprite = $("<div></div>");
                    mapSprite.addClass("map_Sprite");
                    mapSprite.attr("data-nextNode",current_panorama.node);
                    mapSprite.attr("data-name",current_panorama.name);
                    $(".navigation_map .map").append(mapSprite);

                    //设置当前添加热点的颜色
                    mapSprite.css({
                        backgroundPosition: "33px 0px"
                    });
                    //设置当前页面选中的热点
                    XML_D.data.current_VR.map.sprite.html_sprite = mapSprite;
                }
            }else{
                $(".navigation_map").hide();
            }
        };
    },

    /**初始化GUI事件**/
    initEvent : function(){
        /******** 添加沙盘中的事件 ****************/
        this.navigationEvent();

        /********************** 页面中的功能项 ******************************************/
        /**保存现在添加的所有热点
         * 1.从场景中筛选出所有的热点
         * 2.ajax发送保存热点的请求 **/
        $("#save").unbind("click",this.save);
        $("#save").bind("click",this.save);

        $("#map").unbind("click",this.map);
        $("#map").bind("click",this.map);

        //选择热点功能
        $("#sprite").unbind("click",this.sprite);
        $("#sprite").bind("click",this.sprite);

        /********************** 全景图管理热点 *******************************************/
        /********** 选择热点的类型 ***********/
        $(".manage_sprite").find(".manage_sprite_a").unbind("click",this.manage_sprite_a);
        $(".manage_sprite").find(".manage_sprite_a").bind("click",this.manage_sprite_a);

        /********************** 超链接、全景切换 ************************************/
        /**超链接、全景切换 -> 删除热点 **/
        $("#manage_sprite").off("click",".li_cover",this.delete_sprite);
        $("#manage_sprite").on("click",".li_cover",this.delete_sprite);

        /**超链接、全景切换 -> 添加热点 **/
        $(".add_sprite").unbind("click",this.add_sprite);
        $(".add_sprite").bind("click",this.add_sprite);

        /**超链接、全景切换 -> 添加热点 -> X **/
        $(".chang_scene section .close").unbind("click",this.scene_close);
        $(".chang_scene section .close").bind("click",this.scene_close);

        /**超链接、全景切换 -> 添加热点 -> 设置热点样式 -> 选中热点 **/
        $(".chang_scene .select_sprite div").unbind("click",this.sprite_01);
        $(".chang_scene .select_sprite div").bind("click",this.sprite_01);

        /********************** 全景切换 ************************************************/
        /**全景切换 -> 添加热点 -> 设置热点样式**/
        $("#setSprite").unbind("click",this.setSprite);
        $("#setSprite").bind("click",this.setSprite);

        /**全景切换 -> 添加热点 -> 设置热点样式 -> 下一步 **/
        $("#sprites_contex .next").unbind("click",this.next);
        $("#sprites_contex .next").bind("click",this.next);

        /**全景切换 -> 添加热点 -> 选择场景**/
        $("#setScene").unbind("click",this.setScene);
        $("#setScene").bind("click",this.setScene);

        /**全景切换 -> 添加热点 -> 选择场景 -> 点击全景图**/
        $("#chang_scene .select_scene div").unbind("click",this.selectScene);
        $("#chang_scene .select_scene div").bind("click",this.selectScene);

        /********************** 超链接 ************************************************/
        /**超链接 -> 添加热点 -> 设置热点样式 **/
        $("#furniture .setSprite").unbind("click",this.furniture_setSprite);
        $("#furniture .setSprite").bind("click",this.furniture_setSprite);

        /**超链接 -> 添加热点 -> 设置热点样式 -> 下一步 **/
        $("#furniture .next").unbind("click",this.sprites_contex_04_next);
        $("#furniture .next").bind("click",this.sprites_contex_04_next);

        /**超链接 -> 添加热点 -> 超链接地址 **/
        $("#furniture .setLink").unbind("click",this.setLink);
        $("#furniture .setLink").bind("click",this.setLink);

        /**超链接 -> 添加热点 -> 选择场景 -> 点击完成**/
        $(".chang_scene .select_furniture .finish").unbind("click",this.furniture_finish);
        $(".chang_scene .select_furniture .finish").bind("click",this.furniture_finish);

    },

    /** 给沙盘添加事件 **/
    navigationEvent : function(){
        /******************** 沙盘设置 **************************************************/
        /**沙盘设置,添加全景 */
        //$(".navigation_map a").unbind("click",click_01);
        //$(".navigation_map a").bind("click",click_01);

        /**沙盘设置,选择全景图 **/
        //$(".map_scene div").unbind("click",map_scene);
        //$(".map_scene div").bind("click",map_scene);

        ///**沙盘设置,移动热点 **/
        //$(".map").off("mousedown",".map_Sprite",sprite_mousedown);
        //$(".map").on("mousedown",".map_Sprite",sprite_mousedown);

        $(".navigation_map").off("mousemove",".map",move_sprite);
        $(".navigation_map").on("mousemove",".map",move_sprite);

        $(".navigation_map .map .map_Sprite").each(function(){
            if($(this).attr("data-nextNode") == XML_D.data.current_VR.panorama.node){
                $(this).unbind("mousedown",sprite_mousedown_02);
                $(this).bind("mousedown",sprite_mousedown_02);
            }
        });

        /**沙盘设置,添加全景 */
        function click_01(){
            if(this.text.indexOf("添加全景") > -1){
                XML_D.Cover();
                $("#map_chang_scen").show();
            }else if(this.text.indexOf("删除热点") > -1){
                if(XML_D.data.current_VR.map.sprite.html_sprite){
                    XML_D.data.current_VR.map.sprite.html_sprite.remove();
                    XML_D.data.current_VR.map.sprite.html_sprite == null;
                }
            }else{
                console.error("沙盘设置中的添加全景或是删除热点事件出错！");
            }
        };
        /**沙盘设置,选择全景图 **/
        function map_scene(){
            //设置当前选中全景图变色
            $(this).css({border: "2px solid #ff961a"});
            //设置当前选中全景图的兄弟节点变回原来的颜色
            $(this).siblings("div").css({border: "1px solid #e1e1e1"});
            //获得场景的id
            if($(this).attr("data-nextNode")){
                XML_D.data.current_VR.map.sprite.nextNode = $(this).attr("data-nextNode");
            };
            //设置场景的名称
            XML_D.data.current_VR.map.sprite.name = $(this).children("span").text();

            $("#map_chang_scen .finish").remove("bg_05").addClass("bg_06");
            //添加完成按钮的事件
            $("#map_chang_scen .finish").unbind("click",XML_D.GUI.finish);
            $("#map_chang_scen .finish").bind("click",XML_D.GUI.finish);
        };
        /**沙盘设置,移动热点 **/
        function sprite_mousedown(event){
            event.preventDefault();
            //获得热点在原点位置的坐标
            if(XML_D.data.current_VR.map.sprite.source_clientX == null){
                XML_D.data.current_VR.map.sprite.source_clientX = window.innerWidth - event.clientX;
                XML_D.data.current_VR.map.sprite.source_clientY = event.clientY;
            }
            XML_D.data.current_VR.map.sprite.tag = true;

            //设置当前添加热点的颜色
            $(this).css({
                backgroundPosition: "33px 0px"
            });
            //设置当前页面选中的热点
            XML_D.data.current_VR.map.sprite.html_sprite = $(this);

            //设置当前节点的兄弟节点为未选中状态
            $(this).siblings().css({
                backgroundPosition: "0px 0px"
            });
        };
        function sprite_mousedown_02(event){
            event.preventDefault();
            //获得热点在原点位置的坐标
            if(XML_D.data.current_VR.map.sprite.source_clientX == null){
                XML_D.data.current_VR.map.sprite.source_clientX = window.innerWidth - event.clientX;
                XML_D.data.current_VR.map.sprite.source_clientY = event.clientY;
            }
            XML_D.data.current_VR.map.sprite.tag = true;
        };
        function move_sprite(event){
            event.preventDefault();
            if(XML_D.data.current_VR.map.sprite.tag){
                var width = event.clientX + XML_D.data.current_VR.map.sprite.source_clientX - window.innerWidth;
                var height = event.clientY - XML_D.data.current_VR.map.sprite.source_clientY;

                XML_D.data.current_VR.map.sprite.width = width;
                XML_D.data.current_VR.map.sprite.height = height;


                /**判断热点不要超出地图**/
                if(width < 270 && width >= 0){
                    XML_D.data.current_VR.map.sprite.width = width;
                }else if(width > 270){
                    XML_D.data.current_VR.map.sprite.width = 270;
                }else{
                    XML_D.data.current_VR.map.sprite.width = 0;
                };

                if(height < 362 && height >= 0){
                    XML_D.data.current_VR.map.sprite.height = height;
                }else if(height > 362){
                    XML_D.data.current_VR.map.sprite.height = 362;
                }else{
                    XML_D.data.current_VR.map.sprite.height = 0;
                }

                XML_D.data.current_VR.map.sprite.html_sprite.css({
                    transform: "translate("+ XML_D.data.current_VR.map.sprite.width +"px, "+ XML_D.data.current_VR.map.sprite.height +"px) rotateX(10deg)"
                });
                XML_D.data.current_VR.map.sprite.html_sprite.attr("translate",XML_D.data.current_VR.map.sprite.width +"px,"+ XML_D.data.current_VR.map.sprite.height + "px");
            }
        };
        /**沙盘设置，选择完成全景图，点击完成按钮
         * 1. 去掉遮罩层
         * 2. 隐藏选择全景图的弹出框
         * 3. 判断是否选中全景图，如果选中了，添加全景图
         *      3.1 如果当前全景图已经生成对应的热点，那么把这个热点设置成当前的热点
         *      3.2 如果还没有创建热点，创建热点，设置为当前的热点
         * 4. 如果没有选中全景图，弹出提示框
         * 5. 去掉完成时间的响应**/
        function finish(){
            //删除遮罩层
            $("#overlay").remove();
            //选择场景页面隐藏
            $("#map_chang_scen").hide();

            //判断是否选中全景图
            if(XML_D.data.current_VR.map.sprite.nextNode != null){
                var mapSprite = null;
                $(".map div").each(function(){
                    if($(this).attr("data-nextNode") == XML_D.data.current_VR.map.sprite.nextNode){
                        mapSprite = $(this);
                    }
                });
                /**地图上创建一个新的热点
                 * <div class="map_Sprite" data-nextNode="2" style="transform: translate(80px, 120px) rotateX(10deg);"></div>
                 * 1.判断地图上是否存在该全景对应的全景图
                 * 2.不存在时，创建新的节点，
                 * 3.存在时，把选中的节点设置为当前的节点**/
                if(mapSprite == null){
                    mapSprite = $("<div></div>");
                    mapSprite.addClass("map_Sprite");
                    mapSprite.attr("data-nextNode",XML_D.data.current_VR.map.sprite.nextNode);
                    mapSprite.attr("data-name",XML_D.data.current_VR.map.sprite.name);
                    $(".navigation_map .map").append(mapSprite);
                }

                //设置当前添加热点的颜色
                mapSprite.css({
                    backgroundPosition: "33px 0px"
                });
                //设置当前页面选中的热点
                XML_D.data.current_VR.map.sprite.html_sprite = mapSprite;
                //设置当前节点的兄弟节点为未选中状态
                mapSprite.siblings().css({
                    backgroundPosition: "0px 0px"
                });
            }else{
                alert("你没有选择全景图！");
            }

            //去掉完成时间的响应
            $("#map_chang_scen .finish").unbind("click",XML_D.GUI.finish);
            $(".map_scene div").css({border: "1px solid #6182b5"});
            $("#map_chang_scen .finish").removeClass("bg_06").addClass("bg_05");
        };
    },

    /****************** 页面中的功能项 ****************************************/
    save : function() {
        // 全景图上的热点
        var sprites = [];
        for(var item in XML_D.Three.scene.children){
            if(XML_D.Three.scene.children[item].constructor == THREE.Sprite){
                var sprite = {};
                sprite.name = XML_D.Three.scene.children[item].name;
                sprite.type = XML_D.Three.scene.children[item].type;
                sprite.img_url = XML_D.Three.scene.children[item].img_url;
                sprite.position = XML_D.Three.scene.children[item].position.x + "," + XML_D.Three.scene.children[item].position.y + "," + XML_D.Three.scene.children[item].position.z;

                if(sprite.type == 1){
                    sprite.nextNode = XML_D.Three.scene.children[item].nextNode;
                }else{
                    sprite.url = XML_D.Three.scene.children[item].url;
                };
                sprites.push(sprite);
            };
        };
        XML_D.data.save_VR.panoramas[0].sprites = sprites;

        // map上的热点
        //<div class="map_Sprite" nextnode="1" style="transform: translate(80px, 136px) rotateX(10deg); background-position: 0px 0px;"></div>
        var map_sprite = [];
        $(".navigation_map .map .map_Sprite").each(function(){
            var sprite = {};
            sprite.nextNode = $(this).attr("data-nextNode");
            sprite.translate = $(this).attr("translate");
            sprite.name = $(this).attr("data-name");
            map_sprite.push(sprite);
        });
        XML_D.data.save_VR.map.sprites = map_sprite;
        console.log(XML_D.data.save_VR);

        $.ajax({
            type: "post",
            dataType: "text",
            data: { dwd: JSON.stringify(XML_D.data.save_VR) },
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
        $(".item").css({
            transform: "translate(503px, 0)"
        });
        $("#manage_sprite").css({
            transform: "translate(0, 0)"
        });
        $("#link").hide();
    },
    map:function(){
        $(".item").css({
            transform: "translate(503px, 0)"
        });
        $(".navigation_map").css({
            transform:"translate(0px, 0px)"
        });
    },

    /********************** 超链接、全景切换 ************************************/
    /**超链接、全景切换 -> 添加热点 **/
    add_sprite : function(){
        XML_D.Cover();

        $(".select_sprite").show();
        $(".setSprite").removeClass("bg_03").addClass("bg_04").siblings().removeClass("bg_04").addClass("bg_03");

        if($(this).siblings().html().indexOf("全景") >-1 ){
            $("#chang_scene .select_scene").hide();
            $("#chang_scene").show();
        }else{
            $("#furniture .select_furniture").hide();
            $("#furniture").show();
        }
    },
    /**超链接、全景切换 -> 添加热点 -> 设置热点样式 -> 选中热点 **/
    sprite_01 : function(){
        $(this).children("img").removeClass("bd_01").addClass("bd_02");
        $(this).siblings().find("img").removeClass("bd_02").addClass("bd_01");
        XML_D.data.current_VR.panorama.sprite.img_url = $(this).find("img")[0].alt;
    },
    /**超链接、全景切换 -> 删除热点 **/
    delete_sprite : function(){
        //删除全景中的精灵
        var object = XML_D.Three.scene.getObjectById(parseInt($(this).siblings("img").attr("data-id")));
        XML_D.Three.scene.remove(object);
        XML_D.Three.renderScene();
        //删除GUI中的精灵
        $(this).parent().remove();
    },

    /********************** 全景切换 ********************************************/
    /**全景切换 -> 添加热点 -> 设置热点样式 -> 下一步 **/
    next : function(){
        $(this).parent().parent().find(".setSprite").removeClass("bg_04").addClass("bg_03");
        $("#chang_scene .sprite_type #setScene").removeClass("bg_03").addClass("bg_04");
        $(this).parent().siblings(".select_scene").show();
        $(this).parent().hide();
    },
    /**全景切换 -> 添加热点 -> 设置热点样式**/
    setSprite : function(){
        $("#setSprite").removeClass("bg_03").addClass("bg_04");
        $("#setSprite").siblings().removeClass("bg_04").addClass("bg_03");

        $("#sprites_contex").show();
        $("#sprites_contex_02").hide();
    },
    /**全景切换 -> 添加热点 -> 选择场景**/
    setScene : function(){
        $("#setSprite").removeClass("bg_04").addClass("bg_03");
        $("#setScene").removeClass("bg_03").addClass("bg_04");
        $("#sprites_contex").hide();
        $("#sprites_contex_02").show();
    },
    /**全景切换 -> 添加热点 -> 选择场景 -> 点击全景图**/
    selectScene : function(){
        $(this).css({border:"1px solid #5a7fba"});
        $(this).siblings().css({border:"0px"});
        XML_D.data.current_VR.panorama.sprite.name = $(this).children("span").text();
        XML_D.data.current_VR.panorama.sprite.nextNode = $(this).attr("data-nextNode");
        $(this).siblings(".finish").removeClass("bg_05").addClass("bg_06");

        /**全景切换 -> 添加热点 -> 选择场景 -> 点击完成**/
        $("#chang_scene .select_scene .finish").unbind("click",XML_D.GUI.chang_scene_finish);
        $("#chang_scene .select_scene .finish").bind("click",XML_D.GUI.chang_scene_finish);
    },
    /**全景切换 -> 添加热点 -> 选择场景 -> 点击完成**/
    chang_scene_finish : function(){
        //关闭当前组件，删除遮罩层
        $(this).parent().parent().hide();
        $("#overlay").remove();

        //添加热点到全景图、GUI热点列表
        var sprite = XML_D.Sprite.add();
        var liNode = XML_D.HTML.create_sprite_list(sprite.name,sprite.id);
        $("#sprite_chang ul").append(liNode);

        //删除完成事件，设置按钮未激活状态
        $("#chang_scene .select_scene .finish").unbind("click",XML_D.GUI.chang_scene_finish);
        $(this).removeClass("bg_06").addClass("bg_05");
    },

    /********************** 超链接 ************************************************/
    /**超链接 -> 添加热点 -> 设置热点样式 **/
    furniture_setSprite : function(){
        $(this).removeClass("bg_03").addClass("bg_04");
        $(this).siblings().removeClass("bg_04").addClass("bg_03");
        $(this).parent().parent().find(".select_sprite").show().siblings(".select_furniture").hide();
    },
    /**超链接 -> 添加热点 -> 设置热点样式 -> 下一步 **/
    sprites_contex_04_next : function(){
        $(this).parent().parent().find(".setSprite").removeClass("bg_04").addClass("bg_03");
        $(this).parent().parent().find(".setLink").removeClass("bg_03").addClass("bg_04");
        $(this).parent().siblings(".select_furniture").show();
        $(this).parent().hide();
    },
    /**超链接 -> 添加热点 -> 选择场景 -> 点击完成**/
    furniture_finish : function(){
        //数据存放到当前操作节点
        $(this).siblings(".push").find("input").each(function(){
            if(this.name.indexOf("name") > -1){
                XML_D.data.current_VR.panorama.sprite.name = this.value;
            }
            if(this.name.indexOf("url") > -1){
                if(this.value.indexOf("http://") == 0){
                    XML_D.data.current_VR.panorama.sprite.url = this.value;
                }else{
                    XML_D.data.current_VR.panorama.sprite.url = "http://" + this.value;
                    console.log(XML_D.data.current_VR.panorama.sprite.url);
                }
            }
        });

        //关闭当前窗口，删除遮罩层
        $(this).parent().parent().hide();
        $("#overlay").remove();

        //添加热点到全景、热点列表中
        var sprite = XML_D.Sprite.add();
        var liNode = XML_D.HTML.create_sprite_list(sprite.name,sprite.id);
        $("#link ul").append(liNode);
    },

    setLink : function(){
        $(this).removeClass("bg_03").addClass("bg_04");
        $(this).siblings().removeClass("bg_04").addClass("bg_03");
        $(this).parent().parent().find(".select_sprite").hide();
        $(this).parent().parent().find(".select_furniture").show();
    },
    manage_sprite_a : function(){
        /**设置染色变换**/
        $(this).addClass("bg_01");
        $(this).removeClass("bg_02");
        $(this).siblings("a").removeClass("bg_01");
        $(this).siblings("a").addClass("bg_02");

        if(this.text == "全景切换"){
            $("#sprite_chang").show();
            $("#link").hide();
            $("#setLink").hide();
            $("#setScene").show();

            XML_D.data.current_VR.panorama.sprite.type = 1;
        }else if(this.text == "超链接"){
            $("#link").show();
            $("#sprite_chang").hide();
            $("#setScene").hide();
            $("#setLink").show();

            XML_D.data.current_VR.panorama.sprite.type = 2;
        }
    },

    scene_close : function(){
        //删除遮罩层
        $("#overlay").remove();
        $(this).parent().parent().hide();
    },
};
/**js动态创建页面的节点**/
XML_D.HTML = {
    /**创建热点列表项
     * name:热点的名称
     * id : THREE.Sprite中的id **/
    create_sprite_list : function(name,id){
        var liNode = $("<li></li>");

        var divNode = $("<div class='li_cover'></div>");
        divNode.append("删除");
        liNode.append(divNode);

        var imgNode = $("<img src='img/GUI/suo.png'/>");
        imgNode.attr("data-id",id);
        liNode.append(imgNode);

        var pNode = $("<p></p>");
        pNode.append(name);
        liNode.append(pNode);

        return liNode;
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

        return this.getRaycaster_01(mouse,recursive,visible);
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

            return this.getRaycaster_01(mouse,recursive,visible);
        }
    },

    /**给定坐标，得到射线与物体的焦点
     * recursive ：是否遍历子节点
     * visible : 是否检出影藏的物体**/
    getRaycaster_2 : function(recursive,visible){
        /**获得鼠标的位置*/
        var mouse = new THREE.Vector2();
        mouse.x = 0;
        mouse.y = 0;

        return this.getRaycaster_01(mouse,recursive,visible);
    },

    /**给定坐标，得到射线与物体的焦点
     * mouse (THREE.Vector2): 射线起点值
     * recursive ：是否遍历子节点
     * visible : 是否检出影藏的物体**/
    getRaycaster_01 : function(mouse,recursive,visible){
        var raycaster = new THREE.MyRaycaster();
        raycaster.visible = visible;
        raycaster.setFromCamera( mouse, XML_D.Three.camera );
        return raycaster.intersectObjects( XML_D.Three.scene.children,recursive);
    },
};

/**对精灵的相关操作**/
XML_D.Sprite = {
    /**添加热点(场景、GUI)
     * Sprites:热点集合**/
    addSprite : function(Sprites){
        for(var i = 0;i < Sprites.length;i++){

            //当热点的路径是控制时，设置默认的路径
            if(!Sprites[i].img_url){
                Sprites[i].img_url = XML_D.data.current_VR.panorama.sprite.img_url;
            }

            var sprite = this.create(Sprites[i].img_url);

            /*********************** 设置热点的基本属性 ****************/
            //设置热点的名称
            sprite.name =  Sprites[i].name;
            //设置热点的位置
            var arr = XML_D.String.splitToArray(Sprites[i].pos,",");
            sprite.position.set(arr[0],arr[1],arr[2]);
            sprite.scale.set(30,30,30);

            //设置热点的样式
            sprite.img_url = Sprites[i].img_url;

            //设置类型
            sprite.type = Sprites[i].type;
            if(sprite.type == 1){
                //设置下一个场景的id
                sprite.nextNode = Sprites[i].nextNode;
            }else{
                //设置柜体的访问路径
                sprite.url = Sprites[i].url;
            }

            XML_D.Three.scene.add( sprite );

            /*********************** 添加热点项 *************************/
            var liNode = XML_D.HTML.create_sprite_list(sprite.name,sprite.id);
            if(sprite.type == 1){
                $("#sprite_chang ul").append(liNode);
            }else{
                $("#link ul").append(liNode);
            };
        }
    },

    /**添加热点(场景)**/
    add : function(){
        /************************* 创建当前热点 ************************************/
        var sprite = this.create(XML_D.data.current_VR.panorama.sprite.img_url);

        /************************* 设置热点的基本属性 ************************************/
        //设置热点的名称
        sprite.name =  XML_D.data.current_VR.panorama.sprite.name;

        //获得窗口中心点的坐标
        var raycaster = XML_D.Raycaster.getRaycaster_2(false,true);
        var point = raycaster[0].point;
        //设置热点的位置
        sprite.position.set(point.x,point.y,point.z);


        //设置热点的样式
        sprite.img_url = XML_D.data.current_VR.panorama.sprite.img_url;
        //设置类型
        sprite.type = XML_D.data.current_VR.panorama.sprite.type;
        if(XML_D.data.current_VR.panorama.sprite.type == 1){
          //设置下一个场景的id
          sprite.nextNode = XML_D.data.current_VR.panorama.sprite.nextNode;
        }else{
          //设置柜体的访问路径
          sprite.url = XML_D.data.current_VR.panorama.sprite.url;
        }

        XML_D.Three.scene.add( sprite );
        return sprite;
    },

    /**创建一个精灵
     * url : 精灵上贴图的路径
     * return ：创建的精灵**/
    create : function(url){
        /************************* 创建当前热点 ************************************/
        var loader = new THREE.TextureLoader();
        var map = loader.load(url,function(){
            XML_D.Three.renderScene();
        });
        var material = new THREE.SpriteMaterial( { map: map, color: 0xffffff, fog: false ,opacity : 0.5} );
        var sprite = new THREE.Sprite( material );
        sprite.scale.set(40,40,40);
        return sprite;
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
        //当前显示房间
        var current_panorama = XML_D.data.fun.findCurrentPanorama(XML_D.data.current_VR.panorama.node);

        /*************************外面的球体************************************/
        var loader = new THREE.TextureLoader();
        var texture = loader.load( current_panorama.url,function(){
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

        //添加全景图上的热点
        XML_D.Sprite.addSprite(current_panorama.sprites);
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

        if(roomid){
            XML_D.data.save_VR.panoramas[0].id = XML_D.data.current_VR.panorama.node = roomid;
        }
        if(panid){
            XML_D.data.save_VR.id = XML_D.data.current_VR.id = panid;
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
            data : { id : XML_D.data.current_VR.id },
            url : "Views/SpritesManager.ashx",
            success: function (data) {
                //保存户型数据
                XML_D.data.VR = JSON.parse(data);
                //初始化GUI
                XML_D.GUI.initGUI();
                //加载threejs
                XML_D.Three.threeStart();
            },
            error : function(){
                var str ="[{\"RoomId\":\"27\",\"RoomName\":\"卧室\",\"UrlPic\":\"upload/Url/1236.jpg\",\"PanoramasId\":\"31\",\"Sprites\":[{\"name\":\"热点一\",\"type\":\"1\",\"nextNode\":\"1\",\"pos\":\"- 208.26909733320136,-10.95262701925466,-340.5277395366886\",\"img_url\":\"img/sprite/img/sprite/forward_right.png\"},{\"name\":\"热点 二\",\"type\":\"2\",\"url\":\"123.com\",\"pos\":\"-208.26909733320136,-10.95262701925466,- 340.5277395366886\",\"img_url\":\"img/sprite/img/sprite/forward_right.png\"}],\"mapSprites\":[{\"translate\":\"210px, 80px\",\"name\":\"热点三\",\"nextNode\":\"0\"}, {\"translate\":\"210px, 80px\",\"name\":\"热点四\",\"nextNode\":\"0\"}]},{\"RoomId\":\"30\",\"RoomName\":\"卧室 2\",\"UrlPic\":\"upload/Url/2294472375_24a3b8ef46_o.jpg\",\"PanoramasId\":\"31\",\"Sprites\":[{\"name\":\"热点一\",\"type\":\"1\",\"nextNode\":\"1\",\"pos\":\"-208.26909733320136,- 10.95262701925466,-340.5277395366886\",\"img_url\":\"img/sprite/img/sprite/forward.png\"}],\"mapSprites\":[{\"translate\":\"210px, 80px\",\"name\":\"热点 2\",\"nextNode\":\"0\"}]}]";
                //XML_D.data.VR = JSON.parse(str);
                //初始化GUI
                XML_D.GUI.initGUI();
                //加载threejs
                XML_D.Three.threeStart();
                console.error("你访问数据出错，启用默认值！");
            }
        });

    }else{
        Detector.addGetWebGLMessage("123");
        throw "你的浏览器不支持webGL，建议使用谷歌浏览器！";
    }

});
