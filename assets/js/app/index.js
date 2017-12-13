require(['jquery', 'util', 'selector', 'uploadify', 'tlayer', 'plugins'], function ($, util, selector) {
	selector.baseUrl = './assets/vendor/selector/';
	selector.apiUrl = 'http://webapi.maipu.com/Selector/';

	$('#searchProduct').autoComplete({
		async: {
            url: 'http://192.168.102.12:100/Selector/Product/GetCpList',
            dataType: 'jsonp',
            dataField: null,
            searchField: 'name',
            delay: 0,
            minKeywordLength: 1
        },
        width: 300,
        headerTemplate: '<th>ID</th><th>名称</th><th>版本</th>',
        template: '<td width="100">#{ID}</td><td>#{Name}</td><td width="50">#{OriginData.SaleVersion}</td>',
        maxNum: 10,
        callback: function (data) {
        	$(this).val(data.Name);
        }
	});
	
	var table = $("#table").table({
		// tableClass: 'table-bordered',
		height: 400,
		url: 'http://192.168.102.12:100/Test/User/GetList?pageIndex=1&pageSize=0',
		dataType: 'jsonp',
		jsonp: 'callback',
		rownum: true,
		checkbox: true,
		paging: {
			enable: true,
			localPage: true,
			pageIndex: 13,
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
					async: true,
					defaultOrder: 'asc'
				}
			}
		}, {
			name: '姓名',
			field: 'Name',
			width: 100,
			menu: {
				sort: true,
				filter: {
					async: false
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
		var btn = $(this);
		var type = $(this).data('type');
		var badge = $(this).data('badge');

        selector[type]({
        	badge: badge,
        	oldData: btn.data('data'),
            callback: function(data) {
                console.log(data);
                btn.data('data', data);
                $.tlayer('close');
            }
        });
	});

	$('.selector-product').on('click', function () {
		var btn = $(this);
		var type = $(this).data('type');

        selector[type]({
			type: $(this).data('level'),
			zhujiOnly: $(this).data('zhuji-only'),
			oldData: btn.data('data'),
			callback: function(data) {
	            console.log(data);
                btn.data('data', data);
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
				console.log('beforeClose');
			},
			onClose: function () {
				console.log('onClose');
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