require.config({
    baseUrl: './js/',
    paths: {
        'jquery': 'jquery-1.11.3.min',
        'tlayer': 'jquery.tlayer',
        'util': 'util',
        'ztree': 'jquery.ztree.all-3.5.min',
    },
    shim: {
        'bootstrap': {
            deps: ['jquery']
        },
        'ztree': {
            deps: ['jquery']
        },
        'tlayer': {
            deps: ['jquery']
        }
    },
    urlArgs: 'bust=' + (new Date()).getTime()   //开发环境下禁用缓存，生成环境要移除
});