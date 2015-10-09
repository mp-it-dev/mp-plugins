;(function ($, window, undefined) {

    //把以下变量保存成局部变量
    var _top = top || window,
        document = window.document;

    //初始化弹窗
    _top.tlayer = _top.tlayer || {},
    window.tlayer = $.tlayer = _top.tlayer;
    var _tlayer = $.tlayer;

    //当前弹出框使用情况
    _tlayer.layerData = $.extend({
        layers          : {},       //弹出框的集合
        layerLength     : 0,        //当前激活的弹出框的个数
        stack           : []        //弹出框堆栈
    }, _tlayer.layerData || {});

    //弹出框的方法
    var methods = {
        /**
         * 初始化弹出框
         * @return {Object} 弹出框的参数设置
         */
        init: function (options) {

            var tlayer = _tlayer;

            tlayer.globalSettings = tlayer.globalSettings || {};

            /**
             * 以下参数为公用参数，更多参数设置可在相应的弹出层中查看
             */
            var settings = $.extend({
                layerID         : false,        //自定义弹出框的id
                zIndex          : 1100,         //弹出框的层级，数值越大弹出框的层级越高
                showMask        : true,         //是否显示背景透明层
                bindEsc         : true,         //是否绑定Esc键关闭弹出框
                animation       : "fade",       //动画效果 fade淡入(fadeIn)淡出(fadeOut), slide滑入(slideDown)滑出(slideUp), display显示(show)隐藏(hide)
                duration        : 300,          //显示和隐藏的时间
                context         : document,     //上下文对象，弹出框将被追加到哪个上下文中，默认当前文档
                onEsc           : false,        //当弹出框触发Esc按钮时执行的回调函数
                auto            : true,         //默认自动显示，否则使用$.tlayer("show", layerID);
                theme           : '',           //主题，目前提供default，blue, black三种
                width           : 0,            //内容宽度，不包括头部和底部
                height          : 0,            //内容高度，不包括头部和底部
                maxWidth        : 0,            //内容最大宽度
                layerType       : '',           //弹出框类型
                bodyScroll      : false,        //设置body是否需要被设置overflow: hidden;

                /**
                 * 弹出框分为：头部区域(header)、内容区域(content)和底部区域(footer)三部分组成
                 * 以下分别为各部分的参数设置说明
                 */
                
                header          : false,        //弹出框的title，值为false时表示弹出框无头部

                content         : {             //弹出框内容区域的设置  
                    //当src和html属性同时存在，优先级依次降低
                   
                    src         : false,        //如果内容区域是通过绝对或相对路径来显示内容，
                                                //那么将会使用iframe来显示
                    frameID     : "",           // 设置iframe的id属性值
                    frameName   : "",           // 设置iframe的name属性值

                    html        : false,        //一段文字或一段html代码
                    icon        : false         //文字或html代码前带的icon图标
                },        

                footer          : false,         //弹出框的底部参数设置。值为false时表示弹出框无底部
                /**
                 * 如果footer存在，可按照以下格式设置相关参数
                 *
                 * [         //底部按钮设置
                 *     {
                 *         text         : false,    //按钮文字
                 *         buttonID     : false,    //按钮的id，可用于用户自定义设置按钮的样式
                 *         style        : 'layer-btn-default',       //按钮样式
                 *         callback     : false,    //按钮点击时执行的操作
                 *     }
                 * ]
                 * 
                 */
                
                 onInit         : false,            //初始化完成回调
                 onClose        : false             //关闭回调
            }, tlayer.globalSettings, options || {});

            //组装一个弹出框，并返回该弹出框
            return layerUtil.excuteLayer.call(tlayer, settings);
        },
        /**
         * 设置tlayer全局settings的参数值
         * @return 无返回
         */
        global: function (options) {
            var tlayer = _tlayer;
            tlayer.globalSettings = tlayer.globalSettings || {};

            $.extend(tlayer.globalSettings, options || {});
        },
        /**
         * 关闭layerID对应的弹出窗口，并且销毁该窗口
         * @param  {String} layerID layer弹出框的id，不传代表关闭顶层弹窗
         * @param  {Function} fn    关闭弹窗之后的回调函数
         */
        close: function (layerID, fn) {
            var stack = _tlayer.layerData.stack;
            layerID = layerID || stack.pop();

            layerUtil.hideLayer(layerID, function () {

                //执行回调
                if (util.isFunction(fn)) {
                    fn.call(this, layerID);
                }

                //销毁该layer
                var layerData = _tlayer.layerData,
                    layers = layerData.layers;

                layers[layerID].layer.remove();

                //出栈
                util.removeOf.call(layerData.stack, layerID);

                //彻底销毁layer
                delete layers[layerID];
            });
        },
        /**
         * 显示layerID对应的弹出窗口
         * @param  {String} layerID layer弹出框的id
         * @param  {Function} fn    显示之后的回调函数
         * @return 无返回
         */
        show: function (layerID, fn) {
            layerUtil.showLayer(layerID, function () {
                if (util.isFunction(fn)) {
                    fn.call(this, layerID);
                }
            });
        },
        /**
         * 隐藏layerID对应的弹出窗口
         * @param  {String} layerID layer弹出框的id，不传代表隐藏顶层弹窗
         * @param  {Function} fn    隐藏之后的回调函数
         * @return 无返回
         */
        hide: function (layerID, fn) {
            var stack = _tlayer.layerData.stack;

            layerID = layerID || stack.pop();

            layerUtil.hideLayer(layerID, function () {
                if (util.isFunction(fn)) {
                    fn.call(this, layerID);
                }

                //出栈
                util.removeOf.call(stack, layerID);
            });
        }
    };

    //弹出框工具函数
    var layerUtil = {

        /**
         * 组装一个弹出框
         * @param  {Object} settings 弹出框的参数设置
         * @return {Object} 返回弹出框的JQ对象
         */
        excuteLayer: function (settings) {
            var tlayer = this,
                layerData = tlayer.layerData;

            //生成弹出框的唯一id标识
            var layerID = settings.layerID || "tlayer_" + (layerData.layerLength);
            
            //若已存在该layer，则不允许再生成一个，并且显示该弹窗
            if ( layerData.layers[layerID] ) {

                if ( settings.auto ) {
                    methods.show( layerID );
                }
                
                return layerID;
            }

            layerData.layerLength++;

            //生成弹出框的容器
            var $layer = $("<div />", {
                "id"        : layerID,
                "class"     : "layer-box-wraper",
                "style"     : "z-index:"+settings.zIndex
            });

            layerData.layers[layerID] = {
                "layer"     : $layer,
                "settings"  : settings,
                "status"    : 0
            };

            //获取弹出框各个部分的HTML代码
            var mask    = layerUtil.mask.call(this, layerID),
                header  = layerUtil.header.call(this, layerID),
                content = layerUtil.content.call(this, layerID);
                footer  = layerUtil.footer.call(this, layerID);

            //组合弹出框HTML代码
            var layer = mask +
                        '<div class="layer-dialog">'+
                            '<div class="layer-box-container '+settings.theme+' layer-type-'+settings.layerType+'">'+
                                header+content+footer+
                            '</div>' +
                        '</div>';

            $layer.append(layer);

            setTimeout(function () {
                layerUtil.centerLayer($layer.find(".layer-box-container"), settings);
                layerUtil.drag($layer.find(".layer-drag"), $layer.find(".layer-box-container"));
            }, 0);
            

            return $layer;
        },
        /**
         * 将layerID对应的弹出框追加到相应的document上下文对象下
         * @param  {String} layerID layer弹出框的id
         * @return 无返回
         */
        appendLayer: function (layerID) {
            var tlayer = _tlayer,
                layerData = tlayer.layerData,
                $layer = layerData.layers[layerID].layer,
                settings = layerData.layers[layerID].settings;
        
            //追加弹出框到响应的上下文对象上
            $(settings.context).find("body").append($layer);

            //为缺省关闭事件的按钮添加点击时执行隐藏的功能
            layerUtil.addHideFn.call(settings.footer, layerID);

            //给弹出框的所有按钮绑定click事件
            layerUtil.bindBtnClick(layerID);
            if (settings.closeBtn) {
                layerUtil.closeBtnClick(layerID);
            }

            //执行初始化onInit
            if (util.isFunction(settings.onInit)) {
                setTimeout(function () {
                    settings.onInit.call($layer.get(0), layerID);
                }, 0);
            }
        },
        /**
         * 生成背景层HTML代码
         * @param  {String} layerID layer弹出框的id
         * @return {String} 返回背景层的HTML代码
         */
        mask: function (layerID) {
            var tlayer = this,
                layerData = this.layerData,
                settings = layerData.layers[layerID].settings;

            var maskHTML = '<div class="layer-box-mask">&nbsp;</div>';

            if (!settings.showMask || $('.layer-box-mask:visible').length > 0) {
                maskHTML = '';
            }
            
            return maskHTML;
        },
        /**
         * 生成头部HTML代码
         * @param  {String} layerID layer弹出框的id
         * @return {String} 返回头部的HTML代码
         */
        header: function (layerID) {
            var tlayer = this,
                layerData = this.layerData,
                settings = layerData.layers[layerID].settings;

            //不需要头部区域
            if (!settings.header) { return ""; }

            //生成头部区域HTML
            var headerHTML  =   '<div class="layer-box-header">'+
                                    '<h3 class="layer-header-title">'+settings.header+'</h3>'+
                                    '<div class="layer-drag">&nbsp;</div>'+
                                    (settings.closeBtn ? '<div id="layer-cancel" class="layer-cancel" title="关闭" unselectable="on" onselectstart="return false;">×</div>' : '')+
                                '</div>';

            return headerHTML;
        },
        /**
         * 生成内容区域的HTML代码
         * @param  {String} layerID layer弹出框的id
         * @return {String} 返回内容区域的HTML代码
         */
        content: function (layerID) {
            var tlayer = this,
                layerData = this.layerData,
                settings = layerData.layers[layerID].settings;

            var c = settings.content;

            var cStyle = [];

            //设置宽度
            settings.width && cStyle.push("width: "+settings.width+"px");
            //设置高度
            settings.height && cStyle.push("height: "+settings.height+"px");
            //设置最大宽度
            settings.maxWidth && cStyle.push('max-width: '+settings.maxWidth+'px');
            //设置padding
            c.padding && cStyle.push("padding: " + c.padding);

            cStyle = ' style="'+cStyle.join(";")+'"';

            var contentHTML = '<div class="layer-box-content-wraper"' + cStyle + '>';

            if (c.src) {
                //内容区域是通过一个外链来获取的，则使用iframe
                contentHTML += '<iframe class="layer-box-content layer-box-iframe" src="'+c.src+'" id="'+c.frameID+'" name="'+c.frameName+'" width="100%" height="100%" frameborder="0"></iframe>';
            } else {
                //内容区域是一段html字符串
                var html = c.html || "&nbsp;";

                if (c.icon) {
                    html =  '<div class="layer-table">' +
                                '<div class="layer-table-cell">' +
                                    '<span class="layer-box-icon" style="background-image: url('+c.icon+');"></span>' +       
                                '</div>' +
                                '<div class="layer-table-cell">' +
                                    '<span class="layer-box-text">' + html + '</span>' +       
                                '</div>' +
                            '</div>';
                }

                contentHTML += '<div class="layer-box-content">'+html+'</div>';
            }

            contentHTML += '</div>';

            return contentHTML;
        },
        /**
         * 生成底部HTML代码
         * @param  {String} layerID layer弹出框的id
         * @return {String} 返回底部的HTML代码
         */
        footer: function (layerID) {
            var tlayer = this,
                layerData = this.layerData,
                settings = layerData.layers[layerID].settings;

            var f = settings.footer;

            //不需要底部区域
            if (!f) { return ""; }

            //生成头部区域HTML
            var footerHTML  =   '<div class="layer-box-footer">'+
                                    layerUtil.buttons(layerID, f, "footer")+
                                '</div>';

            return footerHTML;
        },
        /**
         * 生成按钮HTML代码
         * @param  {String} layerID layer弹出框的id
         * @param  {Array}  buttons 按钮的对象集合
         * @param  {String} block   按钮的区域，取值"header"或"footer"
         * @return {String} 返回按钮的HTML代码
         */
        buttons: function (layerID, buttons, block) {
            var bLen = buttons && buttons.length;

            //按钮不存在时
            if (!bLen) { return ""; }

            var buttonsHTML = '';

            for (var i = 0; i < bLen; i++) {
                var button = buttons[i];

                button.buttonID = button.buttonID || layerID+"-"+block+"-"+i;
                button.style = 'layer-btn-' + (button.style || 'default');

                var attrs = {
                    "id"            : button.buttonID ? ' id="'+button.buttonID+'"' : '',
                    "cls"         : ' class="layer-btn '+button.style+ '"',
                    "text"          : button.text || "&nbsp;",
                    "title"         : 'title="' + (button.text || "&nbsp;") + '"',
                    "unselectable"  : ' unselectable="on" onselectstart="return false;"'
                };

                buttonsHTML +=  '<button'+attrs.id+attrs.cls+attrs.title+attrs.unselectable+'>'+attrs.text+'</button>';
            }

            return buttonsHTML;
        },
        /**
         * 为所有按钮绑定type事件
         * @param  {String} layerID layer弹出框的id
         * @param  {String} type    事件类型，例如: click, mouseenter, mouseleave等
         * @return 无返回
         */
        bindBtnClick: function (layerID, type) {
            var tlayer = _tlayer,
                layerData = tlayer.layerData,
                $layer = layerData.layers[layerID].layer,
                settings = layerData.layers[layerID].settings;

            type = type || "click";

            //button集合
            var fb = settings.footer ? settings.footer : [];

            for (var i = fb.length-1; i >= 0; i--) {              
                (function (i) {
                    var b = fb[i];
                    if (util.isFunction(b.callback)) {
                        $layer.find("#"+b.buttonID).on(type, function () {
                            b.callback.call($layer[0], layerID);
                        });
                    }
                } (i));
            }
        },
        /**
         * [closeBtnClick 头部关闭按钮]
         * @param  {[type]} layerID [description]
         * @return {[type]}         [description]
         */
        closeBtnClick: function (layerID) {
            var tlayer = _tlayer,
                layerData = tlayer.layerData,
                $layer = layerData.layers[layerID].layer;

            $layer.find('.layer-cancel').on('click', function () {
                methods.close(layerID);
            });
        },
        /**
         * 绑定事件
         * @return 无返回
         */
        bindEvents: function () {
            //绑定ESC键触发关闭layer操作
            $(document).on("keyup.tmenu", function (e) {
                e = e || window.event;
                var code = e.keyCode || e.which;

                var tlayer = _tlayer;

                if (code == 27 && tlayer && tlayer.layerData) {
                    var layerData = tlayer.layerData,
                        layers = layerData.layers,
                        stack = layerData.stack;

                    if (stack.length != 0) {
                        var layerID = stack[stack.length - 1],  //关闭最上面一个
                            layer = layers[layerID],
                            $layer = layer.layer,
                            settings = layer.settings;

                        if (layerID && settings.bindEsc) {

                            if (util.isFunction(settings.onEsc)) {
                                util.runFunction(settings.onEsc, $layer, [layerID]);
                            } else {
                                //关闭layer
                                methods.close(layerID);
                            }

                            //e.stopPropagation();
                            e.preventDefault();
                            //return false;
                        }
                    }
                }
            });
        },
        /**
         * 显示弹出框(动画类型, 例如：show, fadeIn, slideDown等)
         * @param  {String} layerID layer弹出框的id
         * @return 无返回
         */
        showLayer: function (layerID, fn) {
            var tlayer = _tlayer;
            //判断是否存在layer，否则不执行下面的操作
            if (!tlayer || !tlayer.layerData.layers[layerID]) { return false; }

            var layerData = tlayer.layerData,
                layer = layerData.layers[layerID],
                $layer = layer.layer,
                settings = layerData.layers[layerID].settings;

            //判断layer是否已显示，否则不允许再显示
            if (util.inArray(layerID, layerData.stack) > -1) { return false; }

            //显示类型
            var animation = {
                "fade"      : "fadeIn",
                "slide"     : "slideDown",
                "display"   : "show"
            };
            animation = animation[settings.animation];

            var duration = settings.duration;

            //入栈
            layerData.stack.push(layerID)
            layerUtil.sortByZIndex.call(tlayer);

            $layer[animation](duration, function () {
                if (!settings.bodyScroll) {
                    layerUtil.hideBodyScrollBar(layerID);
                }

                if (util.isFunction(fn)) {
                    fn.call($layer[0], layerID);
                }
            });
        },
        /**
         * 隐藏弹出框(动画类型, 例如：hide, fadeOut, slideUp等)
         * @param  {String} layerID layer弹出框的id
         * @return 无返回
         */
        hideLayer: function (layerID, fn) {
            var tlayer = _tlayer;

            //判断是否存在layer，否则不执行下面的操作
            if (!tlayer || !tlayer.layerData.layers[layerID]) { return false; }

            var layerData = tlayer.layerData,
                layer = layerData.layers[layerID],
                $layer = layer.layer,
                settings = layerData.layers[layerID].settings;

            if (!$layer.length) { return false; }

            //显示类型
            var animation = {
                "fade"      : "fadeOut",
                "slide"     : "slideUp",
                "display"   : "hide"
            };
            animation = animation[settings.animation];

            var duration = settings.duration;

            $layer[animation](duration, function () {
                if (!settings.bodyScroll) {
                    layerUtil.resetBodyScrollBar(layerID);
                }

                if (util.isFunction(fn)) {
                    fn.call($layer.get(0), layerID);
                }

            });
        },
        /**
         * 为header和footer的buttons的callback重写具有隐藏弹出框功能
         * @param  {String} layerID layer弹出框的id
         */
        addHideFn: function (layerID) {
            var block = this;

            if (!util.isArray(block)) {
                return;
            }

            for (var i = 0, bLen = block.length; i < bLen; i++) {
                (function (i) {
                    var callback = block[i].callback;

                    if (!callback) {
                        block[i].callback = function () {
                            methods.close(layerID);
                        };
                    }
                } (i));
            }
        },
        /**
         * 设置layer的状态
         * @param {Object} layer layer弹出框
         * @param {Int}    status  layer的状态，-1已销毁，0隐藏，1显示
         */
        setLayerStatus: function (layer, status) {
            layer.status = status;
        },
        /**
         * 获取layer的状态
         * @param {Object} layer layer弹出框
         * @return  {Int}            返回layer的状态值
         */
        getLayerStatus: function (layer) {
            return layer.status;
        },
        /**
         * 根据弹出框的zIndex从小到大排序
         * @return 无返回
         */
        sortByZIndex: function () {
            var tlayer = this,
                layerData = this.layerData,
                layers = layerData.layers;

            layerData.stack.sort(function (a, b) {
                var aZIndex = layers[a].settings.zIndex,
                    bZIndex = layers[b].settings.zIndex;

                return aZIndex - bZIndex;
            });
        },

        /**
         * 拖动
         */
        drag: function ($dragTarget, $moveTarget) {
            if ($dragTarget.length == 0) return;

            /*--------------拖曳效果----------------
            *原理：标记拖曳状态dragging ,坐标位置iX, iY
            *         mousedown:fn(){dragging = true, 记录起始坐标位置，设置鼠标捕获}
            *         mouseover:fn(){判断如果dragging = true, 则当前坐标位置 - 记录起始坐标位置，绝对定位的元素获得差值}
            *         mouseup:fn(){dragging = false, 释放鼠标捕获，防止冒泡}
            */
            var dragging = false;
            var iX, iY;

            $dragTarget.mousedown(function (e) {
                dragging = true;

                iX = e.clientX - $moveTarget.position().left;
                iY = e.clientY - $moveTarget.position().top;

                this.setCapture && this.setCapture();   //在拖动过程中捕获鼠标
                return false;
            });

            $(document).off('mousemove.layer_drag').on('mousemove.layer_drag', function (e) {
                if (dragging) {
                    var oX = e.clientX - iX;
                    var oY = e.clientY - iY;

                    if (oX < 0) oX = 0;
                    if (oY < 0) oY = 0;

                    $moveTarget.css({"left": oX + "px", "top": oY + "px"});

                    return false;
                }
            });

            $(document).off('mouseup.layer_drag').on('mouseup.layer_drag', function(e) {
                dragging = false;
                e.cancelBubble = true;

                $dragTarget[0].releaseCapture && $dragTarget[0].releaseCapture();   //结束拖放释放鼠标
            });
        },

        /**
         * [centerLayer 居中弹出框]
         * @param  {[type]} $container [description]
         * @return {[type]}            [description]
         */
        centerLayer: function ($container, settings) {
            var height = $(window).height();
            var width = $(window).width();
            var mheight = $container.height();
            var mwidth = $container.width();

            var t = (height - mheight) / 2 < 0 ? 0 : (height - mheight) / 2;
            var l = (width - mwidth) / 2 < 0 ? 0 : (width - mwidth) / 2;

            $container.css({
                "top": t + "px",
                "left": l + "px"
            });        

            var argumentsArr = arguments;

            $(window).on("resize.centerLayer", function () {
                $(window).off("resize.centerLayer");

                if (argumentsArr) {
                    argumentsArr.callee.apply(null, argumentsArr);
                }
            });
        },

        hideBodyScrollBar: function (layerID) {
            var layerData = _tlayer.layerData,
                layer = layerData.layers[layerID],
                $layer = layer.layer,
                settings = layerData.layers[layerID].settings;

            var $body = $('body');
            var fullWindowWidth = window.innerWidth;

            if (!fullWindowWidth) { // workaround for missing window.innerWidth in IE8
              var documentElementRect = document.documentElement.getBoundingClientRect();
              fullWindowWidth = documentElementRect.right - Math.abs(documentElementRect.left);
            }

            //计算滚动条宽度
            var scrollDiv = document.createElement('div');
            $(scrollDiv).css({
                position: 'absolute',
                top: '-9999px',
                overflow: 'scroll'
            });
            $body.append(scrollDiv);
            var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
            $body[0].removeChild(scrollDiv);

            //获取原始padding
            $body.originalBodyPad = parseInt(($body.css('padding-right') || 0), 10);

            if (document.body.clientWidth < fullWindowWidth) {
                $body.addClass('hide-scrollbar')
                    .css('padding-right', $body.originalBodyPad + scrollbarWidth);
            }
        },

        /**
         * [resetBodyScrollBar 还原body的scrollbar]
         * @param  {[type]} layerID [description]
         * @return {[type]}         [description]
         */
        resetBodyScrollBar: function (layerID) {
            $('body').removeClass('hide-scrollbar')
                    .css('padding-right', $('body').originalBodyPad || '');
        }
    };

    //公用工具函数
    var util = {
        /**
         * 获取变量的类型
         * @param  {各类型} variable 变量
         * @return {String}          返回变量的类型, 如：number, array, function, object, string等
         */
        typeOf: function (variable) {
            var type = Object.prototype.toString.call(variable);
            return ((/\[object\s+(.*)\]/ig).exec(type)[1]).toLowerCase();
        },
        /**
         * [isArray 判断是否是数组]
         * @param  {[type]}  obj [description]
         * @return {Boolean}     [description]
         */
        isArray: function (obj) {
            return Object.prototype.toString.call(obj) === '[object Array]'; 
        },
        /**
         * 判断元素是否存在数组中
         * @param  {各种类型} item 要判断的元素
         * @param  {array}    arr  被判断的数组
         * @return {boolean}       返回布尔值
         */
        inArray: function (item, arr) {
            if ($.inArray) {
                return $.inArray(item, arr);
            } else {
                for (var i = arr.length-1; i > -1; i--) {
                    if (arr[i] == item) {
                        return i;
                    }
                }
                return -1;
            }
        },
        /**
         * 移除arr数组中index下标对应元素
         * @param  {Int} index   要移除的元素的下标
         * @return 返回被移除的元素
         */
        removeAt: function (index) {
            var len = this.length;
            if (index == 0) {
                return this.shift();            
            } else if (index == (len - 1)) {
                return this.pop();
            } else {
                var value = this[index];
                var newArr = [].concat(this.slice(0, index), this.slice((index + 1), len)),
                    newLen = newArr.length;
                for (var i = 0; i < newLen; i++) {
                    this[i] = newArr[i];
                }
                this.length = newLen;
                return value;
            }
        },
        /**
         * 移除数组中的元素
         * @param  {多类型} value 要移除的元素
         * @return {多类型}       返回被移除的元素
         */
        removeOf: function (value) {
            var index = util.inArray(value, this);
            if (index > -1) {
                return util.removeAt.call(this, index);
            }
            return false;
        },
        /**
         * 判断fun是否存在并且是一个函数
         * @param  {Function}  fun 函数名
         * @return {Boolean}       返回布尔值
         */
        isFunction: function (fun) {
            if (fun && typeof fun === "function") {
                return true;
            }
            return false;
        },
        /**
         * 如果fn为函数则运行该函数
         * @param  {Function}  fn       函数名
         * @param  {Object}    thisObj  函数的当前对象
         * @param  {Array}     args     函数参数
         * @return 无返回
         */
        runFunction: function (fn, thisObj, args) {
            if (this.isFunction(fn)) {
                var argus = arguments,
                    argsl = argus.length;

                //如果函数的参数列表存在1个参数
                if (argsl == 1) {
                    fn.apply(window);
                }

                //如果函数的参数列表存在2个参数
                if (argsl == 2) {
                    if (this.typeOf(thisObj) == "array") {
                        fn.apply(window, thisObj);
                    } else {
                        fn.apply(thisObj);
                    }
                }

                //如果函数的参数列表存在3个参数
                if (argsl == 3) {
                    fn.apply(thisObj || window, args);
                }
            }
        }

    };

    //定义各类弹出框
    var tlayer = {

        /**
         * 弹出一个类似alert的窗口
         * @param  {Object} options alert弹出框的参数设置
         * @return {String}         layer弹出框的id
         */
        alert: function (options) {

            if (util.typeOf(options) == "string") {
                options = {
                    content     : {
                        html    : options || ""
                    }
                };
            }

            //开启深度拷贝
            var settings = $.extend(true, {
                layerType       : 'alert',          //弹出框类型
                closeBtn        : true,
                width           : 560,

                header          : '警告',           //alert弹出框不允许出现头部
                footer: [{
                    text  : "确定",
                    buttonID    : "sure"
                }]
            }, options || {});

            var tLayer = _tlayer,
                layers = tLayer.layerData.layers;

            var $layer = methods.init(settings);

            if (util.typeOf($layer) == "string") {
                //若$layer为字符串，则表示layer已存在
                return layers[$layer].layer;
            }

            $layer.addClass("layer-alert-box");

            var layerID     = $layer.attr("id"),
                settings    = layers[layerID].settings;

            //追加弹出框到上下文对象中
            layerUtil.appendLayer(layerID);

            //是否立即显示弹出框
            if (settings.auto) {
                //显示弹出框
                layerUtil.showLayer(layerID);
            }

            return $layer;
        },
        /**
         * 弹出一个类似confirm的窗口
         * @param  {Object} options confirm弹出框的参数设置
         * @return {String}         layer弹出框的id
         */
        confirm: function (options, callback) {

            if (util.typeOf(options) == "string") {
                options = {
                    content     : {
                        html    : options || ""
                    }
                };
            }

            //开启深度拷贝
            var settings = $.extend(true, {
                layerType       : 'confirm',
                width           : 560,

                content         : {
                    html        : ""
                },
                footer          : [{
                    text        : "确定",
                    buttonID    : "yes",
                    callback    : callback
                }, {
                    text        : "取消",
                    buttonID    : "no"
                }]
            }, options || {});

            var buttons = settings.footer.buttons;

            //confirm弹出框底部只允许两个按钮出现
            settings.footer.buttons = [settings.footer.buttons[0], settings.footer.buttons[1]];

            var tlayer      = _tlayer,
                layers      = tlayer.layerData.layers;

            var $layer = methods.init(settings);

            if (util.typeOf($layer) == "string") {
                //若$layer为字符串，则表示layer已存在
                return layers[$layer].layer;
            }

            $layer.addClass("layer-confirm-box");

            var layerID     = $layer.attr("id"),
                settings    = layers[layerID].settings;

            //追加弹出框到上下文对象中
            layerUtil.appendLayer(layerID);

            //是否立即显示弹出框
            if (settings.auto) {
                //显示弹出框
                layerUtil.showLayer(layerID);
            }

            return $layer;
        },
        /**
         * 淡入一个消息框，在一定的时间后淡出
         * @return {Object} options msg弹出框的参数设置
         * @return {String}         layer弹出框的id
         */
        msg: function (options, fn) {
            if (util.typeOf(options) == "string") {
                options = {
                    content     : {
                        html    : options || ""
                    }
                };
            }

            //开启深度拷贝
            var settings = $.extend(true, {
                delay           : 1000,             //msg弹出框特有的延时消失时间，单位ms
                layerType       : 'msg',            //弹出框类型
                maxWidth        : 300,              //最大宽度

                content: {
                    icon        : "img/layer-icon.png",
                    html        : ""
                },

                onClose         : fn || false       //关闭msg弹出框特有的回调函数
            }, options || {}, {
                header          : false,            //msg弹出框不允许出现头部
                footer          : false             //msg弹出框不允许出现底部
            });

            var tlayer      = _tlayer,
                layers      = tlayer.layerData.layers;

            var $layer = methods.init(settings);

            if (util.typeOf($layer) == "string") {
                //若$layer为字符串，则表示layer已存在
                return layers[$layer].layer;
            }

            $layer.addClass("layer-msg-box");

            var layerID     = $layer.attr("id"),
                settings    = layers[layerID].settings;

            //追加弹出框到上下文对象中
            layerUtil.appendLayer(layerID);

            //是否立即显示弹出框
            if (settings.auto) {
                //显示弹出框
                layerUtil.showLayer(layerID, function () {
                    //msg弹出框显示停留settings.delay时间（ms）后消失
                    setTimeout(function () {
                        methods.close(layerID, settings.onClose);
                    }, settings.delay);
                });
            }

            return $layer;
        },
        /**
         * [tips 提示框]
         * @param  {[type]} message [description]
         * @param  {[type]} type    提示类型，0，1代表警告，2代表错误，3代表正确
         * @return {[type]}         [description]
         */
        tips: function (message, type, fn) {
            type = typeof type === 'undefined' ? 3 : type;

            //开启深度拷贝
            var settings = {
                delay           : 1500,             //提示框框特有的延时消失时间，单位ms
                showMask        : false,            //不显示阴影层
                layerType       : 'tips',           //弹出框类型
                maxWidth        : 300,              //最大宽度
                bodyScroll      : true,             //不设置body的overflow: hidden;

                header          : false,            //提示框框不允许出现底部
                content: {
                    icon        : "img/layer-tips.png",
                    html        : message
                },
                footer          : false,            //提示框框不允许出现头部

                onClose         : fn || false       //提示框特有的回调函数
            };

            var tlayer      = _tlayer,
                layers      = tlayer.layerData.layers;

            var $layer = methods.init(settings);

            if (util.typeOf($layer) == "string") {
                //若$layer为字符串，则表示layer已存在
                return layers[$layer].layer;
            }

            //删除前面的提示框
            $(".layer-msg-box").remove();
            $layer.addClass("layer-msg-box");

            var layerID     = $layer.attr("id"),
                settings    = layers[layerID].settings;

            //追加弹出框到上下文对象中
            layerUtil.appendLayer(layerID);

            //是否立即显示弹出框
            if (settings.auto) {
                //显示弹出框
                layerUtil.showLayer(layerID, function () {
                    //msg弹出框显示停留settings.delay时间（ms）后消失
                    setTimeout(function () {
                        methods.close(layerID, settings.onClose);
                    }, settings.delay);
                });
            }

            //追加样式
            $layer.find(".layer-box-icon").css("background-position", -(type * 40) + "px" + " center");

            return $layer;
        },
        /**
         * 弹出一个loading窗口，不消失
         * @return {Object} options msg弹出框的参数设置
         * @return {String}         layer弹出框的id
         */
        loading: function (options) {
            if (util.typeOf(options) == "string") {
                options = {
                    content     : {
                        html    : options || ""
                    }
                };
            }

            //开启深度拷贝
            var settings = $.extend(true, {
                layerType       : 'loading',
                maxWidth        : 300,          //最大宽度

                content: {
                    icon        : "img/layer-loading.gif",
                    html        : ""
                }
            }, options || {}, {
                header          : false,        //不允许出现头部
                footer          : false         //不允许出现底部
            });

            var tlayer      = _tlayer,
                layers      = tlayer.layerData.layers;

            var $layer = methods.init(settings);

            if (util.typeOf($layer) == "string") {
                //若$layer为字符串，则表示layer已存在
                return layers[$layer].layer;
            }

            $layer.addClass("layer-loading-box");

            var layerID     = $layer.attr("id"),
                settings    = layers[layerID].settings;

            //追加弹出框到上下文对象中
            layerUtil.appendLayer(layerID);

            //是否立即显示弹出框
            if (settings.auto) {
                //显示弹出框
                layerUtil.showLayer(layerID);
            }

            return $layer;
        },
        /**
         * 弹出一个内容弹出框
         * @return {Object} options content弹出框的参数设置
         * @return {String}         layer弹出框的id
         */
        content: function (options) {

            if (options && util.typeOf(options) == "object") {
                //开启深度拷贝
                var settings = $.extend(true, {
                    layerType       : 'conent',
                    closeBtn        : true
                }, options || {});

                var tlayer      = _tlayer,
                    layers      = tlayer.layerData.layers;

                var $layer = methods.init(settings);

                if (util.typeOf($layer) == "string") {
                    //若$layer为字符串，则表示layer已存在
                    return layers[$layer].layer;
                }

                $layer.addClass("layer-content-box");

                var layerID     = $layer.attr("id"),
                    settings    = layers[layerID].settings;

                //追加弹出框到上下文对象中
                layerUtil.appendLayer(layerID);

                //是否立即显示弹出框
                if (settings.auto) {
                    //显示弹出框
                    layerUtil.showLayer(layerID);
                }

                return $layer;
            }

            return false;           
        }
    };

    //直接在jQuery对象上扩展方法
    $.extend(tlayer);

    //在methods对象中扩展方法
    $.extend(methods, tlayer);
    
    $.tLayer = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else {
            $.error('方法 ' + method + ' 在tlayer中未定义！');
        }
    };

    //绑定esc键关闭layer弹窗
    layerUtil.bindEvents();

} (jQuery, window, undefined));