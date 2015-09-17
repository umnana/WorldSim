var Buildings = {
  scope: {},
  WorkerState:{
    idle:"idle",
    goingToWork:"go",
    working:"working",
    leavingWork:"leave"
  },
  createSawmill: function() {
    return {
      name: "Sawmill",
      resources: [],
      needsResources:[Resource.Type.wood],
      workers: [],
      x: 755,
      y: 755,
      height: 20,
      width: 20,
      assignWorker: function() {
        var worker = NPC.getIdle();
        this.workers.push(worker);
        worker.type = NPC.Type.worker(this);
        worker.lastOutput = -100;
      },
      updateWorker: function(worker,deltaT) {
        if (NPC.scope.time - worker.lastOutput > 5) {
          worker.lastOutput = NPC.scope.time;
          if (this.resources.length > 0) {
            var wood = this.resources.pop();
            wood.type = Resource.Type.board;
            wood.state = Resource.State.free;
            wood.x = wood.x - 50;
          }
        }
      }
    };
  },
  createWoodchopper: function() {
    return {
      name: "Woodchopper",
      resources: [],
      workers: [],
      x: 75,
      y: 75,
      height: 20,
      width: 20,
      lastOutput: -100,
      assignWorker: function() {
        var worker = NPC.getIdle();
        this.workers.push(worker);
        worker.type = NPC.Type.worker(this);
        worker.lastOutput = -100;
        worker.state = Buildings.WorkerState.idle;
        worker.tree = undefined;
      },
      updateWorker: function(worker,deltaT) {
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
      }
    };
  },
  createForester: function() {
    return {
      name: "Forester",
      x: 100,
      y: 100,
      height: 20,
      width: 20,
      lastOutput: -100,
      update: function(deltaT) {
        if (Buildings.scope.time > this.lastOutput + 5) {
          this.lastOutput = Buildings.scope.time;
          var newTree = Resource.create(Resource.Type.tree);
          newTree.x = 25 + Math.random() * 100;
          newTree.y = 25 + Math.random() * 100;
          Buildings.scope.resources.push(newTree);
        }
      }
    };
  },
  createPool: function() {
    return {
      name: "empty space",
      needsResources:[],
      x: 100,
      y: 600,
      height: 20,
      width: 20,
      update : function(deltaT){
        var buildings = Buildings.scope.buildings.filter(function(building){return building.needsResources !== undefined});
        buildings.forEach(function(building){
          building.needsResources.forEach(function(resource){
            if (building.resources.filter(function(res){return res.type == resource}).length<10){
              var npc = NPC.getIdle();
              var packet = Resource.getFree(resource);
              
              if (npc !== undefined && packet !== undefined){
        console.log("ok");
                packet.state=Resource.State.transit;
                npc.type = NPC.Type.carrier();
                npc.type.packet = packet;
                npc.type.destination = building;
              }
            }
          });
        });
      },
    };
  },
}