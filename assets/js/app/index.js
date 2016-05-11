require(['jquery', 'util', 'bootstrap', 'uploadify', 'tlayer', 'plugins'], function ($, util) {
	$('#cc').scrollbar();
	$('#autoComplete').autoComplete({
		async: {
            url: 'http://192.168.4.86:100/Selector/Product/GetCpxList',
            dataType: 'jsonp',
            dataField: null,
            searchField: 'keyword'
        },
        //dataList: [{"id":"cpx_2","pid":0,"name":"交换机","isParent":true,"ActualId":2},{"id":"cpx_3","pid":0,"name":"路由器","isParent":true,"ActualId":3},{"id":"cpx_5","pid":0,"name":"安全","isParent":true,"ActualId":5},{"id":"cpx_4","pid":0,"name":"统一通信","isParent":true,"ActualId":4},{"id":"cpx_6","pid":0,"name":"网管运维软件","isParent":true,"ActualId":6},{"id":"cpx_7","pid":0,"name":"WLAN","isParent":true,"ActualId":7},{"id":"cpx_881","pid":0,"name":"迎客无限","isParent":true,"ActualId":881},{"id":"cpx_941","pid":0,"name":"商业产品","isParent":true,"ActualId":941},{"id":"cpx_11","pid":0,"name":"车载及媒推","isParent":true,"ActualId":11},{"id":"cpx_12","pid":0,"name":"其他","isParent":true,"ActualId":12},{"id":"cpx_1221","pid":0,"name":"欣点产品","isParent":true,"ActualId":1221}],
        template: '<td>#{name}</td><td>#{id}</td>',
        maxNum: 10,
        //autoHide: true,
        localSearchField: 'name',
        callback: function (data) {
        	$('#autoComplete').val(data.name);
        }
	});
	
	var table = $("#table").table({
		height: 400,
		url: "https://api.douban.com/v2/movie/top250?start=1",
		dataType: 'jsonp',
		jsonp: 'callback',
		tableClass: 'table-border',
		data: function () {
			return {
				keyword: $('#keyword').val()
			};
		},
		dataField: "subjects",
		paging: {
			enable: true,
			indexField: "start",
			sizeField: "count",
			pageSize: 20
		},
		colOptions: [{
			name: '名称',
			field: 'title',
			edit: {
				replace: function (rowData) {
					return '<input value="'+rowData.title+'" />';
				}
			},
			sort: {
				sname: 'title',
				sorder: 'asc'
			},
			handler: function (value, data) {
				return '<a href="'+data.alt+'" target="_blank">'+data.title+'</a>';
			}
		}, {
			name: '原始名称',
			field: 'original_title'
		}, {
			name: '年代',
			field: 'year'
		}, {
			name: '类型',
			field: 'genres'
		}, {
			name: '收藏数',
			field: 'collect_count'
		}]
	});	

	$('#search').click(function () {
		table.table('reload', {type: 'he'});
	});

	$('#upload').uploadify();

	$('#singlePeople').click(function () {
		$.content({
			header: '单人',
			content: {
				width: 880,
				height: 480,
				src: 'http://eipdev.maipu.com/MpSelector/Selector/SinglePeople'
			},
			onInit: function() {
				var t = Date.now();

				while (Date.now() - t < 3000) {}
			}
		});
	});

	$('#multiPeople').click(function () {
		$.content({
			header: '多人',
			content: {
				width: 880,
				height: 480,
				src: 'http://eipdev.maipu.com/MpSelector/Selector/MultiPeople'
			}
		});
	});

	$('#singleDep').click(function () {
		$.content({
			theme: 'blue',
			header: '单部门',
			content: {
				width: 430,
				height: 380,
				src: 'http://eipdev.maipu.com/MpSelector/Selector/SingleDep'
			}
		});
	});

	$('#multiDep').click(function () {
		$.content({
			theme: 'blue',
			header: '多部门',
			content: {
				width: 780,
				height: 410,
				src: 'http://eipdev.maipu.com/MpSelector/Selector/MultiDep'
			}
		});
	});

	$('#singleJob').click(function () {
		$.content({
			theme: 'black',
			header: '单职位',
			content: {
				width: 430,
				height: 380,
				src: 'http://eipdev.maipu.com/MpSelector/Selector/SingleJob'
			}
		});
	});

	$('#multiJob').click(function () {
		$.content({
			theme: 'black',
			header: '多职位',
			content: {
				width: 780,
				height: 410,
				src: 'http://eipdev.maipu.com/MpSelector/Selector/MultiJob'
			}
		});
	});

	$('#singleJobList').click(function () {
		$.content({
			theme: 'black',
			header: '单职位列表',
			content: {
				width: 430,
				height: 410,
				src: 'http://eipdev.maipu.com/MpSelector/Selector/SingleJobList'
			}
		});
	});

	$('#msg').click(function () {
		$.msg('这是一个msg弹出框');
	});

	$('#alert').click(function () {
		$.alert('这是一个alert弹出框', 0, function () {
			alert(1);
		});
	});

	$('#tips').click(function () {
		$.tips('这是一个tips提示框');
	});

	$('#loading').click(function () {
		$.loading('这是一个loading加载框');
	});

	$('#content').click(function () {
		$.content({
			header: '这是标题',
			content: {
				html: '这是一个content弹出框'
			},
			beforeClose: function () {
				console.log(arguments);
			}
		});
	});

	$('#confirm').click(function () {
		$.confirm('您确定要这么做吗？', function (result) {
			if (result) {
				alert(1)
			}
		});
	});

	$('[name="countries"]').on('changed.ui.select', function (e, value, oldValue) {
		console.log(value)
		console.log(oldValue)
	});

	$('#resizeTest').uiResize({
		// minWidth: 1000,
		// maxWidth: 1300
	});

	$('#uiSelector').uiSelect({
		data: [{
			value: '1',
			text: '中国',
			other: '亚洲'
		}, {
			value: '2',
			text: '美国',
			other: '美洲'
		}, {
			value: '3',
			text: '日本',
			other: '亚洲'
		}, {
			value: '4',
			text: '英国',
			other: '欧洲'
		}],
		fields: [{
			name: 'text',
			width: '50%'
		}, {
			name: 'other',
			width: '50%'
		}],
		name: 'test_country'
	});

	var rMenu = $.rightMenu({
		menu: [{
			icon: '<i class="glyphicon glyphicon-plus" style="color: green;"></i>',
			text: '新建目录',
			callback: function (e, obj) {
				console.log('新建目录')
			}
		}, {
			icon: '<i class="glyphicon glyphicon-remove" style="color: red;"></i>',
			text: '删除目录',
			callback: function (e) {
				console.log('删除目录')
			}
		}, {
			icon: '<i class="glyphicon glyphicon-upload" style="color: blue;"></i>',
			text: '上传文件',
			callback: function (e) {
				console.log('上传文件')
			}
		}]
	});

	$('#table').on('contextmenu', '.table-body .table-tr', function (e) {
		rMenu.show(e.clientX, e.clientY, this);
			
		return false;
	});
});