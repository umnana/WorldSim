angular.module('app', [])
    .controller('ChatController', function($scope, $interval) {
        Resource.scope = $scope;
        Buildings.scope = $scope;
        NPC.scope = $scope;
        
          
        var socket = io.connect();
        var buildSomething = false;
        var sawmillTypeName = "sawmill";
        var foresterTypeName = "forester";
        var woodchopperTypeName = "woodchopper";
        var smallHouseTypeName = "smallhouse";
        var bigHouseTypeName = "bighouse";
        
        
        $scope.resources = [];
        $scope.messages = [];
        $scope.roster = [];
        $scope.name = '';
        $scope.text = '';
        $scope.npcs = [];
        $scope.buildings = [];
        $scope.buildingTypes = [woodchopperTypeName, foresterTypeName, sawmillTypeName,smallHouseTypeName,bigHouseTypeName];
        $scope.selectedBuildingType = undefined;
        
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
        
        var forester=new Forester(150, 150);
        $scope.buildings.push(forester);
        var woodchopper=new Woodchopper(50, 50);
        $scope.buildings.push(woodchopper);
        var sawmill=new Sawmill(700, 700);
        $scope.buildings.push(sawmill);
        var pool=new Pool(200, 600);
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
          buildSomething = false;
        };
        
        $scope.buildingClick = function(building){
          building.assignWorker();
          buildSomething = false;
        };
        
        $scope.buildingTypeSelected = function(type){
          $scope.selectedBuildingType = type;
          buildSomething = true;
        };
        
        $scope.gameAreaClicked = function(event){
          if (buildSomething && $scope.selectedBuildingType !== undefined){
            var newBuilding = undefined;
            switch ($scope.selectedBuildingType) {
              case sawmillTypeName:
                newBuilding = new Sawmill(event.offsetX, event.offsetY);
                break;
              case woodchopperTypeName:
                newBuilding = new Woodchopper(event.offsetX, event.offsetY);
                break;
                case foresterTypeName:
                newBuilding = new Forester(event.offsetX, event.offsetY);
                break;
                case smallHouseTypeName:
                newBuilding = new House(event.offsetX, event.offsetY,5);
                break;
                case bigHouseTypeName:
                newBuilding = new House(event.offsetX, event.offsetY,20);
                break;
              default:
                return
            }
            
            $scope.buildings.push(newBuilding);
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