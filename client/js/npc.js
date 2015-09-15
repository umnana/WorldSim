var NPC = {
    create: function(type){
        var npc = {
            x: Math.random()*300+200,
            y: Math.random()*300+200,
            radius: 10,
            "type" : type,
            active:false,
            update : function(deltaT){
              if (this.active){
                this.type.update(deltaT, this);
              }
            },
            moveTowards : function(deltaT, destination){
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
        "carrier" : { 
            luggage:[],
            isFull: false,
            packet:undefined,
            destination: undefined,
            onPackeetReached : function(){
              this.isFull = true;
              this.packet.state = State.transit;
              this.luggage.push(this.packet);
            },
            onDestinationReached: function(npc){
                this.luggage.forEach(function(packet){
                    packet.state = State.inUse;
                });
                this.luggage = [];
                this.isFull = false;
                
                npc.active = false;
                npc.type = NPC.Type.idle;
            },
            update : function(deltaT, npc){
                if (this.isFull){
                  npc.moveTowards(deltaT, this.destination);
                  if (Math.abs(npc.x-this.destination.x) + Math.abs(npc.y-this.destination.y)<deltaT*50*2){
                    this.onDestinationReached(npc);
                  }
                }
                else {
                  npc.moveTowards(deltaT, this.packet);
                  
                  if (Math.abs(npc.x-this.packet.x) + Math.abs(npc.y-this.packet.y)<deltaT*50*2){
                      console.log(npc);
                    this.onPackeetReached();
                  }
                }
                
                that = npc;
                this.luggage.forEach(function(l){
                  l.x = that.x;
                  l.y = that.y;
                });
            }
        },
        "worker" : {
            update : function(deltaT, npc){}
            
        },
        "idle": { 
            update : function(deltaT, npc){}
            
        }
    }
};