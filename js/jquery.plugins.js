/**
 * jQuery 插件集
 * @author helin
 */

/**
 * [自动生成表格插件]
 * 使用说明：
 * 需要引入 common.css
 * 示例：
 * $(".container").table({
        url: "https://api.douban.com/v2/movie/top250",
        indexField: "start",
        countField: "count",
        pageIndex: 1,
        dataField: "subjects",
        colOptions: [{
            name: 'ID',
            field: 'id'
        }],
        tableClass: "table-bordered table-hover"
    });
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
                    maxHeight       : false,                    //table容器高度
                    checkbox        : false,                    //是否显示checkbox
                    colOptions      : [],                       //列设置

                    /*
                     * colOptions格式：[{
                     *     name: 'ID',                          //列显示名称
                     *     field: 'id',                         //列字段
                     *     width: 100,                          //列宽
                     *     sort: {
                     *         sname: 'id',                     //排序字段
                     *         sorder: 'asc',                   //排序方式，asc升序，desc降序
                     *         stype: ''                        //排序类型，如果指定此字段则为本地排序
                     *     }
                     *     handler: function (data, rowData) {  //列处理函数，在改列的所有数据
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

        var html =  '<div class="table-container" id="'+options.tableID+'">' + 
                        '<div class="table-drag-line">&nbsp;</div>' +
                        '<div class="ajax-loading"></div>' +
                        '<div class="table-thead"' + (maxHeight ? ' style="padding-right: 20px;"' : '') + '>'+
                            '<table class="table ' + options.tableClass + '">' + 
                                thead + 
                            '</table>' +
                        '</div>'+
                        '<div class="table-tbody"' + (maxHeight ? ' style="max-height: '+maxHeight+'px; padding-right: 20px;"' : '') + '></div>'+
                    '</div>' +
                    '<div id="'+options.tableID+'_pager" class="table-pager"></div>';

        $container.append(html);

        setTimeout(function () {
            var w1 = $container.find('.table-thead .table').width();
            var w2 = $container.find('.table-thead').width() - 1;

            if (w1 < w2) {
                $container.find('.table-thead .table').width(w2);
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

        $container.find('.table-pager').pager({
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
                var height = $container.find('.table-tbody').height();

                if (!height) {
                    $container.find('.table-tbody').css('min-height', '200px');
                }

                $container.find(".ajax-loading").show();
            },
            complete        : function () {         //隐藏加载框
                $container.find('.table-tbody').css('min-height', '0');

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

        var tbody = this.initTbody();

        var html =  '<table class="table ' + options.tableClass + '">' + 
                        tbody +
                    '</table>';

        $container.find('.table-tbody .table').remove();
        $(html).appendTo($container.find('.table-tbody'));

        setTimeout(function () {
            //计算表格宽度
            var $ths = $container.find('.table-thead .holder th');
            var $tds = $container.find('.table-tbody .holder td');
            var w;

            for (var i = 0, l = $ths.length; i < l; i++) {
                w = $ths.eq(i).width();

                $tds.eq(i).width(w);
                $ths.eq(i).width(w);
            }

            w = $container.find('.table-thead .table').width();

            $container.find('.table-thead .table, .table-tbody .table').width(w);

            //最后一列拖动条隐藏颜色，解决边框加宽的问题
            $container.find('.table-th-resize:last').addClass('table-th-resize-transparent');

            //去掉第一行的上边框
            $('.table-container .table-tbody .table-tr:first td').css('border-top', '0');

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

        if (!colOptions || colOptions.length == '') {
            return '';
        }

        var colLen = colOptions.length;
        var html = '<thead>';

        for (var k = 0; k < 2; k++) {
            html += '<tr class="' + (k == 0 ? 'holder' : 'table-tr') + '">';

            for (var i = options.checkbox ? -1 : 0; i < colLen; i++) {
                if (k == 0) {
                    if (i == -1) {
                        html += '<th style="height: 0px; width: 40px;"></th>';
                        continue;
                    }

                    html += '<th style="height: 0px; '+(colOptions[i].width ? ' width: '+colOptions[i].width+'px;' : '')+'"></th>';
                } else {
                    if (i == -1) {
                        html += '<th class="table-th table-th-checkbox" onselectstart="return false;">'+
                                    '<input type="checkbox" />'+
                                '</th>';
                        continue;
                    }

                    var s = '', sort = colOptions[i].sort;

                    if (sort) {
                        sort.sorder = sort.sorder || 'asc';
                        s += ' data-sname="' + sort.sname + '"' + ' data-sorder="' + sort.sorder + '"';
                    }

                    html += '<th class="table-th' + (colOptions[i].sort ? ' table-sort' : '') + '"' + s + ' onselectstart="return false;">'+
                                '<div class="table-th-resize">&nbsp;</div>'+
                                '<div class="table-th-text">'+
                                    colOptions[i].name+
                                    (colOptions[i].sort ? '<span class="table-th-icon"></span>' : '')+
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
        
        if (dataLen == 0) {
            var html = '<tbody><tr><td colspan="' + colLen + '" align="center">无结果</td></tr></tbody>';

            return html;
        }

        var i, j;

        if (!colOptions || colLen == 0) {    //不限制字段
            var html = '<tbody>';

            for (i = 0; i < dataLen; i++) {
                html += '<tr class="table-tr">';

                if (options.checkbox) {
                    html += '<td class="table-td table-td-checkbox" onselectstart="return false;">'+
                                '<input type="checkbox" />'+
                            '</td>';
                }

                for (var attr in dataList[i]) {
                    html += '<td class="table-td" data-row="'+i+'" data-col="'+j+'">'+
                                '<div class="table-td-text">'+(dataList[i][attr] || '')+'</div>'+
                            '</td>';
                }

                html += '</tr>';
            }

            html += '</tbody>';

            return html;
        }

        var html = '<tbody><tr class="holder">';

        for (var i = options.checkbox ? -1 : 0; i < colLen; i++) {
            if (i == -1) {
                html += '<td style="height: 0px; width: 40px;"></td>';
                continue;
            }

            html += '<td style="height: 0px;"></td>';
        }

        html += '</tr>';

        for (i = 0; i < dataLen; i++) {
            var data = dataList[i];

            html += '<tr class="table-tr">';

            if (options.checkbox) {
                html += '<td class="table-td table-td-checkbox" onselectstart="return false;">'+
                            '<input type="checkbox" />'+
                        '</td>';
            }

            for (j = 0; j < colLen; j++) {
                var option = colOptions[j];

                if (typeof colOptions[j].handler === 'function') {
                    data[option.field] = option.handler(data[option.field], data);
                }

                html += '<td class="table-td" data-row="'+i+'" data-col="'+j+'">'+
                            '<div class="table-td-text">' + (data[option.field] || '') + '</div>'+
                        '</td>';
            }

            html += '</tr>';
        }

        html += '</tbody>';

        return html;
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

        //固定表头滚动
        $container.find('.table-tbody').on('scroll', function (e) {
            var scrollLeft = this.scrollLeft;
            
            $container.find('.table-thead table').css('left', -scrollLeft);
        });

        var oldX, oldLeft;
        var $th, $td;

        //列宽度拖动，mousedown->mousemove->mouseup
        $container.on('mousedown', '.table-th-resize', function (e) {
            var index = $(this).parent().index();

            $('body').addClass('table-drag');

            $th = $container.find('.holder th').eq(index);
            $td = $container.find('.holder td').eq(index);
            oldX = e.clientX;
            oldLeft = 0;

            for (var i = 0; i < index + 1; i++) {
                oldLeft += $container.find('.holder th').eq(i).width();
            }

            $container.find('.table-drag-line').css('left', oldLeft).show();

            return false;
        });

        $container.on('click', '.table-th-resize', function () {
            return false;
        });

        $(document).off('mousemove.drag').on('mousemove.drag', '.table-drag', function (e) {
            var dragWidth = e.clientX - oldX;
            var left = oldLeft + dragWidth - $container.find('.table-tbody').scrollLeft();

            if (left < 0) {
                left = 0;
            }

            if (left > $container.find('.table-thead').width()) {
                left = $container.find('.table-thead').width();
            }

            $container.find('.table-drag-line').css('left', left);

            return false;
        });

        $(document).off('mouseup.drag').on('mouseup.drag', function (e) {
            if ($('.table-drag').length == 0) {
                return true;
            }

            var dragWidth = e.clientX - oldX;

            $th.width($th.width() + dragWidth);
            $td.width($td.width() + dragWidth);

            $('.table-drag').removeClass('table-drag');
            $container.find('.table-drag-line').hide();
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
})(jQuery, window, undefined);

/**
 * [Pager 分页插件]
 * 使用说明：
 * 需要引入 plugin.css
 * 示例：
    $(selector).pager({
        url         : '',               //请求的url，必需
        type        : 'GET',            //请求方式，默认为GET
        param       : {},               //请求的参数
        crossDomain : false,            //是否跨域，默认为false
        indexField  : 'pageIndex',      //页码索引的字段名，默认为pageIndex
        countField  : 'pageCount',      //每页多少条数据的字段名，默认为pageCount
        dataField   : 'data',           //返回数据中数据列表的字段名
        totalField  : 'total',          //返回数据中总数的字段名
        pageIndex   : 1,                //请求第几页，默认为第一页
        pageCount   : 20,               //每页多少条数据，默认为20条
        bothside    : 1,                //当前页码两边显示多少个页码按钮，默认为1
        pageInfo    : false,            //是否显示分页信息，默认为false
        beforeSend  : function () {},   //请求开始前回调
        complete    : function () {},   //请求完成回调
        success     : function (res) {} //请求成功回调
    });
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

                self.initPage();
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
            return "<a class='btn btn-first' data-topage='"+(pageIndex-1)+"'>&lt;&lt;</a>";
        } else {
            return "<a class='btn btn-first btn-disabled'>&lt;&lt;</a>";
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
            return "<a class='btn btn-last' data-topage='"+(pageIndex+1)+"'>&gt;&gt;</a>";
        } else {
            return "<a class='btn btn-last btn-disabled'>&gt;&gt;</a>";
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
                html += "<a class='btn'>1</a>";
                html += "<a class='btn btn-disabled'>...</span>";

                if (pageIndex+bothside+2 > totalPage) {        //右边没有省略号的情况
                    for (var i = totalPage-(bothside*2+2); i <= totalPage; i++) {
                        if (i == pageIndex) {
                            html += "<a class='btn btn-curr'>"+i+"</a>";
                        } else {
                            html += "<a class='btn'>"+i+"</a>";
                        }
                    }
                } else {    //两边都出现省略号
                    for (var i = pageIndex-bothside; i <= pageIndex+bothside; i++) {
                        if (i == pageIndex) {
                            html += "<a class='btn btn-curr'>"+i+"</a>";
                        } else {
                            html += "<a class='btn'>"+i+"</a>";
                        }
                    }

                    html += "<a class='btn btn-disabled'>...</span>";
                    html += "<a class='btn'>"+totalPage+"</a>";
                }
            } else {    //左边没有省略号
                for (var i = 1; i <= bothside*2+3; i++) {
                    if (i == pageIndex) {
                        html += "<a class='btn btn-curr'>"+pageIndex+"</a>";
                    } else {
                        html += "<a class='btn'>"+i+"</a>";
                    }
                }

                html += "<span class='btn btn-disabled'>...</span>";
                html += "<a class='btn'>"+totalPage+"</a>";
            }
        } else {    //总页数小于等于2n+5时全部显示
            for (var i = 1; i <= totalPage; i++) {
                if (i == pageIndex) {
                    html += "<a class='btn btn-curr'>"+i+"</a>";
                } else {
                    html += "<a class='btn'>"+i+"</a>";
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
        $container.on("change.pager", ".pagecount", function () {
            var pageCount = +$(this).val();
            options.pageCount = pageCount;

            self.requestData(1, true);
        });

        //页码翻页事件
        $container.on("click.pager", ".btn:not(.btn-disabled, .btn-curr)", function () {
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
 * 使用方法一：
 * html：
 *  <select name="sex" >
 *      <option value="1">man</option>
 *      <option value="2">woman</option>
 *  </select>
 * js：
 * $('select').uiSelect();
 */
(function($, window, undefined) {
    var methods = {
        init: function (options) {             
            return this.each(function() {
                var defaultOptions = {
                    upExpand: false,            //是否向上展开
                    insertDir: 'after',         //差入方向
                }

                var settings = $.extend(true, {}, defaultOptions, options);

                var uiSelect = new UiSelect($(this), settings);
                $(this).data('uiSelect', uiSelect);
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
        },

        /**
         * [destory 销毁组件]
         * @return {[type]} [description]
         */
        destory: function () {
            return this.each(function () {
                $(this).data('uiSelect').destory();
            });
        }
    };

    /**
     * [UiSelect 下拉框对象]
     * @param {[type]} $select  [description]
     * @param {[type]} settings [description]
     */
    var UiSelect = function ($select, settings) {
        this.options = $.extend({
            select: $select,
            width: $select.outerWidth(),
            position: $select.position()
        }, settings);

        this.initDom();
    }

    /**
     * [initDom 生成DOM]
     * @return {[type]} [description]
     */
    UiSelect.prototype.initDom = function () {
        var self = this;

        var options = this.options,
            $select = options.select,
            width = options.width;

        var $html = $('<span class="ui-select">' +
                        '<span class="default">' + 
                            '<i>▼</i>' +
                            '<span></span>' +
                        '</span>' +
                        '<ul class="menulist"></ul>' +
                    '</span>');

        if ($select.css('display') == 'none') {
            $html.css('display', 'none');
        }

        if (options.insertDir == 'before') {
            $select.hide().before($html);
        } else {
            $select.hide().after($html);
        }
        

        //保存新的select
        this.options.newSelect = $html;

        //声明变量
        var $list       = $html.find('ul'),
            $default    = $html.find('.default'),
            $span       = $default.find('span'),
            $label      = $default.find('label');

        $optgroup = $select.find('optgroup');

        //将option遍历到li中
        if ($optgroup.length > 0) {
            $optgroup.each(function () {
                var label = $(this).attr('label');
                var $options = $(this).children('option');

                //optgroup
                $('<li class="optgroup">'+label+'</li>').appendTo($list);

                $options.each(function () {
                    var $option = $(this);

                    $li = $('<li data-val="'+$option.val()+'">'+$option.text()+'</li>').appendTo($list);

                    if ($option.prop('selected') === true) {    //选中的项
                        $select.val($option.val());
                        $span.text($option.text());
                        $li.addClass('active');
                    }
                })
            });
        } else {
            //将option遍历到li中
            $select.find('option').each(function () {
                var $option = $(this);

                $li = $('<li data-val="'+$option.val()+'">'+$option.text()+'</li>').appendTo($list);

                if ($option.prop('selected') === true) {    //选中的项
                    $select.val($option.val());
                    $span.text($option.text());
                    $li.addClass('active');
                }
            });
        }
        
        //如果没有选中的项，则默认选中第一个
        if ($span.text() === '') {
            var $li = $list.find('li:not(.optgroup)').first();
            $select.val($li.attr('val'));
            $span.text($li.text());
        }

        //判断盒子模型，判断宽度是否包含边框
        if ($html.css('box-sizing') == 'border-box') {
            width -= 2;
        }

        //计算宽度
        $html.width(width);
        $list.width(width);

        //计算高度
        if (!options.upExpand && $(window).height() - options.position.top - $list.outerHeight() < 0) {
            options.upExpand = true;

            $list.css('top', -$list.outerHeight() + 'px');
        } else {
            options.upExpand = false;

            $list.css('top', $default.outerHeight() + 'px');
        }

        setTimeout(function () {
            self.bindEvents();
        }, 0);
    }

    /**
     * [destory 销毁DOM]
     * @return {[type]} [description]
     */
    UiSelect.prototype.destory = function () {
        var options = this.options,
            $select = options.select,
            $newSelect = options.newSelect;

        $newSelect.remove();
        $select.show();
    }

    /**
     * [bindEvents 绑定事件]
     * @return {[type]} [description]
     */
    UiSelect.prototype.bindEvents = function () {
        var options = this.options,
            $select = options.select,
            $newSelect = options.newSelect;

        var $default = $newSelect.find('.default'),
            $list    = $newSelect.find('ul'),
            $span    = $default.find('span'),
            $label   = $default.find('label');

        //展开下拉框
        $default.click(function (event) {
            //阻止事件冒泡
            if(!$list.find('li').length) {
                return;
            }

            $list.fadeToggle(100);

            event.stopPropagation();
        });
        
        //选中下拉框选项
        $list.find('li:not(.optgroup)').click(function () {
            var $li = $(this);

            $span.text($li.text());

            if($select.val() != $li.attr('data-val')) {    //触发原select元素的change事件
                $select.val($li.attr('data-val')).change();

                $li.siblings("li").removeClass("active");
                $li.addClass("active");
            }
        });

        $list.find('li.optgroup').click(function (e) {
            e.stopPropagation();
            return false;
        })

        //隐藏下拉框
        $(document).on('click.uiSelect', function() {
            $list.hide();

            return true;
        });
    }

    $.fn.uiSelect = function (method) {
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
 * [scrollbar 滚动条插件]
 * 使用说明：
 * 需要引入 plugin.css
 * 示例：
    $(selector).scrollbar({
        scrollbarSize   : 10,           //滚动条粗细，默认为10px
        position        : ['y'],        //滚动条方向，x代表横轴，y代表纵轴（默认）
        onInit          : false         //初始化完毕回调
    });
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

    var Scrollbar = function ($target, options) {
        this.def = {
            scrollbarSize   : 10,                   //滚动条粗细
            target          : $target,              //容器
            position        : ['y'],                //滚动条方向，x代表横轴，y代表纵轴（默认）
            onInit          : false,                //初始化完毕回调
            onScroll        : false                 //滚动时回调
        };

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
        var position = options.position;
        var $target = options.target;

        //给里层元素包裹一层以便滚动
        $target.html('<div class="scroll-target">'+$target.html()+'</div>');

        var outerStyle, innerStyle, track, html = '';

        //创建滚动条
        if ($.inArray('y', position) > -1) {
            this.totalH = $target.find('.scroll-target')[0].scrollHeight;
            this.trackH = $target.height();     //滚动条轨道大小

            track = this.trackH*this.trackH / this.totalH;
            outerStyle = 'width: '+options.scrollbarSize+'px; height: '+this.trackH+'px;';
            innerStyle = 'width: 100%; height: '+track+'px; border-radius: '+(options.scrollbarSize/2)+'px;';

            html += '<div class="scrollbar scrollbar-y">'+
                        '<div class="scrollbar-outer" style="'+outerStyle+'">'+
                            '<div class="scrollbar-inner" style="'+innerStyle+'"></div>'+
                        '</div>'+
                    '</div>';
        }

        //创建滚动条
        if ($.inArray('x', position) > -1) {
            this.totalW = $target.find('.scroll-target')[0].scrollWidth;
            this.trackW = $target.width();     //滚动条轨道大小

            track = this.trackW*this.trackW / this.totalW;
            outerStyle = 'width: '+this.trackW+'px; height: '+options.scrollbarSize+'px;';
            innerStyle = 'width: '+track+'px; height: 100%; border-radius: '+(options.scrollbarSize/2)+'px;';

            html += '<div class="scrollbar scrollbar-x">'+
                        '<div class="scrollbar-outer" style="'+outerStyle+'">'+
                            '<div class="scrollbar-inner" style="'+innerStyle+'"></div>'+
                        '</div>'+
                    '</div>';
        }

        $target.append(html);

        setTimeout(function () {
            if (options.onInit) {
                options.onInit.call($target[0], options);
            }
        }, 0);
    }

    /**
     * [bindEvents 绑定事件]
     * @return {[type]} [description]
     */
    Scrollbar.prototype.bindEvents = function () {
        var _this       = this;
        var options     = this.options;
        var totalH      = this.totalH;
        var totalW      = this.totalW;
        var trackH      = this.trackH;
        var trackW      = this.trackW;
        var $container  = options.target;
        var position    = options.position;
        var $target     = $container.find(' > .scroll-target');

        $container.css({
            position: 'relative'
        });

        //鼠标滚动事件
        if ($.inArray('y', position) > -1) {
            var $innerBarY = $container.find('.scrollbar-y .scrollbar-inner');
            var h = $innerBarY.height();
            var w = $innerBarY.width();

            $container.on('mousewheel', function (event, delta) {
                //计算滚动条位置
                var top = $innerBarY.position().top - delta*h;

                if (top + h >= trackH) {
                    top = trackH-h;
                }

                if (top <= 0) {
                    top = 0;
                }

                $innerBarY.css({
                    transition: 'all 0.4s',
                    top: top + 'px'
                });

                //计算滚动条滚动的百分比，设置目标的位置
                var percent = top / (trackH - h);
                var t = (totalH - trackH) * percent;

                $target.css({
                    transition: 'all 0.4s',
                    top: -t + 'px'
                });

                options.onScroll.call($container[0], delta, options);

                event.preventDefault();
                return false;
            });
        }

        var dragX, dragY;
        var $innerBar;

        //鼠标拖拽事件
        $container.on('mousedown', '.scrollbar-inner', function (e) {
            e.preventDefault();
            e.stopImmediatePropagation();

            $innerBar = $(this);
            $innerBar.data('on_drag', true).addClass("ondrag");

            dragX = e.clientX;
            dragY = e.clientY;
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

            return false;
        });
        
        function scrollbarDrag (x, y) {
            if ($innerBar.parent().parent().hasClass('scrollbar-y')) {
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
            }

            if ($innerBar.parent().parent().hasClass('scrollbar-x')) {
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

            options.onScroll.call($container[0], delta, options);
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