/**
 * Created by Administrator on 2015/12/3.
 */
define(function(require, exports, module){
  function SurperTouch(){
    this.version= 2.0;
    this.base= this;
    this.config= {
      delta: true,    //是否开启累计步长计算
      speed: true
    };
    this.master= {
        startInitX: 0,    //touchstart 的开始坐标
        startInitY: 0,
        speedX:0,         //x轴滑动速度
        speedY:0,
        _prevOnePageX: 0,  //上一ev的pageX记录
        _prevOnePageY: 0
    };
    var delta= function(ev, base){   //启始偏移
      if(ev.type== 'touchstart'){
       // console.log(ev, base);
          base.master.startInitX= ev.changedTouches[0].pageX;
          base.master.startInitY= ev.changedTouches[0].pageY;
      }
      if(ev.type== 'touchmove'){
         ev.changedTouches[0].deltaX= ev.changedTouches[0].pageX- base.master.startInitX;
         ev.changedTouches[0].deltaY= ev.changedTouches[0].pageY- base.master.startInitY;
      }
      if(ev.type== 'touchend'){

      }

      return ev;
      //console.log(ev.changedTouches[0].deltaY);
    };
    var speed= function(ev, base){
       if(ev.type== 'touchstart'){
          base.master._prevOnePageX= ev.changedTouches[0].pageX;
          base.master._prevOnePageY= ev.changedTouches[0].pageY;
       }
      if(ev.type== 'touchmove'){
          base.master.speedX= ev.changedTouches[0].speedX= ev.changedTouches[0].pageX- base.master._prevOnePageX;
          base.master.speedY= ev.changedTouches[0].speedY= ev.changedTouches[0].pageY- base.master._prevOnePageY;
          base.master._prevOnePageX= ev.changedTouches[0].pageX;
          base.master._prevOnePageY= ev.changedTouches[0].pageY;
      }
      if(ev.type== 'touchend'){
        ev.changedTouches[0].speedX= base.master.speedX;
        ev.changedTouches[0].speedY= base.master.speedY;
      }
    };

    this.mainCompute= function(ev){

      if(this.config.delta){
        delta(ev, this.base);
      }
      if(this.config.speed){
        speed(ev, this.base);
      }
      return ev;
    };
    this.add= function(ev){
      if(typeof ev !== "object"){
        return console.error('touch event error!');
      }
      return this.mainCompute(ev);
    }
  };


  /*function init(){
    var v= new SurperTouch();
    console.log(v)
    document.addEventListener('touchmove', function(ev){
      v.add(ev);
      ev.preventDefault();
    }, false);
  }*/

  function Slide(ob, config){
    this.version= 2.0;
    this.base= this;
    this.config={
      isExtraSlide: true,
      SpeedFactor: 40,       //extraSlide 滑动速度系数
      slideDistanceFactorX: 20,
      slideDistanceFactorY: 25,
      slideX: false,     //是否开启左右滑动
      slideY: true
    };
    this.master={
      outContent: null,
      innerContent: null,
      prevEndOffsetX: 0,   //上一滑动偏移值
      prevEndOffsetY: 0,
      currentOffsetX:0,    //当前的偏移值
      currentOffsetY:0,
      currentSpeed: 0,     //当前滑行速度
      _oldOffsetX: 0,
      _oldOffsetY: 0
    };

    var setSite= function(ob){
      ob.master.innerContent.style['-webkit-transform']= 'translate('+ob.master.currentOffsetX+'px, '+ob.master.currentOffsetY+'px) translateZ(0px)';
    };

    var extraSlide= function(ob, evs){
      ob.master.currentSpeed= Math.abs(evs.changedTouches[0].speedY);
      if (Math.abs(evs.changedTouches[0].speedX) > Math.abs(evs.changedTouches[0].speedY) ){
        ob.master.currentSpeed= Math.abs(evs.changedTouches[0].speedX);
      }
      //ob.master.currentOffsetX += 500 *ob.master.currentSpeed;
      ob.master.currentOffsetY += ob.config.slideDistanceFactorY *evs.changedTouches[0].speedY;

      if(ob.config.slideX){
        ob.master.currentOffsetX += ob.config.slideDistanceFactorX *evs.changedTouches[0].speedX;
      }
      if(ob.config.slideY){
        ob.master.innerContent.style['-webkit-transition-duration']= ob.master.currentSpeed* ob.config.SpeedFactor+ 'ms';
      }
    };

    var setBezier= function(ob){
       // ob.master.innerContent.style['-webkit-transition-timing-function']= 'cubic-bezier(0.1, 0.57, 0.1, 1)';
    };

    var start= function(ob, evs){
      ob.master.innerContent.style['-webkit-transition-duration']= '0s';
    };

    var move= function(ob, evs){
      //console.log(ob, evs);
      //console.log(ob, evs.changedTouches[0].deltaY);
      ob.master.currentOffsetX= ob.config.slideX ? parseInt(evs.changedTouches[0].deltaX + ob.master.prevEndOffsetX) : 0;
      ob.master.currentOffsetY= ob.config.slideY ? parseInt(evs.changedTouches[0].deltaY+ ob.master.prevEndOffsetY) : 0;
      setSite(ob);
    };

    var end= function(ob, evs){

      if(ob.config.isExtraSlide){
        extraSlide(ob, evs);
      };
      ob.master.prevEndOffsetX= ob.master.currentOffsetX;
      ob.master.prevEndOffsetY= ob.master.currentOffsetY;
      setSite(ob);

    };

    this._run= function(){
      var base= this;
      var v= new SurperTouch();

      this.master.outContent.addEventListener('touchstart', function(ev){
        start(base, v.add(ev));
        //console.log(v.add(ev))
      }, false);
      this.master.outContent.addEventListener('touchmove', function(ev){
        //console.log(evs);
        move(base, v.add(ev));
        ev.preventDefault();
        //console.log(v.add(ev))
      }, false);
      this.master.outContent.addEventListener('touchend', function(ev){
        end(base, v.add(ev));
       // console.log(ev)
      }, false);

    };
    this.init= function(ob, config){
      if(typeof ob !== 'string') return false;
      this.master.outContent= document.querySelector(ob) || null;
      if( !this.master.outContent ){
        return console.error('no find '+ ob);
      }
      var childs= this.master.outContent.childNodes;
      for( var s in childs){
        if(childs.item(s).nodeType == 1){
          this.master.innerContent= childs.item(s);
          break;
        }
      }
      if( !this.master.innerContent){
        return console.error('no find innerContent object !');
      }
      if(this.master.isExtraSlide){
        setBezier(this);  // 设置贝塞尔曲线
      }
      this._run();
      //console.log(ob, this.master)
    };
    return this.init(ob, config);
  }

  exports.init= Slide;

})
