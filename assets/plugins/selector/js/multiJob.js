require(['jquery', 'util', 'ztree'], function($, util) {
	var apiUrl = decodeURIComponent(util.queryString('apiurl'));
	var jobList = [];
    var selectedData = [];

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

    $('#job-list').on('click', 'input[type="checkbox"]', function (e) {
        e.stopPropagation();
    });

    $('#job-list').on('change', 'input[type="checkbox"]', function () {
        var data = $(this).parent().data('data');

        if ($(this).prop('checked')) {
            if (util.indexOf(selectedData, data, 'JobId') == -1) {
                selectedData.push(data);
            }            
        } else {
            util.removeOf(selectedData, data, 'JobId');
        }

        showSelectedList();
    });

    $('#selected-list').on('click', 'li', function () {  
        $('input[type="checkbox"]', this).prop('checked', !$('input[type="checkbox"]', this).prop('checked'));
    });

    $('#selected-list').on('click', 'input[type="checkbox"]', function (e) {
        e.stopPropagation();
    });

    // 删除选择
    $('#deleteSelected').on('click', function() {
        var delData = [];

        $('#selected-list input[type="checkbox"]:checked').each(function() {
            var data = $(this).parent().data('data');
            delData.push(data);
        });

        for (var i = 0; i < delData.length; i++) {
            util.removeOf(selectedData, delData[i], 'JobId');
        }
        
        showSelectedList();
    });

    // 确定选择
    $('#submitSelected').on('click', function() {
        var cb = parent[util.queryString('callback')];

        if (typeof cb == 'function') {
            cb(selectedData);
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
                    '<input type="checkbox"' + (util.indexOf(selectedData, job, 'JobId') > -1 ? 'checked' : '') + '>' +
                    '<img src="./img/group.png">' +
                    '<span>' + job.JobName + '</span>' +
                '</li>'
            ).appendTo(ul).data('data', job);
        }
    }

    function showSelectedList() {
        var job;
        var ul = $('#selected-list').empty();

        for (var i = 0, l = selectedData.length; i < l; i++) {
            job = selectedData[i];

            $(
                '<li>' + 
                    '<input type="checkbox">' +
                    '<img src="./img/group.png">' +
                    '<span>' + job.JobName + '</span>' +
                '</li>'
            ).appendTo(ul).data('data', job);
        }
    }
});