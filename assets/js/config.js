require.config({
    baseUrl: './assets/js',
    paths: {
        'jquery': 'lib/jquery-1.11.3.min',
        'bootstrap': 'lib/bootstrap.min',
        'uploadify': 'lib/jquery.uploadify',
        'tlayer': 'lib/jquery.tlayer',
        'plugins': 'lib/jquery.plugins',
        'util': 'lib/util',
        'selector': '../plugins/selector/selector'
    },
    shim: {
        'bootstrap': {
            deps: ['jquery']
        },
        'uploadify': {
            deps: ['jquery']
        },
        'tlayer': {
            deps: ['jquery']
        },
        'plugins': {
            deps: ['jquery']
        },
        'selector': {
            deps: ['jquery', 'tlayer']
        }
    },
    urlArgs: 'bust=' + (new Date()).getTime()   //开发环境下禁用缓存，生产环境要移除
});