require(['jquery', 'util', 'ztree'], function($, util) {
    var option = parent.selectorGlobal.singlePeople;
    var apiUrl = option.apiUrl;
    var badge = option.badge;
    var callback = option.callback;
	var rootNodes = [{ id: 'C01', name: '迈普通信', pid: null, isParent: true, nocheck: true }];

    if (badge) {
        rootNodes.push({ id: 'C02', name: '自定义组', pid: null, isParent: false, nocheck: true, icon: './img/file.png' });
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
		        $('#jobList').empty();

		        if (treeNode.id != 'C02') {
                    searchPeople(false);
                    $.ajax({
                        url: apiUrl + 'Organization/GetJobNode',
                        data: {
                            depID: treeNode.id
                        },
                        dataType: 'jsonp',
                        success: function (dataList) {
                            var data;
                            var html = '<li class="selected" data-type="job">' +
                                            '<img src="./img/group.png" />' +
                                            '<span>所有职位</span>' +
                                        '</li>';

                            for (var i = 0; i < dataList.length; i++) {
                                data = dataList[i];
                                html += '<li data-type="job" data-jobid="' + data.JobID + '">'+
                                            '<img src="./img/worker.png" />' +
                                            '<span>' + data.JobName + '</span>'+
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
                        success: function (dataList) {
                            var data;
                            var html = '';

                            for (var i = 0; i < dataList.length; i++) {
                                data = dataList[i];
                                html += '<li data-type="group" data-id="' + data.ID + '" data-ygid="' + data.YgID + '">'+
                                            '<img src="./img/worker.png" />' +
                                            '<span>' + data.GroupName + '</span>'+
                                        '</li>';
                            }

                            $('#jobList').html(html);
                            $('#peopleList tbody').empty();
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

    //展开第一个节点
    var defaultNode = treeObj.getNodes()[0];
    treeObj.selectNode(defaultNode);
    treeObj.expandNode(defaultNode);
    treeObj.setting.callback.onExpand(null, treeObj.setting.treeId, defaultNode);

    ///////////////
    //事件绑定
    //////////////
    
    $(document).on('click', '#jobList li', function() {
    	$('#jobList li').removeClass('selected');
    	$(this).addClass('selected');

    	if ($(this).data('type') == 'job') {
            searchPeople(false);
        } else {
            getGroupPeople();
        }
    });

    $(document).on('click', '#peopleList tr', function() {
    	if (typeof callback == 'function') {
	    	var data = $(this).data('data');
    		callback(data);
    	}
    });

    $('#search-keyword').on('keydown', function(e) {
        if (e.which == 13) {
            searchPeople(true);
        }
    });

    $('#search-btn').on('click', function(e) {
        searchPeople(true);
    });

    //////////////
    ///函数声明
    //////////////
    
    function searchPeople(isSearch) {
        if ($('#loading').is(':visible')) {
            return;
        }

    	var depID = isSearch ? '' : treeObj.getSelectedNodes()[0].id;
    	var jobID = isSearch? '' : $('#jobList li.selected').data('jobid');
        var keyword = isSearch? $('#search-keyword').val() : '';

        $('#loading').show();

        $.ajax({
        	url: apiUrl + 'Organization/GetPeopleResult',
        	data: {
                depID: depID,
                jobID: jobID,
        		keyword: keyword
        	},
        	dataType: 'jsonp',
        	success: function (dataList) {
        		$('#loading').hide();
                var result = $('#peopleList tbody').empty();

        		if (dataList && dataList.length > 0) {
        			var tr;
                    var data;

        			for (var i = 0; i < dataList.length; i++) {
                        data = dataList[i];
                        tr = $(
                            '<tr>' +
                                '<td>' + data.Badge + '</td>' +
                                '<td>' + data.Name + '</td>' +
                                '<td><div class="text-hidden" title="' + data.DepName + '">' + data.DepName + '</div></td>' +
                                '<td><div class="text-hidden" title="' + data.JobName + '">' + data.JobName + '</div></td>' +
                            '</tr>'
                        ).data('data', data);        			    

                        result.append(tr);
        			}
        		}        		
        	}
        });
    }

    function getGroupPeople() {
        var groupID = $('#jobList li.selected').data('id');
        var ygID = $('#jobList li.selected').data('ygid');
        var result = $('#peopleList tbody').empty();

        $('#loading').show();
        $('.js-select-all[data-target="#peopleList"]').prop('checked', false);

        $.ajax({
            url: apiUrl + 'Organization/GetGroupPeopleList',
            data: {
                groupID: groupID,
                ygID: ygID
            },
            dataType: 'jsonp',
            success: function (dataList) {
                $('#loading').hide();

                if (dataList && dataList.length > 0) {
                    var tr;
                    var data;

                    for (var i = 0; i < dataList.length; i++) {
                        data = dataList[i];
                        tr = $(
                            '<tr>' +
                                '<td>' + data.Badge + '</td>' +
                                '<td>' + data.Name + '</td>' +
                                '<td><div class="text-hidden" title="' + data.DepName + '">' + (data.DepName || '') + '</div></td>' +
                                '<td><div class="text-hidden" title="' + data.JobName + '">' + (data.JobName || '') + '</div></td>' +
                            '</tr>'
                        ).data('data', data);                        

                        result.append(tr);
                    }
                }               
            }
        });
    }
});