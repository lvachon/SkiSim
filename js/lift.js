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
    this.towerCount=0;
    const cableG = new THREE.BufferGeometry();
    const cableM = new THREE.MeshPhongMaterial({
        side: THREE.DoubleSide,
        color: 0x404040
    });
    this.cable = new THREE.Mesh(cableG, cableM);
    this.baseHouse = new LiftHouse();
    this.topHouse = new LiftHouse();
    const meshPosition = this.terrain.gridToMesh(this.startX, this.startY);
    this.baseHouse.mesh.position.x = meshPosition.x;
    this.baseHouse.mesh.position.y = meshPosition.y;
    this.baseHouse.mesh.position.z = meshPosition.z;
    this.setEnd = (endX, endY)=>{
        this.endX = endX;
        this.endY = endY;
        this.yaw = Math.PI-Math.atan2(this.endY-this.startY, this.endX-this.startX);
        this.baseHouse.mesh.rotation.z=this.yaw+Math.PI/2;
        let meshPosition = this.terrain.gridToMesh(this.endX, this.endY);
        this.topHouse.mesh.position.x = meshPosition.x;
        this.topHouse.mesh.position.y = meshPosition.y;
        this.topHouse.mesh.position.z = meshPosition.z;
        this.topHouse.mesh.rotation.z = this.yaw-Math.PI/2;
        this.towers.mesh.rotation.z = this.yaw+Math.PI/2;
        meshPosition = this.terrain.gridToMesh(this.startX, this.startY);
        this.towers.mesh.position.x = meshPosition.x;
        this.towers.mesh.position.y = meshPosition.y;
        this.towers.mesh.position.z = meshPosition.z;
        this.cable.position.x = this.towers.mesh.position.x;
        this.cable.position.y = this.towers.mesh.position.y;
        this.cable.position.z = this.towers.mesh.position.z;
        this.cable.rotation.z = this.yaw+Math.PI/2;
        const offsets = [];
        const dist = Math.sqrt((this.endX-this.startX)*(this.endX-this.startX)+(this.endY-this.startY)*(this.endY-this.startY));

        const cableVerts = [
            -10.0 , 0 , 10.0 ,
            -10.5 , 0 , 10.0 ,
            -10.25, 0 , 10.5 ,
             10.0 , 0 , 10.0 ,
             10.5 , 0 , 10.0 ,
             10.25, 0 , 10.5
        ];

        let prevPos = meshPosition;
        prevPos.z+=10;
        for(let i=1;i<dist-this.distancePerTower;i+=this.distancePerTower){
            const dx=Math.cos(this.yaw)*this.distancePerTower*i;
            const dy=Math.sin(this.yaw)*this.distancePerTower*i;
            const nextPosition = this.terrain.gridToMesh(
                this.startX- Math.cos(this.yaw)*this.distancePerTower*i,
                this.startY+ Math.sin(this.yaw)*this.distancePerTower*i
            );
            const d2 = Math.sqrt((meshPosition.x-nextPosition.x)*(meshPosition.x-nextPosition.x)+(meshPosition.y-nextPosition.y)*(meshPosition.y-nextPosition.y));
            const dz = nextPosition.z-meshPosition.z
            offsets.push(0,d2, dz);

            cableVerts.push(
                -10.0 , d2 , 50.0 + dz ,
                -10.5 , d2 , 50.0 + dz,
                -10.25, d2 , 50.5 + dz,
                 10.0 , d2 , 50.0 + dz,
                 10.5 , d2 , 50.0 + dz,
                 10.25, d2 , 50.5 + dz
            );
        }
        const nextPosition = this.terrain.gridToMesh(
            this.endX,
            this.endY
        );
        const d2 = Math.sqrt((meshPosition.x-nextPosition.x)*(meshPosition.x-nextPosition.x)+(meshPosition.y-nextPosition.y)*(meshPosition.y-nextPosition.y));
        const dz = nextPosition.z-meshPosition.z
        cableVerts.push(
            -10.0 , d2 , 10.0 + dz,
            -10.5 , d2 , 10.0 + dz,
            -10.25, d2 , 10.5 + dz,
            10.0 , d2 , 10.0 + dz,
            10.5 , d2 , 10.0 + dz,
            10.25, d2 , 10.5 + dz
        )
        const cableTris = [];
        for(let i=0;i<cableVerts.length-18;i+=9){
            const vertIndex = i/3;
            const nextTowerVertIndex=(i+18)/3;
            let a = vertIndex;
            let b = a+1;
            let c = nextTowerVertIndex;
            let d = nextTowerVertIndex+1;
            cableTris.push( a, b, c );
            cableTris.push( b, d, c );

            a = vertIndex+1;
            b = a+1;
            c = nextTowerVertIndex+1;
            d = c+1;
            cableTris.push( a, b, c );
            cableTris.push( b, d, c );

            a = vertIndex+2;
            b = vertIndex;
            c = nextTowerVertIndex+2;
            d = nextTowerVertIndex;
            cableTris.push( a, b, c );
            cableTris.push( b, d, c );
        }

        this.towers.geom.setAttribute('offset',new THREE.InstancedBufferAttribute(new Float32Array(offsets),3));
        this.towerCount = offsets.length;
        this.towers.mesh.visible=true;

        this.cable.geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(cableVerts),3));
        this.cable.geometry.setIndex(cableTris);
        this.cable.geometry.computeVertexNormals();
        this.cable.geometry.computeFaceNormals();

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