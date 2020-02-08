function GodCam( terrain, windowWidth, windowHeight ){
	this.camera = new THREE.PerspectiveCamera( 60, windowWidth / windowHeight, 1, 50000 );
	this.camera.up = new THREE.Vector3(0,0,1);
	this.terrain = terrain;
	this.windowWidth = windowWidth;
	this.windowHeight = windowHeight;
	this.targetLookX = 0;
	this.targetLookY = 0;
	this.targetLookZ = 0;
	this.targetPosX = 0;
	this.targetPosY = 0;
	this.targetPosZ = 0;
	this.targetX = 0;
	this.targetY = 0;
	this.targetZ = 0;
	this.pitch = Math.PI/2;
	this.yaw = -1*Math.PI/2;
	this.targetYaw = this.yaw;
	this.radius = 2000;
	this.movementStarted = null;
	this.movementTime = 1000;
	this.raycaster = new THREE.Raycaster();
	this.keyStates = {
		w:false,
		s:false,
		a:false,
		d:false,
		q:false,
		e:false,
		z:false,
		x:false
	}
	this.setTarget = (x, y)=>{
		if(x>=this.terrain.gridWidth){x=this.terrain.gridWidth-1;}
		if(x<0){x=0;}
		if(y>=this.terrain.gridDepth){y=this.terrain.gridDepth-1;}
		if(y<0){y=0;}

		this.targetX=x;
		this.targetY=y;
		const baseZ = this.terrain.heightmap[x+y*this.terrain.gridWidth];
		this.targetZ=baseZ;

		this.targetLookX = x/this.terrain.gridWidth * this.terrain.meshWidth - this.terrain.meshWidth/2;
		this.targetLookY = this.terrain.meshDepth - y/this.terrain.gridDepth * this.terrain.meshDepth - this.terrain.meshDepth/2;
		this.targetPosX = this.targetLookX + this.radius * Math.cos(this.targetYaw);
		this.targetPosY = this.targetLookY + this.radius * Math.sin(this.targetYaw);

		this.targetLookZ = baseZ;
		this.targetPosZ = baseZ + this.radius;
		this.movementStarted = Date.now();
		this.mouseX = 0;
		this.mouseY = 0;
	}

	this.anim = (dt)=>{
		const dx = this.camera.position.x - this.targetPosX;
		const dy = this.camera.position.y - this.targetPosY;
		const dz = this.camera.position.z - this.targetPosZ;
		const dtt = (Date.now() - this.movementStarted)/1000.0;
		const dyaw = this.yaw - this.targetYaw;
		this.camera.position.x -= dx*Math.min(1.0,dtt);
		this.camera.position.y -= dy*Math.min(1.0,dtt);
		this.camera.position.z -= dz*Math.min(1.0,dtt);
		this.yaw -= dyaw*Math.min(1.0,dtt);
		this.camera.lookAt(this.camera.position.x-this.radius*Math.cos(this.yaw), this.camera.position.y-this.radius*Math.sin(this.yaw), this.camera.position.z-this.radius);


	}

	this.doMovement = ()=>{
		const newTarget={x:this.targetX, y:this.targetY};
		let dirty=false;
		if(this.keyStates.w) {
			newTarget.x -= Math.cos(this.targetYaw);
			newTarget.y += Math.sin(this.targetYaw);
		}
		if(this.keyStates.s) {
			newTarget.x += Math.cos(this.targetYaw);
			newTarget.y -= Math.sin(this.targetYaw);
		}
		if(this.keyStates.a) {
			newTarget.x += Math.sin(this.targetYaw);
			newTarget.y += Math.cos(this.targetYaw);
		}
		if(this.keyStates.d) {
			newTarget.x -= Math.sin(this.targetYaw);
			newTarget.y -= Math.cos(this.targetYaw);
		}
		if(this.keyStates.x) {
			dirty=true;
			this.radius *= 1.1;
		}
		if(this.keyStates.z) {
			dirty=true;
			this.radius /= 1.1;
		}
		if(this.keyStates.q) {
			dirty=true;
			this.targetYaw+=Math.PI/2;
		}
		if(this.keyStates.e) {
			dirty=true;
			this.targetYaw-=Math.PI/2;
		}
		if(this.targetX!=newTarget.x || this.targetY!=newTarget.y || dirty) {
			this.setTarget(newTarget.x, newTarget.y);
		}
		setTimeout(this.doMovement,90);
	}

	this.keydown = (event)=>{
		this.keyStates[event.key]=true;
	}

	this.keyup = (event)=>{
		this.keyStates[event.key]=false;
	}
	this.mousemove = (terrainM)=>{
		const mouse = {
			x:(this.mouseX / this.windowWidth)*2 -1,
			y:-1 * (this.mouseY / this.windowHeight)*2 +1
		};
		this.raycaster.setFromCamera(mouse, this.camera);
		
		const hits = this.raycaster.intersectObject(terrainM);
		if(hits.length){
			return {
				x: (this.terrain.gridWidth * (hits[0].point.x/this.terrain.meshWidth+0.5)),
				y: -1 * (this.terrain.gridDepth * (hits[0].point.y/this.terrain.meshDepth-0.5)),
				z: hits[0].point.z
			}
		}
		return {x:-1,y:-1,z:-1}

	}

	this.setTarget(this.terrain.gridWidth/2, this.terrain.gridDepth/2);
	this.doMovement();
}