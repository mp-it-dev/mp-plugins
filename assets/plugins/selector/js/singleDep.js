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
    
    

    //////////////
    ///函数声明
    //////////////
    
});