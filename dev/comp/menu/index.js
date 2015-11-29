/**
 * Created by snow on 2015/9/5.
 */
define(function(require, exports, module){
  //nav
  var menu= document.querySelector('.m-menu');
  var menu_cover= menu.querySelector('.m-nav-cover');
  var menu_opened= false;
  var menu_open= function(){
    menu_cover.style.display= 'block';
    menu_opened= true;
  };
  var menu_close= function(){
    menu_cover.style.display= 'none';
    menu_opened= false;
  };
  var menu_btn= document.querySelector('.menu-btn');
  menu_btn.addEventListener('click', function(){
    menu_open();
  }, false);
  menu_cover.addEventListener('click', function(){
    menu_close()
  }, false);
  var tab= require('/comp/tabList/index');


  exports.open= menu_open;
  exports.close= menu_close;

});
