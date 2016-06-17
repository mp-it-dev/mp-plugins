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
    
    $(document).on('click', '#jobList li', function() {
    	$('#jobList li').removeClass('selected');
    	$(this).addClass('selected');

    	searchPeople();
    });

    $(document).on('click', '#peopleList tr', function() {    	
    	var cb = parent[util.queryString('callback')];

    	if (typeof cb == 'function') {
	    	var data = { 
	    		Badge: $(this).children().eq(0).text(),
	    		Name: $(this).children().eq(1).text(),
	    		Email: $(this).children().eq(2).text()
	    	}

    		cb(data);
    	}
    });

    $('#search-keyword').on('keydown', function(e) {
        if (e.which == 13) {
            searchPeople();
        }
    });

    $('#search-btn').on('click', function(e) {
        searchPeople();
    });

    //////////////
    ///函数声明
    //////////////
    
    function searchPeople() {
    	var depId = treeObj.getSelectedNodes()[0].id;
    	var jobId = $('#jobList li.selected').data('jobid');
        var keyword = $('#search-keyword').val();

        $('#loading').show();
        $('#peopleList').empty()

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
});