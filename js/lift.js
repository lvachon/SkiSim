function Lift(startX, startY, terrain){
    this.startX = startX;
    this.startY = startY;
    this.endX = null;
    this.endY = null;
    this.yaw = null;
    this.terrain = terrain;
    this.distancePerTower = 1;
    this.maxLength = 32;
    this.towers = new Tower();
    this.segments = [];
    this.baseHouse = new LiftHouse();
    this.topHouse = new LiftHouse();
    const meshPosition = this.terrain.gridToMesh(this.startX, this.startY);
    this.baseHouse.mesh.position.x = meshPosition.x;
    this.baseHouse.mesh.position.y = meshPosition.y;
    this.baseHouse.mesh.position.z = meshPosition.z;
    this.setEnd = (endX, endY)=>{
        this.endX = endX;
        this.endY = endY;
        this.yaw = Math.atan2(this.endY-this.startY, this.endX-this.startX)+Math.PI/2;
        this.baseHouse.mesh.rotation.z=this.yaw;
        let meshPosition = this.terrain.gridToMesh(this.endX, this.endY);
        this.topHouse.mesh.position.x = meshPosition.x;
        this.topHouse.mesh.position.y = meshPosition.y;
        this.topHouse.mesh.position.z = meshPosition.z;
        this.topHouse.mesh.rotation.z = this.yaw+Math.PI;
        this.towers.mesh.rotation.z = this.yaw;
        meshPosition = this.terrain.gridToMesh(this.startX+ Math.cos(this.yaw)*this.distancePerTower, this.startY+Math.sin(this.yaw)*this.distancePerTower);
        this.towers.mesh.position.x = meshPosition.x;
        this.towers.mesh.position.y = meshPosition.y;
        this.towers.mesh.position.z = meshPosition.z;
        const offsets = [];
        const dist = Math.sqrt((this.endX-this.startX)*(this.endX-this.startX)+(this.endY-this.startY)*(this.endY-this.startY));
        console.log(meshPosition);
        for(let i=1;i<dist-this.distancePerTower;i+=this.distancePerTower){
            const nextPosition = this.terrain.gridToMesh(
                this.startX+ Math.cos(this.yaw-Math.PI/2)*this.distancePerTower*i,
                this.startY+ Math.sin(this.yaw-Math.PI/2)*this.distancePerTower*i
            );
            console.log(nextPosition);
            offsets.push(nextPosition.x-meshPosition.x,nextPosition.y-meshPosition.y, nextPosition.z-meshPosition.z);
        }
        this.towers.geom.setAttribute('offset',new THREE.InstancedBufferAttribute(new Float32Array(offsets),3));
        this.towers.mesh.visible=true;
    }
    this.save = ()=>{
        return {
            startX: this.startX,
            startY: this.startY,
            endX: this.endX,
            endY: this.endY,
            distancePerTower: this.distancePerTower,
        }
    }
}