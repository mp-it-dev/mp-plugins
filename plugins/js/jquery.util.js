
/**
 * [format 格式化时间参数]
 * @param format 字符串，格式化形式，年月日用大写Y、M、D代表，时分秒分别用h、m、s代表，毫秒用S代表
 * @return {[type]}        [description]
 */
Date.prototype.format = function (format) {
    var o = { 
        "M+": this.getMonth() + 1,                      //month 
        "D+": this.getDate(),                           //day 
        "h+": this.getHours(),                          //hour 
        "m+": this.getMinutes(),                        //minute 
        "s+": this.getSeconds(),                        //second
        "S": this.getMilliseconds()                     //millisecond 
    }

    if (/(Y+)/.test(format)) {      //格式化年份
        format = format.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    }

    for (var k in o) {
        if (new RegExp("("+k+")").test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length)); 
        }
    }

    return format;
}

/**
 * [trim 去掉字符串两边的空格]
 * @return {[type]} [description]
 */
String.prototype.trim = function () {
    return this.replace(/(^\s*)|(\s*$)/g, "");
}

/**
 * Util工具类，包含一些常用的工具函数
 * @author helin
 */

var Util = {
    //浏览器版本信息,结果形如{msie: true, version: "8.0"}
    browser: (function () {
        var ua = navigator.userAgent.toLowerCase();
        var browser = {};
        
        var match = /(chrome)[ \/]([\w.]+)/.exec(ua) ||
            /(webkit)[ \/]([\w.]+)/.exec(ua) ||
            /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) ||
            /(msie) ([\w.]+)/.exec(ua) ||
            ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) ||
            [];

        var matched = {
            browser: match[1] || "",
            version: match[2] || "0"
        };

        if (matched.browser) {
            browser[matched.browser] = true;
            browser.version = matched.version;
        }

        //由于IE11没有哦msie标识，所以换一种方式判断IE
        if (window.ActiveXObject || "ActiveXObject" in window) { 
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

    /**
     * [GET 获取标准URL的参数]
     * @param  _key：字符串，参数名
     * @param  _url：窗口对象或者url地址
     * @return 获取到的参数值，如果找不到对应的参数，则返回空字符串
     */
    GET: function (_key, _url) {
        if (typeof(_url) == "object") {
            _url = _url.location.href;
        } else {
            _url = (typeof(_url) == "undefined" || _url == null || _url == "") ? window.location.href : _url;
        }

        //用正则表达式判断，利用定界符\b
        var reg = new RegExp (".*\\b"+_key+"\\b=([^&]+).*");
        if (reg.test(_url)) {
            return RegExp.$1;
        } else {
            return ""
        }
    },

    /**
     * [formatTime 格式化标准时间]
     * @return {[type]} [description]
     */
    formatTime: function (utcTime) {
        var d = new Date(parseInt(utcTime));

        return d.format('yyyy/MM/DD hh:mm:ss');
    },

    /**
     * [formatJsonTime 格式化服务器返回的形如/Date(1437548460000)/形式的utc时间]
     * @param  {[type]} timeStr [description]
     * @return {[type]}         [description]
     */
    formatJsonTime: function (timeStr) {
        return Util.formatTime(Util.getUtcTime(timeStr));
    },

    /**
     * [formatJsonTime 将服务器返回的形如/Date(1437548460000)/形式的utc时间解析为纯数字utc时间]
     * @param  {[type]} timeStr [description]
     * @return {[type]}         [description]
     */
    getUtcTime: function (timeStr) {
        if (timeStr == null || timeStr == "") {
            return 0;
        }

        return +timeStr.replace("/Date(", "").replace(")/", "");
    },

    /**
     * [addZero 格式化数字为两位]
     * @param number 要格式化的数字
     */
    addZero: function (number) {
        return number < 10 ? "0"+number : number;
    },

    /**
     * [getStrLength 获取字符串的长度，ASCII字符为一个长度单位，非ASCII字符为两个长度单位]
     * @param  str [要获取长度的字符串]
     */
    getStrLength: function (str) {        
        if (typeof(str) == "undefined") return 0;
        return str.replace(/[^\x00-\xff]/g, "aa").length;
    },

    /**
     * [hasChinese 判断字符串是否包含中文]
     */
    hasChinese: function (str) {
        var pattern = /[^\x00-\xff]/g;
        return pattern.test(str);
    },

    /**
     * [getSubString 截取字符串，ASCII以外的字符算两个长度]
     * @param  str 要截取的字符串
     * @param  len 要截取的长度
     * @param  repStr 超出长度替代的字符串，默认为空
     */
    getSubString:  function (str, len, repStr) {
        if (!str) {
            return "";
        }

        str = str.trim();

        var rstr   = "",
            slen   = str.length,
            c      = 0,
            repStr = repStr || "";

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

        return rstr.length < slen ? rstr+repStr : rstr;
    },

    /**
     * [HTMLEncode 将html标记转化为html实体]
     * @param {[type]} str [description]
     */
    HTMLEncode: function (str) {
        var s = "";

        if (str.length == 0) return "";

        s = str.replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/\"/g, "&quot;");

        return s;
    },

    /**
     * [HTMLDecode 将html实体转化为html标记]
     * @param {[type]} str [description]
     */
    HTMLDecode: function (str) {
        var s = "";
        if (str.length == 0) return "";

        s = str.replace(/&amp;/g, "&")
                .replace(/&lt;/g, "<")
                .replace(/&gt;/g, ">")
                .replace(/&quot;/g, "\"");

        return s;
    },

    /**
     * [runFunction 执行函数]
     * @param  {Function} fn      [函数引用]
     * @param  {[type]}   thisObj [this对象]
     * @param  {[type]}   args    [参数列表]
     * @return {[type]}           [description]
     */
    runFunction: function (fn, thisObj, args) {
    	if (typeof fn === 'function') {
    		var argus = arguments,
                argsl = argus.length;

            //如果函数的参数列表存在1个参数
            if (argsl == 1) {
                return fn.apply(window);
            }

            //如果函数的参数列表存在2个参数
            if (argsl == 2) {
                if (typeof thisObj === "array") {
                    return fn.apply(window, thisObj);
                } else {
                    return fn.apply(thisObj);
                }
            }

            //如果函数的参数列表存在3个参数
            if (argsl == 3) {
                return fn.apply(thisObj || window, args);
            }
    	} else {
    		throw fn +' is not a function';
    	}
    },

    /**
     * [isDOM 判断是否是DOM元素]
     * @param  {[type]}  obj [节点对象]
     * @return {Boolean}     [description]
     */
    isDOM: function (obj) {
        if (typeof HTMLElement === 'object') {
            return obj instanceof HTMLElement;
        } else {
            return typeof obj === 'object' && obj.nodeType === 1 && typeof obj.nodeName === 'string';
        }
    }
}

/**
 * [GetFileImgIcon 获取文件扩展名的icon]
 * @param {[type]} extName [description]
 */
Util.GetFileImgIcon = function (extName) {
    var className = "";

    switch (extName.toLowerCase()) {
        case ".xls":
            className = "icon-xls";
            break;
        case ".xlsx":
            className = "icon-xlsx";
            break;
        case ".doc":
            className = "icon-doc";
            break;
        case ".docx":
            className = "icon-docx";
            break;
        case ".ppt":
            className = "icon-ppt";
            break;
        case ".pptx":
            className = "icon-pptx";
            break;
        case ".pdf":
            className = "icon-pdf";
            break;
        case ".txt":
            className = "icon-txt";
            break;
        case ".xml":
            className = "icon-xml";
            break;
        case ".csv":
            className = "icon-csv";
            break;
        case ".zip":
        case ".7z":
            className = "icon-zip";
            break;
        case ".rar":
            className = "icon-rar";
            break;
        case ".png":
            className = "icon-png";
            break;
        case ".jpg":
        case ".jpeg":
            className = "icon-jpg";
            break;
        case ".gif":
            className = "icon-gif";
            break;
        case ".js":
            className = "icon-js";
            break;
        case ".css":
            className = "icon-css";
            break;
        default:
            className = "icon-more";
            break;
    }

    return '<span class="icon ' + className + '"></span>';
}

/**
 * [getFileSize 计算文件大小]
 * @param  {[type]} fileSize [description]
 * @return {[type]}          [description]
 */
Util.getFileSize = function (fileSize) {
    fileSize = parseInt(fileSize);

    if (fileSize > 1024) {
        return (fileSize/1024).toFixed(2) + "MB";
    } else {
        return fileSize + "KB";
    }
}

/**
 * [parseTmpl 解析模板中的变量]
 * @param  {[type]} template [模板代码]
 * @param  {[type]} data     [模板数据]
 * @return {[type]}          [返回html代码]
 */
Util.parseTmpl = function (template, data) {
    return template.replace(/\#\{(.*?)\}/g, function (key, value) {
                var value = value.split("."),
                    l = value.length;

                var ret = data;

                if (l > 1) {
                    value = value.slice(1);

                    for (var i = 0, len = value.length; i < len; i++) {
                        ret = ret[value[i]];

                        if (ret === undefined) {
                            break;
                        }
                    }
                } else {
                    ret = data;
                }

                return ret;
            });
}

/**
 * [createGuid 生成Guid]
 * @return {[type]} [description]
 */
Util.createGuid = function () {
    var guid = "";

    for (var i = 1; i <= 32; i++) {
        var n = Math.floor(Math.random() * 16).toString(16);

        guid += n;

        if ((i == 8) || (i == 12) || (i == 16) || (i == 20)) {
            guid += "-";
        }
    }

    return guid;
}

/**
 * [scrollBarWidth 浏览器滚动条宽度]
 * @return {[type]} [description]
 */
Util.scrollBarWidth = function () {
    var $body = $('body');
    var scrollDiv = document.createElement('div');

    scrollDiv.className = 'layer-scrollbar-measure';
    $body.append(scrollDiv);
    var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth;
    $body[0].removeChild(scrollDiv);

    return scrollbarWidth;
}
