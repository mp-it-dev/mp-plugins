(function (win) {
	var selector = {
		apiUrl: 'http://10.0.0.5:8011/Selector/',
		baseUrl: './',
		singlePeople: function(option) {
			top.singlePeopleCallback = option.callback;

			$.content({
				theme: 'blue',
				header: '单人',
				content: {
					width: 930,
					height: 480,
					padding: 0,
					src: this.baseUrl + 'singlePeople.html?callback=singlePeopleCallback&apiurl=' + encodeURIComponent(this.apiUrl)
				}
			});
		},
		multiPeople: function(option) {
			top.multiPeopleCallback = option.callback;

			$.content({
				theme: 'blue',
				header: '多人',
				content: {
					width: 930,
					height: 480,
					padding: 0,
					src: this.baseUrl + 'multiPeople.html?callback=multiPeopleCallback&apiurl=' + encodeURIComponent(this.apiUrl)
				}
			});
		},
		singleDep: function(option) {
			top.singleDepCallback = option.callback;

			$.content({
				theme: 'blue',
				header: '单部门',				
				content: {
					width: 530,
					height: 480,
					padding: 0,
					src: this.baseUrl + 'singleDep.html?callback=singleDepCallback&apiurl=' + encodeURIComponent(this.apiUrl)
				}
			});
		},
		multiDep: function(option) {
			top.multiDepCallback = option.callback;

			$.content({
				theme: 'blue',
				header: '多部门',
				content: {
					width: 530,
					height: 480,
					padding: 0,
					src: this.baseUrl + 'multiDep.html?callback=multiDepCallback&apiurl=' + encodeURIComponent(this.apiUrl)
				}
			});
		},
		singleJob: function(option) {
			top.singleJobCallback = option.callback;

			$.content({
				theme: 'blue',
				header: '单职位',
				content: {
					width: 530,
					height: 480,
					padding: 0,
					src: this.baseUrl + 'singleJob.html?callback=singleJobCallback&apiurl=' + encodeURIComponent(this.apiUrl)
				}
			});
		},
		multiJob: function(option) {
			top.multiJobCallback = option.callback;

			$.content({
				theme: 'blue',
				header: '多职位',
				content: {
					width: 530,
					height: 480,
					padding: 0,
					src: this.baseUrl + 'multiJob.html?callback=multiJobCallback&apiurl=' + encodeURIComponent(this.apiUrl)
				}
			});
		},

		//选择产品结构
		product: function(option) {
			top.productCallback = option.callback;

			var width = 530;

			if (option.level == 'cp' || option.level === undefined) {
				width = 830;
			}

			$.content({
				theme: 'blue',
				header: '产品选择',
				content: {
					width: width,
					height: 480,
					padding: 0,
					src: this.baseUrl + 'product.html?callback=productCallback&apiurl=' + encodeURIComponent(this.apiUrl) + '&level=' + option.level + '&multi=' + option.multi
				}
			});
		}
	};

	if (typeof define === "function" && define.amd) {
		define(['jquery', 'tlayer'], function() {
			return selector;
		});
	} else {
		if (jQuery && jQuery.content) {
			window.selector = selector;
		} else {
			throw new Error('selector depends on jQuery and tlayer');
		}		
	}
})(this);