function GodCam(camera, gridWidth, gridDepth, heightmap, meshWidth, meshDepth ){
	this.camera = camera;
	this.gridWidth = gridWidth;
	this.gridDepth = gridDepth;
	this.meshWidth = meshWidth;
	this.meshDepth = meshDepth;
	this.heightmap = heightmap;
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
	this.radius = 2000;
	this.movementStarted = null;
	this.movementTime = 1000;
	this.setTarget = (x, y)=>{
		if(x>=this.gridWidth){x=this.gridWidth-1;}
		if(x<0){x=0;}
		if(y>=this.gridDepth){y=this.gridDepth-1;}
		if(y<0){y=0;}

		this.targetX=x;
		this.targetY=y;
		const baseZ = this.heightmap[x+y*this.gridWidth];
		this.targetZ=baseZ;

		this.targetLookX = x/this.gridWidth * this.meshWidth - this.meshWidth/2;
		this.targetLookY = meshDepth - y/this.gridDepth * this.meshDepth - this.meshDepth/2;
		this.targetPosX = this.targetLookX + this.radius * Math.cos(this.yaw);
		this.targetPosY = this.targetLookY + this.radius * Math.sin(this.yaw);

		this.targetLookZ = baseZ;
		this.targetPosZ = baseZ + this.radius;
		this.movementStarted = Date.now();
	}

	this.anim = (dt)=>{
		const dx = this.camera.position.x - this.targetPosX;
		const dy = this.camera.position.y - this.targetPosY;
		const dz = this.camera.position.z - this.targetPosZ;
		this.camera.position.x -= dx*Math.min(1.0,dt);
		this.camera.position.y -= dy*Math.min(1.0,dt);
		this.camera.position.z -= dz*Math.min(1.0,dt);
		this.camera.lookAt(this.camera.position.x-this.radius*Math.cos(this.yaw), this.camera.position.y-this.radius*Math.sin(this.yaw), this.camera.position.z-this.radius);

	}
	this.keydown = (event)=>{
		console.log(event);
		switch(event.key){
			case 'w':
				this.setTarget(this.targetX, this.targetY-1);
				break;
			case 's':
				this.setTarget(this.targetX, this.targetY+1);
				break;
			case 'a':
				this.setTarget(this.targetX-1, this.targetY);
				break;
			case 'd':
				this.setTarget(this.targetX+1, this.targetY);
				break;
			case 'z':
				this.radius*=1.1;
				this.setTarget(this.targetX, this.targetY);
				break;
			case 'x':
				this.radius/=1.1;
				this.setTarget(this.targetX, this.targetY);
				break;

				
		}
		return {x:this.targetX, y:this.targetY, z:this.targetZ }
	}

	this.setTarget(gridWidth/2, this.gridDepth/2);
}