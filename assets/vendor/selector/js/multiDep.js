require(['jquery', 'util', 'ztree'], function($, util) {
    var option = parent.selectorGlobal.multiDep;
    var apiUrl = option.apiUrl;
    var callback = option.callback;
	var rootNodes = { id: 'C01', name: '迈普通信', pid: null, isParent: true, nocheck: true };
    var selectedData = [];

    if (option.oldData && option.oldData.length) {
        selectedData = option.oldData.slice(0);
    }

    var setting = {
        data: {
            simpleData: {
                enable: true
            }
        },
        check: {
            enable: true,
            chkboxType: { 'Y': '', 'N': '' }
        },
        callback: {
            onExpand: function(event, treeId, treeNode) {
            	if (treeNode.children) {
		            return false;
		        }

            	treeNode.icon = './img/loading.gif';
        		treeObj.updateNode(treeNode);

            	$.ajax({
			    	url: apiUrl + 'Organization/GetDepResult',
                    data: {
                        parentDepID: treeNode.id === 'C01' ? '' : treeNode.id
                    },
			    	dataType: 'jsonp',
			    	success: function(dataList) {
						if (dataList && dataList.length > 0) {
                            var nodes = [];
                            var data;
                            for (var i in dataList) {
                                data = dataList[i];
                                nodes.push({
                                    id: data.DepID,
                                    name: data.DepName,
                                    pid: treeNode.id,
                                    icon: './img/file.png',
                                    isParent: true,
                                    originData: data
                                });
                            }
			                treeObj.addNodes(treeNode, nodes);
			            } else {
			                treeNode.isParent = false;
			            }

			            treeNode.icon = './img/file.png';
			            treeObj.updateNode(treeNode);
                        // 第一次焦点自动聚焦
                        if (treeNode.id === defaultNode.id) {
                            $('#search-keyword').focus();
                        }
			    	}
			    });
            },
            onClick: function(event, treeId, treeNode) {
                getDepResult(treeNode.id);
            },
            onCheck: function (event, treeId, treeNode) {
                var data = treeNode.originData;

                if (treeNode.checked) {
                    if (util.indexOf(selectedData, data, 'DepID') == -1) {
                        selectedData.push(data);
                    } 
                } else {
                    util.removeOf(selectedData, data, 'DepID');
                }
                showSelectedData();
            }
        }
    };

    ///////////////
    //页面初始化
    //////////////
    
    var treeObj = $.fn.zTree.init($('#ztree'), setting, rootNodes);
    showSelectedData();

    //展开第一个节点
    var defaultNode = treeObj.getNodes()[0];
    treeObj.selectNode(defaultNode);
    treeObj.expandNode(defaultNode);
    treeObj.setting.callback.onExpand(null, treeObj.setting.treeId, defaultNode);

    ///////////////
    //事件绑定
    //////////////
    // 点击行勾选/取消勾选复选框
    $(document).on('click', '#depList tr', function() {
        var checked = !$(this).find('input[type="checkbox"]').prop('checked');
        $(this).find('input[type="checkbox"]').prop('checked', checked).trigger('change');
    });

    // 加入选择或取消选择
    $(document).on('change', '#depList input[type="checkbox"]', function() {
        var data = $(this).parents('tr').data('data');

        if ($(this).prop('checked')) {
            if (util.indexOf(selectedData, data, 'DepID') == -1) {
                selectedData.push(data);
            }
        } else {
            util.removeOf(selectedData, data, 'DepID');
        }

        showSelectedData();

        var totalNum = $('#depList input[type="checkbox"]').length;
        var selectedNum = $('#depList input[type="checkbox"]:checked').length;

        $('.js-select-all[data-target="#depList"]').prop('checked', totalNum == selectedNum);
    });

    // 全选
    $(document).on('change', '.js-select-all', function(e) {      
        var checked = $(this).prop('checked');
        var target = $(this).data('target');

        $(target).find('input[type="checkbox"]').each(function () {
            $(this).prop('checked', checked).trigger('change');
        });
    });

    // 勾选/取消勾选已选择列表
    $(document).on('click', '#selectedList tr', function() {        
        $(this).find('input[type="checkbox"]').prop('checked', !$(this).find('input[type="checkbox"]').prop('checked'));
    });

    // 阻止冒泡
    $(document).on('click', '#depList tr input[type="checkbox"], #selectedList tr input[type="checkbox"]', function(e) {
        e.stopPropagation();
    });

    // 删除
    $('#deleteSelected').on('click', function() {
        var delData = [];

        $('#selectedList input[type="checkbox"]:checked').each(function() {
            var idx = $(this).parents('tr').data('index');
            delData.push(selectedData[idx]);
        });

        for (var i = 0; i < delData.length; i++) {
            util.removeOf(selectedData, delData[i], 'DepID');
        }
        
        showSelectedData();
    });

    // 确定
    $('#submitSelected').on('click', function() {
        if (typeof callback == 'function') {
            callback(selectedData);
        }
    });

    // 搜索
    $('#search-keyword').on('keydown', function(e) {
        if (e.which == 13) {
            var keyword = $('#search-keyword').val();
            getDepResult(undefined, keyword);
        }
    });

    $('#search-btn').on('click', function(e) {
        var keyword = $('#search-keyword').val();
        getDepResult(undefined, keyword);
    });

    //////////////
    ///函数声明
    //////////////
    
    // 显示已选择的数据
    function showSelectedData() {
        var result = $('#selectedList tbody').empty();
        var tr;
        var data;
        var parentData;

        for (var i = 0; i < selectedData.length; i++) {
            data = selectedData[i];
            if (data.NodeList) {
                parentData = data.NodeList[data.NodeList.length - 2];
            } else {
                parentData = null;
            }            
            tr = $(
                '<tr>' +
                    '<td><input type="checkbox"></td>' +
                    '<td>' + data.DepID + '</td>' +
                    '<td><div class="text-hidden" title="' + data.DepName + '">' + data.DepName + '</div></td>' +
                    '<td>' + (parentData ? parentData.DepID : '') + '</td>' +
                    '<td><div class="text-hidden" title="' + (parentData ? parentData.DepName : '') + '">' + (parentData ? parentData.DepName : '') + '</div></td>' +
                '</tr>'
            ).data('index', i);                        

            result.append(tr);
        }
    }

    // 搜索部门
    function getDepResult(parentDepID, keyword) {
        if (!parentDepID && !keyword) return;
        $('#loading').show();
        $.ajax({
            url: apiUrl + 'Organization/GetDepResult',
            data: {
                parentDepID: parentDepID === 'C01' ? '' : parentDepID,
                keyword: keyword
            },
            dataType: 'jsonp',
            success: function(dataList) {
                $('#loading').hide();
                $('.js-select-all[data-target="#depList"]').prop('checked', false);
                var result = $('#depList tbody').empty();

                if (dataList && dataList.length > 0) {
                    var tr;
                    var data;
                    var parentData;

                    for (var i = 0; i < dataList.length; i++) {
                        data = dataList[i];
                        parentData = data.NodeList[data.NodeList.length - 2];
                        tr = $(
                            '<tr>' +
                                '<td><input type="checkbox"></td>' +
                                '<td>' + data.DepID + '</td>' +
                                '<td><div class="text-hidden" title="' + data.DepName + '">' + data.DepName + '</div></td>' +
                                '<td>' + (parentData ? parentData.DepID : '') + '</td>' +
                                '<td><div class="text-hidden" title="' + (parentData ? parentData.DepName : '') + '">' + (parentData ? parentData.DepName : '') + '</div></td>' +
                            '</tr>'
                        ).data('data', data);

                        result.append(tr);
                    }
                }               
            }
        });
    }
});