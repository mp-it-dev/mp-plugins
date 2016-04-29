define(['jquery', 'tlayer'], function($) {
	var selector = {
		baseUrl: './',
		singlePeople: function(option) {
			top.singlePeopleCallback = option.callback;

			$.content({
				theme: 'blue',
				header: '单人',
				content: {
					width: 930,
					height: 480,
					src: this.baseUrl + 'singlePeople.html?callback=singlePeopleCallback'
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
					src: this.baseUrl + 'multiPeople.html?callback=multiPeopleCallback'
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
					src: this.baseUrl + 'singleDep.html?callback=singleDepCallback'
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
					src: this.baseUrl + 'multiDep.html?callback=multiDepCallback'
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
					src: this.baseUrl + 'singleJob.html?callback=singleJobCallback'
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
					src: this.baseUrl + 'multiJob.html?callback=multiJobCallback'
				}
			});
		}
	};

	return selector;
});