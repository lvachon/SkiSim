function Rider(gridX,gridY,terrain){
    if(gridX>=terrain.gridWidth){gridX=terrain.gridWidth-1;}
    if(gridY>=terrain.gridDepth){gridY=terrain.gridDepth-1;}
    if(gridX<0){gridX=0;}
    if(gridY<0){gridY=0;}
    this.gridX=gridX;
    this.gridY=gridY;
    this.velX=0;
    this.velY=0;
    this.velZ=0;
    this.maxVel=0.5;
    this.maxRideVel=10;
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
            this.terrain.meshWidth*this.gridX/this.terrain.gridWidth-this.terrain.meshWidth/2,
            this.terrain.meshDepth*(this.terrain.gridDepth-this.gridY)/this.terrain.gridDepth-this.terrain.meshDepth/2,
            this.terrain.iTerrain(this.gridX-0.5,this.gridY-0.5)+this.radius
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
                this.currentState='NAV2LIFT';
                return;
            }
        }else{
            console.log(`${this.name} is tired!`);
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
               this.velX=0;
               this.velY=0;
               this.currentTarget = {x:this.gridX, y:this.gridY, z:this.terrain.iTerrain(this.gridX,this.gridY)};
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
        if(d<this.radius*this.terrain.gridWidth/this.terrain.meshWidth || this.mesh.position.z<this.currentTarget.z){
            console.log("New target");
            console.log(this.gridX,this.gridY,this.mesh.position.z);
            //Find next target
            let itersLeft = 100;
            do {
                const a = Math.random()*Math.PI*2;
                this.currentTarget.x = this.gridX + Math.cos(a) ;
                this.currentTarget.y = this.gridY + Math.sin(a);
                this.currentTarget.z = this.terrain.iTerrain(this.currentTarget.x-0.5,this.currentTarget.y-0.5)+this.radius;
                if(!itersLeft--){
                    this.currentState='IDLE';
                    return;
                }
            }while(
                this.currentTarget.z>=this.mesh.position.z ||
                this.terrain.treemap[Math.floor(this.currentTarget.x)+Math.floor(this.currentTarget.y)*terrain.gridWidth]>0.1
            );

            dx = this.currentTarget.x - this.gridX;
            dy = this.currentTarget.y - this.gridY;
            dz = (this.currentTarget.z - this.mesh.position.z)*this.terrain.gridWidth/this.terrain.meshWidth;
            d = Math.sqrt(dx*dx+dy*dy);
            this.targetVelX = this.maxRideVel * -1*dz/d * dx/d;
            this.targetVelY = this.maxRideVel * -1*dz/d * dy/d;
            console.log(this.currentTarget);
            return;
        }
        this.velX += (this.targetVelX - this.velX)*0.05*dt;
        this.velY += (this.targetVelY - this.velY)*0.05*dt;
        if(Math.abs(dt*this.velX)>Math.abs(dx)){
            this.gridX+=dx;
        }else {
            this.gridX += dt * this.velX;
        }
        if(Math.abs(dt*this.velY)>Math.abs(dy)){
            this.gridY+=dy;
        }else {
            this.gridY += dt * this.velY;
        }
        const pos = this.meshPosition();
        this.mesh.position.x = pos.x;
        this.mesh.position.y = pos.y;
        this.mesh.position.z = pos.z;
    };



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