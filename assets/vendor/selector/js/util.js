
/**
 * util.js 包含一些常用的工具函数
 * @author helin
 */
(function (factory, global) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else {
        global.util = factory();
    }
}
(function () {
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

        // 是否为数字
        isNumber: function (it, isString) {
            return isString ? !isNaN(Number(it)) && !isNaN(parseFloat(it)) : Object.prototype.toString.call(it) === '[object Number]' && !isNaN(it);
        },

        // 是否为整数
        isInteger: function (it, isString) {
            return isString ? it !== '' && Math.floor(it) === Number(it) : Math.floor(it) === it;
        },

        // 遍历数组或对象
        forEach: function (obj, iterator, context) {
            var key;

            if (obj) {
                if (util.isFunction(obj)) {
                    for (key in obj) {
                        // Need to check if hasOwnProperty exists,
                        // as on IE8 the result of querySelectorAll is an object without a hasOwnProperty function
                        if (key != 'prototype' && key != 'length' && key != 'name' && (!obj.hasOwnProperty || obj.hasOwnProperty(key))) {
                          iterator.call(context, obj[key], key);
                        }
                    }
                } else if (util.isArray(obj)) {
                    for (key = 0; key < obj.length; key++) {
                        iterator.call(context, obj[key], key);
                    }
                } else if (obj.forEach && obj.forEach !== util.forEach) {
                    obj.forEach(iterator, context);
                } else {
                    for (key in obj) {
                        if (obj.hasOwnProperty(key)) {
                            iterator.call(context, obj[key], key);
                        }
                    }
                }
            }

            return obj;
        },

        // 在数组中查找项的位置
        indexOf: function (arr, value, key) {
            var index = -1;

            if (!util.isArray(arr)) {
                throw new TypeError(arr + ' is not a Array');
            }

            if (arr.length > 0) {
                util.forEach(arr, function (item, idx) {
                    if (typeof item === 'object' && typeof key !== 'undefined') {
                        if (item[key] === value[key]) {
                            index = idx;
                        }
                    } else {
                        if (item === value) {
                            index = idx;
                        }
                    }
                });
            }

            return index;
        },

        // 删除数组中某一项
        removeOf: function (arr, value, key) {
            if (!util.isArray(arr)) {
                throw new TypeError(arr + ' is not a Array');
            }

            var index = util.indexOf(arr, value, key);

            if (index >= 0) {
                arr.splice(index, 1);
            }
        },

        // 去掉字符串两边的空格
        trim: function (str) {
            if (!str) {
                return str;
            }

            return str.replace(/(^\s*)|(\s*$)/g, '');
        },

        // 格式化时间参数
        // 参数1： date 日期对象或可转为日期对象的值
        // 参数2： format 字符串，格式化形式，年月日用大写Y、M、D代表，时分秒分别用h、m、s代表，毫秒用S代表
        formatDate: function (date, format) {
            if (!(date instanceof Date)) {
                date = new Date(date);
            }
            if (isNaN(date.getDate())) {
                return null;
            }

            format = format || 'YYYY/MM/DD hh:mm:ss';

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
                    format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length));
                }
            }

            return format;
        },

        // 格式化c#后台返回的/Date(1473133893427)/类型的时间
        formatMSDate: function (str, format) {
            var match = /\/Date\((\d+)\)\//.exec(str);
            return match ? util.formatDate(new Date(+match[1]), format) : '';
        },

        // 浏览器版本信息,结果形如 { msie: true, version: 8 }
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

        // 获取查询字符串
        queryString: function (key, url) {
            var o = {};

            url = url ? url : window.location.href;

            if (url && url.indexOf('?') > -1) {
                var arr = url.split('?')[1].split('&');
                var d;

                util.forEach(arr, function (item) {
                    d = item.split('=');
                    o[d[0]] = d[1];
                });
            }            

            return key === undefined ? o : o[key];
        },

        // 格式化数字，在数字前面加0
        addZero: function (str, length) {
            str += '';
            length = length || 2;
            var zeroNum = length - str.length;

            for (var i = 0; i < zeroNum; i++) {
                str = '0' + str;
            }

            return str;
        },

        // 将html标记转化为html实体
        htmlEncode: function (str) {
            if (!str) {
                return str;
            }

            return String(str).replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/\"/g, '&quot;');
        },

        // 将html实体转化为html标记
        htmlDecode: function (str) {
            if (!str) {
                return str;
            }

            return String(str).replace(/&amp;/g, '&')
                    .replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>')
                    .replace(/&quot;/g, '\"');
        },

        // 获取文件扩展名的icon
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

        // 计算文件大小
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

        // 解析模板中的变量
        parseTpl: function (template, templateData, emptyStrEscape) {
            emptyStrEscape = emptyStrEscape || false;

            return template.replace(/\#\{([\w\.]*)\}/g, function (s0, s1) {
                if (s1 === '') {
                    return templateData || (emptyStrEscape ? '&nbsp;' : '');
                }
                
                var namespaceList = s1.split('.');                
                var data;

                if (util.isObject(templateData)) {
                    data = util.copy(templateData);
                } else {
                    data = templateData;
                }

                for (var i in namespaceList) {
                    if ((data = data[namespaceList[i]]) === undefined) {
                        break;
                    }
                }

                return data || (emptyStrEscape ? '&nbsp;' : '');
            });
        },

        // 拷贝对象，移植于AngularJS
        copy: function (source, destination, stackSource, stackDest) {
            if (!destination) {
                destination = source;
                if (source) {
                    if (util.isArray(source)) {
                        destination = util.copy(source, [], stackSource, stackDest);
                    } else if (util.isObject(source)) {
                        destination = util.copy(source, {}, stackSource, stackDest);
                    }
                }
            } else {
                if (source === destination) {
                    throw new Error('Can\'t copy! Source and destination are identical.');
                }

                stackSource = stackSource || [];
                stackDest = stackDest || [];

                if (util.isObject(source)) {
                    var index = util.indexOf(stackSource, source);

                    if (index !== -1) {
                        return stackDest[index];
                    }

                    stackSource.push(source);
                    stackDest.push(destination);
                }

                var result;
                if (util.isArray(source)) {
                    destination.length = 0;
                    for ( var i = 0; i < source.length; i++) {
                        result = util.copy(source[i], null);
                        if (util.isObject(source[i])) {
                            stackSource.push(source[i]);
                            stackDest.push(result);
                        }
                        destination.push(result);
                    }
                } else {
                    if (util.isArray(destination)) {
                        destination.length = 0;
                    } else {
                        util.forEach(destination, function(value, key) {
                          delete destination[key];
                        });
                    }
                    for ( var key in source) {
                        result = util.copy(source[key], null, stackSource, stackDest);
                        if (util.isObject(source[key])) {
                            stackSource.push(source[key]);
                            stackDest.push(result);
                        }
                        destination[key] = result;
                    }
                }
            }
            
            return destination;
        },

        // 格式化数字，将数字格式化成precision位数，separator分隔的数字
        formatNumber: function (num, precision, separator) {
            if (!util.isNumber(num, true)) {
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
        },

        // 判断是否是DOM元素
        isDOM: function (obj) {
            if (typeof HTMLElement === 'object') {
                return obj instanceof HTMLElement;
            } else {
                return obj != null && typeof obj === 'object' && (obj.nodeType === 1 || obj.nodeType === 9);
            }
        },

        // 是否出现滚动条
        isOverflow: function ($ele) {
            var obj = {};

            if ($ele[0].scrollWidth > $ele.outerWidth(true)) {
                obj.x = true;
            }

            if ($ele[0].scrollHeight > $ele.outerHeight(true)) {
                obj.y = true;
            }

            return $.isEmptyObject(obj) ? false : obj;
        },

        // 浏览器滚动条宽度
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

        // 获取DOM视口信息，包括宽高、相对于body的left、top，以及body的scrollLeft、scrollTop
        getPosition: function (ele) {
            var eleRect = ele.getBoundingClientRect();

            // IE8中没有width和height
            if (eleRect.width === undefined) {
                eleRect.width =  eleRect.right - eleRect.left;
                eleRect.height =  eleRect.bottom - eleRect.top;
            }

            eleRect.scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
            eleRect.scrollTop = document.documentElement.scrollTop || document.body.scrollTop;

            return eleRect;
        }
    }

    return util;
}, window));