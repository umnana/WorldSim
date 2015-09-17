var Resource = {
  scope:{},
State:{
    "free":{id:1,strokeColor:"green"},
    "transit":{id:2,strokeColor:"blue"},
    "inUse":{id:3,strokeColor:"#333"},
  },
Type: {
    "wood":{id:1,color:"#AA7243"},
    "stone":{id:2,color:"#CCCCCC"},
    "board":{id:3,color:"#F4A460"},
    "tree":{id:3,color:"DarkGreen"},
  },

  getFree: function(type){
          return Resource.scope.resources.find(function(el){
              return el.state == Resource.State.free && el.type == type;
          })
      },
  create : function(aType){
      var r ={
        type:aType,
        state:Resource.State.free,
        x:45,
        y:45
      };
      return r;
    }
}