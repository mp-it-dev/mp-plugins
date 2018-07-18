/**
 * [maipuWindowsService 与maipuWindowsService服务结合使用的类库]
 * 依赖jquery、tlayer
 * @return {[type]}         [description]
 */
(function (root, factory) {
    if (typeof exports === 'object' && typeof module === 'object'){
		module.exports = factory(require('jquery'), require('tlayer'));
    } else if (typeof define === 'function' && define.amd) {
        define(['jquery', 'tlayer'], factory);
    } else if (typeof exports === 'object') {
		exports['maipuWindowsService'] = factory(require('jquery'), require('tlayer'));
    } else {
		if (typeof root['jQuery'] === 'undefined' || !root['jQuery'].tlayer) {
            throw new Error('maipuWindowsService depends on jquery, tlayer');
        }
		root['maipuWindowsService'] = factory(root['jQuery']);
	}
}
(typeof self !== 'undefined' ? self : this, function ($) {
	// 回调函数队列
	var callbackQueue = [];

	function show(option) {
		var win = this.contentWindow;
		var listener = function (evt) {
			if (maipuWindowsService.rootUrl.indexOf(evt.origin) === -1) return;
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
			win.postMessage(JSON.stringify(option), maipuWindowsService.rootUrl);
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

	function checkVersion(version) {
		var deferred = $.Deferred();

		$.ajax({
            url: maipuWindowsService.rootUrl + 'Common/GetVersion',
            dataType: 'jsonp',
            jsonp: 'jsoncallback'
        })
        .success(function (res) {
            if (res.Data && compareVersion(res.Data, version) >= 0) {
				deferred.resolve();
			} else {
				alert('请先升级迈普桌面服务到最新版本！');
				deferred.reject();
				$.ajax({
		            url: maipuWindowsService.rootUrl + 'Common/OpenToolBox',
		            dataType: 'jsonp',
		            jsonp: 'jsoncallback'
		        });
			}
        });
        $('head script:eq(0)').on('error', function (evt) {
			alert('迈普桌面服务不可用！');
            $(this).remove();
            deferred.reject();
        });

		return deferred;
	}

	function compareVersion(version1, version2) {
		var versionArr1 = version1.split('.');
		var versionArr2 = version2.split('.');
		if (versionArr1.length !== versionArr2.length) {
			throw new Error('can not compare version');
		}
		var v1, v2;
		for (var i in versionArr1) {
			v1 = +versionArr1[i];
			v2 = +versionArr2[i];
			if (v1 > v2) {
				return 1;
			}
			if (v1 < v2) {
				return -1;
			}
		}
		return 0;
	}

	var maipuWindowsService = {
		rootUrl: 'http://localhost:18002/',
		checkVersion: checkVersion,
		// 选择目录
		selectDirectory: function(option) {
			option = option || {};
			if (!option.callback) {
				throw new Error('请指定callback');
			}
			var _this = this;
			checkVersion('1.0.3.7')
			.then(function () {
				$.content({
					layerID: option.layerID || false,
					theme: 'blue',
					header: '选择目录',
					content: {
						width: 530,
						height: 530,
						src: _this.rootUrl + 'FileTransport/SelectDirectory?origin=' + encodeURIComponent(window.location.protocol + '//' + window.location.host),
					},
					onLoad: function () {
						show.call(this, option);
					},
					onClose: function () {
						hide.call(this, option);
					}
				});
			})
		},
		// 选择文件
		selectFile: function(option) {
			option = option || {};
			if (!option.callback) {
				throw new Error('请指定callback');
			}
			var _this = this;
			checkVersion('1.0.3.7')
			.then(function () {
				$.content({
					layerID: option.layerID || false,
					theme: 'blue',
					header: '选择文件',
					content: {
						width: 530,
						height: 530,
						src: _this.rootUrl + 'FileTransport/SelectFile?origin=' + encodeURIComponent(window.location.protocol + '//' + window.location.host),
					},
					onLoad: function () {
						show.call(this, option);
					},
					onClose: function () {
						hide.call(this, option);
					}
				});
			});
		},
		// 下载文件
		downloadFile: function(option) {
			option = option || {};
			if (!option.url || !option.savePath) {
				throw new Error('文件下载地址和保存路径均不能为为空');
			}
			var _this = this;
			checkVersion('1.0.3.7')
			.then(function () {
				$.ajax({
					url: _this.rootUrl + 'FileTransport/DownloadFile',
					data: {
						label: option.label || '',
						url: option.url,
						savePath: option.savePath
					},
					dataType: 'jsonp',
					jsonp: 'jsoncallback'
				})
				.then(option.callback);
			});
		},
		// 下载进度
		downloadProgress: function (option) {
			option = option || {};
			var _this = this;
			checkVersion('1.0.3.7')
			.then(function () {
				$.content({
					layerID: option.layerID || false,
					theme: 'blue',
					header: '下载文件进度',
					content: {
						width: 830,
						height: 590,
						src: _this.rootUrl + 'FileTransport/DownloadProgress?origin=' + encodeURIComponent(window.location.protocol + '//' + window.location.host),
					},
					onLoad: function () {
						show.call(this, option);
					},
					onClose: function () {
						hide.call(this, option);
					}
				});
			});
		},
		// 关闭选择器
		close: function(instance) {
			$.tlayer('close', instance);
		}
	};

	return maipuWindowsService;
}));