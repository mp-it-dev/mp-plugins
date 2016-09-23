require(['jquery', 'util', 'selector', 'uploadify', 'tlayer', 'plugins'], function ($, util, selector) {
	selector.baseUrl = './assets/plugins/selector/';
	selector.apiUrl = 'http://192.168.4.86:100/Selector/';

	$('#cc').scrollbar();
	$('#searchProductTree').autoComplete({
		width: '400px',
		async: {
            url: 'http://webapi.maipu.com/Selector/Product/SearchProduct',
            dataType: 'jsonp',
            dataField: null,
            searchField: 'wpbm'
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
		tableClass: 'table-condensed',
		height: 400,
		url: 'http://192.168.4.86:100/Test/User/GetList',
		dataType: 'jsonp',
		jsonp: 'callback',
		rownum: true,
		paging: {
			enable: true,
			pageSize: 20,
			pageSizeArray: [20, 40, 60]
		},
		colOptions: [{
			name: '工号',
			field: 'Badge',
			width: 80,
			fixed: true,
			edit: {
				replace: function (data) {
					return '<input value="' + data.Badge + '" />';
				}
			},
			menu: {
				sort: {
					defaultOrder: 'asc'
				},
				filter: {
					async: true
				}
			}
		}, {
			name: '姓名',
			field: 'Name',
			width: 100,
			menu: {
				sort: true,
				filter: {
					async: true
				}
			}
		}, {
			name: '姓名拼音',
			field: 'SpellName',
			width: 150
		}, {
			name: '邮箱',
			field: 'Email',
			minWidth: 200
		}, {
			name: '顶级部门名称',
			field: 'ZeroDepName',
			width: 200
		}, {
			name: '一级部门名称',
			field: 'OneDepName',
			width: 200
		}]
	});	

	$('#search, #tableRefresh').click(function () {
		table.table('reload');
	});

	$('#upload').uploadify({
		uploader: 'http://192.168.4.86:100/test/home/uploadFile',
		formData: {
			name: 'emmett'
		}
	});

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

	$('#single-ui-select').uiSelect({
		dataList: [{
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
		name: 'test_single_select',
		template: '<td>#{text}</td><td>#{other}</td>',
		textField: 'text',
		valueField: 'value',
		search: true
	});

	$('#multi-ui-select').uiSelect({
		dataList: ['中国', '美国', '日本', '英国', '法国', '俄罗斯', '印度', '巴西'],
		name: 'test_multi_select',
		search: true,
		multi: true
	});
});