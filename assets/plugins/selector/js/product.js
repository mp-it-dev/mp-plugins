require(['jquery', 'util', 'ztree'], function($, util) {
	var apiUrl = decodeURIComponent(util.queryString('apiurl'));
    var level = util.queryString('level') || 'cp';
    var multi = util.queryString('multi') || 'false';
    var cb = parent[util.queryString('callback')];

    level = level == 'undefined' ? 'cp' : level;
    multi = multi == 'undefined' ? 'false' : multi;

    var setting = {
        data: {
            simpleData: {
                enable: true
            }
        },
        callback: {
            onExpand: function(event, treeId, treeNode) {
            	if (treeNode.children) {
		            return false;
		        }

            	treeNode.icon = './img/loading.gif';
        		treeObj.updateNode(treeNode);

            	$.ajax({
			    	url: apiUrl + 'Product/GetProList?pid=' + treeNode.id,
			    	dataType: 'jsonp',
			    	success: function(data) {
                        if (data && data.length) {
                            for (var i = 0, l = data.length; i < l; i++) {
                                var type = data[i].id.split('_')[0];
                                                    
                                if (type == level) {
                                    data[i].isParent = false;
                                } else {
                                    data[i].nocheck = true;
                                }

                                if (!data[i].isParent) {
                                    data[i].icon = './img/pro.png';
                                }                                
                            }

                            treeObj.addNodes(treeNode, data);
                        } else {
                            treeNode.isParent = false;
                        }

                        treeNode.icon = './img/file.png';
                        treeObj.updateNode(treeNode);
			    	}
			    });
            },
            onClick: function(event, treeId, treeNode) {
                if (multi == 'false' && !treeNode.isParent) {
                    if (typeof cb == 'function') {                        
                        cb({
                            Id: treeNode.id,
                            ActualId: treeNode.ActualId,
                            Name: treeNode.name
                        });
                    }
                }
            }
        }
    };

    ///////////////
    //页面初始化
    //////////////    
    if (multi == 'true') {
        setting.check = {
            enable: true,
            chkboxType: { 'Y': '', 'N': '' }
        };
        $('.product .part-opt').show();
        $('#ztree, #searchResult').height($('#ztree').height() - 30);
        $('#table-head thead tr').prepend('<th width="30"><input type="checkbox" class="selectAll"></th>');
        $('#table-body thead tr').prepend('<th width="30"></th>');
    }

    if (level == 'cp') {
        $('.product .opt-row').show();
        $('#ztree, #searchResult').height($('#ztree').height() - 30);
        $('#table-body').height($('#searchResult').height() - 30);
    }

    $.ajax({
        url: apiUrl + 'Product/GetCpxList',
        dataType: 'jsonp',
        success: function (data) {
            if (data && data.length) {
                for (var i = 0, l = data.length; i < l; i++) {
                    var type = data[i].id.split('_')[0];

                    if (type == level) {
                        data[i].isParent = false;
                    } else {
                        data[i].nocheck = true;
                    }

                    if (!data[i].isParent) {
                        data[i].icon = './img/pro.png';
                    }                     
                }

                treeObj = $.fn.zTree.init($("#ztree"), setting, data);
            }            
        }
    });

    ///////////////
    // 事件绑定
    //////////////
    var tableHead = $('#table-head');
    var tableBody = $('#table-body');

    // 产品树选中结果
    $('#submitSelected').on('click', function() {
        if (typeof cb == 'function') {
            var selectedData = [];

            if ($('#ztree').is(':visible')) {
                var nodes = treeObj.getCheckedNodes();

                for (var i = 0, l = nodes.length; i < l; i++) {
                    selectedData.push({
                        Id: nodes[i].id,
                        ActualId: nodes[i].ActualId,
                        Name: nodes[i].name
                    });
                }
            } else {
                $('#table-body input:checked').each(function() {
                    var data = $(this).parents('tr').data('data');

                    selectedData.push({
                        Id: 'cp_' + data.cpBm,
                        ActualId: data.cpBm,
                        Name: data.cpName,
                        OriginData: data
                    });
                });
            }            

            if (!selectedData.length) {
                alert('没有选择任何数据！');
                return false;
            }

            cb(selectedData);
        }
    });
    
    // 单击行操作。对于单选则选择该行结果，对于多选则勾选/取消勾选
    tableBody.on('click', 'tbody tr:not(.no-result)', function() {
        if (multi == 'false') {
            if (typeof cb == 'function') {
                var data = $(this).data('data');
                var selectedData =  {
                    Id: 'cp_' + data.cpBm,
                    ActualId: data.cpBm,
                    Name: data.cpName,
                    OriginData: data
                }

                cb(selectedData);
            }
        } else {
            $('input[type="checkbox"]', this).prop('checked', !$('input[type="checkbox"]', this).prop('checked')).change();
        }        
    });

    // 阻止冒泡
    tableBody.on('click', 'tbody input[type="checkbox"]', function(e) {
        e.stopPropagation();
    });

    // 全选
    tableHead.on('change', 'thead .selectAll', function () {
        $('#table-body tbody input[type="checkbox"]').prop('checked', $(this).prop('checked'));
    });

    // 是否勾选全选按钮
    tableBody.on('change', 'tbody input[type="checkbox"]', function () {
        var totalLen = tableBody.find('tbody input[type="checkbox"]').length;
        var currLen = tableBody.find('tbody input[type="checkbox"]:checked').length;

        tableHead.find('thead .selectAll').prop('checked', currLen == totalLen);
    });

    // 搜索
    $('#search-btn').on('click', function() {
        search();
    });

    $('#search-keyword').on('keydown', function(e) {
        if (e.which == 13) {
            search();            
        }
    });

    // 返回产品树
    $('#backToTree').on('click', function() {
        $('#searchResult').hide();
        $('#ztree').show();
    });

    //////////////
    ///函数声明
    //////////////
    function search() {
        var keyword = $('#search-keyword').val();

        $('#loading').show();

        $.ajax({
            url: apiUrl + 'Product/SearchProduct?keyword=' + keyword,
            dataType: 'jsonp',
            success: function(data) {
                $('#loading').hide();                
                $('#ztree').hide();
                $('#searchResult').show();
                $('#table-body tbody').empty();

                if (data && data.length) {
                    for (var i = 0, l = data.length; i < l; i++) {
                        var tr = '<tr>' +
                                    (multi == 'true' ? '<td><input type="checkbox"></td>' : '') +
                                    '<td>' + data[i].cpxName + '</td>' +
                                    '<td>' + data[i].cpxlName + '</td>' +
                                    '<td>' + data[i].zhengjiName + '</td>' +
                                    '<td>' + data[i].xsxhName + '</td>' +
                                    '<td>' + data[i].cpBm + '</td>' +
                                    '<td>' + data[i].cpName + '</td>' +
                                '</tr>';

                        tr = $(tr).appendTo('#table-body tbody').data('data', data[i]);
                    }
                } else {
                    $('#table-body tbody').html('<tr class="no-result"><td class="text-center" colspan="' + (multi == 'true' ? 7 : 6) + '">没有搜索到结果</td></tr>');
                }
            }
        });
    }
});