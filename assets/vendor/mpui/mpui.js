/**
 * angular 工具库js文件
 * @authors helin
 * @date    2017-10-30
 * @version 0.1.0
 */

(function (factory) {
    // AMD
    if (typeof define === 'function' && define.amd) {
        define(['angular'], factory);
    } else {
        if (typeof angular === 'undefined') {
            throw new Error('mpui depends on angular');
        }

        factory(angular);
    }
})
(function (angular) {

if (!angular.element.fn || !angular.element.fn.on) {
	throw new Error('mpui depends on jQuery instead of jqLite');
}

// 是否为整数
function isInteger(it, isNullable, isNegative) {
    return (isNullable && it === null || Math.floor(it) === it) && (isNegative || it >= 0);
}

// 是否为字符串整数
function isStringInteger(it, isNullable, isNegative) {
    if (it === undefined) {
        return false;
    }
    return isNullable && (it === null || it === '') || String(it).indexOf('.') === -1 && Math.floor(it) === Number(it) && (isNegative || +it >= 0);
}

angular.module('mpui', ['mpui.tpls'])

/**
 * 表格指令
 */
.directive('mpuiTb', ['$timeout', '$document', function ($timeout, $document) {
	return {
		restrict: 'EA',
		replace: true,
		prority: 1001,
		scope: {
			maxHeight: '=?', // 表格最大高度
			resize: '@?', // 是否可拖动列宽
			defaultOrderBy: '@?', // 默认排序字段
			defaultOrderSort: '@?', // 默认排序方式
			cancelOrder: '@?', // 是否可以取消排序
			onSort: '&?' // 排序回调
		},
		templateUrl: 'mpui-tb.html',
		transclude: true,
		controller: function ($scope) {
			this.orderBy = $scope.defaultOrderBy;
			this.orderSort = $scope.defaultOrderSort;
			this.cancelOrder = $scope.cancelOrder === 'true' ? true : false;

			// 排序
			this.sort = function (orderBy, orderSort) {
				this.orderBy = orderBy;
				this.orderSort = orderSort;
				// 排序回调
				$scope.onSort({ orderBy: orderBy, orderSort: orderSort });
				// 通知排序子指令排序发生变化
				$scope.$broadcast('onSort', { orderBy: orderBy, orderSort: orderSort });
			};
		},
		link: function ($scope, $ele, $attrs, ctrls) {
			// 横向滚动位置
			$scope.scrollLeft = 0;
			// 是否显示竖直滚动条
			$scope.isShowScrollbar = false;

			var $inner = $ele.find('.mpui-tb-inner');

			// 删除属性以移除overflow:hidden
			$ele[0].removeAttribute('mpui-tb');			
			// 去掉表头的tbody
			$inner.find('.mpui-tb-header-inner > table > tbody').remove();
			// 设置表格最大高度
			$scope.$watch('maxHeight', function (value) {
				$inner.css('max-height', value ? value : 'none');
			});

			// 左右拖动
			$inner.on('scroll', function (evt) {
				var _this = this;
				$scope.$apply(function () {					
					$scope.scrollLeft = -$(_this).scrollLeft();
				});
			});

			// 阻止表头文字拖动时造成表格滚动条滚动的事件
			$ele.on('drag', '.mpui-tb-header', function (evt) {
				evt.stopPropagation();
			});

			if ($attrs.resize !== 'false') {
				addResize();
			}
			toggleScrollbar();

			// 表头拖动
			function addResize () {
				var tables = $ele.find('.mpui-tb-header-inner > table, .mpui-tb-body > table');
				var isResizing = false;

				// 鼠标滑过表头添加可拖动表示
				$ele.on('mouseover', '.mpui-tb-header-inner > table > thead > tr > th', function (evt) {
					if (!isResizing && !$(this).find('.mpui-th-resize-line').length) {
						$(this).addClass('mpui-th-resize');
						$(this).append('<div class="mpui-th-resize-line"></div>');
					}					
				});

				// 鼠标移开表头删除可拖动表示
				$ele.on('mouseleave', '.mpui-tb-header-inner > table > thead > tr > th', function (evt) {
					if (isResizing) return;
					$(this).removeClass('mpui-th-resize');
					$(this).find('.mpui-th-resize-line').remove();
				});

				// 拖动
				$ele.on('mousedown', '.mpui-th-resize-line', function (evt) {
					var $th = $(this).closest('th');
					var index = $th.index();
		        	var oldClientX = evt.clientX;
		        	var oldWidth = $th.outerWidth();
		        	var headerCols = $ele.find('.mpui-tb-header-inner > table > colgroup > col');
		        	var headerThs = $ele.find('.mpui-tb-header-inner > table > thead > tr > th');
		        	var bodyCols = $ele.find('.mpui-tb-body > table > colgroup > col');
		        	var bodyThs = $ele.find('.mpui-tb-body > table > thead > tr > th');

		        	$document.find('body').addClass('mpui-resizing');
		        	isResizing = true;

			        $document.on('mousemove.mpui-th-resize', function (evt) {
			        	var newWidth = Math.max(evt.clientX - oldClientX + oldWidth, 20);
			        	if (headerCols.length) {
			        		headerCols.eq(index).attr('width', newWidth);
			        		bodyCols.eq(index).attr('width', newWidth);
			        	} else {
			        		headerThs.eq(index).attr('width', newWidth);
			        		bodyThs.eq(index).attr('width', newWidth);
			        	}
			        	evt.preventDefault();
			        });
			        
			        $document.on('mouseup.mpui-th-resize', function (evt) {
			        	$document.off('mousemove.mpui-th-resize');
			        	$document.off('mouseup.mpui-th-resize');
			        	$document.find('body').removeClass('mpui-resizing');
			        	if (evt.target !== $th[0]) {
			        		$th.removeClass('mpui-th-resize');
							$th.find('.mpui-th-resize-line').remove();
			        	}
			        	isResizing = false;
			        });
		        });
			}

			// 定时检查高度变化从而设置滚动条
			function toggleScrollbar() {
				timer = $timeout(function () {
					$scope.isShowScrollbar = $inner[0].clientWidth < $inner[0].offsetWidth;
					toggleScrollbar();
				}, 250);
			}

			// 销毁定时器
			$scope.$on('$destroy', function () {
				if (timer) {
					$timeout.cancel(timer);
				}
			});
		}
	};
}])

/**
 * 表格排序指令
 */
.directive('mpuiTbOrder', [function () {
	return {
		restrict: 'EA',
		require: '^mpuiTb',
		link: function ($scope, $ele, $attrs, ctrls) {
			var tbController = ctrls;
			var orderBy = $attrs.mpuiTbOrder;

			if (!orderBy || $attrs.orderDisabled === 'true') return;

			$ele.addClass('mpui-tb-order');

			// 排序操作
			$ele.on('click', function (evt) {
				var orderSort = '';

				if (tbController.orderBy !== orderBy) {
					orderSort = 'asc';
				} else {
					if (tbController.cancelOrder) {
						orderSort = tbController.orderSort === '' ? 'asc' : tbController.orderSort === 'asc' ? 'desc' : '';
					} else {
						orderSort = tbController.orderSort === 'asc' ? 'desc' : 'asc';
					}					
				}
				tbController.sort(orderSort ? orderBy : '', orderSort);
				evt.preventDefault();
				evt.stopPropagation();
			});

			// 阻止快速点击选中文字
			$ele.on('selectstart', function (evt) {
				evt.stopPropagation();
				evt.preventDefault();
			});

			// 排序变化
			$scope.$on('onSort', function (evt, data) {
				setClass();
			});

			// 初始化设置
			setClass();

			function setClass() {
				$ele.removeClass('asc desc');
				if (tbController.orderBy === orderBy) {
					$ele.addClass(tbController.orderSort);
				}
			}
		}
	};
}])

/**
 * 分页指令
 */
.directive('mpuiPager', [function () {
	return {
		restrict: 'EA',
		replace: true,
		templateUrl: 'mpui-pager.html',
		scope: {
			total: '=',
			pageIndex: '=?',
			pageSizeArray: '=?',
			pageLength: '=?',
			pageInfo: '@?',
			onPaging: '&'
		},
		link: function ($scope, $ele, $attrs) {
			$scope.pageIndex = $scope.pageIndex || 1;
			$scope.startIndex = $scope.pageIndex;
			$scope.endIndex = 0;
			$scope.pageSizeArray = $scope.pageSizeArray || [10, 20, 40, 80];
			$scope.pageSize = $scope.pageSizeArray[0];
			$scope.pageInfo = $scope.pageInfo === 'false' ? false : true;
			$scope.pageLength = $scope.pageLength || 5;

			$scope.goPage = function (pageIndex, evt) {
				if (evt) {
					evt.stopPropagation();
					evt.preventDefault();
				}
				$scope.pageIndex = pageIndex;
				calcPage();
				$scope.onPaging({ pageIndex: $scope.pageIndex, pageSize: $scope.pageSize });
			};

			$scope.skipPage = function (evt) {
				if (evt.keyCode === 13) {
					var pageIndex = +evt.target.value;

					if (!isInteger(pageIndex)) {
	                    alert('请输入整数页码');
	                    return;
	                }
	                if (pageIndex > $scope.totalPage || pageIndex <= 0) {
	                    alert('页码不在范围内');
	                    return;
	                }
	                evt.target.value = '';
	                $scope.goPage(pageIndex);
	                evt.stopPropagation();
	                evt.preventDefault();
				}
			};

			$scope.changePageSize = function (size) {
				$scope.pageSize = size;
				$scope.goPage(1);
			};

			$scope.$watch('total', function () {
				calcPage();
			});

			// 计算页码信息
			function calcPage() {
				$scope.totalPage = Math.ceil($scope.total / $scope.pageSize);
		        if ($scope.pageIndex <= $scope.startIndex || $scope.pageIndex === $scope.totalPage) {
		            $scope.startIndex = Math.max(1, $scope.pageIndex - $scope.pageLength + 1);
		        } else if ($scope.pageIndex >= $scope.endIndex) {
		            $scope.startIndex = Math.min($scope.pageIndex, $scope.totalPage - $scope.pageLength + 1);
		        }
		        $scope.endIndex = Math.min($scope.startIndex + $scope.pageLength - 1, $scope.totalPage);
		        $scope.pageList = [];
		        for (var i = $scope.startIndex; i <= $scope.endIndex; i++) {
		        	$scope.pageList.push(i);
		        }
			};
		}
	};
}])

/**
 * 工具服务
 */
.service('mpuiUtilService', ['$window', '$document', function ($window, $document) {
	var SCROLLBAR_WIDTH;
	var BODY_SCROLLBAR_WIDTH;

	return {
		// 浏览器滚动条宽度
        getScrollbarWidth: function (isBody) {
        	if (isBody) {
        		if (typeof SCROLLBAR_WIDTH === 'undefined') {
        			var $body = $document.find('body');
		            $body.addClass('mpui-body-scrollbar-measure');
		            BODY_SCROLLBAR_WIDTH = $window.innerWidth - $body[0].clientWidth;
		            BODY_SCROLLBAR_WIDTH = isFinite(BODY_SCROLLBAR_WIDTH) ? BODY_SCROLLBAR_WIDTH : 0;
		            bodyElem.removeClass('mpui-body-scrollbar-measure');
        		}
        		return BODY_SCROLLBAR_WIDTH;
        	} else {
		        if (typeof SCROLLBAR_WIDTH === 'undefined') {
		          var $ele = $('<div class="mpui-scrollbar-measure"></div>');
		          $document.find('body').append($ele);
		          SCROLLBAR_WIDTH = $ele[0].offsetWidth - $ele[0].clientWidth;
		          SCROLLBAR_WIDTH = isFinite(SCROLLBAR_WIDTH) ? SCROLLBAR_WIDTH : 0;
		          $ele.remove();
		        }
		        return SCROLLBAR_WIDTH;
        	}
        },
	};
}])

/**
 * 立即执行方法
 */
.run(['$document', 'mpuiUtilService', function ($document, mpuiUtilService) {
	var scrollbarWidth = mpuiUtilService.getScrollbarWidth(false);
	$document.find('head').prepend('<style type="text/css">.mpui-scrollbar-padding-right{padding-right: ' + scrollbarWidth + 'px;}.mpui-scrollbar-padding-bottom{padding-bottom: ' + scrollbarWidth + 'px;}</style>');
}]);

/**
 * 模板集合
 */
angular.module('mpui.tpls', [])
.run(['$templateCache', function ($templateCache) {
	$templateCache.put('mpui-tb.html', 
		'<div class="mpui-tb">' +
    		'<div class="mpui-tb-inner">' +
    			'<div class="mpui-tb-header" ng-class="{\'mpui-scrollbar-padding-right\': isShowScrollbar}">' +
    				'<div class="mpui-tb-header-outer">' +
	    				'<div class="mpui-tb-header-inner" ng-transclude ng-style="{\'left\': scrollLeft + \'px\'}"></div>' +
	    			'</div>' +
    			'</div>' +
	    		'<div class="mpui-tb-body" ng-transclude></div>' +
    		'</div>' +
    	'</div>'
	);
	$templateCache.put('mpui-pager.html', 
		'<div class="mpui-pager" ng-class="{\'justify\': pageInfo}">' +
    		'<div class="mpui-pager-control">' +
    			'<ul class="pagination" ng-if="totalPage">' +
    				'<li><a title="第一页" ng-click="goPage(1, $event)">«</a></li>' +
    				'<li ng-repeat="page in pageList" ng-class="{\'active\': page === pageIndex}"><a ng-click="goPage(page, $event)" ng-bind="page"></a></li>' +
    				'<li class="disabled" ng-if="endIndex < totalPage"><a>...</a></li>' +
    				'<li><a title="最后一页" ng-click="goPage(totalPage, $event)">»</a></li>' +
    			'</ul>' +
    		'</div>' +
	    	'<div class="mpui-pager-info" ng-if="pageInfo">' +
	    		'共<span class="text" ng-bind="totalPage"></span>页<span class="text" ng-bind="total"></span>条数据' +
	    		'&nbsp;&nbsp;&nbsp;&nbsp;每页显示<select class="size" ng-options="size for size in pageSizeArray" ng-model="pageSize" ng-change="changePageSize(pageSize)"></select>条数据' +
	    		'&nbsp;&nbsp;&nbsp;&nbsp;跳转到第<input type="text" class="skip" ng-keydown="skipPage($event)" />页' +
	    	'</div>' +
    	'</div>'
	);
}]);

});