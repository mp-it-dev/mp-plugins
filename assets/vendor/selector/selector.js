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
		apiUrl: 'http://webapi.maipu.com/Selector-v2/',
		baseUrl: './',
		badge: '',
		//单人
		singlePeople: function (option) {
			option.apiUrl = option.apiUrl || this.apiUrl;
			option.badge = option.badge || this.badge;
			selectorGlobal.singlePeople = option;
			$.content({
				layerID: option.layerID || false,
				theme: 'blue',
				header: '单人',
				content: {
					width: 930,
					height: 480,
					padding: 0,
					src: this.baseUrl + 'singlePeople.html?t=' + new Date().getTime()
				}
			});
		},
		//多人
		multiPeople: function (option) {
			option.apiUrl = option.apiUrl || this.apiUrl;
			option.badge = option.badge || this.badge;
			selectorGlobal.multiPeople = option;			
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
			option.apiUrl = option.apiUrl || this.apiUrl;
			selectorGlobal.singleDep = option;
			$.content({
				layerID: option.layerID || false,
				theme: 'blue',
				header: '单部门',				
				content: {
					width: 800,
					height: 480,
					padding: 0,
					src: this.baseUrl + 'singleDep.html?t=' + new Date().getTime()
				}
			});
		},
		//多部门
		multiDep: function (option) {
			option.apiUrl = option.apiUrl || this.apiUrl;
			selectorGlobal.multiDep = option;
			$.content({
				layerID: option.layerID || false,
				theme: 'blue',
				header: '多部门',
				content: {
					width: 800,
					height: 480,
					padding: 0,
					src: this.baseUrl + 'multiDep.html?t=' + new Date().getTime()
				}
			});
		},
		//单职位
		singleJob: function (option) {
			option.apiUrl = option.apiUrl || this.apiUrl;
			selectorGlobal.singleJob = option;
			$.content({
				layerID: option.layerID || false,
				theme: 'blue',
				header: '单职位',				
				content: {
					width: 800,
					height: 480,
					padding: 0,
					src: this.baseUrl + 'singleJob.html?t=' + new Date().getTime()
				}
			});
		},
		//多职位
		multiJob: function (option) {
			option.apiUrl = option.apiUrl || this.apiUrl;
			selectorGlobal.multiJob = option;
			$.content({
				layerID: option.layerID || false,
				theme: 'blue',
				header: '多职位',
				content: {
					width: 800,
					height: 480,
					padding: 0,
					src: this.baseUrl + 'multiJob.html?t=' + new Date().getTime()
				}
			});
		},
		//单部门职位
		singleDepJob: function (option) {
			option.apiUrl = option.apiUrl || this.apiUrl;
			selectorGlobal.singleDepJob = option;
			$.content({
				layerID: option.layerID || false,
				theme: 'blue',
				header: '单部门职位',
				content: {
					width: 800,
					height: 480,
					padding: 0,
					src: this.baseUrl + 'singleDepJob.html?t=' + new Date().getTime()
				}
			});
		},
		//多部门职位
		multiDepJob: function (option) {
			option.apiUrl = option.apiUrl || this.apiUrl;
			selectorGlobal.multiDepJob = option;
			$.content({
				layerID: option.layerID || false,
				theme: 'blue',
				header: '多部门职位',
				content: {
					width: 800,
					height: 480,
					padding: 0,
					src: this.baseUrl + 'multiDepJob.html?t=' + new Date().getTime()
				}
			});
		},		
		//单产品
		singleProduct: function (option) {
			option.apiUrl = option.apiUrl || this.apiUrl;
			selectorGlobal.singleProduct = option;
			$.content({
				layerID: option.layerID || false,
				theme: 'blue',
				header: '产品选择',
				content: {
					width: 530,
					height: 480,
					padding: 0,
					src: this.baseUrl + 'singleProduct.html?t=' + new Date().getTime()
				}
			});
		},
		//多产品
		multiProduct: function (option) {
			option.apiUrl = option.apiUrl || this.apiUrl;
			selectorGlobal.multiProduct = option;
			$.content({
				layerID: option.layerID || false,
				theme: 'blue',
				header: '产品选择',
				content: {
					width: 800,
					height: 480,
					padding: 0,
					src: this.baseUrl + 'multiProduct.html?t=' + new Date().getTime()
				}
			});
		}
	};

	if (global) {
		global.selector = selector;
	}

	return selector;
}));