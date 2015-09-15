angular.module('app', [])
    .controller('ChatController', function($scope, $interval) {
        var Resource = {
          "Type":{
            "wood":{id:1,color:"#AA7243"},
            "stone":{id:2,color:"#CCCCCC"}
          },
          "State":{
            "free":{id:1,strokeColor:"green"},
            "transit":{id:2,strokeColor:"blue"},
            "inUse":{id:3,strokeColor:"#333"}
          }
        }
          
        var socket = io.connect();
        
        $scope.resources = [];

        $scope.messages = [];
        $scope.roster = [];
        $scope.name = '';
        $scope.text = '';
        $scope.npcs = [];
        $scope.buildings = [];
        
        var wood = {
          type:Resource.Type.wood,
          state:Resource.State.free,
          x:45,
          y:45
        };
        $scope.resources.push(wood);
        var wood2 = {
          type:Resource.Type.wood,
          state:Resource.State.inUse,
          x:85,
          y:85
        };
        $scope.resources.push(wood2);
        var wood3 = {
          type:Resource.Type.wood,
          state:Resource.State.transit,
          x:65,
          y:65
        };
        $scope.resources.push(wood3);
        
        
        var time=1;
        var deltaT=0.5;
        stop = $interval(function() {
            $scope.npcs.forEach(function(npc){
              if(angular.isDefined(npc.update)){
                npc.update(deltaT);
              }
            });
            $scope.buildings.forEach(function(building){
              if(angular.isDefined(building.update)){
                building.update(deltaT);
              }
            });
            time =time+deltaT;
          }, 100);
        
        var woodchopper={
          x:25,
          y:25,
          height:20,
          width:20
        }
        $scope.buildings.push(woodchopper);
        var sawmill={
          x:775,
          y:775,
          height:20,
          width:20
        }
        $scope.buildings.push(sawmill);
        
        
        for (var i=0;i<10;i++){
          var data = {
            x: Math.random()*300+200,
            y: Math.random()*300+200,
            radius: 10,
            luggage:[],
            target:undefined,
            active:false,
            onTargetReached : function(){
              this.target.state = Resource.State.transit;
              this.luggage.push(this.target);
              this.target=sawmill;
            },  
            update : function(deltaT){
              if (this.active){
                if(angular.isDefined(this.target)){
                  deltaT = deltaT*10;
                  if (this.x>this.target.x) this.x=this.x-deltaT;
                  if (this.x<this.target.x) this.x=this.x+deltaT;
                  if (this.y>this.target.y) this.y=this.y-deltaT;
                  if (this.y<this.target.y) this.y=this.y+deltaT;
                  if (Math.abs(this.x-this.target.x) + Math.abs(this.y-this.target.y)<4){
                    this.onTargetReached();
                  }
                }
                that=this;
                this.luggage.forEach(function(l){
                  l.x = that.x;
                  l.y = that.y;
                });
              }
            }
          };
          $scope.npcs.push(data);
          console.log($scope.npcs.length);
        }

        socket.on('connect', function () {
          $scope.setName();
        });
        
        $scope.npcClick = function(npc){
          npc.active=true;
          npc.target = wood;
        };

        socket.on('message', function (msg) {
          $scope.messages.push(msg);
          $scope.$apply();
        });

        socket.on('deleteMessage', function (msg) {
          console.log("delete: " + msg);
        $scope.messages = $scope.messages.filter(function (el) {
                return el.text != msg.text;
               });
        $scope.$apply();
        });
        socket.on('roster', function (names) {
          $scope.roster = names;
          $scope.$apply();
        });
        
        $scope.deleteMessage = function deleteMessage(msg) {
          console.log("msg:" + msg);
          socket.emit('deleteMessage',msg);
        };

        $scope.send = function send() {
          console.log('Sending message:', $scope.text);
          socket.emit('message', $scope.text);
          $scope.text = '';
        };

        $scope.setName = function setName() {
          socket.emit('identify', $scope.name);
        };
      });