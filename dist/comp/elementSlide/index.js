/**
 * Created by snow on 2015/9/5.
 */
define('comp/elementSlide/index', ['require', 'exports', 'module', 'comp/hammer/index'],function(require, exports, module){

  function SuperTouch(ev){
    this.pam= SuperTouch.prototype.pam;
    //console.log(this.pam);
    this.results= ev.changedTouches[0];

    // deltaX 【为每次touch开始的累计坐标偏移，用于move事件中持续位置更新】
    this.results.deltaX= this.results.pageX- this.pam.startX+ this.pam.oldX;
    this.results.deltaY= this.results.pageY- this.pam.startY+ this.pam.oldY;
    this.results.touchTime= -1;   //默认'-1'即在touchstart、touchmove没有输出滑动耗时

    if(ev.type== 'touchstart'){
      this.pam.startX= this.results.pageX;
      this.pam.startY= this.results.pageY;
        this.pam.startTouchTime= ev.timeStamp;    //记录touch开始时间
    }
    if(ev.type== 'touchmove'){
      this.pam.currentX= this.results.pageX;
      this.pam.currentY= this.results.pageY;
    }
    if(ev.type== 'touchend'){
      /*this.pam.oldX= this.pam.currentX;
      this.pam.oldY= this.pam.currentY;*/
      //本次滑动耗时、滑动速率
      this.results.touchTime= ev.timeStamp- this.pam.startTouchTime;
      this.results.rateX= this.results.deltaX/ this.results.touchTime;
      this.results.rateY= this.results.deltaY/ this.results.touchTime;
      console.log(77, this.results.touchTime);

      //console.log(ev);
    }


    //console.log(this.results.deltaY);

    return this.results;
  }
  SuperTouch.prototype.pam={
    startX: 0,
    startY: 0,
    oldX: 0,
    oldY: 0,
    currentX: 0,
    currentY: 0,
    startTouchTime: 0
  };

  //计算默认偏移距离
  var initOffsetDistance= function(){
    //容器边界
    var config= this.config;
    config._objLimitRight= config.slide_obj.offsetWidth- config.slide_parent.offsetWidth;
    config._objLimitBottom= config.slide_obj.offsetHeight- config.slide_parent.offsetHeight; //limit= 当前高度- 父级高度
  };
  var ev_start= function(ev){  //直接操作config对象
    this.slide_obj.style['-webkit-transition-duration']= '0s';
  };
  var ev_move= function(ev){
    //console.log(ev);
    this.deltaX= this.menuSlideX ? this.endX+ ev.deltaX: 0;    //是否开启横向滚动
    this.deltaY= this.menuSlideY ? this.endY+ ev.deltaY: 0;
    //console.log(deltaX);
    this._moveX= this.deltaX;
    this._moveY= this.deltaY;
    this.slide_obj.style['-webkit-transform']= 'translate('+this.deltaX+'px, '+this.deltaY+'px) translateZ(0px)';
  };
  var oX=oY= 0;    //每次滚动最后的位置
  var oS= 0;  //状态
  var eoX=eoY=0;  //滚动系数

  //缓冲回滚.超出边界
  var bufferBlack= function(){
    //回归
    this._moveX= oX;
    this._moveY= oY;
    this.slide_obj.style['-webkit-transition-duration']= '0.4s';
    this.slide_obj.style['-webkit-transform']= 'translate('+oX+'px, '+oY+'px) translateZ(0px)';
  };

  //追加缓冲滚动距离以及计算本次滑行所需时间
  var bufferScroll= function(ev){
    if(ev.touchTime >700 || ev.touchTime <100) return false;        //滑动拖行时间大于700时不追加距离
    var offsetY= Math.abs(this._moveY- oY);
    var offsetX= Math.abs(this._moveX- oX);
    eoY= offsetY*Math.abs(ev.rateY)*this.slideExtraDistanceFactor;   //利用滑行速率计算出‘追加滑行’距离
    eoX= offsetX*Math.abs(ev.rateX)*this.slideExtraDistanceFactor;   //利用滑行速率计算出‘追加滑行’距离
    console.log(335,ev.touchTime);

    if(this._moveY< oY){
      this._moveY= this._moveY- eoY;   //上减
    }else{
      this._moveY= this._moveY+ eoY;   //下加
    }

    if(this._moveX< oX){
      this._moveX= this._moveX- eoX;
    }else{
      this._moveX= this._moveX+ eoX;
    }

    var a= offsetY*this.slideExtraTimeFactor/Math.abs(ev.rateY);
    var b= offsetX*2/Math.abs(ev.rateX);
    if(a<b){      //取最大的
      this.slideTime= b;
    }else{
      this.slideTime= a;
    }
  };
  var eTime=0;

  var ev_end= function(ev){
    //oX=oY= 99999;
    if(this.isBufferScroll) bufferScroll.call(this, ev);    //调用追加滑行距离
    oX=this._moveX;     //没有触发边界时采用默认值
    oY= this._moveY;
    //以下单项排除
    if(this._moveY>0){
      oX= this._moveX;   //不变
      oY= 0;
    }
    if(Math.abs(this._moveY)> this._objLimitBottom){
      oX= this._moveX;
      oY= -this._objLimitBottom;
    }
    if(this._moveX>0){
      oX= 0;
      oY= this._moveY;
    }
    if(Math.abs(this._moveX)> this._objLimitRight){
      oX= -this._objLimitRight;
      oY= this._moveY;
    }
    //角 边界
    if(this._moveX>0 && this._moveY>0){   //左上角排除
      oX= 0;
      oY= 0;
    }
    if(this._moveY>0 && Math.abs(this._moveX)> this._objLimitRight){    //右上角排除
      oX= -this._objLimitRight;
      oY= 0;
    }
    if(this._moveX>0 && Math.abs(this._moveY)> this._objLimitBottom){    //左下角排除
      oX= 0;
      oY= -this._objLimitBottom;
    }
    if(Math.abs(this._moveX)> this._objLimitRight && Math.abs(this._moveY)> this._objLimitBottom){     //右下角排除
      oX= -this._objLimitRight;
      oY= -this._objLimitBottom;
    }

    /*if(oX !==99999 && oY !== 99999){   //检查是否修改
      bufferBlack();
    }*/
    this.slide_obj.style['-webkit-transition-duration']= this.slideTime+ 'ms';    //计算滑行时间
    this.slide_obj.style['-webkit-transform']= 'translate('+oX+'px, '+oY+'px) translateZ(0px)';
    this._moveX= oX;
    this._moveY= oY;
  };

  function Initslide(slideParent, ops){
    //每次实列都会生成
    var config= this.config= {
      menuSlideX: true,
      menuSlideY: true,
      isBufferScroll: true,
      _moveX: 0,
      _moveY: 0,
      _objLimitRight: 0,   //内容区域的边界值 右边界点 [内容区域的右边框与父元素右边框的偏移距离]
      _objLimitBottom: 0,   //》 【计算内容区域可以向右和向下滑动的距离】
      endX: 0,
      endY: 0,
      deltaX: 0,  //上一次手势滑动坐标
      deltaY: 0,
      slideTime: 0,   //滑动时间
      slideExtraDistanceFactor: 1.6,   //滑动追加额为系数默认1.6
      slideExtraTimeFactor:8          //滑动时间系数 默认8
    };

    var Hammer= require('comp/hammer/index');   //载入Hammer
    if(!Hammer && typeof Hammer !== 'function'){
      return console.log('no Hammer !');
    }
    if(slideParent && typeof slideParent == 'string'){
      config.slide_parent= document.querySelector(slideParent);
      if(!config.slide_parent){
        return console.error('not find \''+slideParent+'\' element !');
      }
      var childs= config.slide_parent.childNodes;
      for( var s in childs){
        if(childs.item(s).nodeType == 1){
          config.slide_obj= childs.item(s);
          break;
        }
      }
    }else{
      return;
    }

    config.slide_obj.style['-webkit-transition-timing-function']= 'cubic-bezier(0.1, 0.57, 0.1, 1)';

    initOffsetDistance.call(this);

    // 事件绑定

    //阻止全局touch事件的触发
    document.addEventListener('touchmove', function(ev){
      ev.preventDefault();
    }, false);


    /*var obj_el= new Hammer(config.slide_obj);
    obj_el.on('panstart', function(ev){
      //console.log(ev);
      ev_start.call(config,ev);
    }, false);

    obj_el.on('panmove', function(ev){
      ev_move.call(config, ev);
      ev.preventDefault()
    }, false);

    obj_el.on('panend', function(ev){
      //console.log(ev)
      ev_end.call(config, ev);
      config.endX= config._moveX;
      config.endY= config._moveY;
    }, false);*/
    config.slide_obj.addEventListener('touchstart', function(ev){
      console.log(ev.changedTouches[0]);
      ev_start.call(config, new SuperTouch(ev));
    }, false);
    config.slide_obj.addEventListener('touchmove', function(ev){
      ev_move.call(config,  new SuperTouch(ev));
     // console.log(ev)
    }, false);
    config.slide_obj.addEventListener('touchend', function(ev){
      ev_end.call(config, new SuperTouch(ev));
      console.log(config)
      config.endX= config._moveX;
      config.endY= config._moveY;
    }, false)

  }
  exports.init= Initslide;

});
