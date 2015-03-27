requirejs.config(
{
    baseUrl: 'js/vendor',
    paths:
    {
        app: '../app'
    }
});
requirejs(['app/main']);