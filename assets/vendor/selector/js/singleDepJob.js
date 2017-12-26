require(['jquery', 'util', 'ztree'], function($, util) {
    var option = parent.selectorGlobal.singleDepJob;
    var apiUrl = option.apiUrl;
    var callback = option.callback;
	var rootNodes = { id: 'C01', name: '迈普通信', pid: null, isParent: true, nocheck: true };
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
		        searchDepJob(treeNode.id);
            }
        }
    };

    ///////////////
    //页面初始化
    //////////////
    
    var treeObj = $.fn.zTree.init($('#ztree'), setting, rootNodes);

    //展开第一个节点
    var defaultNode = treeObj.getNodes()[0];
    treeObj.selectNode(defaultNode);
    treeObj.expandNode(defaultNode);
    treeObj.setting.callback.onExpand(null, treeObj.setting.treeId, defaultNode);

    ///////////////
    //事件绑定
    //////////////
    // 搜索
    $('#search-keyword').on('keydown', function(e) {
        if (e.which == 13) {
            var keyword = $('#search-keyword').val();
            searchDepJob(undefined, keyword);
        }
    });

    // 搜索
    $('#search-btn').on('click', function(e) {
        var keyword = $('#search-keyword').val();
        searchDepJob(undefined, keyword);
    });    

    // 选中搜索结果
    $(document).on('click', '#depJobList tr', function() {
        if (typeof callback == 'function') {
            var data = $(this).data('data');
            callback(data);
        }
    });

    //////////////
    ///函数声明
    //////////////
    function searchDepJob(parentDepID, keyword) {
        if (!parentDepID && !keyword) return;
        $('#loading').show();
        $.ajax({
            url: apiUrl + 'Organization/GetDepJobResult',
            data: {
                parentDepID: parentDepID === 'C01' ? '' : parentDepID,
                keyword: keyword
            },
            dataType: 'jsonp',
            success: function(dataList) {
                $('#loading').hide();
                var result = $('#depJobList tbody').empty();

                if (dataList && dataList.length > 0) {
                    var tr;
                    var data;

                    for (var i = 0; i < dataList.length; i++) {
                        data = dataList[i];
                        tr = $(
                            '<tr>' +
                                '<td>' + data.JobID + '</td>' +
                                '<td><div class="text-hidden" title="' + data.JobName + '">' + data.JobName + '</div></td>' +
                                '<td>' + data.DepID + '</td>' +
                                '<td><div class="text-hidden" title="' + data.DepName + '">' + data.DepName + '</div></td>' +
                            '</tr>'
                        ).data('data', data);

                        result.append(tr);
                    }
                }               
            }
        });
    }
});