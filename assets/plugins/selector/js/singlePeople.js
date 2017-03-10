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
		        $('#jobList').empty();

		        if (treeNode.id != 'C02') {
                    searchPeople(false);
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
                                html += '<li data-type="group" data-id="' + data[i].Id + '" data-ygid="' + data[i].YgID + '">'+
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
        	success: function(data) {
        		$('#loading').hide();
                var result = $('#peopleList').empty();

        		if (data && data.length > 0) {
        			var tr;

        			for (var i = 0; i < data.length; i++) {
                        tr = $(
                            '<tr>' +
                                '<td width="80">' + data[i].Badge + '</td>' +
                                '<td width="80">' + data[i].Name + '</td>' +
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
        var groupId = $('#jobList li.selected').data('id');
        var ygID = $('#jobList li.selected').data('ygid');
        var result = $('#peopleList').empty();

        $('#loading').show();
        $('.js-select-all[data-target="#peopleList"]').prop('checked', false);

        $.ajax({
            url: apiUrl + 'Organization/GetGroupPeopleList',
            data: {
                groupId: groupId,
                ygID: ygID
            },
            dataType: 'jsonp',
            success: function(data) {
                $('#loading').hide();

                if (data && data.length > 0) {
                    var tr;

                    for (var i = 0; i < data.length; i++) {
                        tr = $(
                            '<tr>' +
                                '<td width="80">' + data[i].Badge + '</td>' +
                                '<td width="80">' + data[i].Name + '</td>' +
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
});