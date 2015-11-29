/**
 * Created by snow on 2015/9/5.
 */
define('comp/elementSilde/index', ['require', 'exports', 'module', 'comp/hammer/index'],function(require, exports, module){
  var config= {
    menuSlideX: true,
    menuSlideY: true,
    isBufferScroll: true,
    _moveX: 0,
    _moveY: 0,
    _menuLimitRight: 0,   //内容区域的边界值 右边界点
    _menuLimitBottom: 0
  };

  var deltaX= deltaY= 0;   //上一次手势滑动坐标
  var endX=0;
  var endY= 0;
  var changeStatusInfo= function(){
    //容器边界
    config._menuLimitRight= config.menu_obj.offsetWidth- config.menu_parent.offsetWidth;  //limit= 当前高度- 父级高度
    config._menuLimitBottom= config.menu_obj.offsetHeight- config.menu_parent.offsetHeight;
  };
  var ev_start= function(ev){
    config.menu_obj.style['-webkit-transition-duration']= '0s';
  };
  var ev_move= function(ev){
    deltaX= config.menuSlideX ? endX+ ev.deltaX: 0;    //是否开启横向滚动
    deltaY= config.menuSlideY ? endY+ ev.deltaY: 0;
    //console.log(deltaX);
    config._moveX= deltaX;
    config._moveY= deltaY;
    config.menu_obj.style['-webkit-transform']= 'translate('+deltaX+'px, '+deltaY+'px) translateZ(0px)';
  };
  var oX=oY= 0;
  var oS= 0;  //状态
  //缓冲回滚.超出边界
  var bufferBlack= function(){
    //回归
    config._moveX= oX;
    config._moveY= oY;
    config.menu_obj.style['-webkit-transition-duration']= '0.4s';
    config.menu_obj.style['-webkit-transform']= 'translate('+oX+'px, '+oY+'px) translateZ(0px)';
  };
  //缓冲滚动
  var eoX=eoY=0;
  var bufferScroll= function(ev){
     // console.log(ev,config._moveY);
    eoY= 400;
    if(config._moveY< oY){
      config._moveY= config._moveY- eoY;
    }else{
      config._moveY= config._moveY+ eoY;
    }

    if(config._moveX< oX){
      config._moveX= config._moveX- eoX;
    }else{
      config._moveX= config._moveX+ eoX;
    }

  };
  var ev_end= function(ev){
    //oX=oY= 99999;
    if(config.isBufferScroll) bufferScroll(ev);    //滑行
    oX=config._moveX;     //没有触发边界时采用默认值
    oY= config._moveY;
    //以下单项排除
    if(config._moveY>0){
      oX= config._moveX;   //不变
      oY= 0;
    }
    if(Math.abs(config._moveY)> config._menuLimitBottom){
      oX= config._moveX;
      oY= -config._menuLimitBottom;
    }
    if(config._moveX>0){
      oX= 0;
      oY= config._moveY;
    }
    if(Math.abs(config._moveX)> config._menuLimitRight){
      oX= -config._menuLimitRight;
      oY= config._moveY;
    }
    //角 边界
    if(config._moveX>0 && config._moveY>0){   //左上角排除
      oX= 0;
      oY= 0;
    }
    if(config._moveY>0 && Math.abs(config._moveX)> config._menuLimitRight){    //右上角排除
      oX= -config._menuLimitRight;
      oY= 0;
    }
    if(config._moveX>0 && Math.abs(config._moveY)> config._menuLimitBottom){    //左下角排除
      oX= 0;
      oY= -config._menuLimitBottom;
    }
    if(Math.abs(config._moveX)> config._menuLimitRight && Math.abs(config._moveY)> config._menuLimitBottom){     //右下角排除
      oX= -config._menuLimitRight;
      oY= -config._menuLimitBottom;
    }

    /*if(oX !==99999 && oY !== 99999){   //检查是否修改
      bufferBlack();
    }*/

    config._moveX= oX;
    config._moveY= oY;
    config.menu_obj.style['-webkit-transition-duration']= '0.4s';
    config.menu_obj.style['-webkit-transform']= 'translate('+oX+'px, '+oY+'px) translateZ(0px)';
  };
  var init= function(navStr, menuStr, ops){
    var Hammer= require('comp/hammer/index');   //载入Hammer
    if(!Hammer && typeof Hammer !== 'function'){
      return console.log('no Hammer !');
    }
    if(typeof navStr == 'string' && typeof menuStr == 'string'){
        config.nav_parent= document.querySelector(navStr);
        config.nav_obj= document.querySelector(navStr+' >ul');
        config.menu_parent= document.querySelector(menuStr);
        config.menu_obj= document.querySelector(menuStr+ ' >ul');
    }else{
      return false;
    }
    changeStatusInfo();
    console.log(config);
    var menu_el= new Hammer(config.menu_obj);
    menu_el.on('panstart', function(ev){
      //console.log(ev);
      ev_start(ev);
    });

    /*//上下
    nav_el.on('pandown', function(ev){
     // console.log(ev)
    });
    nav_el.on('panup', function(ev){
      ev_font(ev);
    });
    //左右
    nav_el.on('panright', function(ev){
      //console.log(ev)
    });
    nav_el.on('panleft', function(ev){
      //console.log(ev)
    });*/

    menu_el.on('panmove', function(ev){
      ev_move(ev);
      ev.preventDefault()
    });

    menu_el.on('panend', function(ev){
      //console.log(ev)
      ev_end(ev);
      endX= config._moveX;
      endY= config._moveY;
    });

  console.log(config);


  };
  var open= function(){
    document.body.style.overflow= 'hidden';
    //阻止全局touch事件的触发
    function preventDefault(ev) {
      ev.preventDefault()
    }
    document.addEventListener('touchmove', preventDefault, false)
  };
  exports.init= init;
  exports.open= open;

});
