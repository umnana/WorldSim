function Building(x,y, name){
  this.name= name;
  this.x=x;
  this.y=y;
  this.resources= [];
  this.needsResources = [];
  this.incoming = [];
  this.workers= [];
  this.height= 20;
  this.width= 20;
};
Building.prototype.assignWorker = function(){
  
};

function Sawmill(x, y){
  Building.call(this, x, y, "Sawmill");
  this.needsResources.push(Resource.Type.wood);
};

Sawmill.prototype = Object.create(Building.prototype);
Sawmill.prototype.constructor = Sawmill;

Sawmill.prototype.assignWorker = function() {
        var worker = NPC.getIdle();
        if (worker == undefined){
          return;
        }
        
        this.workers.push(worker);
        worker.type = NPC.Type.worker(this);
        worker.lastOutput = -100;
  };
Sawmill.prototype.updateWorker= function(worker,deltaT) {
        if (NPC.scope.time - worker.lastOutput > 5) {
          worker.lastOutput = NPC.scope.time;
          if (this.resources.length > 0) {
            var wood = this.resources.pop();
            wood.type = Resource.Type.board;
            wood.state = Resource.State.free;
            wood.x = wood.x - 50;
          }
        }
      };

function Woodchopper(x, y){
  Building.call(this, x, y, "Woodchopper");
  
  this.lastOutput= -100;
};

      
Woodchopper.prototype = Object.create(Building.prototype);
Woodchopper.prototype.constructor = Woodchopper;

Woodchopper.prototype.updateWorker = function(worker,deltaT) {
        if (NPC.scope.time - worker.lastOutput > 5 && worker.state == Buildings.WorkerState.idle) {
          var tree = Resource.getFree(Resource.Type.tree);
          if (tree !== undefined){
            worker.lastOutput = NPC.scope.time;
            worker.state = Buildings.WorkerState.goingToWork;
            tree.state = Resource.State.inUse;
            worker.tree = tree;
          }
        }
        if(worker.state == Buildings.WorkerState.goingToWork){
          worker.moveTowards(worker.tree,deltaT);
          if (worker.hasReached(worker.tree,deltaT)){
            worker.state = Buildings.WorkerState.working;
            worker.workStarted = Buildings.scope.time;
          }
        }
        else if (worker.state == Buildings.WorkerState.working){
          if (Buildings.scope.time - worker.workStarted > 5){
              worker.tree.type = Resource.Type.wood;
              worker.tree.state = Resource.State.free;
            worker.state = Buildings.WorkerState.leavingWork;
          }
        }
        else if (worker.state == Buildings.WorkerState.leavingWork){
          worker.moveTowards(worker.type.building,deltaT);
          if (worker.hasReached(worker.type.building,deltaT)){
            worker.state = Buildings.WorkerState.idle;
          }
        }
      };
Woodchopper.prototype.assignWorker = function() {
        var worker = NPC.getIdle();
        
        if (worker == undefined){
          return;
        }
        
        this.workers.push(worker);
        worker.type = NPC.Type.worker(this);
        worker.lastOutput = -100;
        worker.state = Buildings.WorkerState.idle;
        worker.tree = undefined;
      };

function Pool(x, y){
  Building.call(this, x, y, "Pool");
};
Pool.prototype = Object.create(Building.prototype);
Pool.prototype.constructor = Pool;

Pool.prototype.update = function(deltaT){
        var buildings = Buildings.scope.buildings.filter(function(building){return building.needsResources !== undefined});
        buildings.forEach(function(building){
          building.needsResources.forEach(function(resource){
            if (building.resources.filter(function(res){return res.type == resource}).length + building.incoming.filter(function(res) { return res.type == resource}).length < 10){
              var npc = NPC.getIdle();
              var packet = Resource.getFree(resource);
              
              if (npc !== undefined && packet !== undefined){
                packet.state=Resource.State.transit;
                building.incoming.push(packet);
                npc.type = NPC.Type.carrier();
                npc.type.packet = packet;
                npc.type.destination = building;
              }
            }
          });
        });
      };
      
function Forester(x, y){
  Building.call(this, x, y, "Forester");
  this.lastOutput= -100;
}
Forester.prototype = Object.create(Building.prototype);
Forester.prototype.constructor = Forester;
Forester.prototype.updateWorker = function(worker,deltaT) {
        if (NPC.scope.time - worker.lastOutput > 5 && worker.state == Buildings.WorkerState.idle) {
            worker.tree = Resource.create(Resource.Type.tree);
            worker.tree.x = this.x + Math.random()*100-50;
            worker.tree.y = this.y + Math.random()*100-50;
            worker.lastOutput = NPC.scope.time;
            worker.state = Buildings.WorkerState.goingToWork;
            worker.tree.state = Resource.State.inUse;
        }
        if(worker.state == Buildings.WorkerState.goingToWork){
          worker.moveTowards(worker.tree,deltaT);
          if (worker.hasReached(worker.tree,deltaT)){
            worker.state = Buildings.WorkerState.working;
            worker.workStarted = Buildings.scope.time;
          }
        }
        else if (worker.state == Buildings.WorkerState.working){
          if (Buildings.scope.time - worker.workStarted > 5){
              Buildings.scope.resources.push(worker.tree);
              worker.tree.state = Resource.State.free;
              worker.state = Buildings.WorkerState.leavingWork;
          }
        }
        else if (worker.state == Buildings.WorkerState.leavingWork){
          worker.moveTowards(this,deltaT);
          if (worker.hasReached(this,deltaT)){
            worker.state = Buildings.WorkerState.idle;
            worker.lastOutput = NPC.scope.time;
          }
        }
      };
Forester.prototype.assignWorker = function() {
        var worker = NPC.getIdle();
        if (worker == undefined){
          return;
        }
        
        this.workers.push(worker);
        worker.type = NPC.Type.worker(this);
        worker.lastOutput = -100;
        worker.state = Buildings.WorkerState.idle;
        worker.tree = undefined;
      };


function House(x, y, capacity){
  this.capacity = capacity;
  this.generated =0;
  this.lastOutput = -100;
  Building.call(this, x, y, "House");
};

House.prototype = Object.create(Building.prototype);
House.prototype.constructor = House;

House.prototype.update = function(deltaT){
  if (Buildings.scope.time - this.lastOutput > 10 && this.generated < this.capacity){
    this.generated += 1;
    this.lastOutput = Buildings.scope.time;
    var newborn = NPC.create(NPC.Type.idle);
    newborn.x = this.x-10*Math.random();
    newborn.y = this.y-10*Math.random();
    Buildings.scope.npcs.push(newborn);
    this.name = "House (" +this.generated +"/"+this.capacity + ")";
    
  }
};

var Buildings = {
  scope: {},
  WorkerState:{
    idle:"idle",
    goingToWork:"go",
    working:"working",
    leavingWork:"leave"
  }
}