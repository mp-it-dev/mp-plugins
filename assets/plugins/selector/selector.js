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
        if (typeof jQuery === 'undefined' || !jQuery.tlayer) {
            throw new Error('selector depends on jquery, tlayer');
        }

        factory(jQuery, window);
    }
}
(function ($, global) {
	// 占用全局变量
	var selectorGlobal = window.selectorGlobal || (window.selectorGlobal = {});
	var selector = {
		apiUrl: 'http://webapi.maipu.com/Selector/',
		baseUrl: './',
		//单人
		singlePeople: function (option) {
			var obj = selectorGlobal.singlePeople || (selectorGlobal.singlePeople = {});

			obj.apiUrl = option.apiUrl || this.apiUrl;
			obj.badge = option.badge;
			obj.callback = option.callback;

			$.content({
				layerID: option.layerID || false,
				theme: 'blue',
				header: '单人',
				content: {
					width: 930,
					height: 480,
					padding: 0,
					src: this.baseUrl + 'singlePeople.html?callback=singlePeopleCallback&apiurl=' + encodeURIComponent(this.apiUrl) + '&badge=' + option.badge + '&t=' + new Date().getTime()
				}
			});
		},
		//多人
		multiPeople: function (option) {
			var obj = selectorGlobal.multiPeople || (selectorGlobal.multiPeople = {});
			
			obj.apiUrl = option.apiUrl || this.apiUrl;
			obj.badge = option.badge;
			obj.callback = option.callback;
			obj.oldData = option.oldData;

			$.content({
				layerID: option.layerID || false,
				theme: 'blue',
				header: '多人',
				content: {
					width: 930,
					height: 480,
					padding: 0,
					src: this.baseUrl + 'multiPeople.html?t=' + new Date().getTime()
				}
			});
		},
		//单部门
		singleDep: function (option) {
			var obj = selectorGlobal.singleDep || (selectorGlobal.singleDep = {});
			
			obj.apiUrl = option.apiUrl || this.apiUrl;
			obj.callback = option.callback;

			$.content({
				layerID: option.layerID || false,
				theme: 'blue',
				header: '单部门',				
				content: {
					width: 530,
					height: 480,
					padding: 0,
					src: this.baseUrl + 'singleDep.html?t=' + new Date().getTime()
				}
			});
		},
		//多部门
		multiDep: function (option) {
			var obj = selectorGlobal.multiDep || (selectorGlobal.multiDep = {});
			
			obj.apiUrl = option.apiUrl || this.apiUrl;
			obj.callback = option.callback;
			obj.oldData = option.oldData;

			$.content({
				layerID: option.layerID || false,
				theme: 'blue',
				header: '多部门',
				content: {
					width: 750,
					height: 480,
					padding: 0,
					src: this.baseUrl + 'multiDep.html?t=' + new Date().getTime()
				}
			});
		},
		//单职位
		singleJob: function (option) {
			var obj = selectorGlobal.singleJob || (selectorGlobal.singleJob = {});
			
			obj.apiUrl = option.apiUrl || this.apiUrl;
			obj.callback = option.callback;

			$.content({
				layerID: option.layerID || false,
				theme: 'blue',
				header: '单职位',				
				content: {
					width: 530,
					height: 480,
					padding: 0,
					src: this.baseUrl + 'singleJob.html?t=' + new Date().getTime()
				}
			});
		},
		//多职位
		multiJob: function (option) {
			var obj = selectorGlobal.multiJob || (selectorGlobal.multiJob = {});
			
			obj.apiUrl = option.apiUrl || this.apiUrl;
			obj.callback = option.callback;
			obj.oldData = option.oldData;

			$.content({
				layerID: option.layerID || false,
				theme: 'blue',
				header: '多职位',
				content: {
					width: 530,
					height: 480,
					padding: 0,
					src: this.baseUrl + 'multiJob.html?t=' + new Date().getTime()
				}
			});
		},
		//单部门职位
		singleDepJob: function (option) {
			var obj = selectorGlobal.singleDepJob || (selectorGlobal.singleDepJob = {});
			
			obj.apiUrl = option.apiUrl || this.apiUrl;
			obj.callback = option.callback;

			$.content({
				layerID: option.layerID || false,
				theme: 'blue',
				header: '单部门职位',
				content: {
					width: 530,
					height: 480,
					padding: 0,
					src: this.baseUrl + 'singleDepJob.html?t=' + new Date().getTime()
				}
			});
		},
		//多部门职位
		multiDepJob: function (option) {
			var obj = selectorGlobal.multiDepJob || (selectorGlobal.multiDepJob = {});
			
			obj.apiUrl = option.apiUrl || this.apiUrl;
			obj.callback = option.callback;
			obj.oldData = option.oldData;

			$.content({
				layerID: option.layerID || false,
				theme: 'blue',
				header: '多部门职位',
				content: {
					width: 750,
					height: 480,
					padding: 0,
					src: this.baseUrl + 'multiDepJob.html?t=' + new Date().getTime()
				}
			});
		},		
		//选择产品结构
		product: function (option) {
			selectorGlobal.productCallback = option.callback;
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