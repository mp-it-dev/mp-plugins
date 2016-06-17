
/**
 * util.js 包含一些常用的工具函数
 * @author helin
 */
(function (global) {
    var util = {
        // 是否是函数
        isFunction: function (it) {
            return Object.prototype.toString.call(it) === '[object Function]';
        },

        // 是否是数组
        isArray: function (it) {
            return Object.prototype.toString.call(it) === '[object Array]';
        },

        // 是否是对象
        isObject: function (it) {
            return Object.prototype.toString.call(it) === '[object Object]';
        },

        //数组循环
        forEach: function (arr, callback) {
            if (!util.isArray(arr)) {
                throw new TypeError(arr + ' is not a Array');
            }

            var k = 0;
            var O = Object(arr);
            var len = O.length >>> 0;

            if (!util.isFunction(callback)) {
                throw new TypeError(callback + ' is not a Function');
            }

            while (k < len) {
                var kValue;

                if (k in O) {
                    kValue = O[k];
                    callback.call(O, kValue, k, O);
                }

                k++;
            }
        },

        //在数组中查找项的位置
        indexOf: function (arr, value, key) {
            var index = -1;

            if (!util.isArray(arr)) {
                throw new TypeError(arr + ' is not a Array');
            }

            if (arr.length > 0) {
                util.forEach(arr, function (item, idx) {
                    if (typeof item == 'object' && typeof key != 'undefined') {
                        if (item[key] == value[key]) {
                            index = idx;
                        }
                    } else {
                        if (item == value) {
                            index = idx;
                        }
                    }
                });
            }

            return index;
        },

        //删除数组中某一项
        removeOf: function (arr, value, key) {
            if (!util.isArray(arr)) {
                throw new TypeError(arr + ' is not a Array');
            }

            var index = util.indexOf(arr, value, key);

            arr.splice(index, 1);
        },

        //去掉字符串两边的空格
        trim: function (str) {
            if (typeof str !== 'string') {
                throw new Error(str + ' is not a String');
            }

            return str.replace(/(^\s*)|(\s*$)/g, "");
        },

        //格式化时间参数
        //参数1： date 日期对象
        //参数2： format 字符串，格式化形式，年月日用大写Y、M、D代表，时分秒分别用h、m、s代表，毫秒用S代表
        formatDate: function (date, format) {
            if (!date instanceof Date) {
                throw new Error(date + ' is not a Date object');
            }

            var o = {
                'M+': date.getMonth() + 1,                      //month 
                'D+': date.getDate(),                           //day 
                'h+': date.getHours(),                          //hour 
                'm+': date.getMinutes(),                        //minute 
                's+': date.getSeconds(),                        //second
                'S': date.getMilliseconds()                     //millisecond 
            }

            if (/(Y+)/.test(format)) {      //格式化年份
                format = format.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
            }

            for (var k in o) {
                if (new RegExp('(' + k + ')').test(format)) {
                    format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(("" + o[k]).length));
                }
            }

            return format;
        },

        //浏览器版本信息,结果形如{msie: true, version: "8.0"}
        browser: (function () {
            var ua = navigator.userAgent.toLowerCase();
            var browser = {};

            var match = /(chrome)[ \/]([\w.]+)/.exec(ua) ||
                /(webkit)[ \/]([\w.]+)/.exec(ua) ||
                /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) ||
                /(msie) ([\w.]+)/.exec(ua) ||
                ua.indexOf('compatible') < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) ||
                [];

            var matched = {
                browser: match[1] || '',
                version: match[2] || '0'
            };

            if (matched.browser) {
                browser[matched.browser] = true;
                browser.version = +matched.version.split('.')[0];
            }

            //由于IE11没有msie标识，所以换一种方式判断IE
            if (window.ActiveXObject || 'ActiveXObject' in window) {
                browser.msie = true;
                delete browser['mozilla'];
            }

            // Chrome is Webkit, but Webkit is also Safari.
            if (browser.chrome) {
                browser.webkit = true;
            } else if (browser.webkit) {
                browser.safari = true;
            }

            return browser;
        })(),

        //获取查询字符串
        queryString: function (_key, _window) {
            var o = {};
            var search = window.location.search;

            if (_window) {
                search = _window.location.search;
            }

            if (search) {
                search = search.substring(1);
                
                var arr = search.split('&');
                var d;

                util.forEach(arr, function (item) {
                    d = item.split('=');
                    o[d[0]] = d[1];
                });
            }            

            return _key === undefined ? o : o[_key];
        },

        //格式化数字，在数字前面加0
        addZero: function (str, length) {
            str += '';
            length = length || 2;
            var zeroNum = length - str.length;

            for (var i = 0; i < zeroNum; i++) {
                str = '0' + str;
            }

            return str;
        },

        //获取字符串的长度，ASCII字符为一个长度单位，非ASCII字符为两个长度单位
        getStrLength: function (str) {
            if (typeof str == 'undefined') return 0;
            return str.replace(/[^\x00-\xff]/g, 'aa').length;
        },

        //截取字符串，ASCII以外的字符算两个长度
        getSubString: function (str, len, repStr) {
            if (!str) {
                return '';
            }

            str = str.trim();

            var rstr = '',
                slen = str.length,
                c = 0,
                repStr = repStr || '';

            for (var i = 0; i < slen; i++) {
                if (str.charCodeAt(i) < 65 || (str.charCodeAt(i) > 90 && str.charCodeAt(i) < 255)) {
                    c += 1;
                } else {
                    c += 2;
                }

                if (c > len) {
                    break;
                }

                rstr += str.charAt(i);
            }

            return rstr.length < slen ? rstr + repStr : rstr;
        },

        //将html标记转化为html实体
        HTMLEncode: function (str) {
            var s = '';

            if (str.length == 0) return '';

            s = str.replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/\"/g, '&quot;');

            return s;
        },

        //将html实体转化为html标记
        HTMLDecode: function (str) {
            var s = '';
            if (str.length == 0) return '';

            s = str.replace(/&amp;/g, '&')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&quot;/g, '\"');

            return s;
        },

        //判断是否是DOM元素
        isDOM: function (obj) {
            if (typeof HTMLElement === 'object') {
                return obj instanceof HTMLElement;
            } else {
                return typeof obj === 'object' && obj.nodeType === 1 && typeof obj.nodeName === 'string';
            }
        },

        //获取文件扩展名的icon
        getFileIcon: function (fileName) {
            var extName = fileName.substring(fileName.lastIndexOf('.'));
            var fileIcon = '';

            switch (extName.toLowerCase()) {
                case '.xls':
                    fileIcon = 'icon-xls';
                    break;
                case '.xlsx':
                    fileIcon = 'icon-xlsx';
                    break;
                case '.doc':
                    fileIcon = 'icon-doc';
                    break;
                case '.docx':
                    fileIcon = 'icon-docx';
                    break;
                case '.ppt':
                    fileIcon = 'icon-ppt';
                    break;
                case '.pptx':
                    fileIcon = 'icon-pptx';
                    break;
                case '.pdf':
                    fileIcon = 'icon-pdf';
                    break;
                case '.txt':
                    fileIcon = 'icon-txt';
                    break;
                case '.xml':
                    fileIcon = 'icon-xml';
                    break;
                case '.csv':
                    fileIcon = 'icon-csv';
                    break;
                case '.zip':
                case '.7z':
                    fileIcon = 'icon-zip';
                    break;
                case '.rar':
                    fileIcon = 'icon-rar';
                    break;
                case '.png':
                    fileIcon = 'icon-png';
                    break;
                case '.jpg':
                case '.jpeg':
                    fileIcon = 'icon-jpg';
                    break;
                case '.gif':
                    fileIcon = 'icon-gif';
                    break;
                case '.js':
                    fileIcon = 'icon-js';
                    break;
                case '.css':
                    fileIcon = 'icon-css';
                    break;
                default:
                    fileIcon = 'icon-more';
                    break;
            }

            return fileIcon;
        },

        //计算文件大小
        getFileSize: function (fileSize) {
            fileSize = parseInt(fileSize);

            if (fileSize > 1024 * 1024) {
                return (fileSize / 1024 / 1024).toFixed(2) + 'MB';
            } else if (fileSize > 1024) {
                return (fileSize / 1024).toFixed(2) + ' KB';
            } else {
                return fileSize + ' B';
            }
        },

        //解析模板中的变量
        parseTpl: function (template, itemData) {
            return template.replace(/\#\{([\w]*)\}/g, function (s0, s1) {
                return s1 == '' ? itemData : itemData[s1] || '';
            });
        },

        //浏览器滚动条宽度
        scrollBarWidth: function () {
            var body = document.getElementsByTagName('body')[0];
            var scrollDiv = document.createElement('div');

            scrollDiv.style.position = 'absolute';
            scrollDiv.style.top = '-9999px';
            scrollDiv.style.width = '1px';
            scrollDiv.style.height = '1px';
            scrollDiv.style.overflow = 'scroll';

            body.appendChild(scrollDiv);
            var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
            body.removeChild(scrollDiv);

            return scrollbarWidth;
        },

        formatNumber: function (num, precision, separator) {
            //null is number 0?
            if (num === null || isNaN(num)) {
                return num;
            }

            num = Number(num);
            // 处理小数点位数
            num = (typeof precision !== 'undefined' ? num.toFixed(precision) : num).toString();
            // 分离数字的小数部分和整数部分
            parts = num.split('.');
            // 整数部分加[separator]分隔, 借用一个著名的正则表达式
            parts[0] = parts[0].toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1' + (separator || ','));

            return parts.join('.');
        }
    }

    if (typeof define === 'function' && define.amd) {
        define([], function () {
            return util;
        });
    } else {
        global.util = util;
    }
})(this);