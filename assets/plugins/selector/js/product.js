require(['jquery', 'util', 'ztree'], function($, util) {
	var apiUrl = decodeURIComponent(util.queryString('apiurl'));
    var type = util.queryString('type') || 'Cp';
    var multi = util.queryString('multi') || 'false';
    var zhuji = util.queryString('zhuji') || 'false';
    var cb = parent[util.queryString('callback')];

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
                    url += 'Product/GetCpList?cpxlid=' + treeNode.ID + '&zhuji=' + zhuji;
                }

            	$.ajax({
			    	url: url,
			    	dataType: 'jsonp',
			    	success: function(dataList) {
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
                if (multi == 'false' && treeNode.isLeaf) {
                    if (typeof cb == 'function') {                        
                        cb({
                            Type: treeNode.Type,
                            ID: treeNode.ID,
                            Name: treeNode.Name,
                            Node: treeNode
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
        $('#ztree').height($('#ztree').height() - 30);
    }

    $.ajax({
        url: apiUrl + 'Product/GetCpxList',
        dataType: 'jsonp',
        success: function (dataList) {
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
    // 产品树选中结果
    $('#submitSelected').on('click', function() {
        if (typeof cb == 'function') {
            var selectedData = [];
            var nodes = treeObj.getCheckedNodes();

            for (var i = 0, l = nodes.length; i < l; i++) {
                selectedData.push({
                    Type: nodes[i].Type,
                    ID: nodes[i].ID,
                    Name: nodes[i].Name,
                    Node: nodes[i]
                });
            }            

            if (!selectedData.length) {
                alert('没有选择任何数据！');
                return false;
            }

            cb(selectedData);
        }
    });
});