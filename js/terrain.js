function mulberry32(a) {
    return function() {
      var t = a += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

function Terrain(meshWidth, meshDepth, gridWidth, gridDepth, heightmap, treemap = [], maxHeight){
	this.heightmap = heightmap;
	this.treemap = treemap;
	this.gridWidth = gridWidth;
	this.gridDepth = gridDepth;
	this.meshWidth = meshWidth;
	this.meshDepth = meshDepth;
	this.maxHeight = maxHeight;
	this.trees = new Tree();
	this.selectedPoint = {x:-1, y:-1};
	this.workingPoints = [];
	this.arrow = null;
	this.maxPerAcre=20;

	this.init = ()=>{

		this.geom = new THREE.PlaneBufferGeometry( this.meshWidth, this.meshDepth, this.gridWidth - 1, this.gridDepth - 1 );
		this.makeTerrain(this.geom, this.gridWidth, this.gridDepth, this.heightmap);
		this.tex = new THREE.TextureLoader().load('img/noise_grid.png');
		this.tex.wrapS = THREE.RepeatWrapping;
		this.tex.wrapT = THREE.RepeatWrapping;
		this.tex.repeat.set( (this.gridWidth-1)/8, (this.gridDepth-1)/8 );
		this.tex.offset.x = 1/16;
		this.tex.offset.y = 1/16;
		this.mat = new THREE.MeshPhongMaterial({
			map: this.tex, 
			color:0xffffff, 
			shininess: 0, 
			specular: 0xffffff,
			side:THREE.DoubleSide, 
			vertexColors: THREE.VertexColors
		});
		this.mesh = new THREE.Mesh(this.geom, this.mat);

		this.arrow = new Arrow();
	}
	

	this.makeTerrain = (pgb, width, height, heightmap)=>{
		const z = pgb.attributes.position.array;
		const colors = [];// = pgb.attributes.color.array;
		for(let y=0;y<height;y++){
			for(let x=0;x<width;x++){
				const i = y*width+x;
				z[i*3+2] = heightmap[i];
				colors.push(heightmap[i]/this.maxHeight)
				colors.push(0.5+0.5*heightmap[i]/this.maxHeight);
				colors.push(heightmap[i]/this.maxHeight);
			}
		}
		pgb.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
		pgb.computeFaceNormals();
		pgb.computeVertexNormals();
	}

	this.refreshTrees = ()=>{
		this.trees.offsets=[];
		for(let i=0;i<treemap.length;i++){
			let rand = mulberry32(i);
			for(let j=1;j<this.maxPerAcre*this.treemap[i];j++){
				const x = (i%this.gridWidth)+rand();
				const y =  (Math.floor(i/this.gridWidth)+rand());
				const meshPoint = this.gridToMesh(x,y);
				this.trees.offsets.push(meshPoint.x,meshPoint.y,meshPoint.z+10);
			}
		}
		this.trees.geom.setAttribute('offset',new THREE.InstancedBufferAttribute(new Float32Array(this.trees.offsets),3));
	}

	this.trimTrees = (x, y, dt)=>{
		x=Math.floor(x);
		y=Math.floor(y);
		const i = (x+y*this.gridWidth);
		this.treemap[i]=Math.max(this.treemap[i]-dt,0);
		if(Math.floor(this.treemap[i]*this.maxPerAcre)<Math.floor((this.treemap[i]+dt)*this.maxPerAcre)){
			this.refreshTrees();
		}
		if(this.treemap[i]<=0){return true;}
	}

	this.iTerrain = (x, y) => {
		//y=this.gridDepth-y;
		let x1 = Math.floor(x);
		let x2 = x1+1;
		let y1 = Math.floor(y);
		let y2 = y1+1;
		if(x1<0){x1=0;}
		if(y1<0){y1=0;}
		if(x2>=this.gridWidth){x2=this.gridWidth-1;}
		if(y2>=this.gridDepth){y2=this.gridDepth-1;}
		let px = (x-x1)/(x2-x1);
		let py = (y-y1)/(y2-y1);
		if(x2==x1){px=0;}
		if(y2==y1){py=0;}
		const zNW = this.heightmap[x1+this.gridWidth*y1];
		const zNE = this.heightmap[x2+this.gridWidth*y1];
		const zSW = this.heightmap[x1+this.gridWidth*y2];
		const zSE = this.heightmap[x2+this.gridWidth*y2];
		const zN = zNW * (1.0-px)+zNE*px;
		const zS = zSW * (1.0-px)+zSE*px;

		return zN * (1-py)+zS*py;
	}

	this.gridToMesh = (x,y)=>{
		return {
			x:this.meshWidth * (x/this.gridWidth-0.5),
			y:this.meshDepth * ((this.gridDepth-y)/this.gridDepth-0.5),
			z:this.iTerrain(x-0.5,y-0.5)
		};
	}

	this.setSelectedPoint = (x,y,z=0)=>{
		if(x<0||x>this.gridWidth||y<0||y>this.gridDepth){return false;}
		this.clearSelectedPoint();
		this.selectedPoint = {x,y,z};
		this.drawSelectedPoint();
	}

	this.clearSelectedPoint = ()=>{
		this.arrow.mesh.visible=false;
	}

	this.drawSelectedPoint = ()=>{
		if(this.selectedPoint.x <0 || this.selectedPoint.y <0){return;}
		const meshPoint = this.gridToMesh(this.selectedPoint.x, this.selectedPoint.y);
		this.arrow.mesh.position.x = meshPoint.x;
		this.arrow.mesh.position.y = meshPoint.y;
		this.arrow.mesh.position.z = meshPoint.z+125;
		this.arrow.mesh.visible = true;
	}

	this.addWorkingPoint = (x,y)=>{
		x=Math.floor(x);
		y=Math.floor(y);
		this.workingPoints.push({x,y});
		const i = 3*(x+this.gridWidth*y);
		this.geom.attributes.color.array[i]=0;
		this.geom.attributes.color.array[i+1]=0;
		this.geom.attributes.color.array[i+2]=1;
		this.geom.attributes.color.needsUpdate = true;

	}
	this.clearWorkingPoint = (x,y)=>{
		x=Math.floor(x);
		y=Math.floor(y);
		this.workingPoints = this.workingPoints.filter(wp=>wp.x!=x||wp.y!=y);
		const i = 3*(x+this.gridWidth*y);
		const z = this.iTerrain(x,y);
		this.geom.attributes.color.array[i]=z/this.maxHeight;
		this.geom.attributes.color.array[i+1]=0.5 + 0.5*z/this.maxHeight;
		this.geom.attributes.color.array[i+2]=z/this.maxHeight;
		this.geom.attributes.color.needsUpdate = true;
	}

	this.save = (slot)=>{
		localStorage.setItem(`${slot}_terrain_trees`,JSON.stringify(this.treemap));
		localStorage.setItem(`${slot}_terrain_workingPoints`,JSON.stringify(this.workingPoints));
	}
	this.load = (slot)=>{
		this.treemap = JSON.parse(localStorage.getItem(`${slot}_terrain_trees`));
		this.workingPoints = [];
		JSON.parse(localStorage.getItem(`${slot}_terrain_workingPoints`)).forEach(wp=>{this.addWorkingPoint(wp.x,wp.y)});
		this.refreshTrees();
	}


}

