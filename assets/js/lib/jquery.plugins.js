/**
 * jQuery 插件集
 * @author helin
 */
(function (factory) {
    // AMD
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'util'], factory);
    } else {
        if (typeof jQuery === 'undefined' || typeof util === 'undefined') {
            throw new Error('jquery.plugin depends on jquery, util');
        }

        factory(jQuery, util);
    }
}
(function ($, util) {
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
    var tables = [];

    /**
     * [methods 共有方法集合]
     * @type {Object}
     */
    var methods = {
        init: function (option) {
            methods.destroy.call(this);

            return this.each(function () {
                var $this = $(this);

                if (!option.colOptions || option.colOptions.length == 0) {
                    return false;
                }

                option = $.extend(true, {}, Table.DEFAULTS, option);

                $this.data(namespace, new Table($this, option));
            });
        },

        /**
         * [getRowData 获取行数据]
         * @param  {[type]} id [行号或行对象]
         * @return {[type]}    [description]
         */
        getRowData: function (id) {
            var table = this.eq(0).data(namespace);

            if (id instanceof $ || util.isDOM(id)) {
                return $(id, table.container).data('rowData');
            }

            return $('[data-rowid="'+id+'"]', table.container).data('rowData');
        },

        /**
         * [reload 重新加载表格]
         * @param  {[Number]} pageIndex [加载哪一页，默认当前页]
         */
        reload: function (pageIndex) {
            return this.each(function () {
                $(this).data(namespace).reload(pageIndex);                
            });
        },

        /**
         * [refresh 以当前数据刷新表格，改变表结构时调用]
         * @param  {Boolean} isRebuild [是否重构表结构]
         */
        refresh: function (isRebuild) {
            return this.each(function () {
                $(this).data(namespace).refresh(isRebuild);                
            });
        },

        /**
         * [getSelectedRowData 回去当前表格中选中的行数据]
         * @return {[type]} [description]
         */
        getSelectedRowData: function () {
            var ele = this.eq(0).data(namespace).ele;
            var selectedRow = [];

            ele.find('.table-td .table-checkbox:checked').each(function () {
                var data = $(this).parents('.table-tr').data('rowData');
                selectedRow.push(data);
            });

            return selectedRow;
        },

        /**
         * [setGroupHeaders 合并表头]
         */
        setGroupHeaders: function (option) {
            return this.each(function () {
                $(this).data(namespace).setGroupHeaders(option);
            });
        },

        /**
         * [destroy 销毁表格]
         */
        destroy: function () {
            return this.each(function () {
                if ($(this).data(namespace)) {
                    $(this).data(namespace).destroy();
                }
            });
        }
    }

    var Table = function (ele, setting) {
        this.ele = ele;
        this.setting = setting;
        this.id = ele.attr('id') || tables.length;

        this.initDOM();
        this.initData();        
        tables.push(this);
    }

    // 默认配置
    Table.DEFAULTS = {
        // 样式选项
        tableClass      : '',                       // 自定义table类名
        maxHeight       : false,                    // table容器最大高度
        height          : false,                    // table容器高度

        // 单元格选项
        checkbox        : false,                    // 是否显示checkbox
        rownum          : false,                    // 是否显示行号和列显示隐藏，两个功能
        rowParam        : false,                    // 行自定义参数，对象形式，支持函数返回
        colParam        : false,                    // 列自定义参数，对象形式，支持函数返回
        groupHeaders    : false,                    // 多表头设置
        colOptions      : [],                       // 列设置
        autoLoad        : true,                     // 是否自动加载数据
        autoEncode      : true,                     // 是否自动将html标记转为实体

        /*
         * colOptions格式：[{
         *     name: 'ID',                          // 列显示名称
         *     field: 'id',                         // 列字段
         *     width: false,                        // 列宽，默认自适应
         *     minWidth: false,                     // 最小列宽
         *     edit: {                              // 是否可编辑，默认为false
         *         replace: '<input />',            // 编辑元素
         *         callback: function () {},        // 编辑回调函数
         *     },
         *     headerAlign: false,                  // 表头对齐方式，如果为false则取align值
         *     align: false,                        // 对齐方式
         *     hide: false,                         // 是否显示列
         *     fixed: false,                        // 是否固定列不被隐藏
         *     menu: {                              // 列操作菜单
         *         sort: {                          // 排序
         *             async: true,                 // 是否远程排序
         *             type: '',                    // 本地排序时需要指定类型
         *             defaultOrder: 'asc'          // 默认排序方式
         *         },
         *         filter: {                        // 筛选
         *             async: true                  // 是否远程筛选
         *         }
         *     },
         *     handler: function (value, data) {    // 列处理函数，在该列的所有数据
         *                                          // 都会被此函数处理，一定要返回数据
         *         return value;
         *     },
         * }]
         */
        
        dataList            : [],                   // 本地数组数据

        // 远程请求选项
        url                 : '',                   // 远程获取数据url
        type                : 'GET',                // 请求方式
        data                : false,                // 请求数据，json或function
        dataType            : 'json',               // 返回数据类型
        jsonp               : 'callback',           // 跨域回调函数名称
        dataField           : 'data',               // json数组字段名,

        // 分页选项
        paging              : {
            enable          : false,                // 是否启用分页
            localPage       : false,                // 是否本地分页
            indexField      : 'pageIndex',          // 页码字段名
            sizeField       : 'pageSize',           // 每页条数字段名
            totalField      : 'total',              // 总条数字段名
            pageIndex       : 1,                    // 从第几页开始
            pageSize        : 20,                   // 每页显示多少条数据
            pageInfo        : true,                 // 是否显示页码信息
            pageLength      : 5,                    // 显示的页码数
            pageSizeArray   : false,                // 每页显示多少条数据的选择数组
            skipPage        : true                  // 是否启用跳页
        },

        // 表头操作
        resizable           : true,                 // 是否可拖动列宽
        snameField          : 'sname',              // 排序字段字段名
        sorderField         : 'sorder',             // 排序方式字段名
        ascField            : 'asc',                // 升序标识名
        descField           : 'desc',               // 降序标识名
        filterField         : 'filter',             // 筛选字段名称
        keywordField        : 'keyword',            // 关键字字段名称
            
        //回调函数
        onInit              : false,                // 表格数据初始化完成
        beforeSend          : false,                // 请求发送前回调
        error               : false,                // 请求错误回调
        complete            : false                 // 请求完成回调
    }

    /**
     * [initDOM 构建组件DOM结构]
     */
    Table.prototype.initDOM = function () {
        var setting = this.setting;
        var ele = this.ele;
        var html =  
            '<div class="table-container">' + 
                '<div class="table-drag-line">&nbsp;</div>' +
                (setting.tableCaption ? '<div class="table-caption"><a class="op_cl"><span></span></a><span>' + setting.tableCaption + '</div>' : '') +
                '<div class="table-head">'+
                    '<table class="table ' + setting.tableClass + '">' + 
                        '<thead>' + this.initHolder() + this.initThead() + '</thead>'+
                    '</table>' +
                '</div>'+
                '<div class="table-body">' +
                    '<div class="table-loading">努力加载中...</div>'+
                    '<table class="table table-hover ' + setting.tableClass + '">' + 
                        '<thead>' + this.initHolder() + '</thead>' +
                    '</table>' +
                '</div>' +
                (setting.paging.enable ? '<div class="table-pager"></div>' : '') +
            '</div>';

        ele.html(html);
        this.menu = $('<ul class="ui-menu"></ul>').appendTo('body');

        // 设置列索引
        var ths = ele.find('.table-head .table-th');
        for (var i = 0, l = ths.length; i < l; i++) {
            ths.eq(i).attr('data-index', i);
        }

        //执行多列参数设置
        if (setting.groupHeaders) {
            this.setGroupHeaders(setting.groupHeaders);
        }
    }

    /**
     * [initData 初始化数据]
     */
    Table.prototype.initData = function () {
        var setting = this.setting;

        if (setting.autoLoad) {
            if (setting.url) {
                this.requestData(1);
            } else {
                // 备份数据
                this.dataList = setting.dataList.slice(0);
                this.createTbody();
            }
        } else {
            this.dataList = [];
            this.createTbody(false);
        }        
    }

    /**
     * [requestData 加载远程数据]
     */
    Table.prototype.requestData = function (pageIndex) {
        var self = this;
        var setting = this.setting;
        var paging = setting.paging;
        var ele = this.ele;
        var colOptions = setting.colOptions;
        var data;

        if (typeof setting.data === 'function') {
            var retData = setting.data();

            if (retData === false) {
                return;
            }

            data = $.extend(true, {}, retData);
        } else {
            data = $.extend(true, {}, setting.data);
        }

        // 如果有排序则添加
        if (this.sname && this.sorder && this.sasync) {
            data[setting.snameField] = this.sname;
            data[setting.sorderField] = this.sorder;
        }

        // 如果有筛选则添加
        if (this.filterName) {
            data[setting.filterField] = this.filterName;
            data[setting.keywordField] = this.keyword;
        }

        var ajaxOpt;
        var beforeSendFn = setting.beforeSend || function () {
            // 如果tbody有高度，则加载框显示
            if (ele.find('.table-body').height()) {
                ele.find('.table-loading').show();
            }
        };
        var completeFn = setting.complete || function () {
            // 隐藏加载框
            ele.find('.table-loading').hide();
        }

        if (paging.enable) {
            if (this.pager) {
                this.pager.pager('reload', pageIndex, data);
            } else {
                ajaxOpt = {
                    url             : setting.url,
                    type            : setting.type,
                    data            : data,
                    dataType        : setting.dataType,
                    jsonp           : setting.jsonp,
                    dataField       : setting.dataField,
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
                    beforeSend      : beforeSendFn,
                    complete        : completeFn,
                    success         : function (dataList) {                        
                        // 备份数据
                        self.dataList = dataList;
                        setting.dataList = dataList.slice(0);
                        self.createTbody();
                    },
                    error           : setting.error
                }

                this.pager = ele.find('.table-pager').pager(ajaxOpt);
            }
        } else {
            ajaxOpt = {
                url             : setting.url,
                type            : setting.type,
                data            : data,
                dataType        : setting.dataType,
                jsonp           : setting.jsonp,
                beforeSend      : beforeSendFn,
                complete        : completeFn,
                success         : function (res) {                    
                    // 备份数据
                    self.dataList = (setting.dataField ? res[setting.dataField] : res) || [];                    
                    setting.dataList = self.dataList.slice(0);
                    self.createTbody();
                },
                error: setting.error
            }

            $.ajax(ajaxOpt);
        }
    }

    /**
     * [createTbody 生成表格体]
     * @return {[type]} [description]
     */
    Table.prototype.createTbody = function (showEmptyMsg) {
        var ele = this.ele;
        showEmptyMsg = showEmptyMsg !== undefined ? showEmptyMsg : true;
        
        ele.find('.table-body .table tbody').remove();

        if (this.dataList.length == 0) {
            if (showEmptyMsg) {
                this.initError('无数据');
            }
            this.initTable();
            return;
        }

        ele.find('.table-body .table').append(this.initTbody());
        ele.find('.table-body').scrollTop(0);
        // ele.find('.table-body').scrollLeft(0);

        this.initTable();
    }

    /**
     * [initTable 初始化表格，包括计算列宽，绑定事件等]
     * @return {[type]} [description]
     */
    Table.prototype.initTable = function () {
        var self = this;
        var setting = this.setting;
        var colOptions = setting.colOptions;
        var ele = this.ele;

        setTimeout(function () {
            var thead = ele.find('.table-head');
            var tbody = ele.find('.table-body');
            var theadHeight = thead.outerHeight(true);
            var tbodyHeight = tbody.outerHeight(true);
            var tpageHeight = ele.find('.table-pager').outerHeight(true);
            var sWidth = util.scrollBarWidth();

            // 设置最大高度
            if (setting.maxHeight) {
                tbody.css('max-height', setting.maxHeight - theadHeight - tpageHeight);
            }

            // 设置高度
            if (setting.height) {
                tbody.css('height', setting.height - theadHeight - tpageHeight);
            }

            var tbodyTable = tbody.find('.table');
            var theadLastTh = thead.find('.holder th:visible:last');

            // 还原最后一列列宽
            if (thead.data('minusWidth')) {
                var w = Math.max(parseInt(theadLastTh[0].style.width) || theadLastTh.width(), 40);

                theadLastTh.width(w + sWidth);
                thead.css('padding-right', 1);
                tbody.css('padding-right', 1);
                thead.removeData('minusWidth');
            }

            // 出现竖直滚动条则设置padding-right
            if (tbodyTable.outerHeight() > tbody.outerHeight()) {
                var w = Math.max(parseInt(theadLastTh[0].style.width) || theadLastTh.width(), 40);

                theadLastTh.width(w - sWidth);
                thead.css('padding-right', sWidth + 1);
                tbody.css('padding-right', sWidth + 1);
                thead.data('minusWidth', true);
            } else {
                tbody.css('max-height', 'none');
            }

            // 解决IE8下高度会在最大高度基础上加上滚动条高度的bug
            if (util.browser.msie && util.browser.version < 9 && tbody.getCss('max-height') && tbodyTable.outerWidth() > tbody.outerWidth()) {
                tbody.css('max-height', tbody.getCss('max-height') - sWidth);
            }

            // 计算表格宽度
            var theadThs = ele.find('.table-head .holder th');
            var tbodyThs = ele.find('.table-body .holder th');
            var w = 0, totalW = 0, fieldIndex, minWidth;

            for (var i = 0, l = theadThs.length; i < l; i++) {
                fieldIndex = theadThs.eq(i).data('field-index');
                minWidth = typeof fieldIndex != 'undefined' ? colOptions[fieldIndex].minWidth || 0 : 0;
                w = Math.max(parseInt(theadThs[i].style.width) || theadThs.eq(i).width(), 40, minWidth);

                if (theadThs.eq(i).is(':visible')) {
                    totalW += w;
                }

                tbodyThs.eq(i).width(w);
                theadThs.eq(i).width(w);
            }

            // 设置总宽度防止拖动时变形
            ele.find('.table').css('width', totalW);

            if (util.browser.msie) {
                ele.find('.table-th-resize').each(function () {
                    $(this).height($(this).parent().outerHeight());
                });
            }

            // 设置拖动线高度
            ele.find('.table-drag-line').height(ele.height() - tpageHeight);

            // 如果绑定过事件的话不需要再次绑定
            if (!self.isBindedEvent) {
                self.bindEvents();
            }

            if (setting.onInit) {
                setting.onInit.call(ele[0], setting);
            }
        }, 10);
    }

    /**
     * [initHolder 生成占用行]
     * @return {[type]} [description]
     */
    Table.prototype.initHolder = function () {
        var setting = this.setting;
        var colOptions = setting.colOptions;

        var html = '<tr class="holder">';

        // 复选框
        if (setting.checkbox) {
            html += '<th style="width: 40px;" data-width="40px"></th>';
        }

        // 行号
        if (setting.rownum) {
            html += '<th style="width: 40px;" data-width="40px"></th>';
        }

        for (var i = 0, l = colOptions.length; i < l; i++) {
            var col = colOptions[i];
            var style = '';
            var attr = '';

            if (col.hide) {
                continue;
            }

            if (col.width) {
                if (util.isNumber(col.width, true)) {
                    style = ' style="width: ' + col.width + 'px;"';
                    attr = ' data-width="' + col.width + 'px"';
                } else {
                    style = ' style="width: ' + col.width + ';"';
                    attr = ' data-width="' + col.width + '"';
                }
            }

            html += '<th' + style + attr + ' data-field-index="' + i + '"></th>';     
        }

        html += '</tr>';

        return html;
    }

    /**
     * [initThead 生成表头]
     * @return {[type]} [description]
     */
    Table.prototype.initThead = function () {
        var setting = this.setting;
        var colOptions = setting.colOptions;

        var html = '<tr class="table-tr">';

        // 行号
        if (setting.rownum) {
            html += '<th class="table-th" style="text-align: center;">'+
                        '<div class="table-col-display" title="显示隐藏列">' +
                            '<i class="glyphicon glyphicon-th"></i>' +
                        '</div>'+
                    '</th>';
        }

        // 复选框
        if (setting.checkbox) {
            html += '<th class="table-th" style="text-align: center;">'+
                        '<div class="table-th-text">' +
                            '<input class="table-checkbox" type="checkbox" />'+
                        '</div>' +
                    '</th>';
        }

        for (var i = 0, l = colOptions.length; i < l; i++) {
            var col = colOptions[i];
            var menu = col.menu;
            var attr = ' data-field="' + col.field + '" data-field-index="' + i + '"';
            var colClass = '';

            if (col.hide) {
                continue;
            }

            if (menu) {
                colClass = ' table-menu';

                if (menu.sort) {
                    colClass += ' table-sort';
                    if (menu.sort === true) {
                        menu.sort = {
                            enable: true,
                            async: true
                        };
                    } else {
                        menu.sort.async = menu.sort.async === undefined ? true : menu.sort.async;
                    }

                    // 查找默认排序
                    if (menu.sort.defaultOrder) {
                        this.sname = col.field;
                        this.sorder = menu.sort.defaultOrder;
                        this.sasync = menu.sort.async;
                    }                    
                    if (this.sname && this.sname === col.field) {
                        colClass += ' table-sort-active';
                        attr += ' data-sorder="' + this.sorder + '"';
                    }
                }                
            }

            var th = $('<th class="table-th' + colClass + '" ' + attr +'></th>');

            if (col.headerAlign || col.align) {
                th.css('text-align', col.headerAlign || col.align);
            }

            th.append('<div class="table-th-text">' + col.name + (menu && menu.sort ? '<span class="table-sort-icon"></span>' : '') + '</div>');
            th.append('<div class="table-th-resize"></div>');

            if (hasMenu(menu)) {
                th.append('<div class="table-th-menu"><span class="glyphicon glyphicon-menu-hamburger"></span></div>');
            }

            html += th[0].outerHTML;
        }

        html += '</tr>';

        return html;

        function hasMenu(menu) {
            var ret = false;

            if (typeof menu === 'object') {
                for (var i in menu) {
                    if (i != 'sort') {
                        ret = true;
                        break;
                    }
                }
            }

            return ret;
        }
    }

    /**
     * [initTbody 生成表体]
     * @return {[type]} [description]
     */
    Table.prototype.initTbody = function () {
        var setting = this.setting;
        var dataList = setting.dataList;
        var colOptions  = setting.colOptions;

        var tbody = $('<tbody></tbody>');
        var j = 0;
        var colLen = colOptions.length;

        // 遍历行
        for (var i = 0, dataLen = dataList.length; i < dataLen; i++) {
            var data = dataList[i];
            var rowParam = setting.rowParam || {};
            var rowData = ' data-rowid="' + i + '"';

            if (typeof rowParam === 'function') {
                rowParam = rowParam(data, i);
            }

            for (var key in rowParam) {
                rowData += ' data-' + key + '="' + rowParam[key] + '"';
            }

            var tr = $('<tr class="table-tr"' + rowData + '></tr>').appendTo(tbody);
            tr.data('rowData', dataList[i]);

            if (setting.rownum) {
                tr.append(
                    '<td class="table-td" style="text-align: center;">' +
                        '<div class="table-td-text">' + (i + 1) + '</div>' +
                    '</td>'
                );
            }

            if (setting.checkbox) {
                tr.append(
                    '<td class="table-td" style="text-align: center;">' +
                        '<div class="table-td-text">' +
                            '<input class="table-checkbox" type="checkbox" />' +
                        '</div>' +
                    '</td>'
                );
            }

            // 遍历列
            for (j = 0; j < colLen; j++) {
                var col = colOptions[j];                
                var text = undefined;
                var val = undefined;

                if (col.hide) {
                    continue;
                }

                if (col.field && data) {
                    val = data[col.field];
                }

                // 换行
                if (typeof val === 'string') {
                    // html编码
                    if (setting.autoEncode) {
                        val = util.htmlEncode(val);
                    }
                    val = val.replace(/\n/g, '<br>');
                }

                if (typeof col.handler === 'function') {
                    text = col.handler(val, data, col);
                } else {
                    text = val;
                }

                var colParam = setting.colParam || {};
                var colData = '';

                if (typeof colParam === 'function') {
                    colParam = colParam(data, i, col);
                }
                for (var key in colParam) {
                    colData += ' data-' + key + '="' + colParam[key] + '"';
                }

                var td = $('<td class="table-td"' + colData + '></td>').appendTo(tr);
                var div = $('<div class="table-td-text"></div>').appendTo(td);

                if (col.edit) {
                    td.addClass('table-td-edit');
                }
                if (col.align) {
                    td.css('text-align', col.align);
                }
                td.data('colOption', col);

                // 如果返回的是DOM或jquery元素则使用append
                if (text instanceof jQuery || util.isDOM(text)) {
                    div.append(text);
                } else {
                    div.html((text === undefined || text === null) ? '' : text + '');
                }
            }
        }

        return tbody;
    }

    /**
     * [initError 显示错误信息]
     * @return {[type]} [description]
     */
    Table.prototype.initError = function (msg) {
        var ele = this.ele;
        var thLen = ele.find('.table-body thead th').length;
        var tbody = $('<tbody><tr class="table-tr table-errorInfo"><td colspan="' + thLen + '" style="text-align: center;">' + msg + '</td></tr></tbody>');

        ele.find('.table-body table tbody').remove();
        ele.find('.table-body table').append(tbody);

        this.initTable();
    }

    /**
     * [destroy 销毁组件]
     * @return {[type]} [description]
     */
    Table.prototype.destroy = function () {
        this.ele
            .off()
            .removeData(namespace)
            .empty();

        if (this.menu) {
            this.menu.remove();
        }
    }

    /**
     * [reload 重新请求数据并加载表格]
     * @return {[type]} [description]
     */
    Table.prototype.reload = function (pageIndex) {
        // 取消选择
        this.ele.find('.table-checkbox').prop('checked', false);
        this.requestData(pageIndex);
    }

    /**
     * [refresh 以当前数据刷新表格，改变表结构时调用]
     * @param  {Boolean} isRebuild [是否重构表结构]
     */
    Table.prototype.refresh = function (isRebuild) {
        var setting = this.setting;
        var ele = this.ele;
        isRebuild = isRebuild === undefined ? false : isRebuild;

        if (isRebuild) {
            ele.find('.table-head').html(
                '<table class="table ' + setting.tableClass + '">' + 
                    '<thead>' + this.initHolder() + this.initThead() + '</thead>'+
                '</table>' 
            );
            ele.find('.table-body').html(
                '<div class="table-loading">努力加载中...</div>'+
                '<table class="table table-hover ' + setting.tableClass + '">' + 
                    '<thead>' + this.initHolder() + '</thead>' +
                '</table>'
            );

            // 设置列索引
            var ths = ele.find('.table-head .holder th');
            for (var i = 0, l = ths.length; i < l; i++) {
                ths.eq(i).attr('data-index', i);
            }

            // 执行多列参数设置
            if (setting.groupHeaders) {
                this.setGroupHeaders(setting.groupHeaders);
            }
        }

        this.createTbody();
    }

    /**
     * [setGroupHeaders 设置多列表头]
     */
    Table.prototype.setGroupHeaders = function (o) {
        var setting = this.setting;
        var ele = this.ele;

        o = $.extend(true, {
            useColSpanStyle: true,
            headers: []
        }, o);

        setting.groupHeaders = o;

        var i, cmi, skip = 0, $tr, $colHeader, th, $th, thStyle, fieldIndex,
            iCol,
            cghi,
            numberOfColumns,
            titleText,
            cVisibleColumns,
            $htable = $('.table-head', ele),
            $thead = $htable.find("thead"),
            $trLabels = $thead.find("tr.table-tr:last").addClass("table-second-header"),
            $ths = $trLabels.find('th'),
            colOptions = setting.colOptions,
            colLen = $ths.length,
            $theadInTable, $firstRow;

        var inColumnHeader = function (idx, headers) {
            var length = headers.length, i;

            for (i = 0; i < length; i++) {
                if (headers[i].startIndex === idx) {
                    return i;
                }
            }

            return -1;
        };

        $tr = $('<tr>').addClass("table-tr table-first-header");

        for (i = 0; i < colLen; i++) {
            $th = $ths.eq(i);
            fieldIndex = +$th.data('field-index');
            cmi = colOptions[fieldIndex];

            iCol = cmi ? inColumnHeader(fieldIndex, o.headers) : -1;

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

                // 设置对齐方式
                if (cghi.headerAlign) {
                    $colHeader.css('text-align', cghi.headerAlign);
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
     * [filter 列筛选]
     * 1、不分页时由table进行筛选
     * 2、分页时有pager进行筛选
     * @param  {[type]} fieldIndex [列索引]
     * @param  {[type]} keyword    [关键字]
     */
    Table.prototype.filter = function (fieldIndex, keyword) {
        var setting = this.setting;
        var col = setting.colOptions[fieldIndex];
        var dataList = this.dataList;

        if (!col.menu || !col.menu.filter) {
            return;
        }

        this.filterName = col.field;
        this.keyword = keyword;

        if (setting.paging.enable) {
            if (col.menu.filter.async) {
                this.reload(1);
            } else {
                this.pager.pager('filter', this.filterName, this.keyword);
                // 使用之后清除掉，以免在结果中筛选时传递到服务器端
                this.filterName = null;
                this.keyword = null;
            }
        } else {
            if (col.menu.filter.async) {
                this.reload(1);
            } else {
                setting.dataList = [];

                for (var i = 0, l = dataList.length; i < l; i++) {
                    var val = dataList[i][this.filterName];

                    // 处理undefined和null
                    if (val === undefined || val === null) {
                        val = '';
                    }

                    val = val.toString();

                    if (val.indexOf(keyword) > -1) {
                        setting.dataList.push(this.dataList[i]);
                    }
                }

                this.refresh();
                // 使用之后清除掉，以免在结果中筛选时传递到服务器端
                this.filterName = null;
                this.keyword = null;
            }
        }
    }

    /**
     * [sort 本地排序]
     */
    Table.prototype.sort = function (fieldIndex) {
        var setting = this.setting;
        var col = setting.colOptions[fieldIndex];
        this.sasync = col.menu.sort.async;
        
        var order = this.sorder;
        var name = this.sname;
        var type = col.menu.sort.type || 'string';

        if (setting.paging.enable) {
            if (col.menu.sort.async) {
                this.reload(1);
            } else {
                this.pager.pager('sort', order, name, type);
            }
        } else {
            this.dataList.sort(function (a, b) {
                //  先排除空值
                if (order === 'asc') {
                    if (a[name] === null || a[name] === undefined) {
                        return -1;
                    }
                } else {
                    if (a[name] === null || a[name] === undefined) {
                        return 1;
                    }
                }

                if (type === 'number') {
                    return order === 'asc' ? Number(a[name]) - Number(b[name]) : Number(b[name]) - Number(a[name]);
                }
                if (type === 'string') {
                    return order === 'asc' ? String(a[name]).localeCompare(String(b[name])) : String(b[name]).localeCompare(String(a[name]));
                }
                if (type === 'date') {
                    return order === 'asc' ? Date(a[name]) - Date(b[name]) : Date(b[name]) - Date(a[name]);
                }
            });

            setting.dataList = this.dataList.slice(0);
            this.refresh();
        }
    }

    /**
     * [resize 窗口变化时重新计算表格宽度等信息]
     * @return {[type]} [description]
     */
    Table.prototype.resize = function () {
        var ele = this.ele;

        ele.find('.table').css('width', '100%');
        ele.find('.holder th').each(function () {
            var width = $(this).data('width') || 'auto';
            $(this).css('width', width);
        });

        this.initTable();
    }

    /**
     * [bindEvents 绑定事件]
     * @return {[type]} [description]
     */
    Table.prototype.bindEvents = function () {
        var self = this;
        var ele = this.ele;
        var setting = this.setting;
        var colOptions = setting.colOptions;
        var menu = this.menu;

        // 标识绑定过事件
        this.isBindedEvent = true;

        // 固定表头滚动
        ele.find('.table-body').on('scroll', function (e) {
            var w = $(this).width();
            var h = $(this).height();
            var top = this.scrollTop;
            var left = this.scrollLeft;

            ele.find('.table-head table').css('left', -this.scrollLeft);
            ele.find('.table-loading').css({
                top: h / 2 + top,
                left: w / 2 + left
            });
        });

        // 列宽度拖动阻止冒泡到排序等操作
        ele.on('click', '.table-th-resize', function (e) {
            e.stopPropagation();
            e.preventDefault();
        });

        // 列宽度拖动，mousedown->mousemove->mouseup
        ele.on('mousedown', '.table-th-resize', function (e) {
            target = ele;
            oldX = e.clientX;
            oldLineLeft = oldX - ele.offset().left;
            index = +$(this).parent().data('index');

            $('body').addClass('table-drag');
            ele.find('.table-drag-line').css('left', oldLineLeft).show();
            
            e.stopPropagation();
            e.preventDefault();
        });

        // 复选框改变事件，单选
        ele.on('change', '.table-td .table-checkbox', function () {
            var totalLen = ele.find('.table-td .table-checkbox').length;
            var currLen = ele.find('.table-td .table-checkbox:checked').length;

            ele.find('.table-th .table-checkbox').prop('checked', currLen == totalLen);
        });

        // 复选框改变事件，全选
        ele.on('change', '.table-th .table-checkbox', function () {
            ele.find('.table-td .table-checkbox').prop('checked', $(this).prop('checked'));
        });

        // 排序
        ele.on('click', '.table-sort', function () {
            // 如果正在拖动则阻止排序
            if (ele.find('.table-drag-line').is(':visible')) {
                return;
            }

            var th = $(this);
            var sname = th.attr('data-field');
            var sorder = th.attr('data-sorder');

            // 重置其他列排序
            ele.find('.table-th').each(function () {
                if (this != th[0]) {
                    $(this).removeClass('table-sort-active').attr('data-sorder', '');
                }
            });

            if (sorder == 'asc') {
                th.addClass('table-sort-active').attr('data-sorder', 'desc');
                self.sname = sname;
                self.sorder = 'desc';
            } else {
                th.addClass('table-sort-active').attr('data-sorder', 'asc');
                self.sname = sname;
                self.sorder = 'asc';
            }

            self.sort(+th.data('field-index'));           
        });

        // 编辑单元格
        ele.on('dblclick', '.table-td-edit', function (e) {
            var td = $(this);
            var colOption = td.data('colOption');
            var rp;

            // 调用用户定义的编辑元素
            if (typeof colOption.edit.replace == 'function') {
                rp = colOption.edit.replace.call(this, colOption, td.parent().data('rowData'));
            } else {
                rp = colOption.edit.replace;
            }

            $(rp).addClass('table-td-editEle').appendTo(this).focus();
            td.find('.table-td-text').hide();
            e.preventDefault();
        });

        // 确认编辑，回写数据
        ele.on('change', '.table-td-editEle', function (e) {
            var el = $(this);
            var td = el.parent();
            var colOption = td.data('colOption');

            if (typeof colOption.edit.callback == 'function') {
                var ret = colOption.edit.callback.call(this, colOption, td.parent().data('rowData'));

                if (ret !== false) {
                    el.siblings('.table-td-text').show();
                    el.remove();
                }
            }            
        });

        // 确定修改
        ele.on('blur', '.table-td-editEle', function (e) {
            $(this).trigger('change');
        });

        // 列显示隐藏
        ele.on('click', '.table-col-display', function (e) {
            var html = '<li class="table-columns">';

            for (var i = 0, l = colOptions.length; i < l; i++) {
                var col = colOptions[i];
                html +=
                    '<div class="table-columns-item' + (col.fixed ? ' disabled' : '') + '" data-index="' + i + '">' +
                        '<label>' +
                            '<input type="checkbox"' + (!col.hide ? ' checked' : '') + (col.fixed ? ' disabled' : '') + '> ' + 
                            colOptions[i].name +
                        '</label>' +
                    '</div>';
            }

            html += '</li>';

            // 实例化菜单
            self.menu.html(html).menu();
            // 显示菜单
            self.menu.menu('show', {
                left: e.pageX,
                top: e.pageY
            });

            e.stopPropagation();
        });

        // 表头菜单
        ele.on('click', '.table-th-menu', function (e) {
            var th = $(this).parent();
            var index = +th.data('field-index');
            var oldValue = th.data('value') || '';
            var col = colOptions[index];
            var html = '';

            if (col.menu.filter) {
                html +=
                    '<li class="ui-menu-item">' +
                        '<div class="ui-menu-item-icon">' +
                            '<i class="glyphicon glyphicon-filter"></i>' +
                        '</div>' +
                        '<div class="ui-menu-item-text">筛选</div>' +
                        '<div class="ui-menu table-filter">' +
                            '<div class="input-group input-group-sm">' +
                                '<input class="form-control" type="text" value="' + oldValue +'">' +
                                '<span class="input-group-btn">' +
                                    '<button class="btn btn-default">OK</button>' +
                                '</span>' +
                            '</div>' +
                        '</div>' +
                    '</li>';
            }

            // 实例化菜单
            self.menu.html(html).menu();
            // 显示菜单
            self.menu.menu('show', {
                left: e.pageX,
                top: e.pageY,
                args: $(this).parent()
            });

            e.stopPropagation();
        });
    
        // 阻止隐藏菜单
        menu.on('mousedown', '.table-columns, .table-filter', function (e) {
            e.stopPropagation();
        });

        // 显示/隐藏列
        menu.on('change', '.table-columns input', function (e) {
            var index = +$(this).parents('.table-columns-item').data('index');
            var col = colOptions[index];

            col.hide = !$(this).prop('checked');
            self.refresh(true);
        });

        // 筛选
        menu.on('click', '.table-filter button', function (e) {
            var val = menu.find('.table-filter input').val();
            var th = menu.menu('getArgs');

            // 移除筛选值
            ele.find('.table-th-menu').each(function () {
                $(this).parent().removeData('value');
            });

            // 保存筛选值
            th.data('value', val);
            self.filter(+th.data('field-index'), val);
            menu.menu('hide');
        });

        // 筛选
        menu.on('keyup', '.table-filter input', function (e) {
            if (e.which == 13) {
                var val = this.value;
                var th = menu.menu('getArgs');

                // 移除筛选值
                ele.find('.table-th-menu').each(function () {
                    $(this).parent().removeData('value');
                });

                // 保存筛选值
                th.data('value', val);
                self.filter(+th.data('field-index'), val);
                menu.menu('hide');
            }                
        });
    }

    var target, oldX, oldLineLeft, index;

    //公用事件绑定
    (function () {
        // 列宽度拖动中
        $(document).on('mousemove.' + namespace, '.table-drag', function (e) {
            var dragLine = target.find('.table-drag-line');
            var theadThs = target.find('.table-head .holder th');
            var newWidth = Math.max(theadThs.eq(index).width() + e.clientX - oldX, 40);
            var lineLeft = oldLineLeft - (theadThs.eq(index).width() - newWidth);

            dragLine.css('left', lineLeft);
            e.preventDefault();
        });

        // 列宽度拖动结束
        $(document).on('mouseup.' + namespace, '.table-drag', function (e) {
            var theadThs = target.find('.table-head .holder th');
            var tbodyThs = target.find('.table-body .holder th');
            var newWidth = Math.max(theadThs.eq(index).width() + e.clientX - oldX, 40);
            var w = 0, totalW = 0;

            theadThs.eq(index).width(newWidth);

            // 计算表格宽度
            for (var i = 0, l = theadThs.length; i < l; i++) {
                w = parseInt(theadThs[i].style.width);

                if (theadThs.eq(i).is(':visible')) {
                    totalW += w;
                }

                tbodyThs.eq(i).width(w);
                theadThs.eq(i).width(w);
            }

            target.find('.table').width(totalW);
            target.find('.table-drag-line').hide();
            $('.table-drag').removeClass('table-drag');

            // 释放变量
            target = null;
            oldX = null;
            oldLineLeft = null;
            index = null;

            e.preventDefault();
        });

        $(window).on('resize', function () {
            for (var i = 0, l = tables.length; i < l; i++) {
                tables[i].resize();
            }
        });
    }());
    
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
        init: function (option) {
            methods.destroy.call(this);

            return this.each(function () {
                option = $.extend(true, {}, Pager.DEFAULTS, option);

                $(this).data(namespace, new Pager($(this), option));
            });
        },

        /**
         * [reload 重新加载]
         * @return {[type]} [description]
         */
        reload: function (pageIndex, data) {
            return this.each(function () {
                $(this).data(namespace).reload(pageIndex, data);
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
        },

        /**
         * [filter 在结果中筛选]
         * @param  {[type]} filterName [description]
         * @param  {[type]} keyword    [description]
         * @return {[type]}            [description]
         */
        filter: function (filterName, keyword) {
            return this.each(function () {
                $(this).data(namespace).filter(filterName, keyword);
            });
        },

        /**
         * [sort 在结果中排序]
         * @param  {[type]} order [description]
         * @param  {[type]} name  [description]
         * @param  {[type]} type  [description]
         * @return {[type]}            [description]
         */
        sort: function (order, name, type) {
            return this.each(function () {
                $(this).data(namespace).sort(order, name, type);
            });
        }
    };

    /**
     * [Pager 分页对象]
     */
    var Pager = function (ele, setting) {
        this.ele = ele;
        this.setting = setting;
        this.startIndex = 1;

        if (setting.pageSizeArray && setting.pageSizeArray[0]) {
            setting.pageSize = setting.pageSizeArray[0];
        }

        this.requestData(setting.pageIndex);
    }

    // 选项
    Pager.DEFAULTS = {
        url             : '',                       // 远程数据的url
        type            : 'GET',                    // 远程请求的方式
        data            : false,                    // 远程请求的参数
        dataType        : 'json',                   // 返回数据类型
        jsonp           : 'callback',               // jsonp回调函数名称

        indexField      : 'pageIndex',              // 页码字段名
        sizeField       : 'pageSize',               // 每页条数字段名
        dataField       : 'data',                   // json数组字段名
        totalField      : 'total',                  // 总条数字段名

        // 分页信息
        pageIndex       : 1,                        // 从第几页开始
        pageSize        : 20,                       // 每页显示多少条数据
        pageSizeArray   : false,                    // 每页显示条数的选择
        total           : 0,                        // 数据总条数
        totalPage       : 0,                        // 总页数
        pageLength      : 5,                        // 显示的页码数
        pageInfo        : false,                    // 是否显示页码信息
        skipPage        : true,                     // 是否启用跳页
        localPage       : false,                    // 是否本地分页
        localData       : false,                    // 保存本地数据

        beforeSend      : false,                    // 请求之前的回调
        complete        : false,                    // 请求完成的回调
        success         : false,                    // 分页成功之后的回调
        error           : false,                    // 请求错误回调
        onInit          : false                     // 初始化完成的回调
    }

    /**
     * [requestData 请求数据]
     * @param  {[type]} pageIndex  [页码]
     */
    Pager.prototype.requestData = function (pageIndex) {
        var self = this;
        var ele = this.ele;
        var setting = this.setting;
        var data;

        if (typeof setting.data === 'function') {
            var retData = setting.data();

            if (retData === false) {
                return;
            }
            
            data = $.extend(true, {}, retData, this.extraData);
        } else {
            data = $.extend(true, {}, setting.data, this.extraData);
        }

        if (!setting.localPage) {
            data[setting.indexField] = pageIndex;
            data[setting.sizeField] = setting.pageSize;
        }
        
        var ajaxOption = {
            url: setting.url,
            type: setting.type,
            data: data,
            dataType: setting.dataType,
            jsonp: setting.jsonp,
            beforeSend: setting.beforeSend,
            complete: setting.complete,
            error: setting.error,
            success: function (res) {
                // 保存数据
                self.dataList = (setting.dataField ? res[setting.dataField] : res) || [];
                setting.dataList = self.dataList.slice(0);

                // 计算总页码等信息
                setting.pageIndex = pageIndex;
                setting.total = setting.localPage ? setting.dataList.length : res[setting.totalField];
                setting.totalPage = Math.ceil(setting.total / setting.pageSize);
                
                // 生成页码
                self.initPage();

                // 返回数据
                if (setting.localPage) {
                    setting.success(setting.dataList.slice(0, setting.pageIndex * setting.pageSize));
                } else {
                    setting.success(setting.dataList.slice(0));
                }
            }
        }

        // 中止之前的请求，防止不停点击
        if (this.ajaxObj) {
            this.ajaxObj.abort();
        }

        this.ajaxObj = $.ajax(ajaxOption);
    }

    /**
     * [initPage 生成页码信息]
     */
    Pager.prototype.initPage = function () {
        var self = this;
        var setting = this.setting;
        var pageSizeArray = setting.pageSizeArray;
        var ele = this.ele.empty();

        if (setting.total <= 0) {
            return;
        }

        this.calcPage();

        var html =  '<div class="pagination' + (setting.pageInfo ? ' justify"' : '') + '">' +
                        '<div class="paging">' +
                            this.firstPage() +
                            this.pageList() +
                            this.lastPage() +
                        '</div>';

        if (setting.pageInfo) {
            html += '<div class="pageinfo">'+
                        '共<span class="pageinfo-text">' + setting.totalPage + '</span>页'+
                        '<span class="pageinfo-text">' + setting.total + '</span>条数据';

            if ($.isArray(pageSizeArray)) {
                html += '&nbsp;&nbsp;每页显示 '+
                        '<select class="pageinfo-size">';
                
                for (var i = 0, l = pageSizeArray.length; i < l; i++) {
                    html += '<option value="' + pageSizeArray[i] + '">' + pageSizeArray[i] + '条</option>';
                }

                html += '</select>';
            }

            if (setting.skipPage) {
                html += '&nbsp;&nbsp;跳转到第<input class="pageinfo-skip" />页';
            }

            html += '</div>';
        }
                        
        html += '</div>';

        html = html.replace('<option value="' + setting.pageSize + '">', '<option value="' + setting.pageSize + '" selected="selected">');

        ele.append(html);

        setTimeout(function () {
            if (!self.isBindedEvent) {
                self.bindEvents();
            }

            if (setting.onInit) {
                setting.onInit.call(ele[0], setting);
            }
        }, 10);
    }

    /**
     * [calcPage 计算起始页码]
     */
    Pager.prototype.calcPage = function () {
        var setting = this.setting;
        var pageIndex = setting.pageIndex;

        if (pageIndex <= this.startIndex || pageIndex == setting.totalPage) {
            this.startIndex = Math.max(1, pageIndex - setting.pageLength + 1);
        } else if (pageIndex >= this.endIndex) {
            this.startIndex = Math.min(pageIndex, setting.totalPage - setting.pageLength + 1);
        }

        this.endIndex = Math.min(this.startIndex + setting.pageLength - 1, setting.totalPage);
    }

    /**
     * [prevPage 第一页]
     */
    Pager.prototype.firstPage = function () {
        if (this.setting.pageIndex > 1) {
            return '<a class="paging-btn paging-btn-first" title="首页" data-topage="1">«</a>';
        } else {
            return '<a class="paging-btn paging-btn-first paging-btn-disabled" title="首页">«</a>';
        }
    }

    /**
     * [nextPage 最后一页]
     */
    Pager.prototype.lastPage = function () {
        var setting = this.setting;

        if (setting.pageIndex < setting.totalPage) {
            return '<a class="paging-btn paging-btn-last" title="尾页" data-topage="' + setting.totalPage + '">»</a>';
        } else {
            return '<a class="paging-btn paging-btn-last paging-btn-disabled" title="尾页">»</a>';
        }
    },

    /**
     * [pageList 数字页码]
     */
    Pager.prototype.pageList = function () {
        var setting = this.setting;

        var html = '';

        for (var i = this.startIndex; i <= this.endIndex; i++) {
            if (i == setting.pageIndex) {
                html += '<a class="paging-btn paging-btn-curr" data-topage="' + i + '">' + i + '</a>';
            } else {
                html += '<a class="paging-btn" data-topage="' + i + '">' + i + '</a>';
            }
        }

        if (this.endIndex < setting.totalPage) {
            html += '<span class="paging-btn paging-btn-disabled">...</span>';
        }

        return html;
    }

    /**
     * [skipPage 本地页码跳转]
     */
    Pager.prototype.skipPage = function (pageIndex) {
        var setting = this.setting;
        setting.pageIndex = pageIndex;

        this.initPage();

        setting.success(setting.dataList.slice((pageIndex - 1) * setting.pageSize, pageIndex * setting.pageSize));
    }

    /**
     * [reload 重新加载某一页，默认当前页]
     * @param  {[type]} pageIndex [页码]
     */
    Pager.prototype.reload = function (pageIndex, data) {
        pageIndex = pageIndex === undefined ? this.setting.pageIndex : pageIndex;
        this.extraData = data;
        this.requestData(pageIndex);
    }

    /**
     * [destroy 销毁组件]
     */
    Pager.prototype.destroy = function () {
        this.ele
            .off()
            .removeData(namespace)
            .empty();
    }

    /**
     * [filter 结果中筛选]
     * @param  {[type]} filterName  [筛选字段名]
     * @param  {[type]} keyword [筛选值]
     */
    Pager.prototype.filter = function (filterName, keyword) {
        var setting = this.setting;
        var dataList = this.dataList.slice(0);

        setting.dataList = [];

        for (var i = 0, l = dataList.length; i < l; i++) {
            var data = dataList[i];
            var val = data[filterName];

            // 处理undefined和null
            if (val === undefined || val === null) {
                val = '';
            }

            val = val.toString();

            if (val.indexOf(keyword) > -1) {
                setting.dataList.push(data);             
            }
        }

        // 计算总页码等信息
        setting.pageIndex = 1;
        setting.total = setting.dataList.length;
        setting.totalPage = Math.ceil(setting.total / setting.pageSize);

        this.initPage();

        // 返回数据
        if (setting.localPage) {
            setting.success(setting.dataList.slice(0, setting.pageIndex * setting.pageSize));
        } else {
            setting.success(setting.dataList.slice(0));
        }
    }

    /**
     * [sort 结果中排序]
     * @param  {[type]} filterName  [筛选字段名]
     * @param  {[type]} keyword [筛选值]
     */
    Pager.prototype.sort = function (order, name, type) {
        var setting = this.setting;

        this.dataList.sort(function (a, b) {
            //  先排除空值
            if (order === 'asc') {
                if (a[name] === null || a[name] === undefined) {
                    return -1;
                }
            } else {
                if (a[name] === null || a[name] === undefined) {
                    return 1;
                }
            }

            if (type === 'number') {
                return order === 'asc' ? Number(a[name]) - Number(b[name]) : Number(b[name]) - Number(a[name]);
            }
            if (type === 'string') {
                return order === 'asc' ? String(a[name]).localeCompare(String(b[name])) : String(b[name]).localeCompare(String(a[name]));
            }
            if (type === 'date') {
                return order === 'asc' ? Date(a[name]) - Date(b[name]) : Date(b[name]) - Date(a[name]);
            }
        });

        setting.dataList = this.dataList.slice(0);

        // 计算总页码等信息
        setting.pageIndex = 1;
        setting.total = setting.dataList.length;
        setting.totalPage = Math.ceil(setting.total / setting.pageSize);

        this.initPage();

        // 返回数据
        if (setting.localPage) {
            setting.success(setting.dataList.slice(0, setting.pageIndex * setting.pageSize));
        } else {
            setting.success(setting.dataList.slice(0));
        }
    }

    /**
     * [bindEvents 绑定事件]
     * @return {[type]} [description]
     */
    Pager.prototype.bindEvents = function () {
        var self = this;
        var setting = this.setting;
        var ele = this.ele;

        // 标识绑定过事件
        this.isBindedEvent = true;

        // 每页显示条数切换事件
        ele.on('change', '.pageinfo-size', function (e) {
            setting.pageSize = +$(this).val();
            self.requestData(1);
        });

        // 页码翻页事件
        ele.on('click', '.paging-btn:not(.paging-btn-disabled)', function () {
            var pageIndex = +$(this).data('topage');

            if (setting.localPage) {
                self.skipPage(pageIndex);
            } else {
                self.requestData(pageIndex);
            }
        });

        // 页码翻页事件
        ele.on('keydown', '.pageinfo-skip', function (e) {
            if (e.which == 13) {
                e.preventDefault();

                var pageIndex = $(this).val();

                if (!util.isInteger(pageIndex, true)) {
                    alert('请输入整数页码');
                    return;
                }

                pageIndex = parseInt(pageIndex);

                if (pageIndex > setting.totalPage || pageIndex <= 0) {
                    alert('页码不在范围内');
                    return;
                }

                if (setting.localPage) {
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
        init: function (option) {
            methods.destroy.call(this);

            return this.each(function () {
                var $this = $(this);
                option = $.extend(true, {}, UiSelect.DEFAULTS, option);
                $this.data(namespace, new UiSelect($this, option));
            });
        },

        //设置选定值，如果value为数组，则设置多个值选定
        setValue: function (value) {
            return this.each(function () {
                $(this).data(namespace).setValue(value);
            });
        },

        //获取值
        getValue: function () {
            return this.eq(0).data(namespace).getValue();
        },

        //获取值
        getText: function () {
            return this.eq(0).data(namespace).getText();
        },

        //获取选中数据
        getSelectedData: function () {
            return this.eq(0).data(namespace).getSelectedData();
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
        separator       : ',',              // 多选值分隔符
        disabled        : false,            // 是否禁用
        search          : false,            // 是否搜索
        multi           : false             // 是否多选
    };

    /**
     * [init]
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
                    (setting.search ? '<div class="ui-select-search"><input class="form-control" type="text"></div>' : '') +
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
                var html = util.parseTpl('<tr data-key="' + key + '">' + template + '</tr>', data, true);

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
            var dataList = selectedData.slice(0);
            this.ele.trigger(e, [setting.multi ? dataList : dataList[0]]);
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

        if (!$.isArray(value)) {
            value = [value];
        }

        // 查找选中项
        for (var i = 0, l = dataList.length; i < l; i++) {
            var key = setting.valueField ? dataList[i][setting.valueField] : dataList[i];

            for (var j = 0, jLen = value.length; j < jLen; j++) {
                if ('' + key === '' + value[j]) {
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
                if (util.indexOf(this.oldSelectedData, this.selectedData[i], setting.valueField) == -1) {
                    isSame = false;
                }
            }
        }        

        if (!isSame) {
            this.setSelect();
        }
    }

    /**
     * [getValue 获取选中值]
     * @param {[type]} value [description]
     */
    UiSelect.prototype.getValue = function () {
        return this.ele.find('.ui-select-value').val();
    }

    /**
     * [getText 获取选中文本]
     * @param {[type]} value [description]
     */
    UiSelect.prototype.getText = function () {
        return this.ele.find('.ui-select-text').val();
    }

    /**
     * [getSelectedData 获取选中数据]
     * @param {[type]} value [description]
     */
    UiSelect.prototype.getSelectedData = function () {
        return this.selectedData;
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
                var index = util.indexOf(self.selectedData, data, setting.valueField);
                    
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
    var Gallery = function (option) {
        if ($.isArray(option)) {
            this.settings = $.extend(true, {}, Gallery.DEFAULTS, { data: option });
        } else if (typeof option === 'object') {
            this.settings = $.extend(true, {}, Gallery.DEFAULTS, option);
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
        if (util.browser.msie && util.browser.version < 9) {
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
        hideBodyScrollbar(top.document);
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
            resetBodyScrollbar(top.document);
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
    (function bindCommonEvents () {
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
    }());

    /**
     * [hideBodyScrollbar 隐藏body滚动条]
     * @return {[type]} [description]
     */
    function hideBodyScrollbar(context) {
        context = context || document;

        var $body = $('body', context);
        var fullWindowWidth = window.innerWidth;
        var scrollbarWidth = util.scrollBarWidth(context);

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
    function resetBodyScrollbar(context) {
        var $body = $('body', context || document);
        if ($body.hasClass('hide-scrollbar')) {
            $('body', context || document).removeClass('hide-scrollbar').css('padding-right', $('body').originalBodyPad || '');
        }
    }

    $.gallery = function (option) {
        return new Gallery(option);
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

        var option = $.extend(true, {}, Gallery.DEFAULTS, {
            data: data,
            index: index
        }, $ul.data());

        $ul.data(namespace, $.gallery(option));

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

        var outer = $('<div class="ui-validate"></div>').css('display', this.ele.css('display'));
        var inner = $(
            '<div class="ui-validate-tip">' +
                '<span class="glyphicon glyphicon-warning-sign"></span>' + 
                '<span class="ui-validate-tip-text"></span>' +
            '</div>'
        );
        this.ele.addClass('ui-validate-input').wrap(outer);
        this.ele = this.ele.parent();
        this.ele.append(inner);

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
        var placement = this.setting.placement;
        var tip = ele.find('.ui-validate-tip');
        var input = ele.find('.ui-validate-input');

        // 自动设置提示框位置为右边
        if (!/^((top)|(right)|(bottom)|(left))$/.test(placement)) {
            placement = 'right';
        }

        input.addClass('ui-validate-error');
        tip.show().addClass(placement);
        ele.find('.ui-validate-tip-text').html(msg);

        if (placement === 'top' || placement === 'bottom') {
            tip.css('margin-left', -(tip.outerWidth() / 2));
        } else {
            tip.css('margin-top', -(tip.outerHeight() / 2));
        }
    };

    // 隐藏提示框
    Validate.prototype.hideTip = function () {
        var ele = this.ele;

        ele.find('.ui-validate-input').removeClass('ui-validate-error');
        ele.find('.ui-validate-tip').hide().removeClass('top right bottom left');
    };

    // 设置提示框内容和位置
    Validate.prototype.setTip = function (msg) {
        var ele = this.ele;
        var setting = this.setting;

        var tip = ele.find('.ui-validate-tip').show();

        tip.find('.validate-tip-text').html(msg);

        var pos = util.getPosition(ele[0]);
        var viewportPos = util.getPosition($('body')[0]);
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
        var input = ele.find('.ui-validate-input');

        input.on('blur', function () {
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

        input.on('focus', function () {
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
 * [Menu 菜单]
 */
(function (win) {
    var pName = 'menu';
    var namespace = 'ui.' + pName;
    var menus = [];

    var methods = {
        init: function (option) {
            methods.destroy.call(this);

            return this.each(function() {
                var $this = $(this);
                var setting = $.extend(true, {}, Menu.DEFAULTS, option); 
                
                $this.data(namespace, new Menu($this, setting));
            });
        },
        destroy: function () {
            return this.each(function () {
                if ($(this).data(namespace)) {
                    $(this).data(namespace).destroy();
                }
            });
        },
        show: function (option) {
            return this.each(function () {
                $(this).data(namespace).show(option);
            });
        },
        hide: function () {
            return this.each(function () {
                $(this).data(namespace).hide();
            });
        },
        // 获取show方法传递的额外参数
        getArgs: function () {
            return this.eq(0).data(namespace).args;
        }
    };

    var Menu = function (ele, setting) {
        this.ele = ele;
        this.setting = setting;

        // 添加子菜单图标
        ele.find('.ui-menu-item').each(function () {
            var children = $(this).find('.ui-menu');

            if (children.length) {
                children.before('<span class="ui-menu-children-icon"></span>');
            }
        });

        menus.push(this);
        this.bindEvents();
    }

    Menu.DEFAULTS = {
        autoHide : false,               // 是否自动隐藏        
    };

    // 显示菜单
    Menu.prototype.show = function (option) {
        var setting = this.setting;
        var ele = this.ele;
        var pos = util.getPosition($('body')[0]);
        this.args = option.args;

        // 先显示才能获取实际宽高
        ele.show();

        if (option.left + ele.outerWidth() > $(win).width() + pos.scrollLeft) {
            option.left = option.left - ele.outerWidth();
        }

        if (option.top + ele.outerHeight() > $(win).height() + pos.scrollTop) {
            option.top = option.top - ele.outerHeight();
        }

        ele.css({
            left: option.left,
            top: option.top
        });

        if (setting.autoHide) {
            setTimeout(function () {
                self.hide();
            }, setting.autoHide);
        }
    };

    // 隐藏菜单
    Menu.prototype.hide = function () {
        this.ele.hide();
        this.ele.find('.ui-menu-item').removeClass('hover');
    };

    // 销毁组件
    Menu.prototype.destroy = function () {
        this.ele
            .off('mouseenter.' + namespace)
            .removeData(namespace);
    };

    // 绑定事件
    Menu.prototype.bindEvents = function () {
        var setting = this.setting;
        var ele = this.ele;
        var self = this;

        // 显示子菜单
        ele.on('mouseenter.' + namespace, '.ui-menu-item', function (e) {            
            // 隐藏同级菜单的子菜单
            $(this).siblings('.ui-menu-item').each(function () {
                $(this).removeClass('hover');
                $(this).find('.ui-menu').hide();
            });

            $(this).addClass('hover');
            $(this).find('.ui-menu').show();
        });
    };

    // 点击document隐藏菜单
    $(document).on('mousedown.' + namespace, function () {
        for (var i = 0, l = menus.length; i < l; i++) {
            menus[i].hide();
        }
    });

    $.fn.menu = function (method) {
        if (methods[method]) {
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        } else {
            $.error('The method ' + method + ' does not exist in $.menu');
        }
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
        async: {                        // 远程请求获取数据参数，和ajax请求参数基本一致
            url: '',                    // 远程请求url
            type: 'GET',                // 请求方式
            data: false,                // 请求入参，不包括搜索关键字，搜索关键字会自动带入
            dataType: false,            // 返回数据类型，支持jsonp
            dataField: 'data',          // 返回数据的字段中那个字段表示数据列表，null表示返回数据即数据列表
            searchField: 'keyword',     // 搜索关键字名称
            delay: 200,                 // 延迟加载时间
            minKeywordLength: 0         // 最小关键字长度，小于该长度时不发送请求
        },
        dataList: [],                   // 数据列表，支持本地数据列表
        localSearchField: null,         // 本地搜索字段
        template: '<td>#{}</td>',       // 列表模板
        width: false,                   // 列表宽度
        maxHeight: 300,                 // 列表最大高度
        maxNum: null,                   // 最大显示条数
        autoHide: false,                // 列表是否自动在3秒后隐藏
        callback: false,                // 选中数据之后的回掉，参数为选中的数据
        onTrigger: false,               // 触发时自动补全时回调
        onInit: false                   // 组件初始化回调
    };

    // 初始化
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

    // 显示候选列表
    AutoComplete.prototype.showList = function () {
        var ele = this.ele;
        var setting = this.setting;
        
        var table = ele.find('.ui-autoComplete-result table').empty();
        var resultContainer = ele.find('.ui-autoComplete-result');
        var len = setting.maxNum ? Math.min(setting.maxNum, setting.dataList.length) : setting.dataList.length;

        if (len > 0) {
            for (var i = 0; i < len; i++) {
                var tr = $('<tr>' + util.parseTpl(setting.template, setting.dataList[i]) + '</tr>');

                tr.data('data', setting.dataList[i]).appendTo(table);
            }

            resultContainer.show().scrollTop(0);

            if (setting.autoHide) {
                setTimeout(function () {
                    resultContainer.hide();
                }, 3000);
            }
        } else {
        	resultContainer.hide();
        }
    }

    // 绑定事件
    AutoComplete.prototype.bindEvents = function () {
        var ele = this.ele;
        var resultContainer = ele.find('.ui-autoComplete-result')[0];
        var setting = this.setting;
        var self = this;
        var timer = null;

        // note: IE8 hack，由于propertychange在js设置value时也会触发，因此改为keyup
        ele.on('click input keyup', '.ui-autoComplete-input', function (e) {
            var async = setting.async;
            var input = $(this);
            var val = input.val();

            // 非IE8不处理keyup事件
            if (e.type == 'keyup' && !(util.browser.msie && util.browser.version < 9)) {
                return true;
            }

            // 隐藏其他的列表
            $('.ui-autoComplete-result').each(function () {
                if (this != resultContainer) {
                    $(this).hide();
                }
            });

            if (setting.onTrigger) {
                setting.onTrigger.call(this, val);
            }

            if (async.url) {
                // 连续触发时取消上一次请求
                clearTimeout(timer);
                self.requestTimes++;

                if (val.length < setting.async.minKeywordLength) {
                    return true;
                }

                timer = setTimeout((function (currTimes) {
                    return function () {
                        var ajaxOpt = {
                            url: async.url,
                            type: async.type,
                            data: {},
                            success: function (res) {
                                if (currTimes == self.requestTimes && input.is(':focus')) {
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

        // 输入框失去焦点时，延迟隐藏下拉框
        ele.on('blur', '.ui-autoComplete-input', function (e) {
            setTimeout(function () {
                ele.find('.ui-autoComplete-result').hide();
            }, 200);
        });
    
        // 选中候选
        ele.on('click', '.ui-autoComplete-result tr', function (e) {
            if (typeof setting.callback == 'function') {
                setting.callback.call(ele.find('.ui-autoComplete-input')[0], $(this).data('data'));
            }
        });
    }

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