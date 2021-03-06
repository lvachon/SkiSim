function Agent(gridX,gridY,terrain){
	if(gridX>=terrain.gridWidth){gridX=terrain.gridWidth-1;}
	if(gridY>=terrain.gridDepth){gridY=terrain.gridDepth-1;}
	if(gridX<0){gridX=0;}
	if(gridY<0){gridY=0;}
	this.gridX=gridX;
	this.gridY=gridY;
	this.velX=0;
	this.velY=0;
	this.maxVel=1;
	this.radius=10;
	this.terrain=terrain;
	this.name = NAMES[Math.floor(Math.random()*NAMES.length)];
	/*
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
	for(i=0;i<this.verts.length;i+=3){
		this.colors.push(1,0,0);
	}*/

	this.meshPosition = ()=>{
		return new THREE.Vector3(
			this.terrain.meshWidth*this.gridX/(this.terrain.gridWidth-1)-this.terrain.meshWidth/2,
			this.terrain.meshDepth*((this.terrain.gridDepth-1)-this.gridY)/(this.terrain.gridDepth-1)-this.terrain.meshDepth/2,
			this.terrain.iTerrain(this.gridX,this.gridY)+this.radius
		);
	};


	this.assignTask = (task)=>{
		this.currentTask = task;
		this.currentState = 'NAV';
	};

	this.step = (dt)=>{
		switch (this.currentState){
			case 'NAV':
				this.doNav(dt);
				break;
			case 'WORK':
				this.doWork(dt);
				break;
			case 'IDLE':
				CASH-=dt;
				break;

		}
	};

	this.doNav = (dt)=>{
		const dx = this.currentTask.x - this.gridX;
		const dy = this.currentTask.y - this.gridY;
		if(Math.sqrt((dx*dx)+(dy*dy))<this.radius*(this.terrain.gridWidth/this.terrain.meshWidth)){
			this.currentState='WORK';
			return;
		}
		const a = Math.atan2(dy, dx);
		this.yaw = a;
		const velX = Math.cos(a)*this.maxVel;
		const velY = Math.sin(a)*this.maxVel;
		this.gridX+=velX*dt;
		this.gridY+=velY*dt;
		const pos = this.meshPosition();
		this.mesh.position.x = pos.x;
		this.mesh.position.y = pos.y;
		this.mesh.position.z = pos.z;
		this.mesh.rotation.z = Math.PI/2-this.yaw;
		CASH-=dt*10;
	};

	this.doWork = (dt)=>{
		switch(this.currentTask.task){
			case 'CLEARCUT':
				const done = this.terrain.trimTrees(this.currentTask.x, this.currentTask.y, dt);
				CASH-=dt*100;
				if(done){
					this.currentState='IDLE';
					this.terrain.clearWorkingPoint(this.currentTask.x, this.currentTask.y);
					this.currentTask={x:-1,y:-1,task:"None"};

				}
				break;
		}
	};

	/*
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
	this.mesh = new THREE.Mesh(this.geom, this.mat);*/
	this.mesh = models.models['truck'].clone();
	this.mesh.scale.x=2;
	this.mesh.scale.y=2;
	this.mesh.scale.z=2;
	const pos = this.meshPosition();
	this.mesh.position.x = pos.x;
	this.mesh.position.y = pos.y;
	this.mesh.position.z = pos.z;

	this.currentTask = null;
	this.currentState = 'IDLE';

	

}