require(['jquery', 'util', 'ztree'], function($, util) {
	var option = parent.selectorGlobal.multiJob;
    var apiUrl = option.apiUrl;
    var callback = option.callback;
	var jobList = [];
    var selectedData = [];

    if (option.oldData && option.oldData.length) {
        selectedData = option.oldData.slice(0);
    }

    ///////////////
    //页面初始化
    //////////////
    $.ajax({
        url: apiUrl + 'Organization/GetJobList',
        dataType: 'jsonp',
        success: function (dataList) {          
            jobList = dataList || [];
            showList();
        }
    });

    ///////////////
    //事件绑定
    //////////////
    $('#search-keyword').on('input', function () {
        showList($(this).val());
    });
    
    // 选中职位
    $('#job-list').on('click', 'li', function () {  
        $('input[type="checkbox"]', this).prop('checked', !$('input[type="checkbox"]', this).prop('checked'));
        $('input[type="checkbox"]', this).trigger('change');
    });

    // 阻止冒泡
    $('#job-list').on('click', 'input[type="checkbox"]', function (e) {
        e.stopPropagation();
    });

    // 选中/取消职位
    $('#job-list').on('change', 'input[type="checkbox"]', function () {
        var data = $(this).parent().data('data');

        if ($(this).prop('checked')) {
            if (util.indexOf(selectedData, data, 'JobID') == -1) {
                selectedData.push(data);
            }            
        } else {
            util.removeOf(selectedData, data, 'JobID');
        }
    });

    // 确定
    $('#submitSelected').on('click', function() {
        if (typeof callback == 'function') {
            callback(selectedData);
        }
    });

    //////////////
    ///函数声明
    //////////////
    function showList(keyword) {
        var job;
        var ul = $('#job-list').empty();

        for (var i = 0, l = jobList.length; i < l; i++) {
            job = jobList[i];

            if (keyword && job.JobName.indexOf(keyword) == -1) {
                continue;
            }

            $(
                '<li>' + 
                    '<input type="checkbox"' + (util.indexOf(selectedData, job, 'JobID') > -1 ? 'checked' : '') + '>' +
                    '<img src="./img/group.png">' +
                    '<span>' + job.JobName + '</span>' +
                '</li>'
            ).appendTo(ul).data('data', job);
        }
    }
});