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
        directionY:0,
        directionX:0,
        speedX:0,         //x轴滑动速度
        speedY:0,
        _prevOnePageX: 0,  //上一ev的pageX记录
        _prevOnePageY: 0,
        _startTime: 0      //滑动开始时间戳
    };
    var delta= function(ev, base){   //启始偏移
      if(ev.type== 'touchstart'){
       // console.log(ev, base);
          base.master.startInitX= ev.changedTouches[0].pageX;
          base.master.startInitY= ev.changedTouches[0].pageY;
      }
      if(ev.type== 'touchmove' || ev.type== 'touchend'){
         ev.changedTouches[0].deltaX= ev.changedTouches[0].pageX- base.master.startInitX;
         ev.changedTouches[0].deltaY= ev.changedTouches[0].pageY- base.master.startInitY;
      }


      return ev;
      //console.log(ev.changedTouches[0].deltaY);
    };
    var speed= function(ev, base){
       if(ev.type== 'touchstart'){
          base.master._prevOnePageX= ev.changedTouches[0].pageX;
          base.master._prevOnePageY= ev.changedTouches[0].pageY;
          base.master._startTime= ev.timeStamp;
       }
      if(ev.type== 'touchmove'){
          base.master.speedX= ev.changedTouches[0].speedX= ev.changedTouches[0].pageX- base.master._prevOnePageX;
          base.master.speedY= ev.changedTouches[0].speedY= ev.changedTouches[0].pageY- base.master._prevOnePageY;
          if(base.master._prevOnePageX< ev.changedTouches[0].pageX){
            base.master.directionX= ev.changedTouches[0].directionX= 1;   //向下
          }else{
            base.master.directionX=ev.changedTouches[0].directionX= 2;   //向上
          }
          if(base.master._prevOnePageY< ev.changedTouches[0].pageY){
            base.master.directionY=ev.changedTouches[0].directionY= 1;   //向下
          }else{
            base.master.directionY=ev.changedTouches[0].directionY= 2;   //向上
          }
          base.master._prevOnePageX= ev.changedTouches[0].pageX;
          base.master._prevOnePageY= ev.changedTouches[0].pageY;
      }
      if(ev.type== 'touchend'){
        ev.changedTouches[0].speedX= base.master.speedX;
        ev.changedTouches[0].speedY= base.master.speedY;

        ev.changedTouches[0].directionX= base.master.directionX;
        ev.changedTouches[0].directionY= base.master.directionY;
        ev.changedTouches[0].time= ev.timeStamp- base.master._startTime;   //滑行时间
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


  function Slide(ob, config){
    this.version= 2.0;
    this.base= this;
    this.config={
      isExtraSlide: true,
      SpeedFactor: 100,       //extraSlide 滑动速度系数
      slideDistanceFactorX: 20,
      slideDistanceFactorY: 35,
      slideX: false,     //是否开启左右滑动
      slideY: true,
      rubber: true
    };
    this.master={
      interactionStatus: [0, 0],    //交互状态  0正常 100刷新 200加载
      outContent: null,
      outContentWidth: 0,
      outContentHeight: 0,
      innerContent: null,
      innerContentTop: 0,     //顶部
      innerContentBottom: 0,
      innerContentHeader: null,
      innerContentFoot: null,
      innerContentWidth: 0,
      innerContentHeight: 0,
      prevEndOffsetX: 0,   //上一滑动偏移值
      prevEndOffsetY: 0,
      currentOffsetX:0,    //当前的偏移值
      currentOffsetY:0,
      currentSpeed: 0,     //当前滑行速度
      currentAverageSpeed: 0,    //平均速度
      slideTime: 0,   //滑行时间
      _oldOffsetX: 0,
      _oldOffsetY: 0
    };

    var overflowFn= {
      _config:{
        next:[]
      },
      next: function(ob){
        if(ob.master.interactionStatus[1]== 1){
          //console.log(ob.master.interactionStatus);
            if(ob.master.interactionStatus[2]>0.25 && this._config.next.indexOf(0.2)<0 ){
              ob.master.innerContentHeader.innerText= '正在刷新...';
              this._config.next.push(0.2);
            }

            if(ob.master.interactionStatus[2]>0.5 && this._config.next.indexOf(0.5)<0 ){
              ob.master.innerContentHeader.innerText= '好狠，再拉就坏了...';
              this._config.next.push(0.2);
            }
        }

        if(ob.master.interactionStatus[1]== 2){
          if(ob.master.interactionStatus[2]<0.25 && this._config.next.indexOf(0.2)>-1 ){
            ob.master.innerContentHeader.innerText= '下啦刷新...';
            this._config.next.pop();
          }

          if(ob.master.interactionStatus[2]<0.5 && this._config.next.indexOf(0.5)>-1 ){
            ob.master.innerContentHeader.innerText= '正在刷新...';
            this._config.next.pop();
          }
        }

      },
      clearConfig: function(ob){
        this._config.next= [];
        ob.master.innerContentHeader.innerText= '下啦刷新...';
      }
    };

    var setSite= function(ob, evs){
      // -webkit-transform 1.33s cubic-bezier(0.333333, 0.666667, 0.666667, 1) 0s
      if(evs && evs.type== 'touchend'){
        ob.master.innerContent.style['-webkit-transition-duration']= ob.master.slideTime+ 'ms';
      }
      ob.master.innerContent.style['-webkit-transform']= 'translate3d('+ob.master.currentOffsetX+'px, '+ob.master.currentOffsetY+'px, 0px)';
    };
    var changeRubber= function(ob, evs){

      //console.log(ob.master.currentOffsetY);
      return (Math.abs(evs.changedTouches[0].deltaY)>500 ? 500:Math.abs(evs.changedTouches[0].deltaY))/500
    };
    var rubber= function(ob, evs){
      ob.master.interactionStatus= [0, 0, 0];
      if(evs.type == 'touchmove' || evs.type == 'touchend'){
        if(ob.master.currentOffsetY>ob.master.innerContentTop){
          ob.master.currentOffsetY = ob.master.innerContentTop+ evs.changedTouches[0].deltaY*.27 + evs.changedTouches[0].speedY*.8;
          ob.master.slideTime= 200;
          var pf= (Math.abs(evs.changedTouches[0].deltaY)>500 ? 500:Math.abs(evs.changedTouches[0].deltaY))/500;
          ob.master.interactionStatus= [100, evs.changedTouches[0].directionY, pf];    //刷新
        }
        if(ob.master.currentOffsetY< ob.master.innerContentBottom){
          ob.master.currentOffsetY = ob.master.innerContentBottom+ evs.changedTouches[0].deltaY*.27 + evs.changedTouches[0].speedY*.8;
          ob.master.slideTime= 200;
          var pf= (Math.abs(evs.changedTouches[0].deltaY)>500 ? 500:Math.abs(evs.changedTouches[0].deltaY))/500;
          ob.master.interactionStatus= [200, evs.changedTouches[0].directionY, pf];    //加载
        }

        if(ob.master.interactionStatus[0] == 100){
          overflowFn.next(ob);
        }
      }

    };

    //回收
    var recycle= function(ob){
      if(ob.master.currentOffsetY> ob.master.innerContentTop){
        ob.master.currentOffsetY= ob.master.innerContentTop;
        return
      }
      if(ob.master.currentOffsetY< ob.master.innerContentBottom){
        ob.master.currentOffsetY= ob.master.innerContentBottom;
        //当内部内容高度小于外部容器 默认靠容器顶部
        if(ob.master.innerContentHeight< ob.master.outContentHeight){
          ob.master.currentOffsetY= ob.master.innerContentTop;
        }
        return
      }
    };

    var extraSlide= function(ob, evs){
      var t= ( Math.abs(evs.changedTouches[0].speedY) *15 + Math.abs(evs.changedTouches[0].deltaY) *10 + Math.abs(evs.changedTouches[0].time)*12 ) * 0.15;
      var m= (evs.changedTouches[0].speedY * 125 + evs.changedTouches[0].deltaY * 2 + (evs.changedTouches[0].speedY<0 ? -evs.changedTouches[0].time : evs.changedTouches[0].time)* 2 ) *0.15;
        ob.master.slideTime= t;
        ob.master.currentOffsetY += m ;
      //console.log(evs.changedTouches[0].speedY, evs.changedTouches[0].deltaY, evs.changedTouches[0].time, t, m);
    };

    var setBezier= function(ob){
        ob.master.innerContent.style['-webkit-transition-timing-function']= 'cubic-bezier(0.1, 0.57, 0.1, 1)';
    };

    var start= function(ob, evs){
      ob.master.innerContent.style['-webkit-transition-duration']= '0ms';
    };

    var move= function(ob, evs){
      ob.master.currentOffsetX= ob.config.slideX ? parseInt(evs.changedTouches[0].deltaX + ob.master.prevEndOffsetX) : 0;
      ob.master.currentOffsetY= ob.config.slideY ? parseInt(evs.changedTouches[0].deltaY+ ob.master.prevEndOffsetY) : 0;
      if(ob.config.rubber){
        rubber(ob, evs);
      }
      setSite(ob, evs);
    };

    var end= function(ob, evs){
      if(ob.config.isExtraSlide){
        extraSlide(ob, evs);
      }
      if(ob.config.rubber){
        rubber(ob, evs);
      }
      recycle(ob);
      setSite(ob, evs);
      overflowFn.clearConfig(ob);   //清空溢出操作缓存
      ob.master.prevEndOffsetX= ob.master.currentOffsetX;
      ob.master.prevEndOffsetY= ob.master.currentOffsetY;
    };

    this._run= function(){
      var base= this;
      var v= new SurperTouch();
//阻止全局touch事件的触发
      document.addEventListener('touchmove', function(ev){
        ev.preventDefault();
      }, false);
      this.master.outContent.addEventListener('touchstart', function(ev){
        start(base, v.add(ev));
      }, false);
      this.master.outContent.addEventListener('touchmove', function(ev){
        move(base, v.add(ev));
        ev.preventDefault();
      }, false);
      this.master.outContent.addEventListener('touchend', function(ev){
        end(base, v.add(ev));
      }, false);
    };
    this.init= function(ob, config){
      if(typeof ob !== 'string') return false;
      this.master.outContent= document.querySelector(ob) || null;
      if( !this.master.outContent ){
        return console.error('no find '+ ob);
      }else{
        this.master.outContentWidth= this.master.outContent.offsetWidth;
        this.master.outContentHeight= this.master.outContent.offsetHeight;
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
      }else{
        this.master.innerContentwidth= this.master.innerContent.offsetWidth;   //滚动内容的大小
        this.master.innerContentHeight= this.master.innerContent.offsetHeight;
        this.master.innerContentHeader= this.master.innerContent.querySelector('.sx_header');
        this.master.innerContentFoot= this.master.innerContent.querySelector('.sx_foot');
        this.master.innerContentTop= -this.master.innerContentHeader.offsetHeight;
        this.master.innerContentBottom= -(this.master.innerContentHeight- this.master.outContentHeight- this.master.innerContentFoot.offsetHeight);
        this.master.prevEndOffsetY= this.master.currentOffsetY= this.master.innerContentTop;
      }
      if(this.master.isExtraSlide){
        setBezier(this);  // 设置贝塞尔曲线
      }
      setSite(this);   //位置初始化
      this._run();
      //console.log(ob, this.master)
    };
    return this.init(ob, config);
  }


  exports.init= Slide;

})
