require(['jquery', 'util', 'selector', 'uploadify', 'tlayer', 'plugins'], function ($, util, selector) {
	selector.baseUrl = './assets/plugins/selector/';

	$('#cc').scrollbar();
	$('#searchProductTree').autoComplete({
		width: '400px',
		async: {
            url: 'http://192.168.4.86:100/Selector/Product/SearchProduct',
            dataType: 'jsonp',
            dataField: null,
            searchField: 'keyword'
        },
        template: '<td>#{cpBm}</td><td>#{cpName}</td><td>#{zhengjiName}</td>',
        maxNum: 10,
        callback: function (data) {
        	$(this).val(data.zhengjiName);
        }
	});
	$('#searchProductByWpbm').autoComplete({
		async: {
            url: 'http://192.168.4.86:100/Selector/Product/SearchProductByFilter',
            dataType: 'jsonp',
            dataField: null,
            searchField: 'wpbm',
            delay: 0
        },
        template: '<td>#{cpBm}</td><td>#{cpName}</td>',
        maxNum: 10,
        callback: function (data) {
        	$(this).val(data.cpName);
        }
	});
	
	var table = $("#table").table({
		height: 400,
		tableClass: 'table-border',
		menu: {
			cellFilter: '#tableCellFilter',
			colShow: '#tableColShow'
		},
		url: "https://api.douban.com/v2/movie/top250",
		dataType: 'jsonp',
		jsonp: 'callback',
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
			field: 'original_title',
			width: 300
		}, {
			name: '年代',
			field: 'year',
			width: 200
		}, {
			name: '类型',
			field: 'genres',
			width: 200
		}, {
			name: '收藏数',
			field: 'collect_count',
			width: 200
		}]
	});	

	$('#search').click(function () {
		table.table('reload');
	});

	$('#upload').uploadify();

	$('.selector-organiztion').on('click', function () {
		var type = $(this).data('type');

        selector[type]({
            callback: function(data) {
                console.log(data);
                $.tlayer('close');
            }
        });
	});

	$('.selector-product').on('click', function () {
		var level = $(this).data('level');
        var multi = $(this).data('multi');

        selector.product({
            level: level,
            multi: multi,
            callback: function(data) {
                console.log(data);
                $.tlayer('close');
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
				console.log('新建目录');
			}
		}, {
			icon: '<i class="glyphicon glyphicon-remove" style="color: red;"></i>',
			text: '删除目录',
			callback: function (e) {
				console.log('删除目录');
			}
		}, {
			icon: '<i class="glyphicon glyphicon-upload" style="color: blue;"></i>',
			text: '上传文件',
			callback: function (e) {
				console.log('上传文件');
			}
		}]
	});

	$('#table').on('contextmenu', '.table-body .table-tr', function (e) {
		rMenu.show(e.clientX, e.clientY, this);
		e.preventDefault();
	});
});