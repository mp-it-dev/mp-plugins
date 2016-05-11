/**
 * jQuery 插件集
 * @author helin
 */

/**
 * [pluginDep 插件依赖的公用函数]
 */
var PluginDep = {};

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
        browser: match[1] || "",
        version: match[2] || "0"
    };

    if (matched.browser) {
        browser[matched.browser] = true;
        browser.version = matched.version;
    }

    //由于IE11没有msie标识，所以换一种方式判断IE
    if (window.ActiveXObject || "ActiveXObject" in window) { 
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
    return PluginDep.browser.msie && parseInt(PluginDep.browser.version) < 9;
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

;(function ($) {
    $.extend($.fn, {
        getCss: function(name) {
            var value = parseInt(this.css(name));

            if (isNaN(value)) {
                return null;
            }

            return value;
        }
    });
})(jQuery)

/**
 * [table 自动生成表格插件]
 * 使用说明：
 * 需要引入 common.css
 */
;(function($, global) {
    var pName = 'table';
    var namespace = 'ui.' + pName;

    /**
     * [methods 共有方法集合]
     * @type {Object}
     */
    var methods = {
        init: function (options) {
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
         * [getObject 获取table对象]
         * @return {[type]} [description]
         */
        getObject: function () {
            return this.eq(0).data(namespace);
        },

        /**
         * [getOptions 获取选项]
         * @return {[type]} [description]
         */
        getOptions: function (option) {
            var options = this.eq(0).data(namespace).options;

            if (arguments.length == 0) {
                return options;
            } else {
                return options[option];
            }
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
            var argLen = arguments.length;

            return this.each(function () {
                $(this).data(namespace).reload(data);                
            });
        },

        getSelectedRowData: function () {
            var container = this.eq(0).data(namespace).container;
            var selectedRow = [];

            container.find('.table-td-checkbox input:checked').each(function () {
                var data = $(this).parents('.table-tr').data('rowData');
                selectedRow.push(data);
            });

            return selectedRow;
        },

        setGroupHeaders: function (o) {
            return this.each(function () {
                $(this).data(namespace).setGroupHeaders(o);
            });
        }
    }

    var Table = function ($container, settings) {
        this.container = $container;
        this.options = settings;

        this.init();
    }

    //版本信息
    Table.VERSION = '1.1';
    //默认配置
    Table.DEFAULTS = {
        //表格选项
        tableClass      : '',                       //自定义table类名
        maxHeight       : false,                    //table容器最大高度
        height          : false,                    //table容器高度

        //单元格选项
        checkbox        : false,                    //是否显示checkbox
        rownum          : false,                    //是否显示行号
        rowParam        : false,                    //行自定义参数，对象形式，支持函数返回
        colParam        : false,                    //列自定义参数，对象形式，支持函数返回
        colOptions      : [],                       //列设置
        groupHeaders    : false,                    //多表头设置
        align           : false,                    //全局设置对齐方式
        headerAlign     : false,                    //表头对齐方式

        /*
         * colOptions格式：[{
         *     enable: true,                        //是否显示列
         *     name: 'ID',                          //列显示名称
         *     field: 'id',                         //列字段
         *     width: 100,                          //列宽
         *     edit: {                              //是否可编辑，默认为false
         *         replace: '<input />',            //编辑元素
         *         callback: function () {},        //编辑回调函数
         *     },
         *     align: false,                        //对齐方式
         *     headerAlign: false,                  //表头对齐方式
         *     css: false,                          //设置css样式
         *     class: false,                        //自定义类
         *     sort: {
         *         sname: 'id',                     //排序字段
         *         sorder: 'asc',                   //排序方式，asc升序，desc降序
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
        sortNameField       : 'sname',              //排序字段字段名
        sortOrderField      : 'sorder',             //排序方式字段名
        sortName            : '',                   //默认排序字段
        sortOrder           : 'asc',                //默认排序方式

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

        this.container = $container.html(html).find('.table-container');
        //表头最后一个拖动条隐藏
        $container.find('.table-head .table-tr th:last .table-th-resize').addClass('table-th-resize-last');

        for (var i = 0, l = $container.find('.table-head .holder th').length; i < l; i++) {
            $container.find('.table-head .table-tr th').eq(i).attr('data-index', i);
        }

        //执行多列参数设置
        if (options.groupHeaders) {
            self.setGroupHeaders(options.groupHeaders);
        }

        this.initData();
    }

    /**
     * [initData 处理数据并返回到回调]
     * @param  {[type]} options [参数列表]
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
            param;

        if (typeof options.data === 'function') {
            param = options.data();
        } else {
            param = $.extend(true, {}, options.data);
        }

        //是否有默认排序
        if (options.sortName) {
            param[options.sortNameField] = options.sortName;
            param[options.sortOrderField] = options.sortOrder;
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

            var $pager = $('<div class="table-pager"></div>').appendTo($container);

            $pager.pager(ajaxOpt);
            options.paging.pager = $pager.data('ui.pager').options;
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
     * [createTable 生成表格]
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
            var $theadLastTh = $thead.find('.holder th:last');

            //还原列宽
            if ($thead.data('minusWidth')) {
                var w = Math.max(parseInt($theadLastTh[0].style.width) || $theadLastTh.width(), 40);
                //$theadLastTh.width(w + sWidth);
                $thead.css('padding-right', 1);
                $tbody.css('padding-right', 1);
                $thead.removeData('minusWidth');
            }

            //出现竖直滚动条则设置padding-right
            if ($tbodyTable.outerHeight(true) > $tbody.outerHeight(true)) {
                var w = Math.max(parseInt($theadLastTh[0].style.width) || $theadLastTh.width(), 40);
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
            var w = 0, totalW = 0;

            for (var i = 0, l = $thead_ths.length; i < l; i++) {
                w = Math.max(parseInt($thead_ths[i].style.width) || $thead_ths.eq(i).width(), 40);
                totalW += w;

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

            //如果绑定过事件的话不需要再次绑定
            if (!$container.data('bindEvents')) {
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
            html += '<th style="width: 50px;"></th>';
        }

        for (var i = 0; i < colLen; i++) {
            var col = colOptions[i];

            var dis = '';

            if (col.width) {
                if (!isNaN(col.width)) {
                    dis += 'width: ' + col.width + 'px;';
                } else {
                    dis += 'width: ' + col.width + ';';
                }
            }            

            if (col.css && col.css.display) {
                dis = ' display: ' + col.css.display + ';';
            }

            html += '<th style="' + dis + '"></th>';
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

        //复选框
        if (options.checkbox) {
            html += '<th class="table-th table-th-checkbox" onselectstart="return false;">'+
                        '<input type="checkbox" />'+
                    '</th>';
        }

        //行号
        if (options.rownum) {
            html += '<th class="table-th table-th-rownum">'+
                        '<div class="table-th-text">序号</div>'+
                    '</th>';
        }

        for (var i = 0; i < colLen; i++) {
            var col = colOptions[i];
            var attr = 'data-field="'+col.field+'" data-field-index="' + i + '" onselectstart="return false;"', 
                stl = [],
                sort = col.sort;

            if (sort) {
                sort.sorder = sort.sorder || 'asc';
                attr += ' data-sname="' + sort.sname + '"' + ' data-sorder="' + sort.sorder + '"';
            }

            var $th = $('<th class="table-th' + (col.sort ? ' table-sort' : '') + '" ' + attr +'"></th>');

            if (col.css) {
                $th.css(col.css);
            }

            if (col['class']) {
                $th.addClass(col['class']);
            }

            if (col.headerAlign || options.headerAlign) {
                $th.css('text-align', col.headerAlign || options.headerAlign);
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

            if (options.checkbox) {
                $tr.append('<td class="table-td table-td-checkbox" onselectstart="return false;">'+
                            '<input type="checkbox" />'+
                        '</td>');
            }

            if (options.rownum) {
                $tr.append('<td class="table-td table-td-rownum">'+
                            '<div class="table-td-text">'+(i + 1)+'</div>'+
                        '</td>');
            }

            for (j = 0; j < colLen; j++) {
                var col = colOptions[j];
                var text;

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

                if (col.css) {
                    $td.css(col.css);
                }

                if (col['class']) {
                    $td.addClass(col['class']);
                }

                if (col.align || options.align) {
                    $td.css('text-align', col.align || options.align);
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
     * [reload 重新加载表格]
     * @return {[type]} [description]
     */
    Table.prototype.reload = function (data) {
        var options = this.options;

        if (typeof options.data !== 'function') {
            data = $.extend(true, {}, options.data, data);
        } else {
            data = $.extend(true, {}, options.data(), data);
        }

        //是否有排序
        if (options.sortName) {
            data[options.sortNameField] = options.sortName;
            data[options.sortOrderField] = options.sortOrder;
        }

        this.container.find('.table-th-checkbox input').prop('checked', false);

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

                if (options.headerAlign) {
                    $colHeader.css('text-align', options.headerAlign);
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
     * [bindEvents 绑定事件]
     * @return {[type]} [description]
     */
    Table.prototype.bindEvents = function () {
        var self = this,
            $container = this.container;

        $container.data('bindEvents', true);

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

            for (var i = 0; i < index + 1; i++) {
                oldLeft += $container.find('.holder th').eq(i).outerWidth(true);
            }

            $('body').addClass('table-drag');
            $container.find('.table-drag-line').css('left', oldLeft).show();

            return false;
        });

        //复选框点击事件，单选
        $container.on('change', '.table-td-checkbox input[type="checkbox"]', function () {
            var totalLen = $container.find('.table-td-checkbox input[type="checkbox"]').length;
            var currLen = $container.find('.table-td-checkbox input[type="checkbox"]:checked').length;

            $container.find('.table-th-checkbox input[type="checkbox"]').prop('checked', currLen == totalLen);
        });

        $container.on('click', '.table-td-checkbox input[type="checkbox"], .table-th-checkbox input[type="checkbox"]', function (e) {
            e.stopPropagation();
        });

        //复选框点击事件，全选
        $container.on('change', '.table-th-checkbox input[type="checkbox"]', function () {
            $container.find('.table-td-checkbox input[type="checkbox"]').prop('checked', $(this).prop('checked'));
        });
        
        $container.on('click', '.table-th-checkbox, .table-td-checkbox', function () {
            var $checkbox = $(this).find('input[type="checkbox"]');

            $checkbox.prop('checked', !$checkbox.prop('checked')).change();
        });

        //排序
        $container.on('click', '.table-sort', function () {
            //如果正在拖动则阻止排序
            if ($container.find('.table-drag-line').is(':visible')) {
                return;
            }

            $container.find('.table-th').removeClass('table-sort-active');

            var $th = $(this).addClass('table-sort-active');
            var sname = $th.attr('data-sname');
            var sorder = $th.attr('data-sorder');

            if (sorder == 'asc') {
                $th.attr('data-sorder', 'desc');
            } else {
                $th.attr('data-sorder', 'asc');
            }

            var options = self.options;

            options.sortName = sname;
            options.sortOrder = sorder;

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
    }

    var oldX, oldLeft;
    var $target, index;

    //公用事件绑定
    function bindCommonEvents () {
        $(document).on('mousemove.drag', '.table-drag', function (e) {
            var dragWidth = e.clientX - oldX;
            var left = oldLeft + dragWidth - $target.find('.table-body').scrollLeft();

            if (left < 0) {
                left = 0;
            }

            if (left > $target.find('.table-head').width()) {
                left = $target.find('.table-head').width();
            }

            $target.find('.table-drag-line').css('left', left);

            return false;
        });

        $(document).on('mouseup.drag', '.table-drag', function (e) {
            var dragWidth = e.clientX - oldX;

            //计算表格宽度
            var $thead_ths = $target.find('.table-head .holder th');
            var $tbody_ths = $target.find('.table-body .holder th');
            var w = 0, totalW = 0;

            $thead_ths.eq(index).width($thead_ths.eq(index).width() + dragWidth);

            for (var i = 0, l = $thead_ths.length; i < l; i++) {
                w = parseInt($thead_ths[i].style.width);
                totalW += w;

                $tbody_ths.eq(i).width(w);
                $thead_ths.eq(i).width(w);
            }

            $target.find('.table').width(totalW);
            $('.table-drag').removeClass('table-drag');
            $target.find('.table-drag-line').hide();

            return false;
        });

        //解决window.resize再回到原来尺寸时高度比原来大的问题
        /*if (PluginDep.isBelowIE9) {
            var resizeTimes = 0;
            $(window).resize(function () {
                if (resizeTimes % 2 == 0) {
                    $('.table-container .table-body').addClass('resize-hack');
                    setTimeout(function () {
                        $('.table-container .table-body').removeClass('resize-hack');
                    }, 50);
                }

                resizeTimes++;
            });
        }*/
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
})(jQuery, typeof window !== "undefined" ? window : this);

/**
 * [pager 分页插件]
 * 使用说明：
 * 需要引入 plugin.css
 */
(function($, window, undefined) {
    var pName = 'pager';
    var namespace = 'ui.' + pName;

    var methods = {
        init: function (options) {
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
            var pager = this.data(namespace);

            if (typeof data != 'undefined') {
                pager.options.data = data;
            }

            pager.requestData(1);
        },

        //销毁
        destroy: function () {
            $(this).data(namespace).destroy();
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
            return "<a class='paging-btn paging-btn-first' title='首页' data-topage='1'>&lt;&lt;</a>";
        } else {
            return "<a class='paging-btn paging-btn-first paging-btn-disabled' title='首页'>&lt;&lt;</a>";
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
            return "<a class='paging-btn paging-btn-last' title='尾页' data-topage='"+totalPage+"'>&gt;&gt;</a>";
        } else {
            return "<a class='paging-btn paging-btn-last paging-btn-disabled' title='尾页'>&gt;&gt;</a>";
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

    //销毁组件
    Pager.prototype.destroy = function () {
        this.container.off();
        this.container.removeData(namespace);
        this.container.empty();
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
            $.error('The method ' + method + ' does not exist in $.select');
        }
    }
})(jQuery, window, undefined);

/**
 * [uiSelect下拉菜单插件]
 * 使用说明：
 * 需要引入 plugin.css
 */
(function($, window, undefined) {
    var pName = 'select';
    var namespace = 'ui.' + pName;

    var methods = {
        init: function (options) {
            var settings = $.extend(true, {}, UiSelect.DEFAULTS, $(this).data(), options);
            $(this).data(namespace, new UiSelect($(this), settings));
        },

        //设置选定值
        //如果value为数组，则设置多个值选定
        setValue: function (value) {
            $(this).data(namespace).setValue(value);
        },

        //销毁组件
        destroy: function () {
            $(this).data(namespace).destroy();
        },

        //禁用组件
        disable: function () {
            $(this).data(namespace).setDisabled(true);
        },

        //启用组件
        enable: function () {
            $(this).data(namespace).setDisabled(false);
        },

        //全选
        selectAll: function (selected) {
            $(this).data(namespace).selectAll(selected);
        }
    }

    /**
     * [UiSelect 下拉框插件对象]
     */
    var UiSelect = function (ele, settings) {
        this.ele = ele;
        this.settings = settings;
        this.data = [];
        this.selectData = [];

        this.init();
    }

    /**
     * [DEFAULTS 默认配置]
     */
    UiSelect.DEFAULTS = {
        name        	: '',                      //作为表单的name
        data        	: false,                   //数据
        fields          : [],
        /*[{
            name        : 'text',                  //多列字段的名称
            width       : '100%'                   //多列字段所占宽度
        }]*/
        width       	: 0,                       //宽度
        seprator 	    : ';',                     //多选值分隔符
        disabled        : false,                   //是否禁用
        before      	: false,                   //是否在前方插入
        searchbox   	: false,                   //是否显示搜索框
        multiple    	: false                    //是否多选以及多选框类型
    }

    /**
     * [initData 初始化数据]
     * 1、如果选项中有数据列表则直接使用该数据
     * 2、如果选项中没有数据列表则表示是从select中提取数据
     */
    UiSelect.prototype.init = function () {
        var self = this;
        var settings = this.settings;

        settings.width = Math.max(this.ele.outerWidth(true), 70);

        if (settings.data) {
            this.type = 0;
            this.data = settings.data;

            if (!settings.name) {
                settings.name = this.ele.data('name');
            }
        } else {
            this.type = 1;

            var $select = this.ele;
            var $optgroup = $select.find('optgroup');

            settings.position = $select.position();
            settings.disabled = $select.prop('disabled');

            if ($optgroup.length > 0) {
                $optgroup.each(function () {
                    var label = $(this).attr('label');
                    var $options = $(this).children('option');
                    var data = {
                        label: label,
                        children: []
                    }

                    $options.each(function () {
                        var $option = $(this);
                        var d = {
                            value: $option.val(),
                            text: $option.text(),
                            selected: $option.prop('selected')
                        }

                        data.children.push(d);
                    });

                    self.data.push(data);
                });
            } else {
                $select.find('option').each(function () {
                    var $option = $(this);
                    var d = {
                        value: $option.val(),
                        text: $option.text(),
                        selected: $option.prop('selected')
                    }

                    self.data.push(d);
                });
            }   
        }

        //查找选中数据
        outloop:
        for (var i = 0, l = this.data.length; i < l; i++) {
            if (typeof this.data[i] == 'string') {
                this.data[i] = {
                    value: this.data[i],
                    text: this.data[i]
                }
            }

            if (this.data[i].children) {
                for (var j = 0, jLen = this.data[i].children.length; j < jLen; j++) {
                    if (this.data[i].children[j].selected) {
                        this.selectData.push({
                            value: this.data[i].children[j].value,
                            text: this.data[i].children[j].text
                        });

                        if (!settings.multiple) {
                            break outloop;
                        }
                    }
                }
            } else {
                if (this.data[i].selected) {
                    this.selectData.push({
                        value: this.data[i].value,
                        text: this.data[i].text
                    });

                    if (!settings.multiple) {
                        break outloop;
                    }
                }
            }
        }

        //如果没有数据则销毁组件
        if (this.data.length == 0) {
            this.destroy();
            return;
        }

        //如果是单选，且没有选中数据则默认选中第一个
        if (this.selectData.length == 0 && !settings.multiple) {
            var d = this.data[0].children ? this.data[0].children[0] : this.data[0];
            this.selectData.push({
                value: d.value,
                text: d.text
            });
        }

        this.originalData = this.data.slice(0);      //保存原始数据，便于搜索
        this.initDom();
    }

    /**
     * [initDom 生成DOM结构]
     * @return {[type]} [description]
     */
    UiSelect.prototype.initDom = function () {
        var settings = this.settings;
        var $ele = this.ele;

        var $target =  $('<div class="ui-select'+(settings.disabled ? ' disabled' : '')+'">' +
                            '<div class="ui-select-bar'+(settings.multiple == 2 ? ' noexpand' : '')+'">' +
                                '<div class="ui-select-v"></div>' + 
                                '<div class="ui-select-icon"><b></b></div>' +
                            '</div>' +
                            '<div class="ui-select-box">'+
                                (settings.searchbox ? '<div class="ui-select-input"><input /></div>' : '') +
                                '<ul class="ui-select-list"></ul>' +
                            '</div>' +
                            '<input type="hidden" name="'+settings.name+'" />' +
                        '</div>');

        if (this.type == 0) {
            $ele.append($target);
        } else {
            if (settings.before) {
                $ele.hide().before($target);
            } else {
                $ele.hide().after($target);
            }
        }

        this.target = $target;
        this.target.width(settings.width);
        this.createList();
        this.bindEvents();
    }

    /**
     * [createList 创建下拉列表]
     * @return {[type]} [description]
     */
    UiSelect.prototype.createList = function () {
        var settings = this.settings;
        var data     = this.data;
        var $target  = this.target;
        var $list    = $target.find('.ui-select-list').empty();
        var icon     = settings.multiple ? '<span class="ui-select-checkbox"></span>' : '';

        if (data.length == 0) {
            $('<li class="disabled">无数据</li>').appendTo($list);
        } else {
            if (settings.multiple) {
                $('<li class="ui-select-checkAll">'+icon+'全选</li>').appendTo($list);
            }

            for (var i = 0, l = data.length; i < l; i++) {
                if (data[i].children) {
                    var label = data[i].label;
                    var children = data[i].children;
                    
                    $('<li class="optgroup">'+label+'</li>').appendTo($list);

                    for (var j = 0, jLen = children.length; j < jLen; j++) {
                        var d = children[j];

                        var text = '';
                        $.each(settings.fields, function (k, field) {
                            text += '<div style="float: left; width: '+field.width+';">'+d[field.name]+'</div>';
                        });

                        if (text == '') {
                            text = d.text;
                        }

                        $('<li class="ui-select-li" data-value="'+d.value+'" title="'+d.text+'">'+icon+'<div class="ui-select-content">'+text+'</div></li>').appendTo($list);
                    }
                } else {
                    var d = data[i];

                    var text = '';
                    $.each(settings.fields, function (k, field) {
                        text += '<div style="float: left; width: '+field.width+';">'+d[field.name]+'</div>';
                    });

                    if (text == '') {
                        text = d.text;
                    }

                    $('<li class="ui-select-li" data-value="' + d.value + '" title="' +d.text+'">'+icon+'<div class="ui-select-content">'+text+'</li>').appendTo($list);
                }
            }
        }

        this.setSelect(false);
    }

    /**
     * [setSelect 设置选中项]
     */
    UiSelect.prototype.setSelect = function (changeFlag) {
        if (this.data.length == 0) {
            return false;
        }

        var settings   = this.settings;
        var selectData = this.selectData;
        var $target    = this.target;
        var value      = [];
        var text       = [];

        var $vbox      = $target.find('.ui-select-v').empty();
        var $input     = $target.find('input[type="hidden"]');
        var $box       = $target.find('.ui-select-box');
        var $bar       = $target.find('.ui-select-bar');

        $box.find('li').removeClass('active');

        if (settings.multiple) {
            if (selectData.length == 0) {
                $vbox.append('<span class="holder">&nbsp;</span>');
            } else {
                for (var i = 0, l = selectData.length; i < l; i++) {                    
                    $box.find('li[data-value="'+selectData[i].value+'"]').addClass('active');
                    value.push(selectData[i].value);
                    text.push(selectData[i].text);

                    if (settings.multiple != 1) {
                        $vbox.append('<span class="ui-select-item">'+selectData[i].text+'<a class="ui-select-del" data-value="'+selectData[i].value+'">×</a></span>');
                    }
                }

                if (settings.multiple == 1) {
                    var $temp = $('<input class="ui-select-i" readonly />');
                    $temp.val(text.join(settings.seprator));
                    $vbox.append($temp);
                }
            }

            //是否勾选全选按钮
            var tempData = [];
            $.each(this.data, function (i, item) {
                if (item.children) {
                    tempData = tempData.concat(item.children);
                } else {
                    tempData.push(item);
                }
            });

            if (tempData.length == selectData.length) {
                $box.find('.ui-select-checkAll').addClass('active');
            }
        } else {
            $vbox.append('<span class="ui-select-text">'+selectData[0].text+'</span>');
            $box.find('li[data-value="'+selectData[0].value+'"]').addClass('active');
            value.push(selectData[0].value);
        }

        $input.val(value.join(settings.seprator));
        $box.css('top', ($bar.outerHeight(true) - 1) + 'px');     //设置展开框的top值

        //设置原select的选中项
        this.ele.find('option').each(function(index, el) {
            for (var i = 0, l = selectData.length; i < l; i++) {
                if ($(this).val() == selectData[i].value) {
                    $(this).prop('selected', true);
                }
            }
        });

        //触发change和changed事件
        if (changeFlag !== false) {
            var e = $.Event('changed.' + namespace);
            this.ele.trigger(e, [selectData.slice(0), this.oldSelectData.slice(0)]);
            this.ele.trigger('change');
        }
    }

    /**
     * [showList 展开下拉框]
     * @return {[type]} [description]
     */
    UiSelect.prototype.showList = function () {
        this.target.find('.ui-select-box').show();
        this.target.addClass('expand');

        var e = $.Event('expand.' + namespace);
        this.ele.trigger(e);
    }

    /**
     * [hideList 隐藏下拉框]
     * @return {[type]} [description]
     */
    UiSelect.prototype.hideList = function () {
        this.target.find('.ui-select-box').hide();
        this.target.removeClass('expand');

        //清空搜索框
        var $input = this.target.find('.ui-select-input input');

        if ($input.val() !== '') {
            $input.val('');

            if (PluginDep.isBelowIE9) {
                $input.trigger('propertychange');
            } else {
                $input.trigger('input');
            }
        }

        var e = $.Event('shrink.' + namespace);
        this.ele.trigger(e, this.selectData.slice(0));
    }

    /**
     * [public]
     * [setValue 设置值，提供主动调用]
     * @param {[type]} value [description]
     */
    UiSelect.prototype.setValue = function (value) {
        var settings = this.settings;
        this.oldSelectData = this.selectData.slice(0);
        this.selectData.length = 0;

        if (!$.isArray(value)) {
            value = [value];
        }

        for (var i = 0, l = this.data.length; i < l; i++) {
            for (var j = 0, jLen = value.length; j < jLen; j++) {
                if (this.data[i].value == value[j]) {
                    this.selectData.push({
                        value: this.data[i].value,
                        text: this.data[i].text
                    });
                }
            }
        }

        var isSame = false;
        if (this.oldSelectData.length == this.selectData.length) {
            isSame = true
            for (var i = 0, l = this.oldSelectData.length; i < l; i++) {
                if ($.inArray(this.oldSelectData[i], this.selectData) == -1) {
                    isSame = false;
                }
            }
        }        

        if (!isSame && this.selectData.length > 0) {
            this.setSelect();
        }        
    }

    /**
     * [public]
     * [destroy 销毁DOM并显示原来的select]
     * @return {[type]} [description]
     */
    UiSelect.prototype.destroy = function () {
        this.ele.removeData(namespace);

        if (this.target) {
            this.target.remove();
        }        

        if (this.type == 1) {
            this.ele.show();
        }
    }

    /**
     * [public]
     * [setDisabled 设置控件的禁用状态]
     * @return {[type]} [description]
     */
    UiSelect.prototype.setDisabled = function (disabled) {
        this.settings.disabled = typeof disabled == 'undefined' ? true : disabled;

        if (this.settings.disabled) {
            this.target.addClass('disabled');
        } else {
            this.target.removeClass('disabled');
        }
    }

    /**
     * [selectAll 全选/取消全选]
     * @return {[type]} [description]
     */
    UiSelect.prototype.selectAll = function (selected) {
        selected = typeof selected == 'undefined' ? true : selected;
        var checkAll = this.target.find('.ui-select-checkAll');

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
        var settings = this.settings;
        var $target = this.target.off();
        var selectData = this.selectData;

        //展开下拉框
        $target.on('click', '.ui-select-bar, .ui-select-icon', function () {
            //禁用状态
            if (settings.disabled) {
                return false;
            }

            if ($(this).hasClass('noexpand')) {
                return false;
            }

            if ($target.hasClass('expand')) {
                self.hideList();
            } else {
                self.showList();
            }

            return false;
        });
        
        //列表选中事件
        $target.on('click', '.ui-select-li', function () {
            var $this = $(this);
            var value = $this.attr('data-value');
            var text = $this.find('.ui-select-content').html();
            
            try {
                if ($(text).length > 1) {
                    text = $(text).eq(0).text();
                }
            } catch(e) {

            }            

            //保存改变之前的数据
            self.oldSelectData = selectData.slice(0);

            if (settings.multiple) {
                if ($this.hasClass('active')) {
                    for (var i = 0, l = selectData.length; i < l; i++) {
                        if (selectData[i].value === value) {
                            selectData.splice(i, 1);
                            break;
                        }
                    }
                } else {
                    selectData.push({
                        value: value,
                        text: text
                    });
                }

                self.setSelect();
            } else {
                self.hideList();

                if (!$this.hasClass('active')) {
                    selectData.length = 0;
                    selectData.push({
                        value: value,
                        text: text
                    });

                    self.setSelect();
                }
            }
        });
        
        //全选
        $target.on('click', '.ui-select-checkAll', function () {
            //保存改变之前的数据
            self.oldSelectData = selectData.slice(0);
            selectData.length = 0;

            if (!$(this).hasClass('active')) {
                $.each(self.data, function (i, item) {
                    if (item.children) {
                        $.each(item.children, function (j, item) {
                            var text = item.text;

                            if ($(text).length > 0) {
                                text = $(text).eq(0).text();
                            }

                            selectData.push({
                                value: item.value,
                                text: text
                            });
                        });
                    } else {
                        var text = item.text;

                        if ($(text).length > 0) {
                            text = $(text).eq(0).text();
                        }

                        selectData.push({
                            value: item.value,
                            text: text
                        });
                    }
                });
            }

            self.setSelect();
        });
        
        //删除选中项
        $target.on('click', '.ui-select-del', function () {
            var value = $(this).attr('data-value');

            //保存改变之前的数据
            self.oldSelectData = selectData.slice(0);

            for (var i = 0, l = selectData.length; i < l; i++) {
                if (selectData[i].value == value) {
                    selectData.splice(i, 1);
                    break;
                }
            }

            $(this).parent().remove();
            self.setSelect();
        });

        //输入框输入筛选，propertychange不能委托
        $target.find('.ui-select-input input').on('input propertychange', inputHandler);

        function inputHandler(e) {
            var val = $(this).val();
            var data = self.originalData.slice(0);
            var sData = [];

            if (val === '') {
                self.data = data;
            } else {
                //查找结果
                for (var i = 0, l = data.length; i < l; i++) {
                    if (data[i].children) {
                        for (var j = 0, len = data[i].children.length; j < len; j++) {
                            if (data[i].children[j].value.indexOf(val) > -1 ||
                                data[i].children[j].text.indexOf(val) > -1) {
                                var isExist = false;

                                for (var k = 0, kLen = sData.length; k < kLen; k++) {
                                    if (ele.label === data[i].label) {
                                        isExist = true;
                                        ele.children.push(data[i].children[j]);

                                        break;
                                    }
                                }

                                if (!isExist) {
                                    sData.push({
                                        label: data[i].label,
                                        children: [data[i].children[j]]
                                    });
                                }
                            }
                        }
                    } else {
                        if (data[i].value.indexOf(val) > -1 || data[i].text.indexOf(val) > -1) {
                            sData.push(data[i]);
                        }
                    }
                }

                self.data = sData;
            }

            self.createList();
        }

        //隐藏下拉框
        $(document).on('click.' + namespace, function() {
            self.hideList();
        });

        $target.on('click', '.ui-select-box', function () {
            return false;
        });
    }

    $.fn.uiSelect = function (method) {
        var args = arguments;

        if (methods[method]) {
            return this.each(function () {
                if ($(this).data(namespace)) {
                    methods[method].apply(this, Array.prototype.slice.call(args, 1));
                }                
            });
        } else if (typeof method === 'object' || !method) {
            return this.each(function () {
                methods.init.apply(this, args);
            });
        } else {
            $.error('The method ' + method + ' does not exist in $.select');
        }
    }

    // UiSelect.js DATA-API
    $(document).ready(function () {
        $('[data-uitype="'+pName+'"]').uiSelect();
    });
})(jQuery, window, undefined);

/**
 * [scrollbar 滚动条插件]
 * 使用说明：
 * 需要引入 plugin.css
 */
(function($, window, undefined) {
    var pName = 'scrollbar';
    var namespace = 'ui.' + pName;

    var methods = {
        init: function (options) {             
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
            var obj = this.data(namespace);
            obj.destroy();
        },

        /**
         * [getOptions 获取选项]
         * @param  {[type]} option [description]
         * @return {[type]}        [description]
         */
        getOptions: function (option) {
            var obj = this.data(namespace);
            var options = obj.options;

            if (arguments.length == 0) {
                return options;
            } else {
                return options[option];
            }
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

            $container.on('mousewheel', function (event, delta) {
                //计算目标位置
                var tarTop = $target.position().top + delta*100;

                if (tarTop + totalH < trackH) {
                    tarTop = trackH - totalH;
                }

                if (tarTop > 0) {
                    tarTop = 0;
                }

                //计算滚动条位置
                var percent = -tarTop / (totalH - trackH);
                var t = (trackH - h) * percent;

                $target.css({
                    transition: 'all 0.05s linear',
                    top: tarTop + 'px'
                });

                $innerBarY.css({
                    transition: 'all 0.05s linear',
                    top: t + 'px'
                });

                if (typeof options.onScroll === 'function') {
                    options.onScroll.call($container[0], options);
                }

                event.preventDefault();
                return false;
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
})(jQuery, window, undefined);

/**
 * [序列化表单为json]
 * @param  {[type]} $ [description]
 * @return {[type]}   [description]
 */
(function ($) {  
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
})(jQuery);

/**
 * mousewheel事件扩展
 */
;(function(a){function d(b){var c=b||window.event,d=[].slice.call(arguments,1),e=0,f=!0,g=0,h=0;return b=a.event.fix(c),b.type="mousewheel",c.wheelDelta&&(e=c.wheelDelta/120),c.detail&&(e=-c.detail/3),h=e,c.axis!==undefined&&c.axis===c.HORIZONTAL_AXIS&&(h=0,g=-1*e),c.wheelDeltaY!==undefined&&(h=c.wheelDeltaY/120),c.wheelDeltaX!==undefined&&(g=-1*c.wheelDeltaX/120),d.unshift(b,e,g,h),(a.event.dispatch||a.event.handle).apply(this,d)}var b=["DOMMouseScroll","mousewheel"];if(a.event.fixHooks)for(var c=b.length;c;)a.event.fixHooks[b[--c]]=a.event.mouseHooks;a.event.special.mousewheel={setup:function(){if(this.addEventListener)for(var a=b.length;a;)this.addEventListener(b[--a],d,!1);else this.onmousewheel=d},teardown:function(){if(this.removeEventListener)for(var a=b.length;a;)this.removeEventListener(b[--a],d,!1);else this.onmousewheel=null}},a.fn.extend({mousewheel:function(a){return a?this.bind("mousewheel",a):this.trigger("mousewheel")},unmousewheel:function(a){return this.unbind("mousewheel",a)}})})(jQuery);

/**
 * [Gallery 照片查看器]
 * 使用说明：
 * 需要引入 plugin.css
 */
;(function ($) {
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
})(jQuery);

/**
 * [表单正则表达式验证]
 * 使用说明：
 * 需要引入 plugin.css
 */
;(function ($) {
    var pName = 'validate';
    var namespace = 'ui.' + pName;

    //值改变时触发验证事件
    $(document).on('change.' + namespace, '[data-uitype="'+pName+'"]', function () {
        var $this = $(this);
        var val = $this.val();
        var reg = $this.data('reg').split(' ');

        reg = new RegExp(reg[0], reg[1]);
        var result = reg.test(val);

        if (result) {
            $this.removeClass('form-control-error');
        } else {
            $this.addClass('form-control-error');
        }

        var e = $.Event('validate.' + namespace);
        $this.trigger(e, [result]);
    });
})(jQuery);

/**
 * [resize 宽度拖动]
 * @return {[type]} [description]
 */
;(function () {
    var pName = 'resize';
    var namespace = 'ui.' + pName;
    var $container, $ele, opt, oldPoint;

    var methods = {
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
            return this.each(function () {
                var $this = $(this);
                var obj = $this.data(namespace);
                var settings = $.extend(true, {}, UiResize.DEFAULTS, $this.data(), option);

                $this.data(namespace, (obj = new UiResize($this, settings)));
            });
        } else {
            $.error('The method ' + option + ' does not exist in $().UiResize');
        }
    }

    $(document).ready(function () {
        $('[data-uitype="'+pName+'"]').uiResize();
    });
})(jQuery);

/**
 * [RightMenu 右键菜单]
 */
(function ($, win) {
    var pName = 'rightMenu';
    var namespace = 'ui.' + pName;

    var globalVar = win[namespace];

    if (!globalVar) {
        globalVar = win[namespace] = {
            elements: []
        };
    }

    var RightMenu = function (option) {
        if (typeof option === 'object') {
            this.setting = $.extend(true, {}, RightMenu.DEFAULTS, option);
        } else {
            $.error('参数不正确！');
        }

        this.init();
    }

    RightMenu.DEFAULTS = {
        width: 100,
        autoHide : false,
        offsetLeft: 0,
        offsetTop: 0,
        menu: [{
            id: '',
            icon: '',
            text: '',
            callback: function () {

            }
        }]
    }

    RightMenu.prototype.init = function () {
        this.id = 'rMenu_' + globalVar.elements.length;

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
        globalVar.elements.push(this);
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
        for (var i = 0, l = win[namespace].elements.length; i < l; i++) {
            win[namespace].elements[i].hide();
        }
    });

    $.rightMenu = function (option) {
        return new RightMenu(option);
    }
})(jQuery, window);

/**
 * [AutoComplete input框自动补全]
 */
(function ($, win) {
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
        width: false,
        maxNum: null,
        autoHide: false,
        async: {
            url: '',
            type: 'GET',
            data: false,
            dataType: false,
            dataField: 'data',
            searchField: 'keyword'
        },
        dataList: [],
        localSearchField: null,        
        template: '<td>#{}</td>',
        callback: false,
        onInit: false
    };

    AutoComplete.prototype.init = function () {
        var setting = this.setting;

        var styleObj = {
            display: this.ele.css('display'),
            width: setting.width || this.ele.outerWidth(true)
        };

        var div = $('<div class="ui-autoComplete"></div>').css(styleObj);
        this.ele.addClass('ui-autoComplete-input').wrap(div);
        this.ele = this.ele.parent();
        this.ele.append('<div class="ui-autoComplete-result"><table></table></div>');

        if (typeof setting.onInit == 'function') {
            setting.onInit.call(this.ele, this);
        }

        this.bindEvents();
    }

    AutoComplete.prototype.showList = function () {
        var ele = this.ele;
        var setting = this.setting;
        
        var table = ele.find('.ui-autoComplete-result table').empty();
        var len = setting.maxNum ? Math.min(setting.maxNum, setting.dataList.length) : setting.dataList.length;

        if (len > 0) {
            for (var i = 0; i < len; i++) {
                var tr = $('<tr>' + PluginDep.parseTpl(setting.template, setting.dataList[i]) + '</tr>');

                tr.data('data', setting.dataList[i]).appendTo(table);
            }

            ele.find('.ui-autoComplete-result').show();

            if (setting.autoHide) {
                setTimeout(function () {
                    ele.find('.ui-autoComplete-result').hide();
                }, 3000);
            }
        }        
    }

    AutoComplete.prototype.bindEvents = function () {
        var ele = this.ele;
        var setting = this.setting;
        var self = this;
        var timer = null;

        // note: propertychange不能冒泡
        ele.find('.ui-autoComplete-input').on('click input propertychange', function (e) {
            var async = setting.async;
            var val = $(this).val();

            if (async.url) {
                clearTimeout(timer);

                timer = setTimeout(function () {
                    var ajaxOpt = {
                        url: async.url,
                        type: async.type,
                        data: {},
                        success: function (res) {
                            setting.dataList = async.dataField ? res[async.dataField] : res;
                            self.showList();
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
                }, 300);
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
                setting.callback(data);
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
})(jQuery, window);