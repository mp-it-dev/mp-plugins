/**
 * [selector 组织架构、产品选择器]
 * 依赖jquery、tlayer
 * @return {[type]}         [description]
 */
(function (factory) {
    // AMD
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'tlayer'], factory);
    } else {
        if (!jQuery || !jQuery.tlayer) {
            throw new Error('jquery plugin depends on jquery, tlayer');
        }

        factory(jQuery, window);
    }
}
(function ($, global) {
	var selector = {
		apiUrl: 'http://webapi.maipu.com/Selector/',
		baseUrl: './',
		//单人
		singlePeople: function (option) {
			window.singlePeopleCallback = option.callback;
			var t = new Date().getTime();

			$.content({
				layerID: option.layerID || false,
				theme: 'blue',
				header: '单人',
				content: {
					width: 930,
					height: 480,
					padding: 0,
					src: this.baseUrl + 'singlePeople.html?callback=singlePeopleCallback&apiurl=' + encodeURIComponent(this.apiUrl) + '&badge=' + option.badge + '&t=' + t
				}
			});
		},
		//多人
		multiPeople: function (option) {
			window.multiPeopleCallback = option.callback;
			var t = new Date().getTime();

			$.content({
				layerID: option.layerID || false,
				theme: 'blue',
				header: '多人',
				content: {
					width: 930,
					height: 480,
					padding: 0,
					src: this.baseUrl + 'multiPeople.html?callback=multiPeopleCallback&apiurl=' + encodeURIComponent(this.apiUrl) + '&badge=' + option.badge + '&t=' + t
				}
			});
		},
		//单部门
		singleDep: function (option) {
			window.singleDepCallback = option.callback;
			var t = new Date().getTime();

			$.content({
				layerID: option.layerID || false,
				theme: 'blue',
				header: '单部门',				
				content: {
					width: 530,
					height: 480,
					padding: 0,
					src: this.baseUrl + 'singleDep.html?callback=singleDepCallback&apiurl=' + encodeURIComponent(this.apiUrl) + '&t=' + t
				}
			});
		},
		//多部门
		multiDep: function (option) {
			window.multiDepCallback = option.callback;
			var t = new Date().getTime();

			$.content({
				layerID: option.layerID || false,
				theme: 'blue',
				header: '多部门',
				content: {
					width: 530,
					height: 480,
					padding: 0,
					src: this.baseUrl + 'multiDep.html?callback=multiDepCallback&apiurl=' + encodeURIComponent(option.apiUrl || this.apiUrl) + '&t=' + t
				}
			});
		},
		//单职位
		singleJob: function (option) {
			window.singleJobCallback = option.callback;
			var t = new Date().getTime();

			$.content({
				layerID: option.layerID || false,
				theme: 'blue',
				header: '单职位',				
				content: {
					width: 400,
					height: 480,
					padding: 0,
					src: this.baseUrl + 'singleJob.html?callback=singleJobCallback&apiurl=' + encodeURIComponent(this.apiUrl) + '&t=' + t
				}
			});
		},
		//多职位
		multiJob: function (option) {
			window.multiJobCallback = option.callback;
			var t = new Date().getTime();

			$.content({
				layerID: option.layerID || false,
				theme: 'blue',
				header: '多职位',
				content: {
					width: 630,
					height: 480,
					padding: 0,
					src: this.baseUrl + 'multiJob.html?callback=multiJobCallback&apiurl=' + encodeURIComponent(option.apiUrl || this.apiUrl) + '&t=' + t
				}
			});
		},
		//单部门职位
		singleDepJob: function (option) {
			window.singleDepJobCallback = option.callback;
			var t = new Date().getTime();

			$.content({
				layerID: option.layerID || false,
				theme: 'blue',
				header: '单部门职位',
				content: {
					width: 530,
					height: 480,
					padding: 0,
					src: this.baseUrl + 'singleDepJob.html?callback=singleDepJobCallback&apiurl=' + encodeURIComponent(option.apiUrl || this.apiUrl) + '&t=' + t
				}
			});
		},
		//多部门职位
		multiDepJob: function (option) {
			window.multiDepJobCallback = option.callback;
			var t = new Date().getTime();

			$.content({
				layerID: option.layerID || false,
				theme: 'blue',
				header: '多部门职位',
				content: {
					width: 530,
					height: 480,
					padding: 0,
					src: this.baseUrl + 'multiDepJob.html?callback=multiDepJobCallback&apiurl=' + encodeURIComponent(option.apiUrl || this.apiUrl) + '&t=' + t
				}
			});
		},		
		//选择产品结构
		product: function (option) {
			window.productCallback = option.callback;
			var t = new Date().getTime();
			var cloneOption = $.extend({}, option);
			
			delete cloneOption.callback;
			delete cloneOption.apiUrl;
			var param = $.param(cloneOption);

			$.content({
				layerID: option.layerID || false,
				theme: 'blue',
				header: '产品选择',
				content: {
					width: 530,
					height: 480,
					padding: 0,
					src: this.baseUrl + 'product.html?callback=productCallback&apiurl=' + encodeURIComponent(option.apiUrl || this.apiUrl) + '&' + param + '&t=' + t
				}
			});
		}
	};

	if (global) {
		global.selector = selector;
	}

	return selector;
}));