require(['jquery', 'util', 'ztree'], function($, util) {
    var option = parent.selectorGlobal.multiPeople;
    var apiUrl = option.apiUrl;
    var badge = option.badge;
    var callback = option.callback;
	var rootNodes = [{ id: 'C01', name: '迈普通信', pid: null, isParent: true, nocheck: true }];
    var selectedData = [];

    if (badge) {
        rootNodes.push({ id: 'C02', name: '自定义组', pid: null, isParent: false, nocheck: true, icon: './img/file.png' });
    }
    if (option.oldData && option.oldData.length) {
        selectedData = option.oldData.slice(0);
    }

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
                $('#jobList').empty();

                if (treeNode.id != 'C02') {
                    searchPeople();                    
                    $.ajax({
                        url: apiUrl + 'Organization/GetJobNode',
                        data: {
                            depID: treeNode.id
                        },
                        dataType: 'jsonp',
                        success: function(data) {
                            var html = '<li class="selected" data-type="job">' +
                                            '<img src="./img/group.png" />' +
                                            '<span>所有职位</span>' +
                                        '</li>';

                            for (var i = 0; i < data.length; i++) {
                                html += '<li data-type="job" data-jobid="' + data[i].JobID + '">'+
                                            '<img src="./img/worker.png" />' +
                                            '<span>' + data[i].JobName + '</span>'+
                                        '</li>';
                            }

                            $('#jobList').html(html);                     
                        }
                    });
                } else {
                    $.ajax({
                        url: apiUrl + 'Organization/GetGroupList',
                        data: {
                            badge: badge
                        },
                        dataType: 'jsonp',
                        success: function(data) {
                            var html = '';

                            for (var i = 0; i < data.length; i++) {
                                html += '<li data-type="group" data-id="' + data[i].ID + '" data-ygid="' + data[i].YgID + '">'+
                                            '<img src="./img/worker.png" />' +
                                            '<span>' + data[i].GroupName + '</span>'+
                                        '</li>';
                            }

                            $('#jobList').html(html);
                            $('#peopleList').empty();
                            $('#jobList li:eq(0)').trigger('click');
                        }
                    });
                }		        
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
    // 查询职位/分组下的员工
    $(document).on('click', '#jobList li', function() {
    	$('#jobList li').removeClass('selected');
    	$(this).addClass('selected');

        if ($(this).data('type') == 'job') {
    	   searchPeople(false);
        } else {
            getGroupPeople();
        }
    });

    // 点击行勾选/取消勾选复选框
    $(document).on('click', '#peopleList tr', function() {
        var checked = !$(this).find('input[type="checkbox"]').prop('checked');
        $(this).find('input[type="checkbox"]').prop('checked', checked).trigger('change');
    });

    // 加入选择或取消选择
    $(document).on('change', '#peopleList input[type="checkbox"]', function() {
        var data = $(this).parents('tr').data('data');

        if ($(this).prop('checked')) {
            if (util.indexOf(selectedData, data, 'Badge') == -1) {
                selectedData.push(data);
            }            
        } else {
            util.removeOf(selectedData, data, 'Badge');
        }

        showSelectedData();

        var totalNum = $('#peopleList input[type="checkbox"]').length;
        var selectedNum = $('#peopleList input[type="checkbox"]:checked').length;

        $('.js-select-all[data-target="#peopleList"]').prop('checked', totalNum == selectedNum);
    });

    // 勾选/取消勾选已选择列表
    $(document).on('click', '#selectedList tr', function() {    	
    	$(this).find('input[type="checkbox"]').prop('checked', !$(this).find('input[type="checkbox"]').prop('checked'));
    });

    // 阻止冒泡
    $(document).on('click', '#peopleList tr input[type="checkbox"], #selectedList tr input[type="checkbox"]', function(e) {      
        e.stopPropagation();
    });

    // 全选
    $(document).on('change', '.js-select-all', function(e) {      
        var checked = $(this).prop('checked');
        var target = $(this).data('target');

        $(target).find('input[type="checkbox"]').each(function () {
            $(this).prop('checked', checked).trigger('change');
        });
    });

    // enter键搜索
    $('#search-keyword').on('keydown', function(e) {
        if (e.which == 13) {
            searchPeople(true);
        }
    });

    // 搜索
    $('#search-btn').on('click', function(e) {
        searchPeople(true);
    });

    // 删除
    $('#deleteSelected').on('click', function() {
        var delData = [];

        $('#selectedList input[type="checkbox"]:checked').each(function() {
            var idx = $(this).parents('tr').data('index');
            delData.push(selectedData[idx]);
        });

        for (var i = 0; i < delData.length; i++) {
            util.removeOf(selectedData, delData[i], 'Badge');
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
    //////////////
    
    function searchPeople(isSearch) {
        if ($('#loading').is(':visible')) {
            return;
        }
        
    	var depID = isSearch ? '' : treeObj.getSelectedNodes()[0].id;
        var jobID = isSearch ? '' : $('#jobList li.selected').data('jobid');
        var keyword = isSearch ? $('#search-keyword').val() : '';

        $('#loading').show();
        $('.js-select-all[data-target="#peopleList"]').prop('checked', false);

        $.ajax({
        	url: apiUrl + 'Organization/GetPeopleResult',
        	data: {
        		depID: depID,
        		jobID: jobID,
        		keyword: keyword
        	},
        	dataType: 'jsonp',
        	success: function(data) {
        		$('#loading').hide();
                var result = $('#peopleList tbody').empty();

        		if (data && data.length > 0) {
                    var tr;

                    for (var i = 0; i < data.length; i++) {
                        tr = $(
                            '<tr>' +
                                '<td><input type="checkbox"></td>' +
                                '<td>' + data[i].Badge + '</td>' +
                                '<td>' + data[i].Name + '</td>' +
                                '<td><div class="text-hidden" title="' + data[i].DepName + '">' + data[i].DepName + '</div></td>' +
                                '<td><div class="text-hidden" title="' + data[i].JobName + '">' + data[i].JobName + '</div></td>' +
                            '</tr>'
                        ).data('data', data[i]);                        

                        result.append(tr);
                    }
                }        		
        	}
        });
    }

    function getGroupPeople() {
        var groupID = $('#jobList li.selected').data('id');
        var ygID = $('#jobList li.selected').data('ygid');

        $('#loading').show();
        $('.js-select-all[data-target="#peopleList"]').prop('checked', false);

        $.ajax({
            url: apiUrl + 'Organization/GetGroupPeopleList',
            data: {
                groupID: groupID,
                ygID: ygID
            },
            dataType: 'jsonp',
            success: function(data) {
                $('#loading').hide();
                var result = $('#peopleList tbody').empty();

                if (data && data.length > 0) {
                    var tr;

                    for (var i = 0; i < data.length; i++) {
                        tr = $(
                            '<tr>' +
                                '<td><input type="checkbox"></td>' +
                                '<td>' + data[i].Badge + '</td>' +
                                '<td>' + data[i].Name + '</td>' +
                                '<td><div class="text-hidden" title="' + data[i].DepName + '">' + (data[i].DepName || '') + '</div></td>' +
                                '<td><div class="text-hidden" title="' + data[i].JobName + '">' + (data[i].JobName || '') + '</div></td>' +
                            '</tr>'
                        ).data('data', data[i]);                        

                        result.append(tr);
                    }
                }               
            }
        });
    }

    function showSelectedData() {
        var result = $('#selectedList tbody').empty();
        var tr;

        for (var i = 0; i < selectedData.length; i++) {
            tr = $(
                '<tr>' +
                    '<td><input type="checkbox"></td>' +
                    '<td>' + selectedData[i].Badge + '</td>' +
                    '<td>' + selectedData[i].Name + '</td>' +
                    '<td><div class="text-hidden" title="' + selectedData[i].DepName + '">' + (selectedData[i].DepName || '') + '</div></td>' +
                    '<td><div class="text-hidden" title="' + selectedData[i].JobName + '">' + (selectedData[i].JobName || '') + '</div></td>' +
                '</tr>'
            ).data('index', i);                        

            result.append(tr);
        }
    }
});