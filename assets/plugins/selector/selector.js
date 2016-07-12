(function (global) {
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
					src: this.baseUrl + 'singlePeople.html?callback=singlePeopleCallback&apiurl=' + encodeURIComponent(this.apiUrl) + '&t=' + t
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
					src: this.baseUrl + 'multiPeople.html?callback=multiPeopleCallback&apiurl=' + encodeURIComponent(this.apiUrl) + '&t=' + t
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
					src: this.baseUrl + 'multiDep.html?callback=multiDepCallback&apiurl=' + encodeURIComponent(this.apiUrl) + '&t=' + t
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
					src: this.baseUrl + 'singleDepJob.html?callback=singleDepJobCallback&apiurl=' + encodeURIComponent(this.apiUrl) + '&t=' + t
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
					src: this.baseUrl + 'multiDepJob.html?callback=multiDepJobCallback&apiurl=' + encodeURIComponent(this.apiUrl) + '&t=' + t
				}
			});
		},		
		//选择产品结构
		product: function (option) {
			window.productCallback = option.callback;

			var width = 530, t = new Date().getTime();

			if (option.level == 'cp' || option.level === undefined) {
				width = 830;
			}

			$.content({
				layerID: option.layerID || false,
				theme: 'blue',
				header: '产品选择',
				content: {
					width: width,
					height: 480,
					padding: 0,
					src: this.baseUrl + 'product.html?callback=productCallback&apiurl=' + encodeURIComponent(this.apiUrl) + '&level=' + option.level + '&multi=' + option.multi + '&t=' + t
				}
			});
		}
	};

	if (typeof define === 'function' && define.amd) {
		define(['jquery', 'tlayer'], function() {
			return selector;
		});
	} else {
		if (jQuery && jQuery.content) {
			global.selector = selector;
		} else {
			throw new Error('selector depends on jQuery and tlayer');
		}		
	}
})(this);