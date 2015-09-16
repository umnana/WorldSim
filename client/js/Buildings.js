var Buildings = {
    scope: {},
    createSawmill:function(){
        return {
            resources:[],
            workers:[],
            x:775,
            y:775,
            height:20,
            width:20,
            assignWorker:function(){
              var worker = NPC.getIdle();
              this.workers.push(worker);
              worker.type = NPC.Type.worker(this);
              worker.lastOutput = -100;
            },
            updateWorker : function(worker){
              if (NPC.scope.time - worker.lastOutput > 5){
                  worker.lastOutput = NPC.scope.time;
                  if(this.resources.length>0){
                      var wood = this.resources.pop();
                      wood.type = Type.board;
                      wood.state = State.free;
                      wood.x=wood.x-50;
                  }
              }
            }
        };
    },
    createWoodchopper:function(){
        return {
          x:25,
          y:25,
          height:20,
          width:20,
          lastOutput:-100,
          update:function(deltaT){
            if(Buildings.scope.time >this.lastOutput+5){
              this.lastOutput = Buildings.scope.time;
              var nuWood = Buildings.scope.res.create(Type.wood);
              nuWood.x=25+Math.random()*100;
              nuWood.y=25+Math.random()*100;
              Buildings.scope.resources.push(nuWood);
            }
          }
        };
    },
    createPool:function(){
        return {
          x:100,
          y:600,
          height:20,
          width:20
        };
    },
}