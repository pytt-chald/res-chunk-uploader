var timer={

 init:function(id){
   this[id]={
   obj:document.getElementById(id)
  }
 },

 start:function(id){
  var obj=this[id];
  obj.srt=new Date();
  clearTimeout(obj.to);
  this.tick(id)
 },

 stop:function(id){
  clearTimeout(this[id].to);
 },

 tick:function(id){
  this.stop(id);
  var obj=this[id],sec=(new Date()-obj.srt)/1000,min=Math.floor(sec/60),sec=sec%60;
  obj.obj.value=min+':'+(sec>9?sec:'0'+sec);
  obj.to=setTimeout(function(){ timer.tick(id); },10);
 }
}

timer.init('tst');
