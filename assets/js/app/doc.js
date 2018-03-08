require.config({
	paths: {
		'highlight': '../vendor/highlight/highlight',
		'tinymce': '../vendor/tinymce/tinymce.min',
		'highlight/xml': '../vendor/highlight/languages/xml',
		'highlight/css': '../vendor/highlight/languages/css',
		'highlight/javascript': '../vendor/highlight/languages/javascript'	
	},
	shim: {
		'highlight/xml': ['highlight'],
		'highlight/css': ['highlight'],
		'highlight/javascript': ['highlight'],
		'highlight': {
			exports: 'hljs'
		}
	}
});

require(['jquery', 'highlight', 'highlight/xml', 'highlight/css', 'highlight/javascript', 'tinymce', 'plugins'], function ($, hljs) {
	
	hljs.tabReplace = '    ';
	hljs.initHighlighting();

	tinymce.init({
		selector: "#example-richtext",	//textarea选择器
		theme: "modern",			//主题
		language: 'zh_CN',
		plugins: [
			"advlist autolink link image lists charmap print preview hr anchor pagebreak spellchecker",
			"searchreplace wordcount visualblocks visualchars code fullscreen insertdatetime media nonbreaking",
			"save table contextmenu directionality emoticons template paste textcolor importcss"
		],				//菜单栏的额外功能，如图片，链接等
		toolbar1: "undo redo | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | preview | forecolor backcolor emoticons table"	//菜单栏1
	});

	var targets = [];
	var links = $('.page-sidebar .nav > li');

	links.each(function () {
		targets.push($($('a', this).attr('href')));
	});

	$(window).on('scroll', function () {
		var scrollTop = $(this).scrollTop();

		if (scrollTop > 71) {
			$('.page-sidebar').addClass('fixed');
		} else {
			$('.page-sidebar').removeClass('fixed');
		}

		links.removeClass('active');
		var index;

		for (var i = targets.length - 1; i >= 0; i--) {
			var target = targets[i];
			if (target.offset().top - 50 < scrollTop) {
				index = i;
				break;
			}
		}

		if (index === undefined) {
			index = 0;
		}

		links.eq(index).addClass('active');
	});

	$('.page-sidebar .nav li').click(function () {
		$(this).siblings('li').removeClass('active');
		$(this).addClass('active');
	});

	$('#example-autoComolete').autoComplete({
		async: {
	        url: 'http://192.168.4.86:100/Selector/Product/GetCpList',
	        dataType: 'jsonp',
	        dataField: null,
	        searchField: 'name'
	    },
	    template: '<td width="100">#{ID}</td><td>#{Name}</td><td width="50">#{OriginData.SaleVersion}</td>',
	    maxNum: 10,
	    callback: function (data) {
	    	$(this).val(data.zhengjiName);
	    }
	});
});