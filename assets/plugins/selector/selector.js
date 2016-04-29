define(['jquery', 'tlayer'], function($) {
	var selector = {
		apiUrl: 'http://eip.maipu.com/Selector/',
		baseUrl: './',
		singlePeople: function(option) {
			top.singlePeopleCallback = option.callback;

			$.content({
				theme: 'blue',
				header: '单人',
				content: {
					width: 930,
					height: 480,
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
					src: this.baseUrl + 'multiJob.html?callback=multiJobCallback&apiurl=' + encodeURIComponent(this.apiUrl)
				}
			});
		}
	};

	return selector;
});