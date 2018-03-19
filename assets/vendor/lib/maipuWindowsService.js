/**
 * [maipuWindowsService 与maipuWindowsService服务结合使用的类库]
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
				$.alert(
					'<p style="color: red;">出错了！可能的原因及解决办法如下：</p>' +
					'<ul style="list-style: disc; margin-left: 20px;">' +
						'<li>未安装迈普工具箱（<a href="ftp://10.0.0.16/temp/%B5%C7%C2%BC%C8%CF%D6%A4/%C2%F5%C6%D5%D7%C0%C3%E6%B9%A4%BE%DF%CF%E4.exe" target="_blank">点击下载</a>）</li>' +
						'<li>迈普认证服务未升级到最新版本（打开迈普工具箱升级）</li>' +
						'<li>迈普认证服务未启动（在windows服务中启动迈普认证服务并设置为自动启动）</li>' +
					'</ul>');
				deferred.reject();
			}
        });
        $('head script:eq(0)').on('error', function (evt) {
			$.alert(
				'<p style="color: red;">出错了！可能的原因及解决办法如下：</p>' +
				'<ul style="list-style: disc; margin-left: 20px;">' +
					'<li>未安装迈普工具箱（<a href="ftp://10.0.0.16/temp/%B5%C7%C2%BC%C8%CF%D6%A4/%C2%F5%C6%D5%D7%C0%C3%E6%B9%A4%BE%DF%CF%E4.exe" target="_blank">点击下载</a>）</li>' +
					'<li>迈普认证服务未升级到最新版本（打开迈普工具箱升级）</li>' +
					'<li>迈普认证服务未启动（在windows服务中启动迈普认证服务并设置为自动启动）</li>' +
				'</ul>');
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
		var count1 = 0;
		var count2 = 0;
		for (var i in versionArr1) {
			count1 += versionArr1[i] * Math.pow(1000, versionArr1.length - i);
			count2 += versionArr2[i] * Math.pow(1000, versionArr2.length - i);
		}
		return count1 > count2 ? 1 : count1 < count2 ? -1 : 0;
	}

	var maipuWindowsService = {
		rootUrl: 'http://localhost:18002/',
		// 选择目录
		selectDirectory: function(option) {
			option = option || {};
			if (!option.callback) {
				throw new Error('请指定callback');
			}
			var _this = this;
			checkVersion('1.0.0')
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
			checkVersion('1.0.0')
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
		downloadFile: function(url, savePath) {
			if (!urlList || !urlList.length) return;
			var _this = this;
			checkVersion('1.0.0')
			.then(function () {
				$.ajax({
					url: _this.rootUrl + 'FileTransport/DownloadFile',
					data: {
						url: url,
						savePath: savePath
					},
					dataType: 'jsonp',
					jsonp: 'jsoncallback'
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