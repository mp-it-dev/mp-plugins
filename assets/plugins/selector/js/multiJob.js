require(['jquery', 'util', 'ztree'], function($, util) {
	var apiUrl = decodeURIComponent(util.queryString('apiurl'));
	var rootNodes = { id: 'C01', name: '迈普通信', pid: null, isParent: true, nocheck: true };
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
			    	}
			    });
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
    
    $('#submitSelected').on('click', function() {
        var cb = parent[util.queryString('callback')];

        if (typeof cb == 'function') {
            var selectedData = [];
            var nodes = treeObj.getCheckedNodes();

            for (var i = 0, l = nodes.length; i < l; i++) {
                var pNode = nodes[i].getParentNode();
                
                selectedData.push({
                    DepId: pNode.id,
                    DepName: pNode.name,
                    JobId: nodes[i].id,
                    JobName: nodes[i].name
                });
            }

            cb(selectedData);
        }
    });

    //////////////
    ///函数声明
    //////////////
    
});