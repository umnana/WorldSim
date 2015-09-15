var State={
    "free":{id:1,strokeColor:"green"},
    "transit":{id:2,strokeColor:"blue"},
    "inUse":{id:3,strokeColor:"#333"}
  };
var Type = {
    "wood":{id:1,color:"#AA7243"},
    "stone":{id:2,color:"#CCCCCC"}
  };
function ResourceManager($scope){

  this.getFree= function(type){
          return $scope.resources.find(function(el){
              return el.state == State.free && el.type == type;
          })
      };
  this.create = function(aType){
      var r ={
        type:aType,
        state:State.free,
        x:45,
        y:45
      };
      return r;
    };
 }