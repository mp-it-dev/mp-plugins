require.config({
    baseUrl: './assets/js',
    paths: {
        'jquery': 'lib/jquery-1.11.3.min',
        'bootstrap': 'lib/bootstrap.min',
        'uploadify': FormData && FileList ? 'lib/jquery.uploadify.origin': 'lib/jquery.uploadify',
        'tlayer': 'lib/jquery.tlayer',
        'plugins': 'lib/jquery.plugins',
        'util': 'lib/util',
        'selector': '../plugins/selector/selector'
    },
    shim: {
        'bootstrap': {
            deps: ['jquery']
        }
    },
    urlArgs: 'bust=' + (new Date()).getTime()   //开发环境下禁用缓存，生产环境要移除
});