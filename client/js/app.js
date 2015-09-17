angular.module('app', [])
    .controller('ChatController', function($scope, $interval) {
        Resource.scope = $scope;
        Buildings.scope = $scope;
        NPC.scope = $scope;
        
          
        var socket = io.connect();
        
        $scope.resources = [];

        $scope.messages = [];
        $scope.roster = [];
        $scope.name = '';
        $scope.text = '';
        $scope.npcs = [];
        $scope.buildings = [];
        
        
        
        $scope.time=0;
        var deltaT=0.1;
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
            $scope.time =$scope.time+deltaT;
          }, 1000*deltaT);
        
        var forester=Buildings.createForester();
        $scope.buildings.push(forester);
        var woodchopper=Buildings.createWoodchopper();
        $scope.buildings.push(woodchopper);
        var sawmill=Buildings.createSawmill();
        $scope.buildings.push(sawmill);
        var pool=Buildings.createPool();
        $scope.buildings.push(pool);
        $scope.pool = pool;
        
        
        for (var i=0;i<10;i++){
          var data = NPC.create(NPC.Type.idle);
          $scope.npcs.push(data);
        }

        socket.on('connect', function () {
          $scope.setName();
        });
        
        $scope.npcClick = function(npc){
          npc.type = NPC.Type.idle
        };
        
        $scope.buildingClick = function(building){
          if (building.assignWorker !== undefined){
            building.assignWorker();
          }
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