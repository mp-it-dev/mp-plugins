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
     * [isChinese 判断字符串是否包含中文]
     */
    isChinese: function (str) {
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
     * [getWeekDay 获取相对于某个时间偏移的天数对应的星期]
     * @param _offset 偏移的天数
     * @param _time 相对点的时间，默认为当前时间
     * @return 返回相对于_time的星期几
     */
    getWeekDay: function (_offset, _time) {
        if (typeof(time) == "undefined") time = new Date();
        var numOfWeek = time.getDay();

        return Util.weekArr[(numOfWeek+offset)%7];
    },
    
    /**
     * [showTips 信息提示框]
     * @param str  要提示的字符串
     * @param flag 正确的提示还是错误的提示（正确的背景色为绿色，错误的为红色），默认为正确的提示。
     */
    showTips: function (str, flag, callback){
        var flagOK = flag || false;
        var timeOut = 1000;

        var self = this;

        if (typeof this.tipsContainer == "undefined") {     //创建提示框容器和背景阴影
            this.screen = $("<div></div>").appendTo(document.body);
            this.tipsContainer = $("<div></div>").appendTo(document.body);

            this.screen.css({
                display: "none",
                position: "fixed",
                left: "0px",
                top: "0px",
                width: "100%",
                height: "100%",
                backgroundColor: "#000",
                opacity: "0.5",
                filter: "alpha(opacity=50)",
                zIndex: 998
            }).fadeIn(300);

            setTimeout(function () {
            	self.tipsContainer.html(str).css({
            	    position: "fixed",
            	    left: "50%",
            	    top: "50%",
            	    padding: "20px",
            	    fontSize: "16px",
            	    display: "block",
            	    color: "#fff",
            	    zIndex: 999
            	}).css({
            	    marginTop: "-"+self.tipsContainer.height()/2+"px",
            	    marginLeft: "-"+self.tipsContainer.width()/2+"px"
            	});
            }, 250);
        } else {
            this.screen.css({
                left: "0px",
                top: "0px",
                width: "100%",
                height: "100%"
            })
            .fadeIn(300);

            this.tipsContainer.html(str)
            .css({
                left: "50%",
                top: "50%",
                marginTop: "-"+this.tipsContainer.height()/2+"px",
                marginLeft: "-"+this.tipsContainer.width()/2+"px"
            })
            .show();
        }

        if (!flagOK) {   //正确提示用绿色背景
            this.tipsContainer.css("background", "#7CB204");
        } else {
            timeOut = 2000;
            this.tipsContainer.css("background", "#F00");
        }

        setTimeout(function () {
            Util.tipsContainer.hide();
            Util.screen.fadeOut(300);

            if (typeof callback === "function") callback();
        }, timeOut);
    },

    /**
     * [showDialog 弹出对话框]
     * @param  {[type]} options [对话框参数]
     */
    showDialog: function (options) {
    	if (typeof options === 'undefined') {
    		options = {};
    	}

    	if (typeof options === 'string') {
    		options = {
    			content: options
    		};
    	}

        var content = options.content || "";                            //对话框内容
        var buttonText = options.buttonText || ["确定", "取消"];        //按钮文字
        var callback = options.callback || function () {};              //回调函数

        if (typeof this.dialogContainer == "undefined") {     //创建对话框容器和背景阴影
            if (typeof this.screen == "undefined") {
                this.screen = $("<div></div>").appendTo(document.body);

                this.screen.css({
                    display: "none",
                    position: "fixed",
                    left: "0px",
                    top: "0px",
                    width: "100%",
                    height: "100%",
                    backgroundColor: "#000",
                    opacity: "0.5",
                    filter: "alpha(opacity=50)",
                    zIndex: 998
                }).fadeIn(200, function () {
                    //$(document.body).css("overflow", "hidden");
                });
            }

            var html =  "<div id='dialog'>";
                html +=     "<div class='dialog_content'>";
                html +=         "<span class='dialog_text'>"+content+"</span>";
                html +=         "<i style='display: inline-block;font-size: 0;'></i>";
                html +=     "</div>";
                html +=     "<div>";
                html +=         "<div class='dialog_button dialog_yes'>"+buttonText[0]+"</div>";
                html +=         "<div class='dialog_button dialog_no'>"+buttonText[1]+"</div>";
                html +=     "</div>";
                html += "</div>";

            this.dialogContainer = $(html).appendTo(document.body);

            this.dialogContainer.css({
                position: "fixed",
                left: "50%",
                top: "50%",
                width: "280px",
                height: "150px",
                marginLeft: "-140px",
                marginTop: "-75px",
                fontSize: "16px",
                backgroundColor: "#fff",
                zIndex: 999
            }).find(".dialog_content").css({
                width: "240px",
                height: "114px",
                lineHeight: "114px",
                padding: "0 20px",
                textAlign: "center",
                borderBottom: "1px solid #DCDCDC"
            });

            this.dialogContainer.find(".dialog_text").css({
                verticalAlign: "middle",
                lineHeight: "20px",
                display: "inline-block"
            });

            this.dialogContainer.find(".dialog_button").css({
                float: "left",
                width: "140px",
                height: "35px",
                lineHeight: "35px",
                textAlign: "center",
                cursor: "pointer"
            }).on({
                mouseenter: function () {
                    $(this).css({
                        backgroundColor: "#7CB204",
                        color: "#FFF"
                    });
                },

                mouseleave: function () {
                    $(this).css({
                        backgroundColor: "#FFF",
                        color: "#000"
                    });
                }
            });

            this.dialogContainer.find(".dialog_button.dialog_yes").css({
                width: "139px",
                borderRight: "1px solid #DCDCDC"
            });
        } else {
            this.screen.css({
                left: "0px",
                top: "0px",
                width: "100%",
                height: "100%"
            })
            .fadeIn(200, function () {
                //$(document.body).css("overflow", "hidden");
            });

            this.dialogContainer.show().find(".dialog_text").html(content);
        }

        this.dialogContainer.find(".dialog_button").off("click").on("click", function () {
            Util.screen.fadeOut(200, function () {
                //$(document.body).css("overflow", "auto");
            });
            Util.dialogContainer.hide();

            $(this).hasClass("dialog_yes") ? callback(true) : callback(false);
        });
    },

    /**
     * [checkbox 复选框勾选事件]
     * @param  selector jquery选择器
     */
    checkbox: function (selector) {
        $(selector).on("mouseenter", function () {   //鼠标滑过改变背景图片
            $(this).parent().addClass("hover");
        }).on("mouseleave", function () {
            $(this).parent().removeClass("hover");
        }).on("change", function () {
            if ($(this).prop("checked")) {  //选中
                $(this).parent().addClass("checked");
            } else {
                $(this).parent().removeClass("checked");
            }
        });
    },

    /**
     * [encodeToken 对token进行加密，用于自动登录时使用]
     * @param token 要加密的token
     */
    encodeToken: function (token) {
        if (!token) return token;

        //加密数组
        var encodeArr = {A: "z",B: "y",C: "x",D: "w",E: "v",F: "u",G: "t",H: "s",I: "r",J: "q",K: "p",L: "o",M: "n",N: "m",O: "l",P: "k",Q: "j",R: "i",S: "h",T: "g",U: "f",V: "e",W: "d",X: "c",Y: "b",Z: "a",0: 9,1: 8,2: 7,3: 6,4: 5,5: 4,6: 3,7: 2,8: 1,9: 0};

        var len = token.length, i, str = "", charCode, newCharCode;

        for (i = 0; i < len; i++) {
            str += typeof encodeArr[token[i]] !== "undefined" ? encodeArr[token[i]] : token[i];
        }

        return str;
    },

    /**
     * [decodeToken 对加密的token进行解密]
     * @param  str 要解密的token
     */
    decodeToken: function (str) {
        if (!str) return str;

        //加密数组
        var decodeArr = {z: "A",y: "B",x: "C",w: "D",v: "E",u: "F",t: "G",s: "H",r: "I",q: "J",p: "K",o: "L",n: "M",m: "N",l: "O",k: "P",j: "Q",i: "R",h: "S",g: "T",f: "U",e: "V",d: "W",c: "X",b: "Y",a: "Z",0: 9,1: 8,2: 7,3: 6,4: 5,5: 4,6: 3,7: 2,8: 1,9: 0};

        var len = str.length, i, token = "", charCode, newCharCode;

        for (i = 0; i < len; i++) {
            token += typeof decodeArr[str[i]] !== "undefined" ? decodeArr[str[i]] : str[i];
        }

        return token;
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
 * [newGuid 生成Guid]
 * @return {[type]} [description]
 */
Util.newGuid = function () {
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