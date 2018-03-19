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
	// 回调函数队列
	var callbackQueue = [];

	function show(option) {
		var win = this.contentWindow;
		var listener = function (evt) {
			if (selector.rootUrl.indexOf(evt.origin) === -1) return;
			option.callback(JSON.parse(evt.data));
		}
		window.addEventListener('message', listener, false);
		callbackQueue.push({
			callback: option.callback,
			listener: listener
		});
		// 设置一个延迟，看能不能确保IE有时候没有加载出来的问题
		setTimeout(function () {
			// 将选项传到iframe中
			win.postMessage(JSON.stringify(option), selector.rootUrl);
		}, 100);
	}

	function hide(option) {
		var index = -1;
		for (var i in callbackQueue) {
			var item = callbackQueue[i];
			if (item.callback === option.callback) {
				window.removeEventListener('message', item.listener, false);
				index = i;
			}
		}
		if (index > -1) {
			callbackQueue.splice(index, 1);
		}
	}

	var selector = {
		rootUrl: 'http://webapi.maipu.com/Selector-v2/',
		// 单人
		singlePeople: function(option) {
			option = option || {};
			if (!option.callback) {
				throw new Error('请指定callback');
			}
			var instance = $.content({
				layerID: option.layerID || false,
				theme: 'blue',
				header: '单人',
				content: {
					width: 930,
					height: 480,
					padding: 0,
					src: this.rootUrl + 'Selector/SinglePeople?origin=' + encodeURIComponent(window.location.protocol + '//' + window.location.host),
				},
				onLoad: function () {
					show.call(this, option);
				},
				onClose: function () {
					hide.call(this, option);
				}
			});
			return instance;
		},
		// 多人
		multiPeople: function(option) {
			option = option || {};
			if (!option.callback) {
				throw new Error('请指定callback');
			}
			var instance = $.content({
				layerID: option.layerID || false,
				theme: 'blue',
				header: '多人',
				content: {
					width: 930,
					height: 480,
					padding: 0,
					src: this.rootUrl + 'Selector/MultiPeople?origin=' + encodeURIComponent(window.location.protocol + '//' + window.location.host),
				},
				onLoad: function () {
					show.call(this, option);
				},
				onClose: function () {
					hide.call(this, option);
				}
			});
			return instance;
		},
		// 单部门
		singleDep: function(option) {
			option = option || {};
			if (!option.callback) {
				throw new Error('请指定callback');
			}
			var instance = $.content({
				layerID: option.layerID || false,
				theme: 'blue',
				header: '单部门',
				content: {
					width: 800,
					height: 480,
					padding: 0,
					src: this.rootUrl + 'Selector/SingleDep?origin=' + encodeURIComponent(window.location.protocol + '//' + window.location.host),
				},
				onLoad: function () {
					show.call(this, option);
				},
				onClose: function () {
					hide.call(this, option);
				}
			});
			return instance;
		},
		// 多部门
		multiDep: function(option) {
			option = option || {};
			if (!option.callback) {
				throw new Error('请指定callback');
			}
			var instance = $.content({
				layerID: option.layerID || false,
				theme: 'blue',
				header: '多部门',
				content: {
					width: 800,
					height: 480,
					padding: 0,
					src: this.rootUrl + 'Selector/MultiDep?origin=' + encodeURIComponent(window.location.protocol + '//' + window.location.host),
				},
				onLoad: function () {
					show.call(this, option);
				},
				onClose: function () {
					hide.call(this, option);
				}
			});
			return instance;
		},
		// 单职位
		singleJob: function(option) {
			option = option || {};
			if (!option.callback) {
				throw new Error('请指定callback');
			}
			var instance = $.content({
				layerID: option.layerID || false,
				theme: 'blue',
				header: '单职位',
				content: {
					width: 500,
					height: 480,
					padding: 0,
					src: this.rootUrl + 'Selector/SingleJob?origin=' + encodeURIComponent(window.location.protocol + '//' + window.location.host),
				},
				onLoad: function () {
					show.call(this, option);
				},
				onClose: function () {
					hide.call(this, option);
				}
			});
			return instance;
		},
		// 多职位
		multiJob: function(option) {
			option = option || {};
			if (!option.callback) {
				throw new Error('请指定callback');
			}
			var instance = $.content({
				layerID: option.layerID || false,
				theme: 'blue',
				header: '多职位',
				content: {
					width: 500,
					height: 480,
					padding: 0,
					src: this.rootUrl + 'Selector/MultiJob?origin=' + encodeURIComponent(window.location.protocol + '//' + window.location.host),
				},
				onLoad: function () {
					show.call(this, option);
				},
				onClose: function () {
					hide.call(this, option);
				}
			});
			return instance;
		},
		// 单部门职位
		singleDepJob: function(option) {
			option = option || {};
			if (!option.callback) {
				throw new Error('请指定callback');
			}
			var instance = $.content({
				layerID: option.layerID || false,
				theme: 'blue',
				header: '单部门职位',
				content: {
					width: 800,
					height: 480,
					padding: 0,
					src: this.rootUrl + 'Selector/SingleDepJob?origin=' + encodeURIComponent(window.location.protocol + '//' + window.location.host),
				},
				onLoad: function () {
					show.call(this, option);
				},
				onClose: function () {
					hide.call(this, option);
				}
			});
			return instance;
		},
		// 多部门职位
		multiDepJob: function(option) {
			option = option || {};
			if (!option.callback) {
				throw new Error('请指定callback');
			}
			var instance = $.content({
				layerID: option.layerID || false,
				theme: 'blue',
				header: '多部门职位',
				content: {
					width: 800,
					height: 480,
					padding: 0,
					src: this.rootUrl + 'Selector/MultiDepJob?origin=' + encodeURIComponent(window.location.protocol + '//' + window.location.host),
				},
				onLoad: function () {
					show.call(this, option);
				},
				onClose: function () {
					hide.call(this, option);
				}
			});
			return instance;
		},		
		// 单产品
		singleProduct: function(option) {
			option = option || {};
			if (!option.callback) {
				throw new Error('请指定callback');
			}
			var instance = $.content({
				layerID: option.layerID || false,
				theme: 'blue',
				header: '单产品',
				content: {
					width: 530,
					height: 480,
					padding: 0,
					src: this.rootUrl + 'Selector/SingleProduct?origin=' + encodeURIComponent(window.location.protocol + '//' + window.location.host),
				},
				onLoad: function () {
					show.call(this, option);
				},
				onClose: function () {
					hide.call(this, option);
				}
			});
			return instance;
		},
		// 多产品
		multiProduct: function(option) {
			option = option || {};
			if (!option.callback) {
				throw new Error('请指定callback');
			}
			var instance = $.content({
				layerID: option.layerID || false,
				theme: 'blue',
				header: '多产品',
				content: {
					width: 800,
					height: 480,
					padding: 0,
					src: this.rootUrl + 'Selector/MultiProduct?origin=' + encodeURIComponent(window.location.protocol + '//' + window.location.host),
				},
				onLoad: function () {
					show.call(this, option);
				},
				onClose: function () {
					hide.call(this, option);
				}
			});
			return instance;
		},
		// 关闭选择器
		close: function(instance) {
			$.tlayer('close', instance);
		}
	};

	return selector;
}));