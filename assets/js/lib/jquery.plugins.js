/**
 * jQuery 插件集
 * @author helin
 */
(function (factory) {
    // AMD
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else {
        if (!jQuery) {
            throw new Error('jquery plugin depends on jquery');
        }

        factory(jQuery);
    }
}
(function ($) {

/**
 * [pluginDep 插件依赖的公用函数]
 */
var PluginDep = {};

// 在数组中查找项的位置
PluginDep.indexOf = function (arr, value, key) {
    var index = -1;

    if (arr.length > 0) {
        for (var i = 0, l = arr.length; i < l; i++) {
            if (typeof arr[i] == 'object' && typeof key != 'undefined') {
                if (arr[i][key] == value[key]) {
                    index = i;
                }
            } else {
                if (arr[i] == value) {
                    index = i;
                }
            }
        }
    }

    return index;
};

/**
 * [browser 浏览器信息]
 */
PluginDep.browser = (function () {
    var ua = navigator.userAgent.toLowerCase();
    var browser = {};
    
    var match = /(chrome)[ \/]([\w.]+)/.exec(ua) ||
        /(webkit)[ \/]([\w.]+)/.exec(ua) ||
        /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) ||
        /(msie) ([\w.]+)/.exec(ua) ||
        ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) ||
        [];

    var matched = {
        browser: match[1] || '',
        version: match[2] || '0'
    };

    if (matched.browser) {
        browser[matched.browser] = true;
        browser.version = +matched.version.split('.')[0];
    }

    //由于IE11没有msie标识，所以换一种方式判断IE
    if (window.ActiveXObject || 'ActiveXObject' in window) { 
        browser.msie = true;
        delete browser['mozilla'];
    }

    // Chrome is Webkit, but Webkit is also Safari.
    if (browser.chrome) {
        browser.webkit = true;
    } else if (browser.webkit) {
        browser.safari = true;
    }

    return browser;
})();

/**
 * 是否是IE9以下
 */
PluginDep.isBelowIE9 = (function () {
    return PluginDep.browser.msie && PluginDep.browser.version < 9;
})();

/**
 * [parseTpl 解析简单的模板变量]
 */
PluginDep.parseTpl = function (template, itemData) {
    return template.replace(/\#\{([\w]*)\}/g, function (s0, s1) {
        return s1 == '' ? itemData : itemData[s1] || '';
    });
}

/**
 * [isOverflow 判断是否出现滚动条]
 * @param  {[type]}  $ele [description]
 */
PluginDep.isOverflow = function ($ele) {
    var obj = {};

    if ($ele[0].scrollWidth > $ele.outerWidth(true)) {
        obj.x = true;
    }

    if ($ele[0].scrollHeight > $ele.outerHeight(true)) {
        obj.y = true;
    }

    return $.isEmptyObject(obj) ? false : obj;
}

/**
 * [isDOM 判断是否是DOM元素，包括document]
 * @param  {[type]}  obj [节点对象]
 * @return {Boolean}     [description]
 */
PluginDep.isDom = function (obj) {
    if (typeof HTMLElement === 'object') {
        return obj instanceof HTMLElement;
    } else {
        return obj != null && typeof obj === 'object' && (obj.nodeType === 1 || obj.nodeType === 9);
    }
}

/**
 * [scrollBarWidth 浏览器滚动条宽度]
 * @return {[type]} [description]
 */
PluginDep.scrollBarWidth = function (context) {
    context = context || document;

    var $body = $('body', context);
    var scrollDiv = document.createElement('div');
    $(scrollDiv).css({
        position: 'absolute',
        top: '-9999px',
        width: '50px',
        height: '50px',
        overflow: 'scroll'
    });
    $body.append(scrollDiv);
    var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
    $body[0].removeChild(scrollDiv);

    return scrollbarWidth;
}

/**
 * [hideBodyScrollbar 隐藏body滚动条]
 * @return {[type]} [description]
 */
PluginDep.hideBodyScrollbar = function (context) {
    context = context || document;

    var $body = $('body', context);
    var fullWindowWidth = window.innerWidth;
    var scrollbarWidth = PluginDep.scrollBarWidth(context);

    if (!fullWindowWidth) { // workaround for missing window.innerWidth in IE8
      var documentElementRect = document.documentElement.getBoundingClientRect();
      fullWindowWidth = documentElementRect.right - Math.abs(documentElementRect.left);
    }

    //获取原始padding
    $body.originalBodyPad = parseInt(($body.css('padding-right') || 0), 10);

    if (document.body.clientWidth < fullWindowWidth) {
        $body.css('padding-right', $body.originalBodyPad + scrollbarWidth);
    }

    $body.addClass('hide-scrollbar');
}

/**
 * [resetBodyScrollbar 还原body滚动条]
 * @return {[type]} [description]
 */
PluginDep.resetBodyScrollbar = function (context) {
    var $body = $('body', context || document);
    if ($body.hasClass('hide-scrollbar')) {
        $('body', context || document).removeClass('hide-scrollbar').css('padding-right', $('body').originalBodyPad || '');
    }
}

/**
 * [getPosition 计算元素的长宽及位置信息]
 * @param  {[type]} ele [description]
 * @return {[type]}     [description]
 */
PluginDep.getPosition = function (ele) {
    var elRect = ele[0].getBoundingClientRect();

    // IE8中没有width和height
    if (elRect.width == null) {
      elRect = $.extend({}, elRect, { width: elRect.right - elRect.left, height: elRect.bottom - elRect.top });
    }

    return $.extend({}, elRect, { 
        scrollTop: document.documentElement.scrollTop || document.body.scrollTop,
        scrollLeft: document.documentElement.scrollLeft || document.body.scrollLeft 
    });
};

/**
 * [获取css样式数值]
 * @param  {[type]} $ [description]
 * @return {[type]}   [description]
 */
$.extend($.fn, {
    getCss: function(name) {
        var value = parseInt(this.css(name));

        if (isNaN(value)) {
            return null;
        }

        return value;
    }
});

/**
 * [table 自动生成表格插件]
 * 使用说明：
 * 需要引入 common.css
 */
;(function() {
    var pName = 'table';
    var namespace = 'ui.' + pName;

    /**
     * [methods 共有方法集合]
     * @type {Object}
     */
    var methods = {
        init: function (options) {
            methods.destroy.call(this);

            return this.each(function () {
                var $this = $(this);

                if (!options.colOptions || options.colOptions.length == 0) {
                    return false;
                }

                var settings = $.extend(true, {}, Table.DEFAULTS, $(this).data(), options);

                $this.data(namespace, new Table($this, settings));
            });
        },

        /**
         * [getRowData 获取行数据]
         * @param  {[type]} id [行号或行对象]
         * @return {[type]}    [description]
         */
        getRowData: function (id) {
            var table = this.eq(0).data(namespace);

            if (id instanceof $ || PluginDep.isDom(id)) {
                return $(id, table.container).data('rowData');
            }

            return $('[data-rowid="'+id+'"]', table.container).data('rowData');
        },

        /**
         * [reload 重新加载]
         * @return {[type]} [description]
         */
        reload: function (data) {
            return this.each(function () {
                $(this).data(namespace).reload(data);                
            });
        },

        /**
         * [getSelectedRowData 回去当前表格中选中的行数据]
         * @return {[type]} [description]
         */
        getSelectedRowData: function () {
            var container = this.eq(0).data(namespace).container;
            var selectedRow = [];

            container.find('.table-checkbox:checked').each(function () {
                var data = $(this).parents('.table-tr').data('rowData');
                selectedRow.push(data);
            });

            return selectedRow;
        },

        /**
         * [setGroupHeaders 合并表头]
         * @param {[type]} o [description]
         */
        setGroupHeaders: function (o) {
            return this.each(function () {
                $(this).data(namespace).setGroupHeaders(o);
            });
        },

        /**
         * [destroy 销毁表格]
         * @param  {[type]} argument [description]
         * @return {[type]}          [description]
         */
        destroy: function (argument) {
            return this.each(function () {
                if ($(this).data(namespace)) {
                    $(this).data(namespace).destroy();
                }
            });
        }
    }

    var Table = function ($container, settings) {
        this.container = $container;
        this.options = settings;

        this.init();
    }

    //默认配置
    Table.DEFAULTS = {
        //表格选项
        tableClass      : '',                       //自定义table类名
        maxHeight       : false,                    //table容器最大高度
        height          : false,                    //table容器高度
        menu            : false,                    //菜单栏

        /*
         * {
         *     cellFilter: {
         *         button: 'selector'
         *     },
         *     colShow: {
         *         button: 'selector'
         *     }
         * }         
         */

        //单元格选项
        checkbox        : false,                    //是否显示checkbox
        rownum          : false,                    //是否显示行号
        rowParam        : false,                    //行自定义参数，对象形式，支持函数返回
        colParam        : false,                    //列自定义参数，对象形式，支持函数返回
        colOptions      : [],                       //列设置
        groupHeaders    : false,                    //多表头设置

        /*
         * colOptions格式：[{
         *     name: 'ID',                          //列显示名称
         *     field: 'id',                         //列字段
         *     width: false,                        //列宽，默认自适应
         *     minWidth: false,                     //最小列宽
         *     edit: {                              //是否可编辑，默认为false
         *         replace: '<input />',            //编辑元素
         *         callback: function () {},        //编辑回调函数
         *     },
         *     align: false,                        //对齐方式
         *     headerAlign: false,                  //表头对齐方式
         *     hide: false,                         //是否显示列
         *     sort: {                              //排序
         *         enable: false,                   //启用排序
         *         isDefault: false,                //是否默认排序
         *         defaultOrder: 'asc'              //默认排序方式
         *     },
         *     numberFormat: {
         *         toThousands: true,
         *         toWarning: true
         *     }
         *     handler: function (value, data) {    //列处理函数，在该列的所有数据
         *                                          //都会被此函数处理，一定要返回数据
         *         return value;
         *     },
         * }]
         */
        
        //本地表格选项
        dataList            : [],                   //本地数组数据

        //远程请求选项
        url                 : '',                   //远程获取数据url
        type                : 'GET',                //请求方式
        data                : false,                //请求数据，json或function
        dataType            : 'json',               //返回数据类型
        jsonp               : 'callback',           //跨域回调函数名称
        dataField           : 'data',               //json数组字段名,
        autoLoad            : true,                 //是否自动加载数据

        //分页选项
        paging              : {
            enable          : true,                 //是否启用分页
            localPage       : false,                //是否本地分页
            indexField      : 'pageIndex',          //页码字段名
            sizeField       : 'pageSize',           //每页条数字段名
            totalField      : 'total',              //总条数字段名
            pageIndex       : 1,                    //从第几页开始
            pageSize        : 20,                   //每页显示多少条数据
            pageSizeArray   : false,                //每页显示多少条数据的选择数组
            pageLength      : 5,                    //显示的页码数
            pageInfo        : true,                 //是否显示页码信息
            skipPage        : true                  //是否启用跳页
        },

        //表头选项
        resizable           : true,                 //是否可拖动列宽
        snameField          : 'sname',              //排序字段字段名
        sorderField         : 'sorder',             //排序方式字段名
        ascField            : 'asc',                //升序标识名
        descField           : 'desc',               //降序标识名

        resultVerify        : false,                //返回结果验证
            
        //回调函数
        onInit              : false,                //表格数据初始化完成
        onRequestError      : false                 //请求错误回调
    }

    /**
     * [init 表格初始化]
     * @param  {[type]} options [初始化参数]
     * @return {[type]}         [description]
     */
    Table.prototype.init = function () {
        var self = this,
            options = this.options,
            $container = this.container;

        var html =  '<div class="table-container">' + 
                        '<div class="table-drag-line">&nbsp;</div>' +
                        (options.tableCaption ? '<div class="table-caption"><a class="op_cl"><span></span></a><span>'+options.tableCaption+'</div>' : '') +
                        '<div class="table-head">'+
                            '<table class="table ' + options.tableClass + '">' + 
                                '<thead>' + this.initHolder() + this.initThead() + '</thead>'+
                            '</table>' +
                        '</div>'+
                        '<div class="table-body">' +
                            '<div class="table-loading">努力加载中...</div>'+
                            '<table class="table table-hover ' + options.tableClass + '">' + 
                                '<thead>' + this.initHolder() + '</thead>' +
                            '</table>' +
                        '</div>'+
                    '</div>';

        $container.html(html);

        for (var i = 0, l = $container.find('.table-head .holder th').length; i < l; i++) {
            $container.find('.table-head .table-tr th').eq(i).attr('data-index', i);
        }

        //执行多列参数设置
        if (options.groupHeaders) {
            self.setGroupHeaders(options.groupHeaders);
        }

        this.initMenu();
        this.initData();
    }

    /**
     * [initMenu 初始化菜单]
     * @return {[type]} [description]
     */
    Table.prototype.initMenu = function () {
        var options = this.options,
            colOptions = options.colOptions,
            menu = options.menu;

        if (menu.colShow) {
            this.colShow = $('<ul class="dropdown-menu table-columns">').appendTo('body');
        }
    }

    /**
     * [initData 处理数据并返回到回调]
     * @return {[type]} [description]
     */
    Table.prototype.initData = function () {
        if (this.options.url) {
            if (this.options.autoLoad) {
                this.getPageData();
            }
        } else {
            this.createTable();
        }
    }

    /**
     * [getPageData 获取远程数据]
     * @return {[type]}           [description]
     */
    Table.prototype.getPageData = function () {
        var self = this,
            options = this.options,
            paging = options.paging,
            $container = this.container,
            colOptions = options.colOptions,
            param;

        if (typeof options.data === 'function') {
            param = options.data();
        } else {
            param = $.extend(true, {}, options.data);
        }

        // 如果有排序则添加
        if (this.sname) {
            param[options.snameField] = this.sname;
            param[options.sorderField] = this.sorder;
        }

        var ajaxOpt;

        if (paging.enable) {
            ajaxOpt = {
                url             : options.url,
                type            : options.type,
                data            : param,
                dataType        : options.dataType,
                jsonp           : options.jsonp,
                dataField       : options.dataField,
                indexField      : paging.indexField,
                sizeField       : paging.sizeField,
                totalField      : paging.totalField,
                pageIndex       : paging.pageIndex,
                pageSize        : paging.pageSize,
                pageSizeArray   : paging.pageSizeArray,
                pageLength      : paging.pageLength,
                pageInfo        : paging.pageInfo,
                skipPage        : paging.skipPage,
                localPage       : paging.localPage,
                beforeSend      : function () {       //加载框显示
                    var height = $container.find('.table-body').height();
                    
                    if (height) {
                        $container.find(".table-loading").show();
                    }
                },
                complete        : function () {         //隐藏加载框
                    $container.find(".table-loading").hide();
                },
                success         : function (res) {
                    options.dataList = (options.dataField ? res[options.dataField] : res) || [];

                    if (options.dataList == null || options.dataList.length == 0) {
                        self.initError('无数据');
                        return;
                    }
                    
                    self.createTable();
                },
                error           : options.onRequestError,
                resultVerify    : function (res) {
                    if (typeof options.resultVerify == 'function') {
                        var ret = options.resultVerify(res);

                        if (!ret.state) {
                            self.initError(ret.msg);
                        }

                        return ret.state;
                    }
                }
            }

            var $pager = $('<div class="table-pager"></div>').appendTo($container.find('.table-container'));

            $pager.pager(ajaxOpt);
        } else {
            ajaxOpt = {
                url             : options.url,
                type            : options.type,
                data            : param,
                dataType        : options.dataType,
                jsonp           : options.jsonp,
                beforeSend      : function () {       //加载框显示
                    var height = $container.find('.table-body').height();

                    if (height) {
                        $container.find(".table-loading").show();
                    }
                },
                complete        : function () {         //隐藏加载框
                    $container.find(".table-loading").hide();
                },
                success         : function (res) {
                    options.dataList = (options.dataField ? res[options.dataField] : res) || [];

                    if (options.dataList == null || options.dataList.length == 0) {
                        self.initError('无数据')
                        return;
                    }
                    
                    self.createTable();
                },
                error: options.onRequestError,
                resultVerify: function (res) {
                    if (typeof options.resultVerify == 'function') {
                        var ret = options.resultVerify(res);

                        if (!res.state) {
                            self.initError(ret.msg);
                        }

                        return ret.state;
                    }
                }
            }

            $.ajax(ajaxOpt);
        }
    }

    /**
     * [createTable 生成表格体]
     * @return {[type]} [description]
     */
    Table.prototype.createTable = function () {
        var $container = this.container,
            $tbody = this.initTbody();

        $container.find('.table-body .table tbody').remove();
        $container.find('.table-body .table').append($tbody);
        $container.find('.table-body').scrollTop(0);
        //$container.find('.table-body').scrollLeft(0);

        this.initTable();
    }

    /**
     * [initTable 初始化表格，包括计算列宽，绑定事件等]
     * @return {[type]} [description]
     */
    Table.prototype.initTable = function () {
        var self = this,
            options = this.options,
            colOptions = options.colOptions,
            $container = this.container;

        setTimeout(function () {
            var $thead = $container.find('.table-head'),
                $tbody = $container.find('.table-body'),
                theadHeight = $thead.outerHeight(true),
                tbodyHeight = $tbody.outerHeight(true),
                tpageHeight = $container.find('.table-pager').outerHeight(true),
                sWidth = PluginDep.scrollBarWidth();

            //计算最大高度
            if (options.maxHeight) {
                var maxHeight = options.maxHeight - $container.getCss('margin-top') - $container.getCss('margin-bottom') - theadHeight - tpageHeight;

                $tbody.css('max-height', maxHeight);
            }

            //计算高度
            if (options.height) {
                var height = options.height - $container.getCss('margin-top') - $container.getCss('margin-bottom') - theadHeight - tpageHeight;
                $tbody.css('height', height);
            }

            var $tbodyTable = $tbody.find('.table');
            var $theadLastTh = $thead.find('.holder th:visible:last');

            //还原最后一列列宽
            if ($thead.data('minusWidth')) {
                //var w = Math.max(parseInt($theadLastTh[0].style.width) || $theadLastTh.width(), 40);
                //$theadLastTh.width(w + sWidth);
                $thead.css('padding-right', 1);
                $tbody.css('padding-right', 1);
                $thead.removeData('minusWidth');
            }

            //出现竖直滚动条则设置padding-right
            if ($tbodyTable.outerHeight(true) > $tbody.outerHeight(true)) {
                //var w = Math.max(parseInt($theadLastTh[0].style.width) || $theadLastTh.width(), 40);
                //$theadLastTh.width(w - sWidth);
                $thead.css('padding-right', sWidth + 1);
                $tbody.css('padding-right', sWidth + 1);
                $thead.data('minusWidth', true);
            } else {
                $tbody.css('max-height', 'none');
            }

            //解决IE8下高度会在最大高度基础上加上滚动条高度的bug
            if (PluginDep.isBelowIE9 && options.maxHeight && $tbodyTable.outerWidth(true) > $tbody.outerWidth(true)) {
                $tbody.css('max-height', $tbody.getCss('max-height') - sWidth);
            }

            //$container.find('.table').css('table-layout', 'fixed');

            //计算表格宽度
            var $thead_ths = $container.find('.table-head .holder th');
            var $tbody_ths = $container.find('.table-body .holder th');
            var w = 0, totalW = 0, fieldIndex, minWidth;

            for (var i = 0, l = $thead_ths.length; i < l; i++) {
                fieldIndex = $thead_ths.eq(i).data('field-index');
                minWidth = typeof fieldIndex != 'undefined' ? colOptions[fieldIndex].minWidth || 0 : 0;
                w = Math.max(parseInt($thead_ths[i].style.width) || $thead_ths.eq(i).width(), 40, minWidth);

                if ($thead_ths.eq(i).is(':visible')) {
                    totalW += w;
                }

                $tbody_ths.eq(i).width(w);
                $thead_ths.eq(i).width(w);
            }

            //设置总宽度防止拖动时变形
            $container.find('.table').css('width', totalW);

            if (PluginDep.browser.msie) {
                $container.find('.table-th-resize').each(function () {
                    $(this).height($(this).parent().outerHeight());
                });
            }

            //设置拖动线高度
            $container.find('.table-drag-line').height($container.height() - $container.find('.table-pager').outerHeight(true));

            //如果绑定过事件的话不需要再次绑定
            if (!self.isBindedEvent) {
                self.bindEvents();
            }

            if (options.onInit) {
                options.onInit.call($container[0], options);
            }
        }, 0);
    }

    /**
     * [initHolder 生成占用行]
     * @return {[type]} [description]
     */
    Table.prototype.initHolder = function () {
        var options    = this.options,
            colOptions = options.colOptions,
            colLen = colOptions.length;

        var html = '<tr class="holder">';

        //复选框
        if (options.checkbox) {
            html += '<th style="width: 40px;"></th>';
        }

        //行号
        if (options.rownum) {
            html += '<th style="width: 40px;"></th>';
        }

        for (var i = 0; i < colLen; i++) {
            var col = colOptions[i];
            var style = '';

            if (!col.hide) {
                if (col.width) {
                    if (!isNaN(col.width)) {
                        style += ' style="width: ' + col.width + 'px;"';
                    } else {
                        style += ' style="width: ' + col.width + ';"';
                    }
                }

                html += '<th' + style + ' data-field-index="' + i + '"></th>';
            }            
        }

        html += '</tr>';

        return html;
    }

    /**
     * [initThead 生成表头]
     * @return {[type]} [description]
     */
    Table.prototype.initThead = function () {
        var options    = this.options,
            colOptions = options.colOptions,
            colLen = colOptions.length;

        var html = '<tr class="table-tr">';

        //行号
        if (options.rownum) {
            html += '<th class="table-th" style="text-align: center;">'+
                        '<div class="table-th-text"></div>'+
                    '</th>';
        }

        //复选框
        if (options.checkbox) {
            html += '<th class="table-th" style="text-align: center;" onselectstart="return false;">'+
                        '<input class="table-checkbox" type="checkbox" />'+
                    '</th>';
        }

        for (var i = 0; i < colLen; i++) {
            var col = colOptions[i],
                sort = col.sort,
                attr = 'data-field="' + col.field + '" data-field-index="' + i + '" onselectstart="return false;"',
                sortClass = '';

            if (col.hide) {
                continue;
            }

            if (sort && sort.enable) {
                sort.defaultOrder = sort.defaultOrder || 'asc';
                attr += ' data-sorder="' + (sort.isDefault ? sort.defaultOrder : '') + '"';
                sortClass = ' table-sort';

                // 保存默认排序
                if (sort.isDefault) {
                    this.sname = col.field;
                    this.sorder = sort.defaultOrder;
                    sortClass += ' table-sort-active';
                }
            }

            var $th = $('<th class="table-th' + sortClass + '" ' + attr +'></th>');

            if (col.headerAlign) {
                $th.css('text-align', col.headerAlign);
            }            

            if (options.resizable) {
                $th.append('<div class="table-th-resize">&nbsp;</div>');
            }

            $th.append('<div class="table-th-text">' + col.name + (col.sort ? '<span class="table-sort-icon"></span>' : '') + '</div>');

            html += $th[0].outerHTML;
        }

        html += '</tr>';

        return html;
    }

    /**
     * [initTbody 生成表体]
     * @return {[type]} [description]
     */
    Table.prototype.initTbody = function () {
        var options     = this.options,
            dataList    = options.dataList,
            colOptions  = options.colOptions,
            colLen      = colOptions.length;

        var $tbody = $('<tbody></tbody>');

        var i, j, dataLen = dataList.length;

        for (i = 0; i < dataLen; i++) {
            var data = dataList[i];
            var rowParam = options.rowParam || {};
            var rowData = ' data-rowid="'+i+'"';

            if (typeof rowParam === 'function') {
                rowParam = rowParam(data, i);
            }

            for (var key in rowParam) {
                rowData += ' data-'+key+'="'+rowParam[key]+'"';
            }

            var $tr = $('<tr class="table-tr"'+rowData+'></tr>').appendTo($tbody);
            $tr.data('rowData', dataList[i]);

            if (options.rownum) {
                $tr.append('<td class="table-td" style="text-align: center;">'+
                            '<div class="table-td-text">'+(i + 1)+'</div>'+
                        '</td>');
            }

            if (options.checkbox) {
                $tr.append('<td class="table-td" style="text-align: center;" onselectstart="return false;">'+
                            '<input class="table-checkbox" type="checkbox" />'+
                        '</td>');
            }

            for (j = 0; j < colLen; j++) {
                var col = colOptions[j];
                var text;

                if (col.hide) {
                    continue;
                }

                if (typeof col.handler === 'function') {
                    var val;

                    if (col.field && data) {
                        val = data[col.field];
                    }

                    text = col.handler(val, data, col);
                } else if (col.handler) {
                    text = col.handler;
                } else {
                    text = data[col.field];
                }

                //数字格式化
                if (col.numberFormat) {
                    if (col.numberFormat.toThousands) {
                        text = NumberFormat.toThousands(text);
                    }
                    if (col.numberFormat.toWarning) {
                        text = NumberFormat.toWarning(text);
                    }
                }

                var colParam = options.colParam || {};
                var colData = '';

                if (typeof colParam === 'function') {
                    colParam = colParam(data, i, col.field);
                }

                for (var key in colParam) {
                    colData += ' data-'+key+'="'+colParam[key]+'"';
                }

                var $td = $('<td class="table-td"'+colData+'></td>').appendTo($tr);
                var $div = $('<div class="table-td-text"></div>').appendTo($td);

                if (typeof col.edit === 'object') {
                    $td.addClass('table-td-edit').attr('onuserselectstart', 'return false');
                    $td.data('editData', col.edit);
                }

                if (col.align) {
                    $td.css('text-align', col.align);
                }

                //如果返回的是html元素或jquery元素则使用append
                if (typeof text === 'object' && (text instanceof jQuery || PluginDep.isDom(text))) {
                    $div.append(text);
                } else {
                    $div.html((text === undefined || text === null) ? '' : text + '');
                }
            }
        }

        return $tbody;
    }

    /**
     * [initError 返回结果出错时显示错误信息]
     * @return {[type]} [description]
     */
    Table.prototype.initError = function (msg) {
        var $container = this.container;
        var colLen = $container.find('.table-body thead th').length;
        var $tbody = $('<tbody><tr class="table-tr table-errorInfo"><td colspan="' + colLen + '" align="center">' + msg + '</td></tr></tbody>');

        $container.find('.table-body table tbody').remove();
        $container.find('.table-body table').append($tbody);
        this.initTable();
    }

    /**
     * [reload 重新请求数据并加载表格]
     * @return {[type]} [description]
     */
    Table.prototype.reload = function (data) {
        var options = this.options;

        if (typeof options.data !== 'function') {
            data = $.extend(true, {}, options.data, data);
        } else {
            data = $.extend(true, {}, options.data(), data);
        }

        // 如果有排序则添加
        if (this.sname) {
            data[options.snameField] = this.sname;
            data[options.sorderField] = this.sorder;
        }

        this.container.find('.table-checkbox').prop('checked', false);

        if (options.paging.enable) {
            var pager = this.container.find('.table-pager');

            if (pager.length) {
                pager.pager('reload', data);
            } else {
                this.getPageData();
            }
        } else {
            this.getPageData();
        }
    }

    /**
     * [refresh 以当前数据刷新表格]
     * @return {[type]} [description]
     */
    Table.prototype.refresh = function () {
        var self = this,
            options = this.options,
            $container = this.container;

        $container.find('.table-head').html(
            '<table class="table ' + options.tableClass + '">' + 
                '<thead>' + this.initHolder() + this.initThead() + '</thead>'+
            '</table>' 
        );
        $container.find('.table-body').html(
            '<div class="table-loading">努力加载中...</div>'+
            '<table class="table table-hover ' + options.tableClass + '">' + 
                '<thead>' + this.initHolder() + '</thead>' +
            '</table>'
        );

        for (var i = 0, l = $container.find('.table-head .holder th').length; i < l; i++) {
            $container.find('.table-head .table-tr th').eq(i).attr('data-index', i);
        }

        //执行多列参数设置
        if (options.groupHeaders) {
            self.setGroupHeaders(options.groupHeaders);
        }

        this.createTable();
    }

    /**
     * [setGroupHeaders 设置多列表头]
     * @return {[type]} [description]
     */
    Table.prototype.setGroupHeaders = function (o) {
        o = $.extend({
            useColSpanStyle: true,
            headers: []
        }, o || {});

        var options = this.options,
            container = this.container,
            ts = this;

        options.groupHeaders = o;

        var i, cmi, skip = 0, $tr, $colHeader, th, $th, thStyle,
            iCol,
            cghi,
            numberOfColumns,
            titleText,
            cVisibleColumns,
            $htable = $('.table-head', container),
            $thead = $htable.find("thead"),
            $trLabels = $thead.find("tr.table-tr:last").addClass("table-second-header"),
            $ths = $trLabels.find('th'),
            colOptions = options.colOptions,
            colLen = $ths.length,
            $theadInTable, $firstRow;

        var inColumnHeader = function (text, headers) {
            var length = headers.length, i;

            for (i = 0; i < length; i++) {
                if (headers[i].startColumnField === text) {
                    return i;
                }
            }

            return -1;
        };

        $tr = $('<tr>').addClass("table-tr table-first-header");

        for (i = 0; i < colLen; i++) {
            $th = $ths.eq(i);
            cmi = colOptions[+$th.data('field-index')];

            iCol = cmi ? inColumnHeader(cmi.field, o.headers) : -1;

            if (iCol >= 0) {
                cghi = o.headers[iCol];
                numberOfColumns = cghi.numberOfColumns;
                titleText = cghi.name;

                // caclulate the number of visible columns from the next numberOfColumns columns
                for (cVisibleColumns = 0, iCol = 0; iCol < numberOfColumns && (i + iCol < colLen) ; iCol++) {
                    if ($ths.eq(i + iCol).is(':visible')) {
                        cVisibleColumns++;
                    }
                }

                // The next numberOfColumns headers will be moved in the next row
                // in the current row will be placed the new column header with the titleText.
                // The text will be over the cVisibleColumns columns
                $colHeader = $('<th>').addClass("table-th").html(titleText);

                if (cVisibleColumns > 0) {
                    $colHeader.attr("colspan", cVisibleColumns);
                }

                // hide if not a visible cols
                if (cVisibleColumns === 0) {
                    $colHeader.hide();
                }

                $tr.append($colHeader);         // move the current header in the next row

                // set the coumter of headers which will be moved in the next row
                skip = numberOfColumns - 1;
            } else {
                if (skip === 0) {
                    if (o.useColSpanStyle) {
                        $th.attr("rowspan", "2").remove().appendTo($tr);
                    } else {
                        $('<th>')
                            .addClass(".table-th")
                            .css({ "display": $th.css('display') })
                            .appendTo($tr);
                    }
                } else {
                    skip--;
                }
            }
        }

        $tr.insertBefore($trLabels);
    }

    /**
     * [destroy 销毁组件]
     * @return {[type]} [description]
     */
    Table.prototype.destroy = function () {
        this.container
            .off()
            .removeData(namespace)
            .empty();

        if (this.colShow) {
            this.colShow.remove();
        }
    }

    /**
     * [bindEvents 绑定事件]
     * @return {[type]} [description]
     */
    Table.prototype.bindEvents = function () {
        var self = this,
            $container = this.container,
            options = this.options,
            colOptions = options.colOptions,
            menu = options.menu;

        this.isBindedEvent = true;

        //固定表头滚动
        $container.find('.table-body').on('scroll', function (e) {
            var w = $(this).width();
            var h = $(this).height();
            var top = this.scrollTop;
            var left = this.scrollLeft;

            $container.find('.table-head table').css('left', -this.scrollLeft);
            $container.find('.table-loading').css({
                top: h / 2 + top,
                left: w / 2 + left
            });
        });

        $container.on('click', '.table-th-resize', function () {
            return false;
        });

        //列宽度拖动，mousedown->mousemove->mouseup
        $container.on('mousedown', '.table-th-resize', function (e) {
            index = +$(this).parent().data('index');
            $target = $container;
            oldX = e.clientX;
            oldLeft = 0;
            oldLineLeft = oldX - $container.offset().left;

            for (var i = 0; i < index + 1; i++) {
                oldLeft += $container.find('.holder th').eq(i).outerWidth(true);
            }

            $('body').addClass('table-drag');
            $container.find('.table-drag-line').css('left', oldLineLeft).show();

            return false;
        });

        //复选框点击事件，单选
        $container.on('change', '.table-td .table-checkbox', function () {
            var totalLen = $container.find('.table-td .table-checkbox').length;
            var currLen = $container.find('.table-td .table-checkbox:checked').length;

            $container.find('.table-th .table-checkbox').prop('checked', currLen == totalLen);
        });

        //复选框点击事件，全选
        $container.on('change', '.table-th .table-checkbox', function () {
            $container.find('.table-td .table-checkbox').prop('checked', $(this).prop('checked'));
        });

        //排序
        $container.on('click', '.table-sort', function () {
            //如果正在拖动则阻止排序
            if ($container.find('.table-drag-line').is(':visible')) {
                return;
            }

            var $th = $(this);
            var sname = $th.attr('data-field');
            var sorder = $th.attr('data-sorder');

            // 重置其他列排序
            $container.find('.table-th').each(function () {
                if (this != $th[0]) {
                    $(this).removeClass('table-sort-active').attr('data-sorder', '');
                }
            });

            if (sorder == '') {
                $th.addClass('table-sort-active').attr('data-sorder', 'asc');
                self.sname = sname;
                self.sorder = 'asc';
            } else if (sorder == 'asc') {
                $th.addClass('table-sort-active').attr('data-sorder', 'desc');
                self.sname = sname;
                self.sorder = 'desc';
            } else {
                $th.attr('data-sorder', '');
                self.sname = null;
                self.sorder = null;
            }

            self.reload();
        });

        //编辑单元格
        $container.on('dblclick', '.table-td-edit', function () {
            var $this = $(this);
            var edit = $(this).data('editData');

            //调用用户定义的编辑元素
            var ele = edit.replace.call(this, $this.parent().data('rowData'));

            $(ele).addClass('table-td-editEle').appendTo(this).focus();
            $this.find('.table-td-text').hide();

            return false;
        });

        //确认编辑，回写数据
        $container.on('change', '.table-td-editEle', function (e) {
            var $ele = $(this);
            var $td = $ele.parent();
            var $tr = $td.parent();
            var $text = $ele.siblings('.table-td-text');
            var rowData = $tr.data('rowData');

            var ev = $.Event('editen.ui.table');
            var ret = $container.trigger(ev, [rowData, $ele]);

            if (ret !== false) {
                $text.show();
                $ele.remove();
            }
        });

        $container.on('blur', '.table-td-editEle', function (e) {
            $(this).trigger('change');
        });

        // 列显示事件
        if (menu.colShow) {
            $(menu.colShow).on('click', function (e) {
                if (self.colShow.is(':hidden')) {
                    var pos = PluginDep.getPosition($(this));
                    self.colShow.empty();

                    for (var i = 0, l = colOptions.length; i < l; i++) {
                        $(
                            '<li data-index="' + i + '">'+
                                '<label>' +
                                    '<input type="checkbox"' + (!colOptions[i].hide ? ' checked' : '') + '> ' + 
                                    colOptions[i].name +
                                '</label>' +
                            '</li>'
                        ).appendTo(self.colShow);
                    }

                    self.colShow.show().css({
                        left: pos.left + pos.scrollLeft,
                        top: pos.top + pos.scrollTop + pos.height
                    });
                } else {
                    self.colShow.hide();
                }

                e.stopPropagation();           
            });

            self.colShow.on('click', function (e) {
                e.stopPropagation();
            });

            self.colShow.on('change', 'input', function (e) {
                var index = +$(this).parents('li').data('index');
                var col = colOptions[index];

                col.hide = !$(this).prop('checked');
                self.refresh();
            });

            $(document).on('click', function () {
                self.colShow.hide();
            });
        }

        // 列筛选
        if (menu.cellFilter) {
            $container.on('click', '.table-td', function (e) {
                $container.find('.table-td').removeClass('table-td-filter');
                $(this).addClass('table-td-filter');
                e.stopPropagation();
            });

            $(menu.cellFilter).on('click', function (e) {
                var filterTd = $container.find('.table-td-filter').removeClass('table-td-filter');

                if (!filterTd.length) {
                    if ($(this).hasClass('active')) {
                        $container.find('.table-body tbody .table-tr').show();
                        $(this).removeClass('active');
                    }

                    return;
                }

                var idx = filterTd.index();
                var html = filterTd.html();

                $container.find('.table-body tbody .table-tr').each(function () {
                    if ($('.table-td', this).eq(idx).html() != html) {
                        $(this).hide();
                    } else {
                        $(this).show();
                    }
                });

                $(this).addClass(('active'));
            });
        }
    }

    var oldX, oldLeft, oldLineLeft;
    var $target, index;

    //公用事件绑定
    function bindCommonEvents () {
        $(document).on('mousemove.drag', '.table-drag', function (e) {
            var $dragLine = $target.find('.table-drag-line');
            var $thead_ths = $target.find('.table-head .holder th');
            var newWidth = Math.max($thead_ths.eq(index).width() + e.clientX - oldX, 40);
            var lineLeft = oldLineLeft - ($thead_ths.eq(index).width() - newWidth);

            $dragLine.css('left', lineLeft);

            return false;
        });

        $(document).on('mouseup.drag', '.table-drag', function (e) {            
            var $thead_ths = $target.find('.table-head .holder th');
            var $tbody_ths = $target.find('.table-body .holder th');
            var newWidth = Math.max($thead_ths.eq(index).width() + e.clientX - oldX, 40);
            var w = 0, totalW = 0;

            $thead_ths.eq(index).width(newWidth);

            //计算表格宽度
            for (var i = 0, l = $thead_ths.length; i < l; i++) {
                w = parseInt($thead_ths[i].style.width);

                if ($thead_ths.eq(i).is(':visible')) {
                    totalW += w;
                }

                $tbody_ths.eq(i).width(w);
                $thead_ths.eq(i).width(w);
            }

            $target.find('.table').width(totalW);
            $('.table-drag').removeClass('table-drag');
            $target.find('.table-drag-line').hide();

            return false;
        });

        $(document).on('click', function () {
            $('.table-container .table-td-filter').removeClass('table-td-filter');
        });
    }

    bindCommonEvents();

    var NumberFormat = {
        toThousands: function (num, precision) {
            //null is number 0?
            if (num === null || isNaN(num)) {
                return num;
            }

            num = Number(num);
            // 处理小数点位数
            num = (typeof precision !== 'undefined' ? num.toFixed(precision) : num).toString();
            // 分离数字的小数部分和整数部分
            parts = num.split('.');
            // 整数部分加[separator]分隔, 借用一个著名的正则表达式
            parts[0] = parts[0].toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1' + (','));

            return parts.join('.');
        },
        toWarning: function (num) {
            //null is number 0?
            if (num === null || num === undefined) {
                return num;
            }

            var newNum = Number(num.toString().replace(/,/g, ''));

            if (isNaN(newNum)) {
                return num;
            }

            return newNum < 0 ? '<span style="color: red;">' + num + '</span>' : num;
        }
    }
    
    $.fn.table = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('The method ' + method + ' does not exist in $.table');
        }
    }
})();

/**
 * [pager 分页插件]
 * 使用说明：
 * 需要引入 plugin.css
 */
;(function() {
    var pName = 'pager';
    var namespace = 'ui.' + pName;

    var methods = {
        init: function (options) {
            methods.destroy.call(this);

            return this.each(function () {
                var settings = $.extend(true, {}, Pager.DEFAULTS, $(this).data(), options);

                $(this).data(namespace, new Pager($(this), settings));
            });
        },

        /**
         * [reload 重新加载]
         * @return {[type]} [description]
         */
        reload: function (data) {
            return this.each(function () {
                $(this).data(namespace).reload(data);
            });            
        },

        /**
         * [destroy 销毁组件]
         * @return {[type]} [description]
         */
        destroy: function () {
            return this.each(function () {
                if ($(this).data(namespace)) {
                    $(this).data(namespace).destroy();
                }
            });
        }
    };

    /**
     * [Pager 分页对象]
     * @param {[type]} settings [description]
     */
    var Pager = function ($container, settings) {
        this.container = $container;
        this.options = settings;
        this.startIndex = 1;

        this.requestData(settings.pageIndex);
    }

    //默认选项
    Pager.DEFAULTS = {
        url             : '',                       //远程数据的url
        type            : 'GET',                    //远程请求的方式
        data            : false,                    //远程请求的参数
        dataType        : 'json',                   //返回数据类型
        jsonp           : 'callback',               //jsonp回调函数名称

        indexField      : 'pageIndex',              //页码字段名
        sizeField       : 'pageSize',               //每页条数字段名
        dataField       : 'data',                   //json数组字段名
        totalField      : 'total',                  //总条数字段名
        pageIndex       : 1,                        //从第几页开始
        pageSize        : 20,                       //每页显示多少条数据
        pageSizeArray   : false,                    //每页显示条数的选择
        total           : 0,                        //数据总条数
        totalPage       : 0,                        //总页数
        pageLength      : 5,                        //显示的页码数
        pageInfo        : false,                    //是否显示页码信息
        skipPage        : true,                     //是否启用跳页
        localPage       : false,                    //是否本地分页
        localData       : false,                    //保存本地数据

        beforeSend      : function () {},           //请求之前的回调
        complete        : function () {},           //请求完成的回调
        success         : function () {},           //分页成功之后的回调
        error           : function () {},           //请求错误回调
        resultVerify    : function () {},           //返回结果验证
        onInit          : false                     //初始化完成的回调
    }

    /**
     * [requestData 请求数据]
     * @param  {[type]} pageIndex  [页码]
     * @return {[type]}            [description]
     */
    Pager.prototype.requestData = function (pageIndex) {
        var self = this,
            $container = this.container,
            options = this.options,
            url = options.url,
            data = options.data,
            param;

        if (typeof data === 'function') {
            param = data();
        } else {
            param = $.extend(true, {}, data);
        }

        if (!options.localPage) {
            param[options.indexField] = pageIndex;
            param[options.sizeField] = options.pageSize;
        }
        
        var ajaxOption = {
            url: url,
            type: options.type,
            data: param,
            dataType: options.dataType,
            jsonp: options.jsonp,
            beforeSend: options.beforeSend,
            complete: options.complete,
            error: options.error,
            success: function (res) {
                var ret = options.resultVerify(res);

                if (ret === false) {
                    return false;
                }

                var data = (options.dataField ? res[options.dataField] : res) || [];

                //计算总页码等信息
                options.pageIndex = pageIndex;
                options.total = options.localPage ? data.length : res[options.totalField];
                options.totalPage = Math.ceil(options.total / options.pageSize);
                $container.empty();

                if (options.total > 0) {
                    self.initPage();
                }

                if (options.localPage) {
                    if ($.isArray(res)) {
                        self.localRes = res.slice(0);
                    } else {
                        self.localRes = $.extend(true, {}, res);
                    }

                    //本地分页需要将res的data重新加算
                    if (options.dataField) {
                        res[options.dataField] = data.slice(0, options.pageIndex * options.pageSize);
                    } else {
                        res = data.slice(0, options.pageIndex * options.pageSize);
                    }

                    options.success(res);
                } else {
                    options.success(res);
                }                
            }
        }

        //中止之前的请求，防止不停点击
        if (this.ajaxObj) {
            this.ajaxObj.abort();
        }

        this.ajaxObj = $.ajax(ajaxOption);
    }

    /**
     * [skipPage 本地页码跳转]
     * @return {[type]} [description]
     */
    Pager.prototype.skipPage = function (pageIndex) {
        var options = this.options;

        options.pageIndex = pageIndex;

        this.container.empty();
        this.initPage();

        var res;

        if ($.isArray(this.localRes)) {
            res = this.localRes.slice(0);
        } else {
            res = $.extend(true, {}, this.localRes);
        }

        //本地分页需要将res的data重新加算
        if (options.dataField) {
            res[options.dataField] = res[options.dataField].slice((pageIndex - 1) * options.pageSize, pageIndex * options.pageSize);
        } else {
            res = res.slice((pageIndex - 1) * options.pageSize, pageIndex * options.pageSize);
        }

        options.success(res, true);
    }

    /**
     * [calcPage 计算起始页码]
     * @return {[type]}           [description]
     */
    Pager.prototype.calcPage = function () {
        var options = this.options;
        var pageIndex = options.pageIndex;

        if (pageIndex <= this.startIndex || pageIndex == options.totalPage) {
            this.startIndex = Math.max(1, pageIndex - options.pageLength + 1);
        } else if (pageIndex >= this.endIndex) {
            this.startIndex = Math.min(pageIndex, options.totalPage - options.pageLength + 1);
        }

        this.endIndex = Math.min(this.startIndex + options.pageLength - 1, options.totalPage);
    }

    /**
     * [initPage 生成页码信息]
     * @return {[type]} [description]
     */
    Pager.prototype.initPage = function () {
        var self = this;

        var options = this.options;
        var pageSizeArray = options.pageSizeArray;
        var $container = this.container;

        this.calcPage();

        var html =  '<div class="pagination'+(options.pageInfo ? ' justify"' : '')+'">'+
                        '<div class="paging">' +
                            this.firstPage() +
                            this.pageList() +
                            this.lastPage() +
                        '</div>';

        if (options.pageInfo) {
            html += '<div class="pageinfo">'+
                        '<span>'+
                            '共<span class="pageinfo-text">'+options.totalPage+'</span>页'+
                            '<span class="pageinfo-text">'+options.total+'</span>条数据'+
                        '</span>';

            if ($.isArray(pageSizeArray)) {
                html += '<span class="pageinfo-text">每页显示：</span>'+
                        '<select class="pageSize">';
                
                for (var i = 0, l = pageSizeArray.length; i < l; i++) {
                    html += '<option value="'+pageSizeArray[i]+'">'+pageSizeArray[i]+'条</option>';
                }

                html += '</select>';
            }

            if (options.skipPage) {
                html += '<span>&nbsp;&nbsp;&nbsp;&nbsp;跳转到第<input class="pageinfo-skip" />页</span>';
            }

            html += '</div>';
        }
                        
        html += '</div>';

        html = html.replace('<option value="'+options.pageSize+'">', '<option value="'+options.pageSize+'" selected="selected">');

        $container.append(html);

        setTimeout(function () {
            if (!self.initFlag) {
                self.bindEvents();
            }

            if (options.onInit) {
                options.onInit.call($container[0], options);
            }

            self.initFlag = true;
        }, 0);
    },

    /**
     * [prevPage 第一页]
     * @return {[type]} [description]
     */
    Pager.prototype.firstPage = function () {
        if (this.options.pageIndex > 1) {
            return "<a class='paging-btn paging-btn-first' title='首页' data-topage='1'>«</a>";
        } else {
            return "<a class='paging-btn paging-btn-first paging-btn-disabled' title='首页'>«</a>";
        }
    },

    /**
     * [nextPage 最后一页]
     * @return {[type]} [description]
     */
    Pager.prototype.lastPage = function () {
        var options = this.options,
            pageIndex = options.pageIndex,
            totalPage = options.totalPage;

        if (pageIndex < totalPage) {
            return "<a class='paging-btn paging-btn-last' title='尾页' data-topage='"+totalPage+"'>»</a>";
        } else {
            return "<a class='paging-btn paging-btn-last paging-btn-disabled' title='尾页'>»</a>";
        }
    },

    /**
     * [pageList 数字页码]
     * @return {[type]} [description]
     */
    Pager.prototype.pageList = function () {
        var options = this.options,
            pageIndex = options.pageIndex;

        var html = "";

        for (var i = this.startIndex; i <= this.endIndex; i++) {
            if (i == pageIndex) {
                html += "<a class='paging-btn paging-btn-curr'>"+i+"</a>";
            } else {
                html += "<a class='paging-btn'>"+i+"</a>";
            }
        }

        if (this.endIndex < options.totalPage) {
            html += "<span class='paging-btn paging-btn-disabled'>...</span>";
        }

        return html;
    }

    /**
     * [reload 重新加载第一页]
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    Pager.prototype.reload = function (data) {        
        if (typeof data != 'undefined') {
            this.options.data = data;
        }

        this.requestData(1);
    }

    //销毁组件
    Pager.prototype.destroy = function () {
        this.container
            .off()
            .removeData(namespace)
            .empty();
    }

    /**
     * [bindEvents 绑定事件]
     * @return {[type]} [description]
     */
    Pager.prototype.bindEvents = function () {
        var self = this;

        var options = this.options,
            $container = this.container;

        //每页显示条数切换事件
        $container.on("change", ".pageSize", function (e) {
            options.pageSize = +$(this).val();
            self.requestData(1, true);
        });

        //页码翻页事件
        $container.on("click.pager", ".paging-btn:not(.paging-btn-disabled, .paging-btn-curr)", function () {
            var pageIndex = +($(this).data("topage") || $(this).text());

            if (options.localPage) {
                self.skipPage(pageIndex);
            } else {
                self.requestData(pageIndex, true);
            }
        });

        //页码翻页事件
        $container.on("keydown.pager", ".pageinfo-skip", function (e) {
            if (e.which == 13) {
                var pageIndex = +$(this).val();

                if (isNaN(pageIndex) || pageIndex > options.totalPage || pageIndex <= 0) {
                    alert('请输入有效页码');
                    return;
                }

                if (options.localPage) {
                    self.skipPage(pageIndex);
                } else {
                    self.requestData(pageIndex, true);
                }
            }
        });
    }

    $.fn.pager = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('The method ' + method + ' does not exist in $.pager');
        }
    }
})();

/**
 * [uiSelect下拉菜单插件]
 * 使用说明：
 * 需要引入 plugin.css
 */
;(function() {
    var pName = 'select';
    var namespace = 'ui.' + pName;

    var methods = {
        // 组件初始化
        init: function (options) {
            methods.destroy.call(this);

            return this.each(function () {
                var $this = $(this);
                var setting = $.extend(true, {}, UiSelect.DEFAULTS, $this.data(), options);

                $this.data(namespace, new UiSelect($this, setting));
            });
        },

        //设置选定值，如果value为数组，则设置多个值选定
        setValue: function (value) {
            return this.each(function () {
                $(this).data(namespace).setValue(value);
            });
        },

        //销毁组件
        destroy: function () {
            return this.each(function () {
                if ($(this).data(namespace)) {
                    $(this).data(namespace).destroy();
                }
            });
        },

        //禁用组件
        disable: function () {
            return this.each(function () {
                $(this).data(namespace).setDisabled(true);
            });
        },

        //启用组件
        enable: function () {
            return this.each(function () {
                $(this).data(namespace).setDisabled(false);
            });
        },

        //全选
        selectAll: function (selected) {
            return this.each(function () {
                $(this).data(namespace).selectAll(selected);
            });
        }
    };

    /**
     * [UiSelect 下拉框插件对象]
     */
    var UiSelect = function (container, setting) {
        this.container = container;
        this.setting = setting;
        this.showDataList = setting.dataList;
        this.selectedData = [];
        this.searchFields = [];

        this.init();
    };

    /**
     * [DEFAULTS 默认配置]
     */
    UiSelect.DEFAULTS = {
        name            : '',               // 作为表单的name
        dataList        : [],               // 数据项
        template        : '<td>#{}</td>',   // 模板
        textField       : '',               // text字段名
        valueField      : '',               // value字段名
        seprator        : ',',              // 多选值分隔符
        disabled        : false,            // 是否禁用
        search          : false,            // 是否搜索
        multi           : false             // 是否多选
    };

    /**
     * [initData 初始化数据]
     * 1、如果选项中有数据列表则直接使用该数据
     * 2、如果选项中没有数据列表则表示是从select中提取数据
     */
    UiSelect.prototype.init = function () {
        var setting = this.setting;
        var self = this;

        this.ele = $(
            '<div class="ui-select' + (setting.disabled ? ' disabled' : '') + '">' +
                '<div class="ui-select-bar">' +
                    '<input class="ui-select-text" readonly>' +
                    '<div class="ui-select-caret"><b></b></div>' +
                '</div>' +
                '<div class="ui-select-box">'+
                    (setting.search ? '<div class="ui-select-search"><input type="text"></div>' : '') +
                    '<div class="ui-select-list"><table></table></div>' +
                '</div>' +
                '<input class="ui-select-value" type="hidden" name="' + setting.name + '" />' +
            '</div>'
        ).appendTo(this.container);

        // 保存将要进行搜索的字段名
        setting.template.replace(/\#\{([\w]*)\}/g, function (s0, s1) {
            if (s1 !== '') {
                self.searchFields.push(s1);
            }

            return s1;
        });

        // 如果数据为空则抛出异常
        if (!setting.dataList || !setting.dataList.length) {
            throw new Error('$.uiSelect require more than one data!');
        }

        if (!setting.multi) { // 如果是单选则默认选中第一个
            this.selectedData = setting.dataList.slice(0, 1);
        } else {    // 多选添加图标
            setting.template = '<td><span class="ui-select-checkbox"></span></td>' + setting.template;
        }

        this.createList();
        this.bindEvents();
    };

    /**
     * [createList 创建下拉列表]
     * @return {[type]} [description]
     */
    UiSelect.prototype.createList = function () {
        var setting = this.setting;
        var dataList = this.showDataList;
        var ele  = this.ele;
        var template = setting.template;
        var table = ele.find('.ui-select-list table').empty();

        if (dataList.length == 0) {
            $('<tr class="disabled"><td>无数据</td></tr>').appendTo(table);
        } else {
            for (var i = 0, l = dataList.length; i < l; i++) {
                var data = dataList[i];
                var key = setting.valueField ? data[setting.valueField] : data;
                var html = PluginDep.parseTpl('<tr data-key="' + key + '">' + template + '</tr>', data);

                $(html).appendTo(table).data('data', data);
            }

            // 多选全选按钮
            if (setting.multi) {
                var colSpan = table.find('tr:eq(0) td').length - 1;
                $('<tr class="ui-select-checkAll"><td width="30"><span class="ui-select-checkbox"></span></td><td colspan="' + colSpan + '">全选</td></tr>').prependTo(table);
            }
        }

        this.setSelect(false);
    }

    /**
     * [setSelect 设置全选项]
     * @param {[type]} isTriggerChangeEvent [是否触发change事件]
     */
    UiSelect.prototype.setSelect = function (isTriggerChangeEvent) {
        var setting = this.setting;
        var selectedData = this.selectedData;
        var ele = this.ele;

        var textInput = ele.find('.ui-select-text');
        var valueInput = ele.find('.ui-select-value');
        var table = ele.find('.ui-select-list table');
        var bar = ele.find('.ui-select-bar');
        var selectedValue = [];
        var selectedText = [];

        table.find('tr').removeClass('active');

        if (setting.multi) {
            for (var i = 0, l = selectedData.length; i < l; i++) {
                var data = selectedData[i];
                var key = setting.valueField ? data[setting.valueField] : data;
                var item = setting.textField ? data[setting.textField] : data;

                table.find('[data-key="' + key + '"]').addClass('active');
                selectedValue.push(key);
                selectedText.push(item);
            }

            // 是否勾选全选按钮
            if (selectedData.length == setting.dataList.length) {
                table.find('.ui-select-checkAll').addClass('active');
            }
        } else {
            var data = selectedData[0];
            var key = setting.valueField ? data[setting.valueField] : data;
            var item = setting.textField ? data[setting.textField] : data;

            table.find('[data-key="' + key + '"]').addClass('active');
            selectedValue.push(key);
            selectedText.push(item);
        }

        valueInput.val(selectedValue.join(setting.separator));
        textInput.val(selectedText.join(setting.separator));

        // 触发change事件
        if (isTriggerChangeEvent !== false) {
            var e = $.Event('change.' + namespace);
            this.ele.trigger(e, [selectedData.slice(0)]);
        }
    }

    /**
     * [showList 展开下拉框]
     * @return {[type]} [description]
     */
    UiSelect.prototype.showList = function () {
        var ele = this.ele;
        
        ele.addClass('expand');
        ele.find('.ui-select-box').show();

        var e = $.Event('expand.' + namespace);
        this.ele.trigger(e);
    }

    /**
     * [hideList 隐藏下拉框]
     * @return {[type]} [description]
     */
    UiSelect.prototype.hideList = function () {
        var ele = this.ele;

        ele.removeClass('expand');
        ele.find('.ui-select-box').hide();

        //清空搜索框
        var input = ele.find('.ui-select-search input');

        if (input.val() !== '') {
            input.val('');
            input.trigger('propertychange');
            input.trigger('input');
        }

        var e = $.Event('collapse.' + namespace);
        ele.trigger(e);
    }

    /**
     * [setValue 选中值]
     * @param {[type]} value [description]
     */
    UiSelect.prototype.setValue = function (value) {
        var setting = this.setting;
        var dataList = setting.dataList;

        this.oldSelectedData = this.selectedData.slice(0);
        this.selectedData = [];

        if (setting.multi && !$.isArray(value)) {
            throw new Error('Need an array of value when multi option is true!');
        }

        if (!setting.multi && $.isArray(value)) {
            throw new Error('Value can not be an array when multi option is false!');
        }

        if ($.isArray(value)) {
            value = [value];
        }

        // 查找选中项
        for (var i = 0, l = dataList.length; i < l; i++) {
            var key = setting.valueField ? dataList[i][setting.valueField] : dataList[i];

            for (var j = 0, jLen = value.length; j < jLen; j++) {
                if (key === value[j]) {
                    this.selectedData.push(dataList[i]);
                }
            }
        }

        // 未找到
        if (!this.selectedData.length) {
            return;
        }

        // 判断新设置的值是否和旧值相同
        var isSame = false;
        if (this.oldSelectedData.length == this.selectedData.length) {
            isSame = true;

            for (var i = 0, l = this.selectedData.length; i < l; i++) {
                if (PluginDep.indexOf(this.oldSelectedData, this.selectedData[i], setting.valueField) == -1) {
                    isSame = false;
                }
            }
        }        

        if (!isSame) {
            this.setSelect();
        }
    }

    /**
     * [destroy 销毁组件]
     * @return {[type]} [description]
     */
    UiSelect.prototype.destroy = function () {
        this.container
            .removeData(namespace)
            .empty();
    }

    /**
     * [public]
     * [setDisabled 设置控件的禁用状态]
     * @return {[type]} [description]
     */
    UiSelect.prototype.setDisabled = function (disabled) {
        this.setting.disabled = typeof disabled == 'undefined' ? true : disabled;

        if (this.setting.disabled) {
            this.ele.addClass('disabled');
        } else {
            this.ele.removeClass('disabled');
        }
    }

    /**
     * [selectAll 全选/取消全选]
     * @return {[type]} [description]
     */
    UiSelect.prototype.selectAll = function (selected) {
        selected = typeof selected == 'undefined' ? true : selected;
        var checkAll = this.ele.find('.ui-select-checkAll');

        if (selected && !checkAll.hasClass('active')
            || !selected && checkAll.hasClass('active')) {
            checkAll.trigger('click');
        }
    }

    /**
     * [bindEvents 绑定事件]
     * @return {[type]} [description]
     */
    UiSelect.prototype.bindEvents = function () {
        var self = this;
        var setting = this.setting;
        var ele = this.ele;
        var box = ele.find('.ui-select-box')[0];

        // 展开下拉框
        ele.on('click', '.ui-select-bar', function (e) {
            // 禁用状态
            if (setting.disabled) {
                return false;
            }

            if (ele.hasClass('expand')) {
                self.hideList();
            } else {
                self.showList();
            }

            e.preventDefault();
        });
        
        // 列表选中事件
        ele.on('click', '.ui-select-list tr:not(.ui-select-checkAll)', function (e) {
            var $this = $(this);
            var data = $this.data('data');      

            // 保存改变之前的数据
            self.oldSelectedData = self.selectedData.slice(0);

            if (setting.multi) {
                var index = PluginDep.indexOf(self.selectedData, data, setting.valueField);
                    
                if (index > -1) {
                    self.selectedData.splice(index, 1);
                } else {
                    self.selectedData.push(data);
                }

                self.setSelect();
            } else {
                if (!$this.hasClass('active')) {
                    self.selectedData = [data];
                    self.setSelect();
                }

                self.hideList();
            }
        });
        
        // 全选
        ele.on('click', '.ui-select-checkAll', function () {
            // 保存改变之前的数据
            self.oldSelectedData = self.selectedData.slice(0);

            if (!$(this).hasClass('active')) {
                self.selectedData = setting.dataList.slice(0);
            } else {
                self.selectedData = [];
            }

            self.setSelect();
        });

        // 输入框输入筛选，propertychange不能委托
        ele.find('.ui-select-search input').on('input propertychange', inputHandler);

        function inputHandler(e) {
            var val = $(this).val();
            var dataList = setting.dataList;
            self.showDataList = [];

            if (val === '') {
                self.showDataList = dataList;
            } else {
                //查找结果
                for (var i = 0, l = dataList.length; i < l; i++) {
                    var data = dataList[i];

                    if (self.searchFields.length) {
                        for (var j = 0, jLen = self.searchFields.length; j < jLen; j++) {
                            var field = self.searchFields[j];

                            if (data[field] !== undefined && data[field] !== null && data[field].toString().indexOf(val) > -1) {
                                self.showDataList.push(data);
                                // break当前循环，以防止单条数据多次匹配
                                break;
                            }
                        }
                    } else {
                        if (data !== undefined && data !== null && data.toString().indexOf(val) > -1) {
                            self.showDataList.push(data);
                        }
                    }
                }
            }

            self.createList();
        }

        // 隐藏下拉框
        $(document).on('click.' + namespace, function () {
            self.hideList();
        });

        // 隐藏其他的列表
        $(document).on('click', '.ui-select', function (e) {
            if (this != ele[0]) {
                self.hideList();
            } else {
                e.stopPropagation();
            }
        });
    }

    $.fn.uiSelect = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('The method ' + method + ' does not exist in $.uiSelect');
        }
    }
})();

/**
 * [scrollbar 滚动条插件]
 * 使用说明：
 * 需要引入 plugin.css
 */
;(function() {
    var pName = 'scrollbar';
    var namespace = 'ui.' + pName;

    var methods = {
        init: function (options) {     
            methods.destroy.call(this);

            return this.each(function() {
                var $this = $(this);
                var settings = $.extend(true, {}, Scrollbar.DEFAULTS, $this.data(), options); 
                
                $this.data(namespace, new Scrollbar($this, settings));
            });
        },

        /**
         * [destroy 销毁组件]
         * @return {[type]} [description]
         */
        destroy: function () {
            return this.each(function () {
                if ($(this).data(namespace)) {
                    $(this).data(namespace).destroy();
                }
            });
        }
    };

    var Scrollbar = function ($container, options) {
        this.container = $container;
        this.options = options;

        this.needScrollbar = PluginDep.isOverflow($container);

        //如果没有滚动条则不需要后续操作
        if (!this.needScrollbar) {
            this.destroy();
            return;
        }
        
        this.init();
        this.bindEvents();
    }

    Scrollbar.DEFAULTS = {
        scrollbarSize   : 8,                    //滚动条宽度
        onInit          : false,                //初始化完毕回调
        onScroll        : false                 //滚动时回调
    }

    /**
     * [init 初始化]
     * @return {[type]} [description]
     */
    Scrollbar.prototype.init = function () {
        var options = this.options;
        var $container = this.container;
        var needScrollbar = this.needScrollbar;

        this.totalH = $container[0].scrollHeight;
        this.totalW = $container[0].scrollWidth;

        $container.css({
            position: 'relative',
            overflow: 'hidden'
        });

        //给里层元素包裹一层以便滚动
        $container.html('<div class="scroll-target">'+$container.html()+'</div>');

        var outerStyle, innerStyle, track, html = '';

        //创建竖轴滚动条
        if (needScrollbar.y) {
            //滚动条轨道大小
            this.trackH = $container.height() + (parseInt($container.css('padding-top')) || 0) + (parseInt($container.css('padding-bottom')) || 0) + (parseInt($container.css('border-top')) || 0) + (parseInt($container.css('border-bottom')) || 0);

            track = this.trackH*this.trackH / this.totalH;
            outerStyle = 'width: '+options.scrollbarSize+'px; height: '+this.trackH+'px;';
            innerStyle = 'width: 100%; height: '+track+'px; border-radius: '+(options.scrollbarSize/2)+'px;';

            html += '<div class="scrollbar scrollbar-y" style="'+outerStyle+'">'+
                        '<div class="scrollbar-inner" style="'+innerStyle+'"></div>'+
                    '</div>';
        }

        //创建横轴滚动条
        if (needScrollbar.x) {
            //滚动条轨道大小
            this.trackW = $container.width() + (parseInt($container.css('padding-left')) || 0) + (parseInt($container.css('padding-right')) || 0) + (parseInt($container.css('border-left')) || 0) + (parseInt($container.css('border-right')) || 0);

            track = this.trackW*this.trackW / this.totalW;
            outerStyle = 'width: '+this.trackW+'px; height: '+options.scrollbarSize+'px;';
            innerStyle = 'width: '+track+'px; height: 100%; border-radius: '+(options.scrollbarSize/2)+'px;';

            html += '<div class="scrollbar scrollbar-x" style="'+outerStyle+'">'+
                        '<div class="scrollbar-inner" style="'+innerStyle+'"></div>'+
                    '</div>';
        }

        $container.append(html);

        setTimeout(function () {
            if (options.onInit) {
                options.onInit.call($container[0], options);
            }
        }, 0);
    }

    /**
     * [destroy 销毁组件]
     * @return {[type]} [description]
     */
    Scrollbar.prototype.destroy = function () {
        this.container.removeData(namespace);
    }

    /**
     * [bindEvents 绑定事件]
     * @return {[type]} [description]
     */
    Scrollbar.prototype.bindEvents = function () {
        var _this           = this;
        var options         = this.options;
        var totalH          = this.totalH;
        var totalW          = this.totalW;
        var trackH          = this.trackH;
        var trackW          = this.trackW;
        var needScrollbar   = this.needScrollbar;
        var $container      = this.container;
        var $target         = $container.find(' > .scroll-target');

        //鼠标滚动事件
        if (needScrollbar.y) {
            var $innerBarY = $container.find('.scrollbar-y .scrollbar-inner');
            var h = $innerBarY.height();
            var w = $innerBarY.width();

            $container.on('mousewheel', function (e, delta) {
                //计算目标位置
                var tarTop = $target.position().top + delta * 100;

                if (tarTop + totalH < trackH) {
                    tarTop = trackH - totalH;
                }

                if (tarTop > 0) {
                    tarTop = 0;
                }

                //计算滚动条位置
                var percent = -tarTop / (totalH - trackH);
                var t = (trackH - h) * percent;

                if (delta < 0 && percent != 1 || delta > 0 && percent != 0) {
                    e.stopPropagation();
                    e.preventDefault();
                }

                $target.css('top', tarTop);
                $innerBarY.css('top', t);

                if (typeof options.onScroll === 'function') {
                    options.onScroll.call($container[0], options);
                }
            });
        }

        var dragX, dragY;
        var $innerBar;

        //滚动条显示和隐藏
        $container.on({
            mouseenter: function () {
                $container.find('.scrollbar').addClass('visible');
            },
            mouseleave: function () {
                $container.find('.scrollbar').removeClass('visible');
            }
        });

        //鼠标拖拽事件
        $container.on('mousedown', '.scrollbar-inner', function (e) {
            $innerBar = $(this);
            $innerBar.data('on_drag', true).addClass("ondrag");
            $container.find('.scrollbar').addClass('draging');

            dragX = e.clientX;
            dragY = e.clientY;

            e.preventDefault();
            e.stopImmediatePropagation();
        });

        $(document).bind('mousemove.scrollbar', function (e) {
            if (!$innerBar || !$innerBar.data('on_drag')) {
                return true;
            }

            var x = e.clientX - dragX;
            var y = e.clientY - dragY;

            dragX = e.clientX;
            dragY = e.clientY;

            scrollbarDrag(x, y);

            return false;
        }).bind('mouseup.scrollbar', function (e) {
            if (!$innerBar || !$innerBar.data('on_drag')) {
                return true;
            }

            $innerBar.data('on_drag', false).removeClass('ondrag');
            $container.find('.scrollbar').removeClass('draging');

            return false;
        });
        
        function scrollbarDrag (x, y) {
            if ($innerBar.parent().hasClass('scrollbar-y')) {
                var h = $innerBar.height();
                var top = $innerBar.position().top + y;

                if (top + h >= trackH) {
                    top = trackH - h;
                }

                if (top <= 0) {
                    top = 0;
                }

                $innerBar.css({
                    transition: 'none',
                    top: top + 'px'
                });

                //计算滚动条滚动的百分比，设置目标的位置
                var percent = top / (trackH - h);
                var t = (totalH - trackH) * percent;
                
                $target.css({
                    transition: 'none',
                    top: -t + 'px'
                });
            } else {
                var w = $innerBar.width();
                var left = $innerBar.position().left + x;

                if (left + w >= trackW) {
                    left = trackW - w;
                }

                if (left <= 0) {
                    left = 0;
                }

                $innerBar.css({
                    transition: 'none',
                    left: left + 'px'
                });

                //计算滚动条滚动的百分比，设置目标的位置
                var percent = left / (trackW - w);
                var l = (totalW - trackW) * percent;
                
                $target.css({
                    transition: 'none',
                    left: -l + 'px'
                });
            }

            if (typeof options.onScroll === 'function') {
                options.onScroll.call($container[0], options);
            }
        }
    }

    $.fn.scrollbar = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('The method ' + method + ' does not exist in $.scrollbar');
        }
    }

    //DATA-API
    $(document).ready(function () {
        $('[data-uitype="' + pName + '"]').scrollbar();
    });
})();

/**
 * [序列化表单为json]
 * @param  {[type]} $ [description]
 * @return {[type]}   [description]
 */
;(function () {  
    $.fn.serializeJson = function () {
        var serializeObj = {};
        var array = this.serializeArray();
        var str = this.serialize();

        $(array).each(function () {
            if (serializeObj[this.name]) {
                if ($.isArray(serializeObj[this.name])) {
                    serializeObj[this.name].push(this.value);
                } else {
                    serializeObj[this.name] = [serializeObj[this.name], this.value];
                }
            } else {
                serializeObj[this.name] = this.value;
            }
        });

        return serializeObj;
    };
})();

/**
 * mousewheel事件扩展
 */
;(function(a){function d(b){var c=b||window.event,d=[].slice.call(arguments,1),e=0,f=!0,g=0,h=0;return b=a.event.fix(c),b.type="mousewheel",c.wheelDelta&&(e=c.wheelDelta/120),c.detail&&(e=-c.detail/3),h=e,c.axis!==undefined&&c.axis===c.HORIZONTAL_AXIS&&(h=0,g=-1*e),c.wheelDeltaY!==undefined&&(h=c.wheelDeltaY/120),c.wheelDeltaX!==undefined&&(g=-1*c.wheelDeltaX/120),d.unshift(b,e,g,h),(a.event.dispatch||a.event.handle).apply(this,d)}var b=["DOMMouseScroll","mousewheel"];if(a.event.fixHooks)for(var c=b.length;c;)a.event.fixHooks[b[--c]]=a.event.mouseHooks;a.event.special.mousewheel={setup:function(){if(this.addEventListener)for(var a=b.length;a;)this.addEventListener(b[--a],d,!1);else this.onmousewheel=d},teardown:function(){if(this.removeEventListener)for(var a=b.length;a;)this.removeEventListener(b[--a],d,!1);else this.onmousewheel=null}},a.fn.extend({mousewheel:function(a){return a?this.bind("mousewheel",a):this.trigger("mousewheel")},unmousewheel:function(a){return this.unbind("mousewheel",a)}})})($);

/**
 * [Gallery 照片查看器]
 * 使用说明：
 * 需要引入 plugin.css
 */
;(function () {
    var pName = 'gallery';
    var namespace = 'ui.' + pName;

    /**
     * [Gallery 下拉框插件对象]
     */
    var Gallery = function (options) {
        if ($.isArray(options)) {
            this.settings = $.extend(true, {}, Gallery.DEFAULTS, {data: options});
        } else if (typeof options === 'object') {
            this.settings = $.extend(true, {}, Gallery.DEFAULTS, options);
        } else {
            $.error('参数不正确！');
        }

        this.init();
    }

    /**
     * [DEFAULTS 默认配置]
     */
    Gallery.DEFAULTS = {
        data        : [],                               //数据
        /*
        [
            {
               src  : '',                               //图片路径
               alt  : ''                                //图片显示名称，如果省略则使用图片名称
            }
        ]        
         */
        index       : 0,                                //默认显示第一个
        opacity     : true,                             //是否透明
        animation   : 'fade',                           //默认动画类型为fade
        errorimg    : './assets/img/error.png',         //加载失败时的默认图片
        loadingimg  : './assets/img/loading_31.gif',    //加载时显示的图片
        zoomscale   : 1.25,                             //放大缩小倍数
        showlist    : false                             //是否显示小图列表
    }

    /**
     * [init 初始化]
     * @return {[type]} [description]
     */
    Gallery.prototype.init = function () {
        var settings = this.settings;
        this.scale = 100;
        this.rotate = 0;

        var h = $(top).height() - 36;

        var html =  '<div id="Gallery" class="gallery gallery-'+settings.animation+(settings.opacity ? '' : ' gallery-no-opacity')+'">'+
                        '<div class="gallery-screen"></div>'+
                        '<a class="gallery-close"></a>'+
                        '<a class="gallery-prev"></a>'+
                        '<a class="gallery-next"></a>'+
                        '<div class="gallery-content">'+
                            '<div class="gallery-imgbox" style="height: '+h+'px;">'+
                                '<img class="gallery-img" />'+
                            '</div>'+
                            '<div class="gallery-toolbar">'+
                                '<div class="gallery-toolbar-mask"></div>'+
                                '<div class="gallery-left">'+
                                    '<span class="gallery-imgname"></span>'+
                                '</div>'+
                                '<div class="gallery-center">'+
                                    '<span class="gallery-bar-btn gallery-zoomin">'+
                                        '<i class="gallery-icon" title="放大"></i>'+
                                    '</span>'+
                                    '<span class="gallery-zoomScale"></span>'+
                                    '<span class="gallery-bar-btn gallery-zoomout">'+
                                        '<i class="gallery-icon" title="缩小"></i>'+
                                    '</span>'+
                                    '<span class="gallery-bar-btn gallery-origin">'+
                                        '<i class="gallery-icon" title="原始尺寸"></i>'+
                                    '</span>'+
                                    '<span class="gallery-bar-btn gallery-rotate">'+
                                        '<i class="gallery-icon" title="旋转"></i>'+
                                    '</span>'+
                                    '<span class="gallery-bar-btn gallery-showList">'+
                                        '<span>显示列表</span>'+
                                        '<i class="gallery-icon"></i>'+
                                    '</span>'+
                                '</div>'+
                                '<div class="gallery-right">'+
                                    '<span class="gallery-nav"></span>'+
                                '</div>'+
                            '</div>'+ 
                            '<div class="gallery-marquee-con">'+
                                '<div class="gallery-slideLeft"></div>'+
                                '<div class="gallery-imgList">'+
                                    '<ul></ul>'+
                                '</div>'+
                                '<div class="gallery-slideRight"></div>'+
                            '</div>'+
                        '</div>'+
                    '</div>';
        
        this.ele = $(html).appendTo(top.document.body);

        this.bindEvents();
        this.show();
        this.setImgSrc();
        this.cacheImg();

        //IE9以下不支持旋转
        if (PluginDep.isBelowIE9) {
            this.ele.find('.gallery-rotate').remove();
        }

        if (settings.showlist) {
            this.ele.find('.gallery-showList').trigger('click');
        }
    }

    /**
     * [setImgSrc 设置图片]
     */
    Gallery.prototype.setImgSrc = function () {
        var self = this;
        var settings = this.settings;
        var data = settings.data;
        var index = settings.index;
        var $ele = this.ele;
        var $img = $ele.find('.gallery-img');
        var img = new Image();
        var alt = data[index].alt || data[index].src.substring(data[index].src.lastIndexOf('/')+1);
        var maxWidth = $ele.find('.gallery-imgbox').width();
        var maxHeight = $ele.find('.gallery-imgbox').height();

        $ele.find('.gallery-imgname').text(alt);
        $ele.find('.gallery-nav').text((index + 1) + '/' + data.length);

        img.onload = function () {
            var s1 = 1;
            var s2 = 1;

            if (this.width > maxWidth) {
                s1 = maxWidth / this.width;
            }

            if (this.height > maxHeight) {
                s2 = maxHeight / this.height;
            }

            $img.attr('src', this.src);
            $img.css({
                'left': '50%',
                'top': '50%'
            });
            $img.data('origin-width', this.width);
            $img.data('origin-height', this.height);

            self.scale = Math.round(Math.min(s1, s2) * 100);
            self.setImgSize();
        }

        img.onerror = function () {
            $img.attr('src', settings.errorimg);
            $img.css({
                'width': '300px',
                'height': '150px',
                'left': '50%',
                'top': '50%',
                'margin-left': '-150px',
                'margin-top': '-75px'
            });
            $img.data('origin-width', 300);
            $img.data('origin-height', 150);
        }

        img.src = data[index].src;

        this.roteate = 0;
        this.rotateImg();
        $ele.find('.gallery-imgList li').removeClass('active').eq(index).addClass('active');
    }

    /**
     * [cacheImg 缓存图片]
     * @return {[type]} [description]
     */
    Gallery.prototype.cacheImg = function () {
        var settings = this.settings;
        var data = settings.data;
        var $ul = this.ele.find('.gallery-imgList ul').empty();
        var $li, img;

        for (var i = 0, l = data.length; i < l; i++) {
            img = new Image();
            $li = $('<li><img /></li>').appendTo($ul);

            (function (img, $li) {
                img.onload = function () {
                    $li.find('img').attr('src', this.src);
                }

                img.onerror = function () {
                    $li.find('img').attr('src', settings.errorimg);
                }
            })(img, $li);

            img.src = data[i].src;
        }

        $ul.width(data.length * $li.outerWidth(true));
        $ul.find('li').eq(settings.index).addClass('active');
    }

    /**
     * [centerImgbox 图片容器大小自适应]
     * @return {[type]} [description]
     */
    Gallery.prototype.centerImgbox = function () {
        var $ele = this.ele;

        //设置行高
        var h = $(top).height() - $ele.find('.gallery-toolbar').outerHeight(true);

        if ($ele.find('.gallery-showList').hasClass('up')) {
            h -= $ele.find('.gallery-imgList').outerHeight(true);
        }

        $ele.find('.gallery-imgbox').height(h);
        $ele.find('.gallery-imgList').width($(top).width() - 56);
    }

    /**
     * [show 关闭查看器]
     * @return {[type]} [description]
     */
    Gallery.prototype.show = function () {
        PluginDep.hideBodyScrollbar(top.document);
        this.ele.show();
        this.ele[0].offsetWidth;        //force reflow，否则动画无效
        this.ele.addClass('in');
    }

    /**
     * [hide 显示查看器]
     * @return {[type]} [description]
     */
    Gallery.prototype.hide = function () {
        var $ele = this.ele;

        $ele.removeClass('in');
        $(top.document).off('keydown.' + namespace);
        setTimeout(function () {
            $ele.remove();
            PluginDep.resetBodyScrollbar(top.document);
        }, 150);
    }

    /**
     * [setImgSize 设置图片尺寸]
     */
    Gallery.prototype.setImgSize = function () {
        var $ele = this.ele;
        var $img = $ele.find('.gallery-img');
        var $label = $ele.find('.gallery-zoomScale');
        var w = $img.data('origin-width');
        var h = $img.data('origin-height');

        $label.text(this.scale + '%');
        $img.css({
            'width': w * this.scale / 100,
            'height': h * this.scale / 100,
            'margin-left': -w * this.scale / 200,
            'margin-top': -h * this.scale / 200
        });
    }

    /**
     * [rotateImg 旋转图片]
     * @return {[type]} [description]
     */
    Gallery.prototype.rotateImg = function () {
        var $img = this.ele.find('.gallery-img');
        var transform = ['webkitTransform', 'mozTransform', 'msTransform', 'transform'];

        for (var i = 0, l = transform.length; i < l; i++) {
            $img.css(transform[i], 'rotate(' + this.rotate + 'deg)');
        }
    }

    /**
     * [bindEvents 绑定事件]
     * @return {[type]} [description]
     */
    Gallery.prototype.bindEvents = function () {
        var $ele = this.ele.off();
        var settings = this.settings;
        var self = this;

        //关闭查看器
        $ele.on('click', '.gallery-close', function () {
            self.hide();
        });

        //上一张图片
        $ele.on('click', '.gallery-prev', function () {
            settings.index--;

            if (settings.index < 0) {
                settings.index = settings.data.length - 1;
            }

            self.setImgSrc();
        });

        //下一张图片
        $ele.on('click', '.gallery-next', function () {
            settings.index++;

            if (settings.index == settings.data.length) {
                settings.index = 0;
            }

            self.setImgSrc();
        });

        //图片选择
        $ele.on('click', '.gallery-imgList li', function () {
            settings.index = $(this).index();
            self.setImgSrc();
        });

        //图片尺寸调整事件
        $ele.on('click', '.gallery-zoomin, .gallery-zoomout, .gallery-origin', function () {
            var zoomScale = settings.zoomscale;

            if ($(this).hasClass('gallery-zoomin')) {     //放大
                self.scale = Math.round(self.scale*zoomScale);
            } else if ($(this).hasClass('gallery-zoomout')) {   //缩小
                self.scale = Math.round(self.scale/zoomScale);
            } else {    //原始尺寸
                self.scale = 100;
            }

            self.setImgSize();
        });

        $ele.on('mousewheel', '.gallery-imgbox', function (e, delta) {
            if (delta < 0) {
                $ele.find('.gallery-zoomout').click();
            } else {
                $ele.find('.gallery-zoomin').click();
            }
        });

        //旋转图片
        $ele.on('click', '.gallery-rotate', function () {
            self.rotate = (self.rotate + 90) % 360;
            self.rotateImg();
        });

        //显示小图列表
        $ele.on('click', '.gallery-showList', function () {
            $(this).toggleClass('up');
            $ele.find('.gallery-marquee-con').toggleClass('open');
            self.centerImgbox();
        });

        //滑动
        $ele.on('click', '.gallery-slideLeft, .gallery-slideRight', function () {
            var delta = $(this).hasClass('gallery-slideLeft') ? 1 : -1;
            var $ul = $ele.find('.gallery-imgList ul');
            var left = parseInt($ul.css('left')) || 0;
            var w = $ele.find('.gallery-imgList').width();

            if ($ul.width() <= w) {     //不需要滑动
                return false;
            }

            left += delta*w;

            if (left > 0) {
                left = 0;
            }

            if (left < w - $ul.width()) {
                left = w - $ul.width();
            }

            $ul.css('left', left + 'px');
        });

        $(top).off('resize.gallery').on('resize.gallery', function () {
            self.centerImgbox();
        });

        //照片拖动，mousedown->mousemove->mouseup
        $ele.on('mousedown', '.gallery-img', function (e) {
            $target = $(this);
            dragging = true;
            oldX = e.clientX;
            oldY = e.clientY;

            return false;
        });

        //键盘事件绑定
        $(top.document).on('keydown.' + namespace, function (e) {
            switch (e.which) {
                case 27:    //ESC
                    self.hide();
                    break;
                case 37:    //Left
                    $ele.find('.gallery-prev').trigger('click');
                    break;
                case 39:    //Right
                    $ele.find('.gallery-next').trigger('click');
                    break;
            }
        });
    }

    var oldX, oldY, $target;
    var dragging = false;

    //公用事件绑定
    function bindCommonEvents () {
        $(top.document).on('mousemove.' + namespace, function (e) {
            if (!dragging) {
                return true;
            }

            var offsetX = e.clientX - oldX;
            var offsetY = e.clientY - oldY;
            oldX = e.clientX;
            oldY = e.clientY;

            $target.css({
                'left': parseInt($target.css('left')) + offsetX,
                'top': parseInt($target.css('top')) + offsetY
            });

            return false;
        });

        $(top.document).on('mouseup.' + namespace, function (e) {
            dragging = false;
        });
    }

    bindCommonEvents();

    $.gallery = function (options) {
        return new Gallery(options);
    }

    // Gallery DATA-API
    $(document).on('click.' + namespace, '[data-uitype="'+pName+'"] li', function () {
        var data = [];
        var $ul = $(this).parent();
        var index = $(this).index();

        $ul.find('li').each(function(index, el) {
            data.push({
                src: $(el).find('img').attr('data-origin-src') || $(el).find('img').attr('src'),
                alt: $(el).find('img').attr('alt')
            });
        });

        var options = $.extend(true, {}, Gallery.DEFAULTS, {
            data: data,
            index: index
        }, $ul.data());

        $ul.data(namespace, $.gallery(options));

        return false;
    });
})();

/**
 * [表单正则表达式验证]
 * 使用说明：
 * 需要引入 plugin.css
 */
;(function () {
    var pName = 'validate';
    var namespace = 'ui.' + pName;

    var globalId = 0;

    var methods = {
        init: function (option) {
            return this.each(function () {
                var $this = $(this);
                var setting = $.extend(true, {}, Validate.DEFAULTS, $this.data(), option); 
                
                $this.data(namespace, new Validate($this, setting));
            });
        }
    }

    var Validate = function (ele, setting) {
        this.ele = ele;
        this.setting = setting;
        this.targetId = 'validate-tip-' + globalId++;

        this.init();
    };

    Validate.DEFAULTS = {        
        rules               : [],       // 校验规则
        /*
         * [{
         *     reg          : '',       // 正则表达式，优先级大于type
         *     type         : '',       // 内置正则表达式email, idcard, tel, mobile
         *     msg          : ''        // 错误提示信息
         * }]
         */
        placement           : '',       // 提示框放置位置，默认自动计算
        isForcePlacement    : false     // 是否强制位置
    };

    Validate.prototype.init = function () {
        var setting = this.setting;

        if (typeof setting.rules == 'string') {
            setting.rules = eval(setting.rules);
        }

        setting.originPlacement = setting.placement;
        this.tipDom = $(
                            '<div class="validate-tip" id="' + this.targetId + '">' +
                                '<span class="glyphicon glyphicon-warning-sign"></span>' + 
                                '<span class="validate-tip-text"></span>' +
                            '</div>'
                        ).appendTo('body');
        this.createRegExp();
        this.bindEvents();
    };

    // 生成正则表达式
    Validate.prototype.createRegExp = function () {
        var rules = this.setting.rules;

        for (var i = 0, l = rules.length; i < l; i++) {
            var rule = rules[i];

            if (!rule.reg) {
                switch (rule.type) {
                    case 'email':
                        rule.reg = /^\w+(\\.\\w+)*@\w+(\.\w+){1,3}$/i;
                        break;
                    case 'idcard':
                        rule.reg = /(^\d{15}$)|(^\d{17}([0-9]|X)$)/i;
                        break;
                    case 'tel':
                        rule.reg = /^(0[0-9]{2,3}-?)?([2-9][0-9]{6,7})+(-[0-9]{1,4})?$/;
                        break;
                    case 'mobile':
                        rule.reg = /^(\+\d{2})?\d{11}$/;
                        break;
                }
            }

            if (!rule.reg instanceof RegExp) {
                throw new Error(reg + ' is not a instance of RegExp');
            }
        }
    };

    // 显示提示框
    Validate.prototype.showTip = function (msg) {
        var ele = this.ele;
        var setting = this.setting;
        
        ele.addClass('validate-error');
        this.setTip(msg);
    };

    // 隐藏提示框
    Validate.prototype.hideTip = function () {
        var ele = this.ele;

        ele.removeClass('validate-error');
        $('#' + this.targetId).hide().removeClass('top right bottom left');
    };

    // 设置提示框内容和位置
    Validate.prototype.setTip = function (msg) {
        var ele = this.ele;
        var setting = this.setting;

        var tip = $('#' + this.targetId).show();

        tip.find('.validate-tip-text').html(msg);

        var pos = PluginDep.getPosition(ele);
        var viewportPos = PluginDep.getPosition($('body'));
        var placement = setting.originPlacement;
        var actualWidth = tip[0].offsetWidth;
        var actualHeight = tip[0].offsetHeight;

        // 自动设置提示框位置为右边
        if (!/^((top)|(right)|(bottom)|(left))$/.test(placement)) {
            placement = 'right';
        }

        if (!setting.isForcePlacement) {
            // 校正位置，当前位置放不下则统一放到底部
            placement = placement == 'top' && pos.top - actualHeight < viewportPos.top ? 'bottom' :
                placement == 'right' && pos.right + actualWidth > viewportPos.width ? 'bottom' :
                placement == 'left' && pos.left - actualWidth < viewportPos.left ? 'bottom' : placement;
        }        

        var actualPos = this.calcActualPos(pos, placement, actualWidth, actualHeight);

        tip.addClass(placement)
            .css({
                left: actualPos.left,
                top: actualPos.top
            });
        setting.placement = placement;
    };

    // 计算元素的真实位置
    Validate.prototype.calcActualPos = function (pos, placement, actualWidth, actualHeight) {
        pos.top += pos.scrollTop;
        pos.left += pos.scrollLeft;

        return placement == 'bottom' ? { top: pos.top + pos.height, left: pos.left + pos.width / 2 - actualWidth / 2 } :
           placement == 'top' ? { top: pos.top - actualHeight, left: pos.left + pos.width / 2 - actualWidth / 2 } :
           placement == 'left' ? { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left - actualWidth } :
            { top: pos.top + pos.height / 2 - actualHeight / 2, left: pos.left + pos.width };
    };

    // 绑定事件
    Validate.prototype.bindEvents = function () {
        var ele = this.ele;
        var setting = this.setting;
        var rules = setting.rules;
        var self = this;

        ele.on('blur', function () {
            var val = $(this).val();

            self.hideTip();

            for (var i = 0, l = rules.length; i < l; i++) {
                var rule = rules[i];
                var ev = $.Event('validate.ui.validate');

                ele.trigger(ev, [rule, setting, self]);

                if (!rule.reg.test(val)) {
                    self.showTip(rule.msg);
                    break;
                }
            }
        });

        ele.on('focus', function () {
            self.hideTip();
        });
    };

    $.fn.validate = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('The method ' + method + ' does not exist in $.validate');
        }
    };

    // data-api
    $(document).ready(function () {
        $('[data-uitype="'+pName+'"]').validate();
    });
})();

/**
 * [resize 宽度拖动]
 * @return {[type]} [description]
 */
;(function () {
    var pName = 'resize';
    var namespace = 'ui.' + pName;
    var $container, $ele, opt, oldPoint;

    var methods = {
        init: function (option) {
            return this.each(function () {
                var $this = $(this);
                var settings = $.extend(true, {}, UiResize.DEFAULTS, $this.data(), option);

                $this.data(namespace, new UiResize($this, settings));
            });
        },
        resizeStart: function (e, settings, container, ele) {
            var dragFlag = settings.onResizeStart.call(container[0], e);

            if (dragFlag === false) {
                return false;
            }

            $container = container;
            $ele = ele;
            opt = settings;

            oldPoint = settings.vertical ? e.clientX : e.clientY;
            $('body').append('<div class="ui-resize-drag"></div>');
        },
        resize: function (e) {
            var distance;
            if (opt.vertical) {
                distance = e.clientX - oldPoint;
                oldPoint = e.clientX;

                var w;

                if ($container.width() + distance > opt.maxWidth) {
                    w = opt.maxWidth;
                    distance = opt.maxWidth - $container.width();
                } else if ($container.width() + distance < opt.minWidth) {
                    w = opt.minWidth;
                    distance = opt.minWidth - $container.width();
                } else {
                    w = $container.width() + distance
                }

                $container.width(w);
                $ele.css('left', parseInt($ele.getCss('left')) + distance);
            } else {
                distance = e.clientY - oldPoint;
                oldPoint = e.clientY;

                var h;

                if ($container.height() + distance > opt.maxHeight) {
                    h = opt.maxHeight;
                    distance = opt.maxHeight - $container.height();
                } else if ($container.height() + distance < opt.minHeight) {
                    h = opt.minHeight;
                    distance = opt.minHeight - $container.height();
                } else {
                    h = $container.height() + distance
                }

                $container.height(h);
                $ele.css('top', parseInt($ele.getCss('top')) + distance);
            }

            opt.onResize.call($container[0], distance, e);
        },
        resizeEnd: function (e) {
            opt.onResizeEnd.call($container[0], e);

            $('.ui-resize-drag').remove();
        },
        /**
         * [destroy 销毁组件]
         * @return {[type]} [description]
         */
        destroy: function () {
            return this.each(function() {
                var uiResize = $(this).data(namespace);

                if (uiResize) {
                    uiResize.ele.remove();
                    uiResize.container.removeClass('ui-resize-container');
                    $(this).removeData(namespace);
                }
            });
        }
    }

    /**
     * [Resize]
     */
    var UiResize = function (container, settings) {
        this.container = container;
        this.settings = settings;

        this.init();
        this.bindEvents();
    }

    UiResize.DEFAULTS = {
        vertical        : true,                         //拖动方向，true为垂直方向
        border          : 1,                            //可拖动区域的宽度
        minWidth        : 0,                            //容器可改变的最小宽度
        minHeight       : 0,                            //容器可改变的最小高度
        maxWidth        : Infinity,                     //容器可改变的最大宽度
        maxHeight       : Infinity,                     //容器可改变的最大高度
        onResizeStart   : function (e) {},              //开始拖动的回调，返回false的不进行拖动
        onResize        : function (e, distance) {},    //拖动中的回调
        onResizeEnd     : function (e) {}               //拖动结束的回调
    }

    UiResize.prototype.init = function () {
        var settings = this.settings;
        var w, h, left, top;

        if (settings.vertical) {
            left = this.container.outerWidth(true) - settings.border - this.container.getCss('border-right');
            top = -(this.container.getCss('border-top') + this.container.getCss('border-bottom')) / 2;
            w = settings.border;
            h = this.container.outerHeight(true);
        } else {
            left = -(this.container.getCss('border-left') + this.container.getCss('border-right')) / 2;
            top = this.container.outerHeight(true) - settings.border - this.container.getCss('border-bottom');
            w = this.container.outerWidth(true);
            h = settings.border;
        }

        this.ele = $('<div class="ui-resize"></div>').appendTo(this.container);

        this.ele.css({
            width: w,
            height: h,
            left: left,
            top: top
        })
        .addClass(settings.vertical ? 'vertical' : 'horizontal');
        this.container.addClass('ui-resize-container');
    }

    UiResize.prototype.bindEvents = function () {
        var container = this.container;
        var ele = this.ele;
        var settings = this.settings;

        //拖动，mousedown->mousemove->mouseup
        container.on('mousedown', '.ui-resize', function (e) {
            methods.resizeStart(e, settings, container, ele);
            return false;
        });
    }

    //公用事件绑定
    function bindCommonEvents () {
        $(document).on('mousemove.' + namespace, '.ui-resize-drag', function (e) {
            methods.resize(e);
        });

        $(document).on('mouseup.' + namespace, '.ui-resize-drag', function (e) {
            methods.resizeEnd(e);
        });
    }

    bindCommonEvents();

    $.fn.uiResize = function (option) {
        if (methods[option]) {
            return methods[option].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof option === 'object' || !option) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('The method ' + option + ' does not exist in $().UiResize');
        }
    }

    // data-api
    $(document).ready(function () {
        $('[data-uitype="'+pName+'"]').uiResize();
    });
})();

/**
 * [RightMenu 右键菜单]
 */
(function (win) {
    var pName = 'rightMenu';
    var namespace = 'ui.' + pName;

    var elements = [];

    var RightMenu = function (option) {
        if (typeof option === 'object') {
            this.setting = $.extend(true, {}, RightMenu.DEFAULTS, option);
        } else {
            $.error('参数不正确！');
        }

        this.init();
    }

    RightMenu.DEFAULTS = {
        width: 100,                     // 宽度
        autoHide : false,               // 是否自动隐藏
        offsetLeft: 0,                  // 点击处偏移宽度
        offsetTop: 0,                   // 点击处偏移高度
        menu: [{                        // 菜单项选项
            id: '',                     // 菜单id
            icon: '',                   // 菜单图标
            text: '',                   // 菜单文本
            callback: function () {     // 菜单回调，参数为show方法的第三个参数开始的参数

            }
        }]
    }

    RightMenu.prototype.init = function () {
        this.id = 'rMenu_' + elements.length;

        var setting = this.setting;
        var self = this;
        var ul = $('<ul class="right-menu" id="' + this.id + '"></ul>').appendTo('body');

        for (var i = 0, l = setting.menu.length; i < l; i++) {
            (function (i) {
                var op = setting.menu[i];
                var li = $('<li id="' + op.id + '"><span class="right-menu-icon">' + op.icon + '</span><span class="right-menu-text">' + op.text + '</span></li>').appendTo(ul);

                li.on('mousedown', function (e) {
                    if (typeof op.callback == 'function') {
                        var args = [e].concat(self.args);
                        var ret = op.callback.apply(this, args);    //执行回调，并将额外参数传入回调
                        
                        if (ret !== false) {     //如果返回false，则邮件惨淡不消失
                            self.hide();
                        }

                        return ret;
                    }
                });
            })(i);
        }

        this.element = ul;
        elements.push(this);
    }

    RightMenu.prototype.show = function (left, top) {
        var setting = this.setting;
        var ele = this.element;
        var self = this;

        //保存额外参数，回调时候使用
        if (arguments.length > 2) {
            this.args = Array.prototype.slice.call(arguments, 2);
        }

        ele.show();

        if (left + ele.outerWidth() > $(win).width()) {
            left = left - ele.outerWidth();
        } else {
            left += setting.offsetLeft;
        }

        if (top > $(win).height() / 2 ) {
            top = top - ele.outerHeight(true);
        } else {
            top += setting.offsetTop;
        }

        ele.css({
            left: left,
            top: top
        });

        if (setting.autoHide) {
            setTimeout(function () {
                self.hide();
            }, 3000);
        }
    }

    RightMenu.prototype.hide = function () {
        this.element.hide();
    }

    //点击隐藏
    $(document).on('mousedown.' + namespace, function () {
        for (var i = 0, l = elements.length; i < l; i++) {
            elements[i].hide();
        }
    });

    $.rightMenu = function (option) {
        return new RightMenu(option);
    }
})(window);

/**
 * [AutoComplete input框自动补全]
 */
(function () {
    var pName = 'autoComplete';
    var namespace = 'ui.' + pName;

    var methods = {
        init: function (option) {
            return this.each(function() {
                var $this = $(this);
                var setting = $.extend(true, {}, AutoComplete.DEFAULTS, option); 
                
                $this.data(namespace, new AutoComplete($this, setting));
            });
        }
    };

    var AutoComplete = function (ele, setting) {
        this.ele = ele;
        this.setting = setting;

        if (!setting.async.url) {
            this.originDataList = setting.dataList;
        }

        this.init();
    }

    AutoComplete.DEFAULTS = {
        async: {                        //远程请求获取数据参数，和ajax请求参数基本一致
            url: '',                    //远程请求url
            type: 'GET',                //请求方式
            data: false,                //请求入参，不包括搜索关键字，搜索关键字会自动带入
            dataType: false,            //返回数据类型，支持jsonp
            dataField: 'data',          //返回数据的字段中那个字段表示数据列表，null表示返回数据即数据列表
            searchField: 'keyword',     //搜索关键字名称
            delay: 200                  //延迟加载时间
        },
        dataList: [],                   //数据列表，支持本地数据列表
        localSearchField: null,         //本地搜索字段
        template: '<td>#{}</td>',       //列表模板
        width: false,                   //列表宽度
        maxHeight: 300,                 //列表最大高度
        maxNum: null,                   //最大显示条数
        autoHide: false,                //列表是否自动在3秒后隐藏
        callback: false,                //选中数据之后的回掉，参数为选中的数据
        onInit: false                   //组件初始化回调
    };

    AutoComplete.prototype.init = function () {
        var setting = this.setting;

        var styleObj = {
            display: this.ele.css('display')
        };

        var outer = $('<div class="ui-autoComplete"></div>').css(styleObj);
        var inner = $('<div class="ui-autoComplete-result"><table></table></div>');
        this.ele.addClass('ui-autoComplete-input').wrap(outer);
        this.ele = this.ele.parent();
        this.ele.append(inner);

        styleObj = {
            width: setting.width,
            maxHeight: setting.maxHeight
        }
        
        inner.css(styleObj);

        if (typeof setting.onInit == 'function') {
            setting.onInit.call(this.ele, this);
        }

        // 记录请求次数
        this.requestTimes = 0;
        this.bindEvents();
    }

    AutoComplete.prototype.showList = function () {
        var ele = this.ele;
        var setting = this.setting;
        
        var table = ele.find('.ui-autoComplete-result table').empty();
        var resultContainer = ele.find('.ui-autoComplete-result');
        var len = setting.maxNum ? Math.min(setting.maxNum, setting.dataList.length) : setting.dataList.length;

        if (len > 0) {
            for (var i = 0; i < len; i++) {
                var tr = $('<tr>' + PluginDep.parseTpl(setting.template, setting.dataList[i]) + '</tr>');

                tr.data('data', setting.dataList[i]).appendTo(table);
            }

            resultContainer.show();

            if (setting.autoHide) {
                setTimeout(function () {
                    resultContainer.hide();
                }, 3000);
            }
        }        
    }

    AutoComplete.prototype.bindEvents = function () {
        var ele = this.ele;
        var resultContainer = ele.find('.ui-autoComplete-result')[0];
        var setting = this.setting;
        var self = this;
        var timer = null;

        // note: IE8 hack，由于propertychange在js设置value时也会触发，因此改为keyup
        ele.on('click input keyup', '.ui-autoComplete-input', function (e) {
            var async = setting.async;
            var val = $(this).val();

            // 非IE8不处理keyup事件
            if (e.type == 'keyup' && !(PluginDep.browser.msie && PluginDep.browser.version < 9)) {
                return true;
            }

            // 隐藏其他的列表
            $('.ui-autoComplete-result').each(function () {
                if (this != resultContainer) {
                    $(this).hide();
                }
            });

            if (async.url) {
                // 连续触发时取消上一次请求
                clearTimeout(timer);
                self.requestTimes++;

                timer = setTimeout((function (currTimes) {
                    return function () {
                        var ajaxOpt = {
                            url: async.url,
                            type: async.type,
                            data: {},
                            success: function (res) {
                                if (currTimes == self.requestTimes) {
                                    setting.dataList = async.dataField ? res[async.dataField] : res;
                                    self.showList();
                                }
                            }
                        };

                        if (async.dataType) {
                            ajaxOpt.dataType = async.dataType;
                        }

                        ajaxOpt.data[async.searchField] = val;

                        if (async.data) {
                            $.extend(true, ajaxOpt.data, typeof async.data == 'function' ? async.data() : async.data);
                        }

                        $.ajax(ajaxOpt);
                    }
                })(self.requestTimes), async.delay);
            } else {
                var originDataList = self.originDataList;
                var field = setting.localSearchField;
                setting.dataList = [];

                for (var i = 0, l = originDataList.length; i < l; i++) {
                    if (field) {
                        if (originDataList[i][field].indexOf(val) > -1) {
                            setting.dataList.push(originDataList[i]);
                        }
                    } else {
                        if (originDataList[i].indexOf(val) > -1) {
                            setting.dataList.push(originDataList[i]);
                        }
                    }
                }

                self.showList();
            }

            e.stopPropagation();
        });

        ele.on('click', '.ui-autoComplete-result tr', function (e) {
            var data = $(this).data('data');

            if (typeof setting.callback == 'function') {
                setting.callback.call(ele.find('.ui-autoComplete-input')[0], data);
            }
        });
    }

    $(document).on('click', function () {
        $('.ui-autoComplete-result').hide();
    });

    $.fn.autoComplete = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('The method ' + method + ' does not exist in $.autoComplete');
        }
    }
})();

/**
 * [inputEnter 输入框enter键与按钮事件关联]
 */
(function () {
    var pName = 'inputEnter';
    var namespace = 'ui.' + pName;

    // 输入框enter键与按钮事件关联
    $(document).on('keydown.' + namespace, '[data-uitype="'+pName+'"]', function (e) {
        if (e.which == 13) {
            var ev = $(this).data('event') || 'click';
            
            $($(this).data('target')).trigger(ev);
        }
    });
})();

}));