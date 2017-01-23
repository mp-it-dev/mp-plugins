require(['jquery', 'util', 'ztree'], function($, util) {
	var apiUrl = decodeURIComponent(util.queryString('apiurl'));
	var jobList = [];

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
        var cb = parent[util.queryString('callback')];

        if (typeof cb == 'function') {
            var data = $(this).data('data');
            cb(data);
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
                    '<img src="./img/group.png">' +
                    '<span>' + job.JobName + '</span>' +
                '</li>'
            ).appendTo(ul).data('data', job);
        }
    }
});