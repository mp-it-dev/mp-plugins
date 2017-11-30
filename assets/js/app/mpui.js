require(['angular', 'util', 'mpui'], function (angular, util) {
	angular.module('app', ['mpui'])
	.controller('pageCtrl', [
		'$scope',
		'$http',
		function ($scope, $http) {
			$scope.columnList = [
				{
					name: '工号',
					field: 'Badge',
					width: 300,
					isShow: true
				}, {
					name: '姓名',
					field: 'Name',
					width: 300,
					isShow: true
				}, {
					name: '姓名拼音',
					field: 'SpellName',
					width: 300,
					isShow: true
				}, {
					name: '一级\n部门名称',
					field: 'OneDepName',
					width: 300,
					isShow: true
				}, {
					name: '邮箱',
					field: 'Email',
					width: 600,
					isShow: true
				}
			];
			$scope.userList = [];
			$scope.sname = 'Name';
			$scope.sorder = 'asc';
			$scope.total = 0;
			$scope.pageIndex = 1;
			$scope.pageSize = 10;

			$scope.getUserList = function () {
				// $.loading('loading...');
				$http.jsonp('http://192.168.102.12:100/Test/User/GetList', {				
					params: {
						sorder: $scope.sorder,
						sname: $scope.sname,
						pageIndex: $scope.pageIndex,
						pageSize: $scope.pageSize,
						callback: 'JSON_CALLBACK'
					}
				})
				.success(function (res) {
					// $.tlayer('close');
					$scope.userList = res.data;
					$scope.total = res.total;
				});
			};

			$scope.sort = function (orderBy, orderSort) {
				$scope.sname = orderBy;
				$scope.sorder = orderSort;
				$scope.getUserList();
			};

			$scope.onPaging = function (pageIndex, pageSize) {
				$scope.pageIndex = pageIndex;
				$scope.pageSize = pageSize;
				$scope.getUserList();
			};

			$scope.getUserList();
		}
	]);

	angular.bootstrap(document, ['app']);
});