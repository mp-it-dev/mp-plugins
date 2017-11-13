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
			    	url: apiUrl + 'Organization/GetDepJobNode?pid=' + treeNode.id,
			    	dataType: 'jsonp',
			    	success: function(data) {
						if (data && data.length > 0) {
                            for (var i = 0, l = data.length; i < l; i++) {
                                if (data[i].id.indexOf('J') > -1) {
                                    data[i].icon = './img/worker.png';
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
            onClick: function(event, treeId, treeNode) {
		        if (treeNode.id.indexOf('J') > -1) {
                    if (typeof callback == 'function') {
                        var pNode = treeNode.getParentNode();
                        var data = { 
                            DepID: pNode.id,
                            DepName: pNode.name,
                            JobID: treeNode.id,
                            JobName: treeNode.name
                        };
                        
                        callback(data);
                    }
                }
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
            searchDepJob();
        }
    });

    // 搜索
    $('#search-btn').on('click', function(e) {
        searchDepJob();
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