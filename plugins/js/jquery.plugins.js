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

    //由于IE11没有哦msie标识，所以换一种方式判断IE
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
 * [isOverflow 判断是否出现滚动条]
 * @param  {[type]}  $ele [description]
 */
PluginDep.isOverflow = function ($ele) {
    var obj = {};

    if ($ele[0].scrollWidth > $ele.outerWidth()) {
        obj.x = true;
    }

    if ($ele[0].scrollHeight > $ele.outerHeight()) {
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
        return typeof obj === 'object' && (obj.nodeType === 1 || obj.nodeType === 9);
    }
}

/**
 * [scrollBarWidth 浏览器滚动条宽度]
 * @return {[type]} [description]
 */
PluginDep.scrollBarWidth = function () {
    var $body = $('body');
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
PluginDep.hideBodyScrollbar = function () {
    var $body = $('body');
    var fullWindowWidth = window.innerWidth;
    var scrollbarWidth = PluginDep.scrollBarWidth();

    if (!fullWindowWidth) { // workaround for missing window.innerWidth in IE8
      var documentElementRect = document.documentElement.getBoundingClientRect();
      fullWindowWidth = documentElementRect.right - Math.abs(documentElementRect.left);
    }

    //获取原始padding
    $body.originalBodyPad = parseInt(($body.css('padding-right') || 0), 10);

    if (document.body.clientWidth < fullWindowWidth) {
        $body.addClass('hide-scrollbar')
                    .css('padding-right', $body.originalBodyPad + scrollbarWidth);
    }
}

/**
 * [resetBodyScrollbar 还原body滚动条]
 * @return {[type]} [description]
 */
PluginDep.resetBodyScrollbar = function () {
    $('body').removeClass('hide-scrollbar')
                    .css('padding-right', $('body').originalBodyPad || '');
}

/**
 * [table 自动生成表格插件]
 * 使用说明：
 * 需要引入 common.css
 */
;(function($, window, undefined) {
    var tableData = $.tableData || {
        tableLength: 0
    };

    $.tableData = tableData;

    /**
     * [methods 共有方法集合]
     * @type {Object}
     */
    var methods = {
        init: function (options) {
            return this.each(function () {
                var $this = $(this);
                var defaultOptions = {
                    tableID         : '',                       //表格ID
                    tableClass      : '',                       //自定义table类名
                    tableCaption    : '',                       //表名
                    maxHeight       : false,                    //table容器高度
                    checkbox        : false,                    //是否显示checkbox
                    rownum          : false,                    //是否显示行号
                    colOptions      : [],                       //列设置
                    rowParam        : false,                    //行自定义参数，对象形式，支持函数返回
                    colParam        : false,                    //列自定义参数，对象形式，支持函数返回

                    /*
                     * colOptions格式：[{
                     *     name: 'ID',                          //列显示名称
                     *     field: 'id',                         //列字段
                     *     width: 100,                          //列宽
                     *     hide: false,                         //是否隐藏该列
                     *     edit: false,                         //是否可编辑
                     *     sort: {
                     *         sname: 'id',                     //排序字段
                     *         sorder: 'asc',                   //排序方式，asc升序，desc降序
                     *         stype: ''                        //排序类型，如果指定此字段则为本地排序
                     *     },
                     *     handler: function (data, rowData) {  //列处理函数，在该列的所有数据
                     *                                          //都会被此函数处理，一定要返回数据
                     *         return data;
                     *     },
                     * }]
                     */
            
                    url             : '',                       //远程获取数据url
                    type            : 'GET',                    //请求方式
                    data            : false,                    //请求数据，json或function
                    crossDomain     : false,                    //是否跨域
                    indexField      : 'pageIndex',              //页码字段名
                    countField      : 'pageCount',              //每页条数字段名
                    dataField       : 'data',                   //json数组字段名
                    totalField      : 'total',                  //总条数字段名
                    pageIndex       : 1,                        //从第几页开始
                    pageCount       : 20,                       //每页显示多少条数据
                    pageCountArray  : [20, 40, 60, 80, 100],    //每页显示多少条数据的选择数组
                    total           : 0,                        //数据总条数
                    totalPage       : 0,                        //总页数
                    bothside        : 1,                        //当前页左右两边显示的个数
                    pageInfo        : true,                     //是否显示页码信息

                    sortName        :'',                        //默认排序字段
                    sortOrder       :'asc',                     //默认排序方式

                    dataList        : [],                       //json数组数据
                    dataHandler     : [],                       //数据处理函数
            
                    onInit          : false                     //初始化回调
                }

                if (!options.colOptions || options.colOptions.length == 0) {
                    return;
                }

                var settings = $.extend(true, {}, defaultOptions, options);

                var table = new Table($this, settings);
                $this.data('table', table);
            });
        },

        /**
         * [getOptions 获取选项]
         * @return {[type]} [description]
         */
        getOptions: function (option) {
            var options = this.eq(0).data('table').options;

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
            if (id instanceof $ || PluginDep.isDom(id)) {
                return $(id).data('rowdata');
            }

            return $('[data-rowid="'+id+'"]').data('rowdata');
        },

        /**
         * [reload 重新加载]
         * @return {[type]} [description]
         */
        reload: function (url, data) {
            var argLen = arguments.length;

            return this.each(function () {
                if (argLen == 0) {
                    $(this).data('table').reload();
                } else {
                    $(this).data('table').reload(url, data);
                }
            });
        }
    }

    var Table = function ($container, settings) {
        this.options = $.extend({
            container: $container
        }, settings);

        this.init();
    }

    /**
     * [init 表格初始化]
     * @param  {[type]} options [初始化参数]
     * @return {[type]}         [description]
     */
    Table.prototype.init = function () {
        var self = this;

        var options = this.options;
        var maxHeight = options.maxHeight;
        var $container = options.container;

        if (options.tableID === "") {   //生成tableID
            options.tableID = "table_" + tableData.tableLength++;
        }

        var thead = this.initThead();
        var sWidth = PluginDep.scrollBarWidth() + 1;

        var html =  '<div class="table-container" id="'+options.tableID+'">' + 
                        '<div class="table-drag-line">&nbsp;</div>' +
                        '<div class="ajax-loading"></div>' +
                        (options.tableCaption ? '<div class="table-caption"><a class="op_cl"><span></span></a><span>'+options.tableCaption+'</div>' : '') +
                        '<div class="table-head"' + (maxHeight ? ' style="padding-right: '+sWidth+'px;"' : '') + '>'+
                            '<table class="table ' + options.tableClass + '">' + 
                                thead + 
                            '</table>' +
                        '</div>'+
                        '<div class="table-body"' + (maxHeight ? ' style="max-height: '+maxHeight+'px; padding-right: '+sWidth+'px;"' : '') + '></div>'+
                    '</div>';

        $container.append(html);

        setTimeout(function () {
            var w1 = $container.find('.table-head .table').width();
            var w2 = $container.find('.table-head').width() - 1;

            if (w1 < w2) {
                $container.find('.table-head .table').width(w2);
            }

            self.initData();
        }, 0);
    }

    /**
     * [initData 处理数据并返回到回调]
     * @param  {[type]} options [参数列表]
     * @return {[type]} [description]
     */
    Table.prototype.initData = function () {
        var options = this.options,
            url     = options.url;

        if (url) {
            this.getPageData();
        } else {
            var dataList    = options.dataList,
                dataHandler = options.dataHandler;

            //数据处理
            for (var i = 0, l = dataHandler.length; i < l; i++) {
                if (typeof dataHandler[i] === "function") {
                    dataList[i] = dataHandler[i].call(this, dataList[i]);
                }
            }

            options.dataList = dataList;
            this.initTable();
        }
    }

    /**
     * [getPageData 获取远程数据]
     * @return {[type]}           [description]
     */
    Table.prototype.getPageData = function () {
        var self = this;

        var options = this.options,
            url = options.url,
            type = options.type,
            data = options.data,
            $container = options.container,
            param;

        if (typeof data === 'function') {
            param = data();
        } else {
            param = $.extend(true, {}, data);
        }

        //是否有默认排序
        if (options.sortName) {
            if (type.toUpperCase() === 'GET') {
                url += (url.indexOf('?') > -1 ? '&' : '?') + 'sname=' + options.sortName + '&sorder=' + options.sortOrder;
            } else {
                param.sname = options.sortName;
                param.sorder = options.sortOrder;
            }
        }

        var $pager = $('<div id="'+options.tableID+'_pager" class="table-pager"></div>').appendTo($container)

        $pager.pager({
            url             : url,
            type            : type,
            data            : param,
            crossDomain     : options.crossDomain,
            indexField      : options.indexField,
            countField      : options.countField,
            dataField       : options.dataField,
            totalField      : options.totalField,
            pageIndex       : options.pageIndex,
            pageCount       : options.pageCount,
            pageCountArray  : options.pageCountArray,
            bothside        : options.bothside,
            pageInfo        : options.pageInfo,
            beforeSend      : function () {       //加载框显示
                var height = $container.find('.table-body').height();

                if (!height) {
                    $container.find('.table-body').css('min-height', '200px');
                }

                $container.find(".ajax-loading").show();
            },
            complete        : function () {         //隐藏加载框
                $container.find('.table-body').css('min-height', '0');

                $container.find(".ajax-loading").hide();
            },
            success         : function (res, reloadFlag) {
                var dataHandler = options.dataHandler;
                var dataList = res[options.dataField];

                //数据处理
                for (var i = 0, l = dataHandler.length; i < l; i++) {
                    if (typeof dataHandler[i] === "function") {
                        dataList[i] = dataHandler[i].call($container, dataList[i]);
                    }
                }

                //保存新数据
                options.dataList = dataList;

                self.initTable(reloadFlag);
            }
        });
    }

    /**
     * [initTable 生成表格]
     * @return {[type]} [description]
     */
    Table.prototype.initTable = function (reloadFlag) {
        var self = this;

        var options = this.options;
        var $container = options.container;
        var $table = this.initTbody();

        $container.find('.table-body').empty().append($table);

        setTimeout(function () {
            //计算表格宽度
            var $ths = $container.find('.table-head .holder th');
            var $tds = $container.find('.table-body .holder td');
            var w = 0, totalW = 0;

            for (var i = 0, l = $ths.length; i < l; i++) {
                w = parseInt($ths[i].style.width) || $ths.eq(i).width();
                totalW += w;

                $tds.eq(i).width(w);
                $ths.eq(i).width(w);
            }

            $container.find('.table-head .table, .table-body .table').css({
                'width': totalW,
                'table-layout': 'fixed'
            });

            //最后一列拖动条隐藏颜色，解决边框加宽的问题
            $container.find('.table-th-resize:last').addClass('table-th-resize-transparent');

            //去掉第一行的上边框
            $container.find('.table-body .table-tr:first td').css('border-top', '0');

            //如果是重新加载的话不需要再次绑定事件
            if (!reloadFlag) {
                self.bindEvents();
            }

            if (options.onInit) {
                options.onInit.call($container[0], options);
            }
        }, 0);
    }

    /**
     * [initThead 生成表头]
     * @return {[type]} [description]
     */
    Table.prototype.initThead = function () {
        var options    = this.options,
            colOptions = options.colOptions;

        var colLen = colOptions.length;
        var html = '<thead>';

        for (var k = 0; k < 2; k++) {
            html += '<tr class="' + (k == 0 ? 'holder' : 'table-tr') + '">';

            //复选框
            if (options.checkbox) {
                if (k == 0) {
                    html += '<th style="height: 0px; width: 40px;"></th>';
                } else {
                    html += '<th class="table-th table-th-checkbox" onselectstart="return false;">'+
                                '<input type="checkbox" />'+
                            '</th>';
                }
            }

            //行号
            if (options.rownum) {
                if (k == 0) {
                    html += '<th style="height: 0px; width: 40px;"></th>';
                } else {
                    html += '<th class="table-th table-th-rownum">'+
                                '<div class="table-th-text">序号</div>'+
                            '</th>';
                }
            }

            for (var i = 0; i < colLen; i++) {
                var col = colOptions[i];

                if (k == 0) {
                    html += '<th style="height: 0px;'+(col.width ? ' width: '+col.width+'px;' : '')+(col.hide ? ' display: none;' : '')+'"></th>';
                } else {
                    var s = '', sort = col.sort;

                    if (col.hide) {
                        s += ' style="display: none;"';
                    }

                    if (sort) {
                        sort.sorder = sort.sorder || 'asc';
                        s += ' data-sname="' + sort.sname + '"' + ' data-sorder="' + sort.sorder + '"';
                    }

                    html += '<th class="table-th' + (col.sort ? ' table-sort' : '') + '"' + s + ' data-field="'+col.field+'" onselectstart="return false;">'+
                                '<div class="table-th-resize">&nbsp;</div>'+
                                '<div class="table-th-text">'+
                                    col.name+
                                    (col.sort ? '<span class="table-th-icon"></span>' : '')+
                                '</div>'+
                            '</th>';
                }
            }

            html += '</tr>';
        }

        html += '</thead>';

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
            colLen      = colOptions.length,
            dataLen     = dataList.length;

        var $table = $('<table class="table ' + options.tableClass + '"></table>');
        var $tbody = $('<tbody></tbody>');

        $table.append($tbody);
        
        if (dataLen == 0) {
            $tbody.append('<tr><td colspan="'+colLen+'" align="center">无结果</td></tr>');

            return $table;
        }

        var i, j;
        var $holder = $('<tr class="holder"></tr>').appendTo($tbody);

        if (options.checkbox) {
            $holder.append('<td style="height: 0px; width: 40px;"></td>');
        }

        if (options.rownum) {
            $holder.append('<td style="height: 0px; width: 40px;"></td>');
        }

        for (var i = 0; i < colLen; i++) {
            $holder.append('<td style="height: 0px;'+(colOptions[i].hide ? ' display: none;' : '')+'"></td>');
        }

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

            var $tr = $('<tr class="table-tr"'+rowData+'>').appendTo($tbody);
            $tr.data('rowdata', dataList[i]);

            if (options.checkbox) {
                $tr.append('<td class="table-td table-td-checkbox" onselectstart="return false;">'+
                            '<input type="checkbox" />'+
                        '</td>');
            }

            if (options.rownum) {
                $tr.append('<td class="table-td table-td-rownum">'+
                            '<div class="table-td-text">'+i+'</div>'+
                        '</td>');
            }

            for (j = 0; j < colLen; j++) {
                var col = colOptions[j];
                var d = data[col.field];

                if (typeof col.handler === 'function') {
                    d = col.handler(d, data, col);
                }

                var colParam = options.colParam || {};
                var colData = ' data-colid="'+col.field+'"';

                if (typeof colParam === 'function') {
                    colParam = colParam(data, i, col.field);
                }

                for (var key in colParam) {
                    colData += ' data-'+key+'="'+colParam[key]+'"';
                }

                var $td = $('<td class="table-td"'+(col.hide ? ' style="display: none;"' : '')+colData+'></td>').appendTo($tr);
                var $div = $('<div class="table-td-text"></div>').appendTo($td);

                if (col.edit) {
                    $td.addClass('table-td-edit').attr('onuserselectstart', 'return false;');
                }

                if (typeof d === 'object' && (d instanceof jQuery || PluginDep.isDom(d))) {
                    $div.append(d);
                } else {
                    $div.html(d ? d + '' : '');
                }
            }
        }

        return $table;
    }

    /**
     * [reload 重新加载表格]
     * @return {[type]} [description]
     */
    Table.prototype.reload = function (url, data) {
        var options = this.options;
        var pager = options.container.find('.table-pager');

        if (arguments.length == 0) {
            if (typeof options.data !== 'function') {
                data = $.extend(true, {}, options.data);
            } else {
                data = options.data();
            }

            url = options.url;

            //是否有排序
            if (options.sortName) {
                if (options.type.toUpperCase() === 'GET') {
                    url += (url.indexOf('?') > -1 ? '&' : '?') + 'sname=' + options.sortName + '&sorder=' + options.sortOrder;
                } else {
                    data.sname = options.sortName;
                    data.sorder = options.sortOrder;
                }
            }
        }

        pager.pager('reload', url, data);
    }

    /**
     * [bindEvents 绑定事件]
     * @return {[type]} [description]
     */
    Table.prototype.bindEvents = function () {
        var self = this;
        var $container = this.options.container;
        var tableID = this.options.tableID;

        //固定表头滚动
        $container.find('.table-body').on('scroll', function (e) {            
            $container.find('.table-head table').css('left', -this.scrollLeft);
        });

        $container.on('click', '.table-th-resize', function () {
            return false;
        });

        //列宽度拖动，mousedown->mousemove->mouseup
        $container.on('mousedown', '.table-th-resize', function (e) {
            var index = $(this).parent().index();

            $target = $container;
            $th = $container.find('.holder th').eq(index);
            $td = $container.find('.holder td').eq(index);
            oldX = e.clientX;
            oldLeft = 0;

            for (var i = 0; i < index + 1; i++) {
                oldLeft += $container.find('.holder th').eq(i).outerWidth();
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
            var $th = $(this);
            var sname = $th.attr('data-sname');
            var sorder = $th.attr('data-sorder');

            if (sorder == 'asc') {
                $th.attr('data-sorder', 'desc');
            } else {
                $th.attr('data-sorder', 'asc');
            }

            var options = self.options,
                url = options.url,
                type = options.type,
                data;

            if (typeof options.data !== 'function') {
                data = $.extend(true, {}, options.data);
            } else {
                data = options.data();
            }

            options.sortName = sname;
            options.sortOrder = sorder;

            if (type.toUpperCase() === 'GET') {
                url += (url.indexOf('?') > -1 ? '&' : '?') + 'sname=' + sname + '&sorder=' + sorder;
            } else {
                data.sname = sname;
                data.sorder = sorder;
            }

            self.reload(url, data);
        });

        //编辑单元格
        $container.on('dblclick', '.table-td-edit', function () {
            var $this = $(this);
            var $text = $this.find('.table-td-text').hide();
            var $input = $this.find('.table-td-input');

            if ($input.length == 0) {
                $input = $('<input type="text" class="table-td-input" />').appendTo($this);
                $input.val($text.html()).focus();
            }

            return false;
        });

        //确认编辑，回写数据
        $container.on('focusout', '.table-td-input', function (e) {
            var $input = $(this);
            var $td = $input.parent();
            var $tr = $td.parent();
            var $text = $input.siblings('.table-td-text');
            var data = $tr.data('rowdata');
            var colid = $td.data('colid');

            data[colid] = $input.val();
            $text.html($input.val()).show();
            $input.remove();

            var ev = $.Event('editen.ui.table', {customData: {
                data: data,
                id: colid
            }});
            $container.trigger(ev);
        });

        $container.on('keydown', '.table-td-input', function (e) {
            if (e.which == 13) {
                $(this).blur();
            }
        });
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

    var oldX, oldLeft, dragWidth;
    var $target, $th, $td;

    //公用事件绑定
    function bindCommonEvents () {
        $(document).on('mousemove.drag', '.table-drag', function (e) {
            dragWidth = e.clientX - oldX;
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
            dragWidth = e.clientX - oldX;
            
            $th.width($th.width() + dragWidth);
            $td.width($td.width() + dragWidth);

            $('.table-drag').removeClass('table-drag');
            $target.find('.table-drag-line').hide();
        });
    }

    bindCommonEvents();
})(jQuery, window, undefined);

/**
 * [pager 分页插件]
 * 使用说明：
 * 需要引入 plugin.css
 */
(function($, window, undefined) {
    var methods = {
        init: function (options) {
            return this.each(function () {
                var defaultOptions = {
                    container       : $(this),                  //页码容器

                    url             : '',                       //远程数据的url
                    type            : 'GET',                    //远程请求的方式
                    data            : false,                    //远程请求的参数
                    crossDomain     : false,                    //是否跨域

                    indexField      : 'pageIndex',              //页码字段名
                    countField      : 'pageCount',              //每页条数字段名
                    dataField       : 'data',                   //json数组字段名
                    totalField      : 'total',                  //总条数字段名
                    pageIndex       : 1,                        //从第几页开始
                    pageCount       : 20,                       //每页显示多少条数据
                    pageCountArray  : [20, 40, 60, 80, 100],    //每页显示条数的选择
                    total           : 0,                        //数据总条数
                    totalPage       : 0,                        //总页数
                    bothside        : 1,                        //当前页左右两边显示的个数
                    pageInfo        : false,                    //是否显示页码信息

                    beforeSend      : function () {},           //请求之前的回调
                    complete        : function () {},           //请求完成的回调
                    success         : function () {},           //分页成功之后的回调
                    onInit          : false                     //初始化完成的回调
                }

                var settings = $.extend(true, {}, defaultOptions, options);
                
                //默认显示条数设置
                settings.pageCount = settings.pageCountArray[0] || 20;

                var pager = new Pager(settings);
                $(this).data('pager', pager);
            });
        },

        /**
         * [getOptions 获取选项]
         * @param  {[type]} option [description]
         * @return {[type]}        [description]
         */
        getOptions: function (option) {
            
        },

        /**
         * [getOptions 获取当前页]
         * @param  {[type]} option [description]
         * @return {[type]}        [description]
         */
        getPageIndex: function () {
            return this.data('pager').options.pageIndex;
        },

        /**
         * [reload 重新加载]
         * @return {[type]} [description]
         */
        reload: function (url, data) {
            var pager = this.data('pager');

            if (arguments.length == 2) {
                pager.options.url = url;
                pager.options.data = data;
            }

            pager.requestData(1, true);
        }
    };

    /**
     * [Pager 分页对象]
     * @param {[type]} settings [description]
     */
    var Pager = function (settings) {
        this.options = settings;

        this.requestData(settings.pageIndex);
    }

    /**
     * [requestData 请求数据]
     * @param  {[type]} pageIndex  [页码]
     * @param  {[type]} reloadFlag [是否是reload]
     * @return {[type]}            [description]
     */
    Pager.prototype.requestData = function (pageIndex, reloadFlag) {
        var self = this;

        var options = this.options,
            url = options.url,
            data = options.data,
            param;

        if (typeof data === 'function') {
            param = data();
        } else {
            param = $.extend(true, {}, data);
        }

        if (options.type.toUpperCase() == 'GET') {
            url += (url.indexOf("?") > -1 ? "&" : "?") + options.indexField + "=" + pageIndex + "&" + options.countField + "=" + options.pageCount;
        } else {
            param[options.indexField] = pageIndex;
            param[options.countField] = options.pageCount;
        }
        
        var ajaxOption = {
            url: url,
            type: options.type,
            data: param,
            beforeSend: options.beforeSend,
            complete: options.complete,
            success: function (res) {
                //计算总页码等信息
                options.pageIndex = pageIndex;
                options.total = res[options.totalField];
                options.totalPage = Math.ceil(options.total / options.pageCount);

                if (options.total > 0) {
                    self.initPage();
                }
                
                options.success(res, reloadFlag);
            }
        }

        //跨域处理
        if (options.crossDomain) {
            $.extend(ajaxOption, {
                dataType: 'jsonp',
                jsonp: 'callback'
            });
        }

        $.ajax(ajaxOption);
    }

    /**
     * [initPage 生成页码信息]
     * @return {[type]} [description]
     */
    Pager.prototype.initPage = function () {
        var self = this;

        var options = this.options;
        var pageCountArray = options.pageCountArray;
        var $container = options.container.empty();

        var html =  '<div class="pagination'+(options.pageInfo ? ' justify"' : '')+'">'+
                        '<div class="paging">' +
        
                            this.prevPage() +
                            this.pageList() +
                            this.nextPage() +

                        '</div>';

        if (options.pageInfo) {
            html += '<div class="pageinfo">'+
                        '共<span class="pageinfo-text">'+options.totalPage+'</span>页'+
                        '<span class="pageinfo-text">'+options.total+'</span>条数据';

            if (pageCountArray) {
                html += '<span class="pageinfo-text">每页显示：</span>'+
                        '<select class="pagecount">';
                
                for (var i = 0, l = pageCountArray.length; i < l; i++) {
                    html += '<option value="'+pageCountArray[i]+'">'+pageCountArray[i]+'条</option>';
                }

                html += '</select>';
            }

            html += '</div>';
        }
                        
        html += '</div>';

        html = html.replace('<option value="'+options.pageCount+'">', '<option value="'+options.pageCount+'" selected="selected">');

        $container.append(html);

        setTimeout(function () {
            self.bindEvents();

            if (options.pageInfo) {
                $('.pagecount').uiSelect();
            }

            if (options.onInit) {
                options.onInit.call($container[0], options);
            }
        }, 0);
    },

    /**
     * [prevPage 上一页]
     * @return {[type]} [description]
     */
    Pager.prototype.prevPage = function () {
        var options = this.options,
            pageIndex = +options.pageIndex;

        if (pageIndex > 1) {
            return "<a class='paging-btn paging-btn-first' data-topage='"+(pageIndex-1)+"'>&lt;&lt;</a>";
        } else {
            return "<a class='paging-btn paging-btn-first paging-btn-disabled'>&lt;&lt;</a>";
        }
    },

    /**
     * [nextPage 下一页]
     * @return {[type]} [description]
     */
    Pager.prototype.nextPage = function () {
        var options = this.options,
            pageIndex = +options.pageIndex,
            totalPage = options.totalPage;

        if (pageIndex < totalPage) {
            return "<a class='paging-btn paging-btn-last' data-topage='"+(pageIndex+1)+"'>&gt;&gt;</a>";
        } else {
            return "<a class='paging-btn paging-btn-last paging-btn-disabled'>&gt;&gt;</a>";
        }
    },

    /**
     * [pageList 数字页码]
     * @return {[type]} [description]
     */
    Pager.prototype.pageList = function () {
        var options = this.options,
            pageIndex = +options.pageIndex,
            totalPage = options.totalPage,
            bothside = options.bothside;

        var html = "";

        if (totalPage > bothside*2+5) {       //总页数大于2n+5时才会出现省略号
            if (pageIndex > bothside+3) {       //当前页大于n+3时，只有右边有省略号
                html += "<a class='paging-btn'>1</a>";
                html += "<a class='paging-btn paging-btn-disabled'>...</span>";

                if (pageIndex+bothside+2 > totalPage) {        //右边没有省略号的情况
                    for (var i = totalPage-(bothside*2+2); i <= totalPage; i++) {
                        if (i == pageIndex) {
                            html += "<a class='paging-btn paging-btn-curr'>"+i+"</a>";
                        } else {
                            html += "<a class='paging-btn'>"+i+"</a>";
                        }
                    }
                } else {    //两边都出现省略号
                    for (var i = pageIndex-bothside; i <= pageIndex+bothside; i++) {
                        if (i == pageIndex) {
                            html += "<a class='paging-btn paging-btn-curr'>"+i+"</a>";
                        } else {
                            html += "<a class='paging-btn'>"+i+"</a>";
                        }
                    }

                    html += "<a class='paging-btn paging-btn-disabled'>...</span>";
                    html += "<a class='paging-btn'>"+totalPage+"</a>";
                }
            } else {    //左边没有省略号
                for (var i = 1; i <= bothside*2+3; i++) {
                    if (i == pageIndex) {
                        html += "<a class='paging-btn paging-btn-curr'>"+pageIndex+"</a>";
                    } else {
                        html += "<a class='paging-btn'>"+i+"</a>";
                    }
                }

                html += "<span class='paging-btn paging-btn-disabled'>...</span>";
                html += "<a class='paging-btn'>"+totalPage+"</a>";
            }
        } else {    //总页数小于等于2n+5时全部显示
            for (var i = 1; i <= totalPage; i++) {
                if (i == pageIndex) {
                    html += "<a class='paging-btn paging-btn-curr'>"+i+"</a>";
                } else {
                    html += "<a class='paging-btn'>"+i+"</a>";
                }
            }
        }

        return html;
    }

    /**
     * [bindEvents 绑定事件]
     * @return {[type]} [description]
     */
    Pager.prototype.bindEvents = function () {
        var self = this;

        var options = this.options,
            $container = options.container.off('change.pager click.pager');

        //每页显示条数切换事件
        $container.on("changed.ui.select", ".pagecount", function (e) {
            var pageCount = +e.customData[0].value;
            options.pageCount = pageCount;

            self.requestData(1, true);
        });

        //页码翻页事件
        $container.on("click.pager", ".paging-btn:not(.paging-btn-disabled, .paging-btn-curr)", function () {
            var $this = $(this),
                pageIndex = $this.data("topage") || $this.html();

            self.requestData(pageIndex, true);
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

    /**
     * [UiSelect 下拉框插件对象]
     */
    var UiSelect = function (ele, settings) {
        this.ele = $(ele);
        this.settings = settings;
        this.data = [];
        this.selectData = [];

        this.init();
    }

    /**
     * [DEFAULTS 默认配置]
     */
    UiSelect.DEFAULTS = {
        name        : '',               //作为表单的name
        data        : false,            //数据
        searchbox   : false,            //是否显示搜索框
        multiple    : false             //是否多选
    }

    /**
     * [initData 初始化数据]
     * 1、如果选项中有数据列表则直接使用该数据
     * 2、如果选项中没有数据列表则表示是从select中提取数据
     */
    UiSelect.prototype.init = function () {
        var self = this;
        var settings = this.settings;

        if (settings.data) {
            this.type = 0;
            this.data = settings.data;

            if (!settings.name) {
                settings.name = this.ele.attr('name');
            }
        } else {
            this.type = 1;

            var $select = this.ele;
            var $optgroup = $select.find('optgroup');

            settings.width = $select.outerWidth();
            settings.position = $select.position();
            settings.multiple = $select.prop('multiple');

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
        for (var i in this.data) {
            if (this.data[i].children) {
                for (var j in this.data[i].children) {
                    if (this.data[i].children[j].selected) {
                        this.selectData.push(this.data[i].children[j]);

                        if (!settings.multiple) {
                            break outloop;
                        }
                    }
                }
            } else {
                if (this.data[i].selected) {
                    this.selectData.push(this.data[i]);

                    if (!settings.multiple) {
                        break outloop;
                    }
                }
            }
        }

        //如果没有选中数据则默认选中第一个
        if (this.selectData.length == 0) {
            var d = this.data[0].children ? this.data[0].children[0] : this.data[0];
            this.selectData.push(d);
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

        var $target =  $('<div class="ui-select'+(settings.multiple ? ' multiple' : '')+'">' +
                            '<div class="ui-select-bar">' +
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
            $ele.hide().after($target);
        }

        this.target = $target;
        this.target.css('width', settings.width);
        this.createList();
        this.bindEvents();
    }

    /**
     * [createList 创建下拉列表]
     * @return {[type]} [description]
     */
    UiSelect.prototype.createList = function () {
        var settings   = this.settings;
        var data       = this.data;
        var selectData = this.selectData;
        var $target    = this.target;
        
        var $list      = $target.find('.ui-select-list').empty();

        if (data.length == 0) {
            $('<li class="disabled">无数据</li>').appendTo($list);
        } else {
            for (var i in data) {
                if (data[i].children) {
                    var label = data[i].label;
                    var children = data[i].children;
                    
                    $('<li class="optgroup">'+label+'</li>').appendTo($list);

                    for (var j in children) {
                        var d = children[j];

                        $('<li data-value="'+d.value+'">'+d.text+'</li>').appendTo($list);
                    }
                } else {
                    var d = data[i];

                    $('<li data-value="'+d.value+'">'+d.text+'</li>').appendTo($list);
                }
            }
        }

        this.setSelect(false);
    }

    /**
     * [setSelect 设置选中项]
     */
    UiSelect.prototype.setSelect = function (changeFlag) {
        var settings   = this.settings;
        var selectData = this.selectData;
        var $target    = this.target;
        var value      = [];

        var $vbox      = $target.find('.ui-select-v').empty();
        var $input     = $target.find('input[type="hidden"]');
        var $box       = $target.find('.ui-select-box');
        var $bar       = $target.find('.ui-select-bar');

        $box.find('li').removeClass('active');

        if (settings.multiple) {
            if (selectData.length == 0) {
                $vbox.append('<span class="holder">&nbsp;</span>');
            } else {
                for (var i in selectData) {
                    $vbox.append('<span class="ui-select-item">'+selectData[i].text+'<a class="ui-select-del" data-value="'+selectData[i].value+'">×</a></span>');
                    $box.find('li[data-value="'+selectData[i].value+'"]').addClass('active');
                    value.push(selectData[i].value);
                }
            }
        } else {            
            $vbox.append('<span class="ui-select-text">'+selectData[0].text+'</span>');
            $box.find('li[data-value="'+selectData[0].value+'"]').addClass('active');
            value.push(selectData[0].value);
        }

        $input.val(value.join(','));
        $box.css('top', ($bar.outerHeight()-1) + 'px');     //设置展开框的top值

        //触发changed事件
        if (changeFlag !== false) {
            var e = $.Event('changed.' + namespace, {customData: selectData.slice(0)});
            this.ele.trigger(e);
        }
    }

    /**
     * [destory 销毁DOM并显示原来的select]
     * @return {[type]} [description]
     */
    UiSelect.prototype.destory = function () {
        this.target.remove();

        if (this.type == 1) {
            this.ele.show();
        }
    }

    /**
     * [showList 展开下拉框]
     * @return {[type]} [description]
     */
    UiSelect.prototype.showList = function () {
        this.target.find('.ui-select-box').show();
        this.target.addClass('expand');
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

            if (PluginDep.browser.msie && parseInt(PluginDep.browser.version) < 9) {
                $input.trigger('propertychange');
            } else {
                $input.trigger('input');
            }
        }
    }

    /**
     * [bindEvents 绑定事件]
     * @return {[type]} [description]
     */
    UiSelect.prototype.bindEvents = function () {
        var self = this;
        var settings = this.settings;
        var $target = this.target;
        var selectData = this.selectData;

        //展开下拉框
        $target.on('click', '.ui-select-bar, .ui-select-icon', function () {
            if ($(this).parent().hasClass('multiple')) {
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
        $target.on('click', 'li:not(.optgroup, .disabled)', function () {
            var $this = $(this);
            var text = $this.text();
            var value = $this.attr('data-value');

            if (settings.multiple) {
                if ($this.hasClass('active')) {
                    for (var i in selectData) {
                        if (selectData[i].value == value) {
                            selectData.splice(i, 1);
                            break;
                        }
                    }
                } else {
                    selectData.push({
                        text: text,
                        value: value
                    });
                }

                self.setSelect();
            } else {
                self.hideList();

                if (!$this.hasClass('active')) {
                    selectData.length = 0;
                    selectData.push({
                        text: text,
                        value: value
                    });

                    self.setSelect();
                }
            }
        });
        
        //删除选中项
        $target.on('click', '.ui-select-del', function () {
            var value = $(this).attr('data-value');

            for (var i in selectData) {
                if (selectData[i].value == value) {
                    selectData.splice(i, 1);
                    break;
                }
            }

            $(this).parent().remove();
            self.setSelect();
        });

        //输入框输入筛选，propertychange不能委托
        $target.find('.ui-select-input input').on('input propertychange', inputHandle);

        function inputHandle (e) {
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
                            if (data[i].children[j].value.indexOf(val) > -1) {
                                var isExist = false;

                                for (var ele in sData) {
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
                        if (data[i].value.indexOf(val) > -1) {
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

    $.fn.uiSelect = function (option, args) {
        return this.each(function () {
            var $this = $(this);
            var data = $this.data(namespace);
            var options = $.extend(true, {}, UiSelect.DEFAULTS, $this.data(), typeof option === 'object' && option);

            if (!data) {
                $this.data(namespace, (data = new UiSelect(this, options)));
            }

            if (typeof option === 'string') {
                runFunction(data[option], args);
            }
        });
    }

    function runFunction (fn, args) {
        if (typeof fn !== 'function') {
            throw new Error(fn + ' is not a function in $().UiSelect');
        }

        fn(args);
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
    var methods = {
        init: function (options) {             
            return this.each(function() {             
                var scrollbar = new Scrollbar($(this), options);

                $(this).data('scrollbar', scrollbar);
            });
        },

        /**
         * [getOptions 获取选项]
         * @param  {[type]} option [description]
         * @return {[type]}        [description]
         */
        getOptions: function (option) {
            var options = this.data('uiSelect').options;

            if (arguments.length == 0) {
                return options;
            } else {
                return options[option];
            }
        }
    };

    var Scrollbar = function ($container, options) {
        this.def = {
            scrollbarSize   : 6,                    //滚动条粗细
            container       : $container,           //容器
            onInit          : false,                //初始化完毕回调
            onScroll        : false                 //滚动时回调
        };

        this.needScrollbar = PluginDep.isOverflow($container);

        //如果没有滚动条则不需要后续操作
        if (!this.needScrollbar) {
            return;
        }

        this.options = $.extend(true, {}, this.def, options);
        
        this.init();
        this.bindEvents();
    }

    /**
     * [init 初始化]
     * @return {[type]} [description]
     */
    Scrollbar.prototype.init = function () {
        var options = this.options;
        var $container = options.container;
        var needScrollbar = this.needScrollbar;

        this.totalH = $container[0].scrollHeight;
        this.totalW = $container[0].scrollWidth;

        $container.css({
            'position': 'relative',
            'overflow': 'hidden'
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
        var $container      = options.container;
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
(function(a){function d(b){var c=b||window.event,d=[].slice.call(arguments,1),e=0,f=!0,g=0,h=0;return b=a.event.fix(c),b.type="mousewheel",c.wheelDelta&&(e=c.wheelDelta/120),c.detail&&(e=-c.detail/3),h=e,c.axis!==undefined&&c.axis===c.HORIZONTAL_AXIS&&(h=0,g=-1*e),c.wheelDeltaY!==undefined&&(h=c.wheelDeltaY/120),c.wheelDeltaX!==undefined&&(g=-1*c.wheelDeltaX/120),d.unshift(b,e,g,h),(a.event.dispatch||a.event.handle).apply(this,d)}var b=["DOMMouseScroll","mousewheel"];if(a.event.fixHooks)for(var c=b.length;c;)a.event.fixHooks[b[--c]]=a.event.mouseHooks;a.event.special.mousewheel={setup:function(){if(this.addEventListener)for(var a=b.length;a;)this.addEventListener(b[--a],d,!1);else this.onmousewheel=d},teardown:function(){if(this.removeEventListener)for(var a=b.length;a;)this.removeEventListener(b[--a],d,!1);else this.onmousewheel=null}},a.fn.extend({mousewheel:function(a){return a?this.bind("mousewheel",a):this.trigger("mousewheel")},unmousewheel:function(a){return this.unbind("mousewheel",a)}})})(jQuery);

/**
 * [表单正则表达式验证]
 * 使用说明：
 * 需要引入 plugin.css
 */
;(function ($) {
    var namespace = 'reg';

    //失去焦点时触发验证事件
    $(document).on('blur.' + namespace, '[data-reg]', function () {
        var $this = $(this);
        var val = $this.val();
        var reg = $this.attr('data-reg').split(' ');

        reg = new RegExp(reg[0], reg[1]);

        if (reg.test(val)) {
            $this.removeClass('form-control-error');
        } else {
            $this.addClass('form-control-error');
        }

        var e = $.Event('validate.' + namespace, {customData: reg.test(val)});
        $this.trigger(e);
    });
})(jQuery);

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
        if (typeof options === 'object') {
            this.settings = $.extend(true, {}, Gallery.DEFAULTS, options);
        } else if ($.isArray(options)) {
            this.settings = $.extend(true, {}, Gallery.DEFAULTS, {imgArr: options});
        } else {
            $.error('参数不正确！');
        }

        this.init();
    }

    /**
     * [DEFAULTS 默认配置]
     */
    Gallery.DEFAULTS = {
        index       : 0,        //默认显示第一个
        clickhide   : true,     //默认点击空白处隐藏
        animation   : 'fade',   //默认动画类型为fade
        zoomScale   : 1.25      //放大缩小倍数
    }

    /**
     * [init 初始化]
     * @return {[type]} [description]
     */
    Gallery.prototype.init = function () {
        var settings = this.settings;
        this.scale = 100;
        this.rotate = 0;

        if ($('#Gallery').length == 0) {
            var html =  '<div id="Gallery" class="gallery '+settings.animation+'">'+
                            '<div class="gallery-screen"></div>'+
                            '<a class="gallery-close"></a>'+
                            '<a class="gallery-prev"></a>'+
                            '<a class="gallery-next"></a>'+
                            '<div class="gallery-imgbox">'+
                                '<img src="" class="gallery-img" />'+
                            '</div>'+
                            '<div class="gallery-toolbar">'+
                                '<div class="gallery-toolbar-mask"></div>'+
                                '<span class="gallery-bar-btn">'+
                                    '<a class="gallery-icon gallery-zoomin" title="放大"><i></i></a>'+
                                    '<label class="gallery-zoomScale"></label>'+
                                    '<a class="gallery-icon gallery-zoomout" title="缩小"><i></i></a>'+
                                '</span>'+
                                '<span class="gallery-bar-btn">'+
                                    '<a class="gallery-icon gallery-origin" title="原始尺寸"><i></i></a>'+
                                '</span>';

            if (!PluginDep.browser.msie || parseInt(PluginDep.browser.version) > 8) {
                html +=         '<span class="gallery-bar-btn">'+
                                    '<a class="gallery-icon gallery-rotate" title="旋转"><i></i></a>'+
                                '</span>';
            }

            html +=         '</div>'+ 
                        '</div>';
            
            this.ele = $(html).appendTo('body');
        } else {
            this.ele = $('#Gallery');
        }

        var self = this;
        setTimeout(function () {
            //设置行高
            var $imgbox = self.ele.find('.gallery-imgbox');
            $imgbox.css('line-height', $imgbox.height() + 'px');
        });

        this.show();
        this.setImgSrc();
        this.bindEvents();
        this.cacheImg();
    }

    /**
     * [setImgSrc 设置图片]
     */
    Gallery.prototype.setImgSrc = function () {
        var imgArr = this.settings.imgArr;
        var index = this.settings.index;
        var $ele = this.ele;
        var $img = $ele.find('.gallery-img');
        var img = new Image();

        this.scale = 100;
        this.roteate = 0;
        this.rotateImg();
        $ele.find('.gallery-zoomScale').text(this.scale + '%');
        $img.attr('src', './img/ajaxloading.gif');

        img.onload = function () {
            $img.attr('src', this.src);
            $img.attr('width', this.width);
            $img.attr('height', this.height);
            $img.data('origin-width', this.width);
            $img.data('origin-height', this.height);
        }

        img.src = imgArr[index];
    }

    /**
     * [cacheImg 缓存图片]
     * @return {[type]} [description]
     */
    Gallery.prototype.cacheImg = function () {
        var imgArr = this.settings.imgArr;

        for (var i in imgArr) {
            new Image().src = imgArr[i];
        }
    }

    /**
     * [show 关闭查看器]
     * @return {[type]} [description]
     */
    Gallery.prototype.show = function () {
        PluginDep.hideBodyScrollbar();
        this.ele.show();
        this.ele[0].offsetWidth;        //force reflow，否则动画无效
        this.ele.addClass('in');
    }

    /**
     * [hide 显示查看器]
     * @return {[type]} [description]
     */
    Gallery.prototype.hide = function () {
        var self = this;

        this.ele.removeClass('in');
        setTimeout(function () {
            self.ele.hide();
            PluginDep.resetBodyScrollbar();
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
        var h = $img.attr('origin-height');

        $label.text(this.scale + '%');
        $img.attr('width', w * this.scale / 100);
        $img.attr('height', h * this.scale / 100);
    }

    /**
     * [rotateImg 旋转图片]
     * @return {[type]} [description]
     */
    Gallery.prototype.rotateImg = function () {
        var $img = this.ele.find('.gallery-img');
        var transform = ['webkitTransform', 'mozTransform', 'msTransform', 'transform'];

        for (var i in transform) {
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

        //点击空白处是否关闭查看器
        if (settings.clickhide) {
            $ele.on('click', '.gallery-screen', function () {
                self.hide();
            });
        }

        //上一张图片
        $ele.on('click', '.gallery-prev', function () {
            settings.index--;

            if (settings.index < 0) {
                settings.index = settings.imgArr.length - 1;
            }

            self.setImgSrc();
        });

        //下一张图片
        $ele.on('click', '.gallery-next', function () {
            settings.index++;

            if (settings.index == settings.imgArr.length) {
                settings.index = 0;
            }

            self.setImgSrc();
        });

        //图片尺寸调整事件
        $ele.on('click', '.gallery-zoomin, .gallery-zoomout, .gallery-origin', function () {
            var zoomScale = settings.zoomScale;

            if ($(this).hasClass('gallery-zoomin')) {     //放大
                self.scale = Math.round(self.scale*zoomScale);
            } else if ($(this).hasClass('gallery-zoomout')) {   //缩小
                self.scale = Math.round(self.scale/zoomScale);
            } else {    //原始尺寸
                self.scale = 100;
            }

            self.setImgSize();
        });

        //旋转图片
        $ele.on('click', '.gallery-rotate', function () {
            self.rotate = (self.rotate + 90) % 360;
            self.rotateImg();
        });
    }

    $.gallery = function (options) {
        return new Gallery(options);
    }

    // Gallery DATA-API
    $(document).ready(function () {
        $('[data-uitype="'+pName+'"] li a').click(function () {
            var imgArr = [];
            var $ul = $(this).parent().parent();
            var index = $(this).parent().index();

            $ul.find('li').each(function(index, el) {
                imgArr.push($(el).find('img').attr('data-origin-src') || $(el).find('img').attr('src'));
            });

            var options = $.extend(true, {}, Gallery.DEFAULTS, {
                imgArr: imgArr,
                index: index
            }, $ul.data());

            $ul.data(namespace, $.gallery(options));

            return false;
        });
    });
})(jQuery);
