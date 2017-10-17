require(['jquery', 'util', 'ztree'], function($, util) {
	var option = parent.selectorGlobal.multiProduct;
    var apiUrl = option.apiUrl;
    var type = option.type || 'Cp';
    var zhujiOnly = option.zhujiOnly === undefined ? true : option.zhujiOnly;
    var callback = option.callback;
    var filter = option.filter;
    var selectedData = [];

    if (option.oldData && option.oldData.length) {
        selectedData = option.oldData.slice(0);
    }

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
            onCheck: function(event, treeId, treeNode) {
                var data = {
                    ID: treeNode.ID,
                    Name: treeNode.Name,
                    Type: treeNode.Type,
                    Node: treeNode
                };

                if (treeNode.checked) {
                    if (util.indexOf(selectedData, data, 'ID') == -1) {
                        selectedData.push(data);
                    } 
                } else {
                    util.removeOf(selectedData, data, 'ID');
                }
                showSelectedData();
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
    showSelectedData();

    ///////////////
    // 事件绑定
    //////////////
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
            util.removeOf(selectedData, delData[i], 'ID');
        }
        
        showSelectedData();
    });

    // 确定
    $('#submitSelected').on('click', function() {
        if (typeof callback == 'function') {
            callback(selectedData);
        }
    });

    //////////////
    ///函数声明
    /////////////
    function showSelectedData() {
        var result = $('#selectedList').empty();
        var tr;

        for (var i = 0; i < selectedData.length; i++) {
            tr = $(
                '<tr>' +
                    '<td width="40"><input type="checkbox"></td>' +
                    '<td width="80">' + selectedData[i].ID + '</td>' +
                    '<td><div class="text-hidden" title="' + selectedData[i].Name + '">' + (selectedData[i].Name || '') + '</div></td>' +
                '</tr>'
            ).data('index', i);                        

            result.append(tr);
        }
    }
});