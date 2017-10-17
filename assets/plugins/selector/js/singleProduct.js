require(['jquery', 'util', 'ztree'], function($, util) {
    var option = parent.selectorGlobal.singleProduct;
    var apiUrl = option.apiUrl;
    var type = option.type || 'Cp';
    var zhujiOnly = option.zhujiOnly === undefined ? true : option.zhujiOnly;
    var callback = option.callback;
    var filter = option.filter;

    var setting = {
        data: {
            simpleData: {
                enable: true,
                idKey: 'ID',
                pIdKey: 'ParentID'
            },
            key: {
                name: 'Name'
            }
        },
        callback: {
            onExpand: function(event, treeId, treeNode) {
            	if (treeNode.children) {
		            return false;
		        }

            	treeNode.icon = './img/loading.gif';
        		treeObj.updateNode(treeNode);
                var url = apiUrl;

                if (treeNode.Type == 'Cpx') {
                    url += 'Product/GetCpxlList?cpxid=' + treeNode.ID;
                } else if (treeNode.Type == 'Cpxl') {
                    url += 'Product/GetCpList?cpxlid=' + treeNode.ID + '&zhuji=' + zhujiOnly + '&pageSize=0';
                }

            	$.ajax({
			    	url: url,
			    	dataType: 'jsonp',
			    	success: function(dataList) {
                        if (filter) {
                            dataList = filter(dataList);
                        }
                        if (dataList && dataList.length) {                            
                            for (var i = 0, l = dataList.length; i < l; i++) {
                                var data = dataList[i];

                                if (data.Type == type) {
                                    data.isParent = false;
                                    data.isLeaf = true;
                                    data.icon = './img/pro.png';
                                } else {
                                    data.isParent = true;
                                    data.nocheck = true;
                                    data.icon = './img/file.png';
                                }
                            }
                            treeObj.addNodes(treeNode, dataList);
                        } else {
                            treeNode.isParent = false;
                        }

                        treeNode.icon = './img/file.png';
                        treeObj.updateNode(treeNode);
			    	}
			    });
            },
            onClick: function(event, treeId, treeNode) {
                if (treeNode.isLeaf) {
                    if (typeof callback == 'function') {
                        var data = { 
                            ID: treeNode.ID,
                            Name: treeNode.Name,
                            Type: treeNode.Type,
                            Node: treeNode
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
    $.ajax({
        url: apiUrl + 'Product/GetCpxList',
        dataType: 'jsonp',
        success: function (dataList) {
            if (filter) {
                dataList = filter(dataList);
            }
            if (dataList && dataList.length) {
                for (var i = 0, l = dataList.length; i < l; i++) {
                    var data = dataList[i];

                    if (data.Type == type) {
                        data.isParent = false;
                        data.isLeaf = true;
                        data.icon = './img/pro.png';
                    } else {
                        data.isParent = true;
                        data.nocheck = true;
                        data.icon = './img/file.png';
                    }
                }

                treeObj = $.fn.zTree.init($("#ztree"), setting, dataList);
            }            
        }
    });

    ///////////////
    // 事件绑定
    //////////////
});