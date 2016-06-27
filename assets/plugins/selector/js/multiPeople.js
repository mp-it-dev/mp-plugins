require(['jquery', 'util', 'ztree'], function($, util) {
	var apiUrl = decodeURIComponent(util.queryString('apiurl'));
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
		        $('#jobList').empty();
		        searchPeople();

		        $.ajax({
		        	url: apiUrl + 'Organization/GetJobNode',
		        	data: {
		        		depId: treeNode.id
		        	},
		        	dataType: 'jsonp',
		        	success: function(data) {
		        		var html = '<li class="selected">' +
	        							'<img src="./img/group.png" />' +
	        							'<span>所有职位</span>' +
	        						'</li>';

	        			for (var i = 0; i < data.length; i++) {
	        			    html += '<li data-jobid="' + data[i].JobId + '">'+
	        			    			'<img src="./img/worker.png" />' +
	        			    			'<span>' + data[i].JobName + '</span>'+
	        			    		'</li>';
	        			}

	        			$('#jobList').html(html);		        		
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
    // 查询职位下的员工
    $(document).on('click', '#jobList li', function() {
    	$('#jobList li').removeClass('selected');
    	$(this).addClass('selected');

    	searchPeople();
    });

    // 点击行勾选/取消勾选复选框
    $(document).on('click', '#peopleList tr', function() {
        var checked = !$(this).find('input[type="checkbox"]').prop('checked');
        $(this).find('input[type="checkbox"]').prop('checked', checked).trigger('change');
    });

    // 加入选择或取消选择
    $(document).on('change', '#peopleList input[type="checkbox"]', function() {
        var selectedData = $('#selectedList').data('selectedData') || [];
        var tr = $(this).parents('tr');

        var data = { 
            Badge: $('td:eq(1)', tr).text(),
            Name: $('td:eq(2)', tr).text(),
            Email: $('td:eq(3)', tr).text()
        }

        if ($(this).prop('checked')) {
            if (util.indexOf(selectedData, data, 'Badge') == -1) {
                selectedData.push(data);
            }            
        } else {
            util.removeOf(selectedData, data, 'Badge');
        }

        $('#selectedList').data('selectedData', selectedData);
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

    $('#search-keyword').on('keydown', function(e) {
        if (e.which == 13) {
            searchPeople();
        }
    });

    $('#search-btn').on('click', function(e) {
        searchPeople();
    });

    $('#deleteSelected').on('click', function() {
        var selectedData = $('#selectedList').data('selectedData') || [];
        var delData = [];

        $('#selectedList input[type="checkbox"]:checked').each(function() {
            var idx = $(this).parents('tr').data('index');
            delData.push(selectedData[idx]);
        });

        for (var i = 0; i < delData.length; i++) {
            util.removeOf(selectedData, delData[i], 'Badge');
        }
        
        $('#selectedList').data('selectedData', selectedData);
        showSelectedData();
    });

    $('#submitSelected').on('click', function() {
        var cb = parent[util.queryString('callback')];

        if (typeof cb == 'function') {
            var selectedData = $('#selectedList').data('selectedData') || [];

            cb(selectedData);
        }
    });

    //////////////
    ///函数声明
    //////////////
    
    function searchPeople() {
    	var depId = treeObj.getSelectedNodes()[0].id;
    	var jobId = $('#jobList li.selected').data('jobid');
        var keyword = $('#search-keyword').val();

        $('#loading').show();
        $('#peopleList').empty();
        $('.js-select-all[data-target="#peopleList"]').prop('checked', false);

        $.ajax({
        	url: apiUrl + 'Organization/GetPeopleResult',
        	data: {
        		depId: depId,
        		jobId: jobId,
        		keyword: keyword
        	},
        	dataType: 'jsonp',
        	success: function(data) {
        		$('#loading').hide();

        		if (data && data.length > 0) {
        			var html = '';

        			for (var i = 0; i < data.length; i++) {
        			    html += '<tr>';
                        html +=     '<td width="40"><input type="checkbox"></td>';
        			    html += 	'<td width="80">' + data[i].Badge + '</td>';
        			    html += 	'<td width="80">' + data[i].Name + '</td>';
        			    html += 	'<td>' + data[i].Email + '</td>';
        			    html += '</tr>';
        			}

        			$('#peopleList').html(html);
        		}        		
        	}
        });
    }

    function showSelectedData() {
        var selectedData = $('#selectedList').data('selectedData');
        var html = '';

        for (var i = 0; i < selectedData.length; i++) {
            html += '<tr data-index="' + i + '">';
            html +=     '<td width="40"><input type="checkbox"></td>';
            html +=     '<td width="80">' + selectedData[i].Badge + '</td>';
            html +=     '<td width="80">' + selectedData[i].Name + '</td>';
            html +=     '<td>' + selectedData[i].Email + '</td>';
            html += '</tr>';
        }

        $('#selectedList').html(html);
    }
});