require(['jquery', 'util', 'ztree'], function($, util) {
	var option = parent.selectorGlobal.multiDepJob;
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
			    	url: apiUrl + 'Organization/GetDepJobNode?pid=' + treeNode.id,
			    	dataType: 'jsonp',
			    	success: function(data) {
						if (data && data.length > 0) {
                            for (var i = 0, l = data.length; i < l; i++) {
                                if (data[i].id.indexOf('J') > -1) {
                                    data[i].icon = './img/worker.png';
                                } else {                                    
                                    data[i].nocheck = true;
                                }
                            }

			                treeObj.addNodes(treeNode, data);
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
            onCheck: function (event, treeId, treeNode) {
                var pNode = treeNode.getParentNode();
                var data = {
                    DepID: pNode.id,
                    DepName: pNode.name,
                    JobID: treeNode.id,
                    JobName: treeNode.name
                }

                if (treeNode.checked) {
                    if (indexOf(data) == -1) {
                        selectedData.push(data);
                    } 
                } else {
                    removeOf(data);
                }
                showSelectedData();
            }
        }
    };

    function indexOf(data) {
        var index = -1;

        for (var i in selectedData) {
            if (selectedData[i].JobID === data.JobID && selectedData[i].DepID === data.DepID) {
                index = i;
            }
        }

        return index;
    }

    function removeOf(data) {
        var index = indexOf(data);
        if (index > -1) {
            selectedData.splice(index, 1);
        }
    }

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
    $(document).on('click', '#depJobList tr', function() {
        var checked = !$(this).find('input[type="checkbox"]').prop('checked');
        $(this).find('input[type="checkbox"]').prop('checked', checked).trigger('change');
    });

    // 加入选择或取消选择
    $(document).on('change', '#depJobList input[type="checkbox"]', function() {
        var data = $(this).parents('tr').data('data');

        if ($(this).prop('checked')) {
            if (indexOf(data) == -1) {
                selectedData.push(data);
            }
        } else {
            removeOf(data);
        }

        showSelectedData();

        var totalNum = $('#depJobList input[type="checkbox"]').length;
        var selectedNum = $('#depJobList input[type="checkbox"]:checked').length;

        $('.js-select-all[data-target="#depJobList"]').prop('checked', totalNum == selectedNum);
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
    $(document).on('click', '#selectedList tr input[type="checkbox"]', function(e) {      
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
            removeOf(delData[i]);
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
            searchDepJob();
        }
    });

    // 搜索
    $('#search-btn').on('click', function(e) {
        searchDepJob();
    });
    //////////////
    ///函数声明
    //////////////
    function showSelectedData() {
        var result = $('#selectedList tbody').empty();
        var tr;

        for (var i = 0; i < selectedData.length; i++) {
            tr = $(
                '<tr>' +
                    '<td><input type="checkbox"></td>' +
                    '<td>' + selectedData[i].JobID + '</td>' +
                    '<td><div class="text-hidden" title="' + selectedData[i].JobName + '">' + (selectedData[i].JobName || '') + '</div></td>' +
                    '<td>' + selectedData[i].DepID + '</td>' +
                    '<td><div class="text-hidden" title="' + selectedData[i].DepName + '">' + (selectedData[i].DepName || '') + '</div></td>' +
                '</tr>'
            ).data('index', i);                        

            result.append(tr);
        }
    }

    // 搜索部门职位
    function searchDepJob() {
        var keyword = $('#search-keyword').val();

        if (!keyword) return;
        $('#loading').show();
        $.ajax({
            url: apiUrl + 'Organization/SearchDepJobResult',
            data: {
                keyword: keyword
            },
            dataType: 'jsonp',
            success: function(data) {
                $('#loading').hide();
                var result = $('#depJobList tbody').empty();

                if (data && data.length > 0) {
                    var tr;

                    for (var i = 0; i < data.length; i++) {
                        tr = $(
                            '<tr>' +
                                '<td><input type="checkbox"></td>' +
                                '<td>' + data[i].JobID + '</td>' +
                                '<td><div class="text-hidden" title="' + data[i].JobName + '">' + data[i].JobName + '</div></td>' +
                                '<td>' + data[i].DepID + '</td>' +
                                '<td><div class="text-hidden" title="' + data[i].DepName + '">' + data[i].DepName + '</div></td>' +
                            '</tr>'
                        ).data('data', data[i]);

                        result.append(tr);
                    }
                }               
            }
        });
    }
});