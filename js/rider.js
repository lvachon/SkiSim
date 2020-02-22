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
    this.maxVel=0.5;
    this.maxRideVel=10;
    this.maxSlope=150;
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
    this.verts = [
        0, 0, -1,
        0.7236, -0.52572, -0.447215,
        -0.276385, -0.85064, -0.447215,
        -0.894425, 0, -0.447215,
        -0.276385, 0.85064, -0.447215,
        0.7236, 0.52572, -0.447215,
        0.276385, -0.85064, 0.447215,
        -0.7236, -0.52572, 0.447215,
        -0.7236, 0.52572, 0.447215,
        0.276385, 0.85064, 0.447215,
        0.894425, 0, 0.447215,
        0, 0, 1
    ].map(z=>this.radius*z);

    this.indicies = [
        0, 1, 2,
        1, 0, 5,
        0, 2, 3,
        0, 3, 4,
        0, 4, 5,
        1, 5, 10,
        2, 1, 6,
        3, 2, 7,
        4, 3, 8,
        5, 4, 9,
        1, 10, 6,
        2, 6, 7,
        3, 7, 8,
        4, 8, 9,
        5, 9, 10,
        6, 10, 11,
        7, 6, 11,
        8, 7, 11,
        9, 8, 11,
        10, 9, 11
    ];

    this.colors = [];
    for(let i=0;i<this.verts.length;i+=3){
        this.colors.push(0,0,1);
    }

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
        const dx = this.currentTarget.x - this.gridX;
        const dy = this.currentTarget.y - this.gridY;
        if(Math.sqrt((dx*dx)+(dy*dy))<this.radius*(this.terrain.gridWidth/this.terrain.meshWidth)){
            this.currentState = this.nextState[this.currentState];
            this.currentLiftTower=0;
            return;
        }
        const a = Math.atan2(dy, dx);
        const velX = Math.cos(a)*this.maxVel;
        const velY = Math.sin(a)*this.maxVel;
        this.gridX+=velX*dt;
        this.gridY+=velY*dt;
        const pos = this.meshPosition();
        this.mesh.position.x = pos.x;
        this.mesh.position.y = pos.y;
        this.mesh.position.z = pos.z;
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
        }
    }

    this.doLift = (dt)=>{
        if(!this.targetLift){return;}
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

        this.energy-=dt*0.001;
    };

    this.ride = (dt)=>{
        let dx = this.currentTarget.x - this.gridX;
        let dy = this.currentTarget.y - this.gridY;
        let dz = (this.currentTarget.z - this.mesh.position.z)*this.terrain.gridWidth/this.terrain.meshWidth;
        let d = Math.sqrt(dx*dx+dy*dy);
        if(d<this.radius*this.terrain.gridWidth/this.terrain.meshWidth || dz>-0.01){
            //Find next target
            let best = {a:null,slope:-100000,trees:10/this.terrain.maxPerAcre};
            const step = Math.random()>0.5?1:-1;//randomly choose which way to sweep for searching
            for(let a = this.yaw - Math.PI/2; a<this.yaw+Math.PI/2;a+=0.01){
                this.currentTarget.x = this.gridX + 0.5*Math.cos(step*a);
                this.currentTarget.y = this.gridY + 0.5*Math.sin(step*a);
                this.currentTarget.z = this.terrain.iTerrain(this.currentTarget.x,this.currentTarget.y)+this.radius;
                const slope = this.mesh.position.z-this.currentTarget.z;
                const i = Math.floor(this.currentTarget.x)+Math.floor(this.currentTarget.y)*this.terrain.gridWidth;
                if(slope>best.slope && this.terrain.treemap[i]<best.trees && slope<this.maxSlope){
                    best={a:step*a,slope,trees:best.trees};
                    if(best.slope>this.maxSlope/8 && Math.random()>0.25){break;}//Randomly, if it's good enough go there
                }else{
                    //console.log({trees:this.terrain.treemap[i],slope});
                }
            }
            if(best.a===null || best.slope<0.01*this.terrain.meshWidth/this.terrain.gridWidth){console.log("NO MORE SLOPE",{best});this.currentState='IDLE';return;}
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



    this.geom = new THREE.BufferGeometry();
    this.geom.setIndex(this.indicies);
    this.geom.setAttribute('position',new THREE.Float32BufferAttribute(this.verts,3));
    this.geom.setAttribute('color',new THREE.Float32BufferAttribute(this.colors,3));
    this.geom.computeVertexNormals();
    this.geom.computeFaceNormals();
    this.mat = new THREE.MeshPhongMaterial({
        side: THREE.DoubleSide,
        vertexColors: THREE.VertexColors
    });
    this.mesh = new THREE.Mesh(this.geom, this.mat);
    const pos = this.meshPosition();
    this.mesh.position.x = pos.x;
    this.mesh.position.y = pos.y;
    this.mesh.position.z = pos.z;





}