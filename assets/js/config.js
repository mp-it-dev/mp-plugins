require.config({
    baseUrl: './assets/js',
    paths: {
        'jquery': '../vendor/lib/jquery-1.11.3',
        'bootstrap': '../vendor/lib/bootstrap.min',
        'uploadify': window.FormData ? '../vendor/lib/jquery.uploadify.origin': '../vendor/lib/jquery.uploadify',
        'tlayer': '../vendor/lib/jquery.tlayer',
        'plugins': '../vendor/lib/jquery.plugins',
        'util': '../vendor/lib/util',
        'selector': '../vendor/lib/selector'
    },
    shim: {
        'bootstrap': {
            deps: ['jquery']
        }
    },
    urlArgs: 'v=2'   //开发环境下禁用缓存，生产环境要移除
});