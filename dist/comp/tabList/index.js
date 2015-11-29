/**
 * Created by snow on 2015/11/7.
 */
define('comp/tabList/index', ['require', 'exports', 'module', 'comp/elementSlide/index'],function(require, exports, module){
    var createTouchObj= require('comp/elementSlide/index').init;
    var contS= new createTouchObj('.tab-menu');
    var navS= new createTouchObj('.tab-nav');
});
