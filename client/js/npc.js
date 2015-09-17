var NPC = {
    scope:{},
    getIdle:function(){
      return NPC.scope.npcs.find(function(el){
              return el.type == NPC.Type.idle;
          });
    },
    create: function(type){
        var npc = {
            x: Math.random()*300+200,
            y: Math.random()*300+200,
            radius: 10,
            "type" : type,
            update : function(deltaT){
              this.type.update(deltaT, this);
            },
            hasReached : function(destination,deltaT){
              return (Math.abs(this.x-destination.x) + Math.abs(this.y-destination.y)<deltaT*50*2)
            },
            moveTowards : function(destination,deltaT){
                var delta = deltaT*50;
                  if (this.x>destination.x) this.x=this.x-delta;
                  if (this.x<destination.x) this.x=this.x+delta;
                  if (this.y>destination.y) this.y=this.y-delta;
                  if (this.y<destination.y) this.y=this.y+delta;
            }
          }; 
          
          return npc;
    },
    Type: {
        "carrier" : function(){ 
          return {
            luggage:[],
            isFull: false,
            packet:undefined,
            destination: undefined,
            onPackeetReached : function(){
              this.isFull = true;
              this.packet.state = Resource.State.transit;
              this.luggage.push(this.packet);
            },
            onDestinationReached: function(npc){
                this.luggage.forEach(function(packet){
                    packet.state = Resource.State.inUse;
                    npc.type.destination.resources.push(packet);
                });
                this.luggage = [];
                this.isFull = false;
                
                npc.type = NPC.Type.idle;
            },
            update : function(deltaT, npc){
                if (this.isFull){
                  npc.moveTowards(this.destination,deltaT);
                  if (npc.hasReached(this.destination,deltaT)) {
                    this.onDestinationReached(npc);
                  }
                }
                else {
                  npc.moveTowards(this.packet,deltaT);
                  
                  if (npc.hasReached(this.packet,deltaT)){
                    this.onPackeetReached();
                  }
                }
                
                this.luggage.forEach(function(l){
                  l.x = npc.x;
                  l.y = npc.y;
                });
            }
          };
        },
        "worker" : function(building){
            return {
              "building":building,
              hasReachedBuilding:false,
              update : function(deltaT, npc){
                if (!this.hasReachedBuilding)
                  if(!npc.hasReached(building,deltaT)){
                    npc.moveTowards( this.building,deltaT);
                  }else{
                    this.hasReachedBuilding=true;
                  }
                else{
                    building.updateWorker(npc,deltaT);
                  }
                }
            };
        },
        "idle": { 
            update : function(deltaT, npc){
              npc.moveTowards( NPC.scope.pool,deltaT);
            }
            
        }
    }
};