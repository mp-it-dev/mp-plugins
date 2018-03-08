require.config({
    baseUrl: './assets/js',
    paths: {
        'jquery': '../vendor/lib/jquery-1.11.3.min',
        'uploadify': '../vendor/lib/jquery.uploadify.origin',
        'tlayer': '../vendor/lib/jquery.tlayer',
        'plugins': '../vendor/lib/jquery.plugins',
        'util': '../vendor/lib/util',
        'selector': '../vendor/selector/selector',
        'angular': '../vendor/angular-1.5.9/angular',
        'angular-route': '../vendor/angular-1.5.9/angular-route',
        'angular-cookies': '../vendor/angular-1.5.9/angular-cookies',
        'mpui': '../vendor/mpui/mpui'
    },
    shim: {
        'angular': {
            exports: 'angular',
            deps: ['jquery']
        },
        'angular-route': {
            deps: ['angular']
        },
        'angular-cookies': {
            deps: ['angular']
        }
    }
});