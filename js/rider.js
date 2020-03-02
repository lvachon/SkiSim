function Rider(gridX,gridY,terrain){
    if(gridX>=terrain.gridWidth){gridX=terrain.gridWidth-1;}
    if(gridY>=terrain.gridDepth){gridY=terrain.gridDepth-1;}
    if(gridX<0){gridX=0;}
    if(gridY<0){gridY=0;}
    this.gridX=gridX;
    this.gridY=gridY;
    this.yaw=0;
    this.vel=0;
    this.targetVel=0;
    this.maxVel=0.5+0.25*Math.random();
    this.maxRideVel=2.5+5*Math.random();
    this.maxSlope=25+50*Math.random();
    this.radius=10;
    this.terrain=terrain;
    this.name = NAMES[Math.floor(Math.random()*NAMES.length)];
    this.energy = 1;
    this.targetLift = null;
    this.currentLiftTower = 0;
    this.currentTarget = {x:-1,y:-1};
    this.currentState = 'IDLE';
    this.nextState = {
        'NAV2LIFT':'LIFT',
        'LIFT':'RIDE',
        'RIDE':'IDLE'
    };

    this.meshPosition = ()=>{
        return new THREE.Vector3(
            this.terrain.meshWidth*this.gridX/(this.terrain.gridWidth-1)-this.terrain.meshWidth/2,
            this.terrain.meshDepth*((this.terrain.gridDepth-1)-this.gridY)/(this.terrain.gridDepth-1)-this.terrain.meshDepth/2,
            this.terrain.iTerrain(this.gridX,this.gridY)+this.radius
        );
    };


    this.step = (dt)=>{
        switch (this.currentState){
            case 'NAV2LIFT':
                this.doNav(dt);
                break;
            case 'LIFT':
                this.doLift(dt);
                break;
            case 'RIDE':
                this.ride(dt);
                break;
            case 'IDLE':
                this.think(dt);
                break;

        }
    };

    this.doNav = (dt)=>{
        const i = Math.floor(this.gridX)+this.terrain.gridWidth*Math.floor(this.gridY);
        if(this.terrain.treemap[i]==0 && this.terrain.iTerrain(this.currentTarget.x,this.currentTarget.y)-this.mesh.position.z<-0.01*this.terrain.meshWidth/this.terrain.gridWidth){
            if(Math.random()<0.01) {//To prevent pingponging
                this.currentState = 'RIDE';
                this.currentTarget.x = this.gridX;
                this.currentTarget.y = this.gridY;
                return;
            }
        }
        const dx = this.currentTarget.x - this.gridX;
        const dy = this.currentTarget.y - this.gridY;
        if(Math.sqrt((dx*dx)+(dy*dy))<this.radius*(this.terrain.gridWidth/this.terrain.meshWidth)){
            this.currentState = this.nextState[this.currentState];
            this.currentLiftTower=0;

            return;
        }
        this.yaw = Math.atan2(dy, dx);
        const velX = Math.cos(this.yaw)*this.maxVel;
        const velY = Math.sin(this.yaw)*this.maxVel;
        this.gridX+=velX*dt;
        this.gridY+=velY*dt;
        const pos = this.meshPosition();
        this.mesh.position.x = pos.x;
        this.mesh.position.y = pos.y;
        this.mesh.position.z = pos.z;
        this.mesh.rotation.z = Math.PI-this.yaw;
        this.energy-=dt*0.002;
    };

    this.think = (dt)=>{
        if(this.energy>0.05){
            //I've got energy for another run
            //Let's find the (closest?) lift
            const closestLift = lifts.reduce((a,l)=>{
                const dist = (this.gridX-l.startX)*(this.gridX-l.startX)+(this.gridY-l.startY)*(this.gridY-l.startY);
                if(dist<a.dist){
                    return {dist:dist, lift:l};
                }else{
                    return a;
                }
            },{dist:100000000000,lift:null}).lift;
            if(closestLift){
                this.targetLift=closestLift;
                this.currentTarget = {
                    x:closestLift.startX,
                    y:closestLift.startY
                };
                this.currentState = 'NAV2LIFT';
                return;
            }
        }else{
            console.log(`${this.name} is tired!`);
            riders = riders.filter(r=>{return r.name!==this.name || r.energy!==this.energy});
            scene.remove(this.mesh);
        }
    }

    this.doLift = (dt)=>{
        if(!this.targetLift){return;}
        this.yaw = this.targetLift.yaw;
        let towerPos = null;

        if(this.currentLiftTower==this.targetLift.towerCount){
            towerPos = this.terrain.gridToMesh(this.targetLift.endX, this.targetLift.endY);
            towerPos.x -= 15*Math.cos(this.targetLift.yaw+Math.PI/2);
            towerPos.y -= 15*Math.sin(this.targetLift.yaw+Math.PI/2);
            towerPos.z += 0;
        }else {
            towerPos = this.terrain.gridToMesh(this.targetLift.startX, this.targetLift.startY);
            towerPos.x -= this.targetLift.towers.offsets[this.currentLiftTower*3+1]*Math.cos(this.targetLift.yaw)+15*Math.cos(this.targetLift.yaw+Math.PI/2);
            towerPos.y -= this.targetLift.towers.offsets[this.currentLiftTower*3+1]*Math.sin(this.targetLift.yaw)+15*Math.sin(this.targetLift.yaw+Math.PI/2);
            towerPos.z += this.targetLift.towers.offsets[this.currentLiftTower*3+2]+35;
        }


        const dx = towerPos.x - this.mesh.position.x;
        const dy = towerPos.y - this.mesh.position.y;
        const dz = towerPos.z - this.mesh.position.z;
        const d = Math.sqrt(dx*dx+dy*dy+dz*dz);
        if(d<this.radius){
            if(this.currentLiftTower < this.targetLift.towerCount) {
                this.currentLiftTower++;
            }else{
               this.currentState = this.nextState[this.currentState];
               this.gridX = this.targetLift.endX;
               this.gridY = this.targetLift.endY;
               const pos = this.meshPosition();
               this.mesh.position.x = pos.x;
               this.mesh.position.y = pos.y;
               this.mesh.position.z = pos.z;
               this.velX=0;
               this.velY=0;
               this.yaw = this.targetLift.yaw;
               this.currentTarget = {x:this.gridX, y:this.gridY, z:this.terrain.iTerrain(this.gridX,this.gridY)+this.radius};
               return;
            }
        }

        this.velX = this.targetLift.cableVel*dx/d;
        this.velY = this.targetLift.cableVel*dy/d;
        this.velZ = this.targetLift.cableVel*dz/d;
        this.mesh.position.x+=this.velX*dt;
        this.mesh.position.y+=this.velY*dt;
        this.mesh.position.z+=this.velZ*dt;
        this.mesh.rotation.z = Math.PI-this.yaw;
        this.energy-=dt*0.001;
    };

    this.ride = (dt)=>{
        let dx = this.currentTarget.x - this.gridX;
        let dy = this.currentTarget.y - this.gridY;
        let dz = (this.currentTarget.z - this.mesh.position.z)*this.terrain.gridWidth/this.terrain.meshWidth;
        let d = Math.sqrt(dx*dx+dy*dy);
        if(d<this.radius*this.terrain.gridWidth/this.terrain.meshWidth || dz>-0.01){
            //Find next target
            let best = {a:null,slope:-100000,slopeDist:100000,trees:10/this.terrain.maxPerAcre};
            const step = Math.random()>0.5?1:-1;//randomly choose which way to sweep for searching
            for(let a = this.yaw - Math.PI; a<this.yaw+Math.PI;a+=0.01){
                this.currentTarget.x = this.gridX + 0.5*Math.cos(step*a);
                this.currentTarget.y = this.gridY + 0.5*Math.sin(step*a);
                this.currentTarget.z = this.terrain.iTerrain(this.currentTarget.x,this.currentTarget.y)+this.radius;
                const slope = this.mesh.position.z-this.currentTarget.z;
                const slopeDist = Math.abs(slope-this.maxSlope/2);
                const i = Math.floor(this.currentTarget.x)+Math.floor(this.currentTarget.y)*this.terrain.gridWidth;
                if(this.terrain.treemap[i]<=best.trees && slopeDist<=best.slopeDist){
                    best={a:step*a,slope,slopeDist,trees:this.terrain.treemap[i]};
                    if(best.slope>this.maxSlope/8 && Math.random()>0.25){break;}//Randomly, if it's good enough go there
                }else{
                    //console.log({trees:this.terrain.treemap[i],slope});
                }
            }
            if(best.a===null || best.slope<0.01*this.terrain.meshWidth/this.terrain.gridWidth){console.log("NO MORE SLOPE",{best});this.currentState='IDLE';return;}
            this.yaw = best.a;
            this.currentTarget.x = this.gridX + 0.5*Math.cos(best.a);
            this.currentTarget.y = this.gridY + 0.5*Math.sin(best.a);
            this.currentTarget.z = this.terrain.iTerrain(this.currentTarget.x,this.currentTarget.y)+this.radius;

            dx = this.currentTarget.x - this.gridX;
            dy = this.currentTarget.y - this.gridY;
            dz = (this.currentTarget.z - this.mesh.position.z)*this.terrain.gridWidth/this.terrain.meshWidth;
            //dz*=1-(best.trees*0.75);
            d = Math.sqrt(dx*dx+dy*dy);
            this.targetVel = Math.max(this.maxVel, this.maxRideVel*-1*dz/d);

            return;
        }
        this.vel -= (this.vel-this.targetVel)*0.05*dt;

        const velX = this.vel * dx/d;
        const velY = this.vel * dy/d;

        if(Math.abs(dt*velX)>Math.abs(dx)){
            this.gridX+=dx;
        }else {
            this.gridX += dt * velX;
        }
        if(Math.abs(dt*velY)>Math.abs(dy)){
            this.gridY+=dy;
        }else {
            this.gridY += dt * velY;
        }
        const pos = this.meshPosition();
        this.mesh.position.x = pos.x;
        this.mesh.position.y = pos.y;
        this.mesh.position.z = pos.z;
        this.mesh.rotation.z = Math.PI-this.yaw;
        this.energy -= 0.01*dt;
    };

    this.save = () => {
        return {
            gridX: this.gridX,
            gridY: this.gridY,
            vel: this.vel,
            targetVel: this.targetVel,
            yaw: this.yaw,
            maxVel: this.maxVel,
            maxRideVel: this.maxRideVel,
            maxSlope: this.maxSlope,
            name: this.name,
            energy: this.energy,
            targetLift: lifts.indexOf(this.targetLift),
            currentLiftTower: this.currentLiftTower,
            currentTarget: this.currentTarget,
            currentState: this.currentState
        };
    };

    this.load = (obj) => {
        this.gridX=obj.gridX;
        this.gridY=obj.gridY;
        this.vel=obj.vel;
        this.targetVel=obj.targetVel;
        this.velZ=obj.velZ;
        this.yaw=obj.yaw;
        this.maxVel=obj.maxVel;
        this.maxRideVel=obj.maxRideVel;
        this.maxSlope=obj.maxSlope;
        this.name = obj.name;
        this.energy = obj.energy;
        this.targetLift = lifts[obj.targetLift];
        this.currentLiftTower = obj.currentLiftTower;
        this.currentTarget = obj.currentTarget;
        this.currentState = obj.currentState;
    }
    this.mesh = models.models['snowboarder'].clone();
    this.mesh.scale.x=2;
    this.mesh.scale.y=2;
    this.mesh.scale.z=2;


}