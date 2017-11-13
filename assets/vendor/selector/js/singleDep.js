require(['jquery', 'util', 'ztree'], function($, util) {
    var option = parent.selectorGlobal.singleDep;
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
			    	url: apiUrl + 'Organization/GetDepNode?pid=' + treeNode.id,
			    	dataType: 'jsonp',
			    	success: function(data) {
						if (data && data.length > 0) {
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
                //顶级节点不能选中
		        if (treeNode.pid == null) {
                    return false;
                }

                if (typeof callback == 'function') {
                    var nodeList = [{ 
                        DepID: treeNode.id,
                        DepName: treeNode.name
                    }];
                    var data = { 
                        DepID: treeNode.id,
                        DepName: treeNode.name,
                        NodeList: nodeList
                    };
                    var pNode = treeNode.getParentNode();

                    while (pNode != null && pNode.pid != null) {
                        nodeList.unshift({
                            DepID: pNode.id,
                            DepName: pNode.name
                        });
                        pNode = pNode.getParentNode();
                    }

                    callback(data);
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
    $('#search-keyword').on('keydown', function(e) {
        if (e.which == 13) {
            searchDep();
        }
    });

    $('#search-btn').on('click', function(e) {
        searchDep();
    });    

    $(document).on('click', '#depList tr', function() {
        if (typeof callback == 'function') {
            var data = $(this).data('data');
            callback(data);
        }
    });

    //////////////
    ///函数声明
    //////////////
    function searchDep() {
        var keyword = $('#search-keyword').val();

        if (!keyword) return;
        $('#loading').show();
        $.ajax({
            url: apiUrl + 'Organization/SearchDepResult',
            data: {
                keyword: keyword
            },
            dataType: 'jsonp',
            success: function(data) {
                $('#loading').hide();
                var result = $('#depList tbody').empty();

                if (data && data.length > 0) {
                    var tr;
                    var parentData;

                    for (var i = 0; i < data.length; i++) {
                        parentData = data[i].NodeList[data[i].NodeList.length - 2];
                        tr = $(
                            '<tr>' +
                                '<td>' + data[i].DepID + '</td>' +
                                '<td>' + data[i].DepName + '</td>' +
                                '<td>' + (parentData ? parentData.DepID : '') + '</td>' +
                                '<td>' + (parentData ? parentData.DepName : '') + '</td>' +
                            '</tr>'
                        ).data('data', data[i]);

                        result.append(tr);
                    }
                }               
            }
        });
    }
});