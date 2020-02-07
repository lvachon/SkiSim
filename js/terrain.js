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
	this.trees = null;
	this.selectedPoint = {x:-1, y:-1};

	this.init = ()=>{
		this.geom = new THREE.PlaneBufferGeometry( this.meshWidth, this.meshDepth, this.gridWidth - 1, this.gridDepth - 1 );
		this.makeTerrain(this.geom, this.gridWidth, this.gridDepth, this.heightmap);
		this.tex = new THREE.TextureLoader().load('img/noise_grid.png');
		this.tex.wrapS = THREE.RepeatWrapping;
		this.tex.wrapT = THREE.RepeatWrapping;
		this.tex.repeat.set( this.gridWidth/8, this.gridDepth/8 );
		this.mat = new THREE.MeshPhongMaterial({
			map: this.tex, 
			color:0xffffff, 
			shininess: 0, 
			specular: 0xffffff,
			side:THREE.DoubleSide, 
			vertexColors: THREE.VertexColors
		});
		this.mesh = new THREE.Mesh(this.geom, this.mat);
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

	this.initTrees = (maxPerAcre=5)=>{
		this.maxPerAcre = maxPerAcre;
		this.trees = new Tree();
		for(let i=0;i<treemap.length;i++){
			let rand = mulberry32(i);
			for(let j=1;j<maxPerAcre*this.treemap[i];j++){
				const x = (i%this.gridWidth)+rand();
				const y = this.gridDepth - (Math.floor(i/this.gridWidth)+rand());
				const px = this.meshWidth * ((x/this.gridWidth)-0.5);
				const py = this.meshDepth * ((y/this.gridDepth)-0.5);
				this.trees.offsets.push(px,py,this.iTerrain(x-0.5,y+0.5)+10);
			}
		}
		this.trees.init();
	}

	this.refreshTrees = ()=>{
		this.trees.offsets=[];
		for(let i=0;i<treemap.length;i++){
			let rand = mulberry32(i);
			for(let j=1;j<this.maxPerAcre*this.treemap[i];j++){
				const x = (i%this.gridWidth)+rand();
				const y = this.gridDepth - (Math.floor(i/this.gridWidth)+rand());
				const px = this.meshWidth * ((x/this.gridWidth)-0.5);
				const py = this.meshDepth * ((y/this.gridDepth)-0.5);
				this.trees.offsets.push(px,py,this.iTerrain(x-0.5,y+0.5)+10);
			}
		}
		this.trees.geom.setAttribute('offset',new THREE.InstancedBufferAttribute(new Float32Array(this.trees.offsets),3));
	}

	this.trimTrees = (x, y, dt)=>{
		const i = (x+y*this.gridWidth);
		this.treemap[i]=Math.max(this.treemap[i]-dt,0);
		if(Math.floor(this.treemap[i]*this.maxPerAcre)<Math.floor((this.treemap[i]+dt)*this.maxPerAcre)){
			this.refreshTrees();
		}
		if(this.treemap[i]<=0){return true;}
	}

	this.iTerrain = (x, y) => {
		y=this.gridDepth-y;
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

	this.setSelectedPoint = (x,y,z=0)=>{
		if(x<0||x>this.gridWidth||y<0||y>this.gridDepth){return false;}
		this.clearSelectedPoint();
		this.selectedPoint = {x,y,z};
		this.drawSelectedPoint();
	}

	this.clearSelectedPoint = ()=>{
		if(this.selectedPoint.x <0 || this.selectedPoint.y <0){return;}
		const oi = 3*(this.selectedPoint.x+this.gridWidth*this.selectedPoint.y);
		this.geom.attributes.color.array[oi]=this.selectedPoint.z/this.maxHeight;
		this.geom.attributes.color.array[oi+1]=0.5 + 0.5*this.selectedPoint.z/this.maxHeight;
		this.geom.attributes.color.array[oi+2]=this.selectedPoint.z/this.maxHeight;
		this.geom.attributes.color.needsUpdate = true;
	}

	this.drawSelectedPoint = ()=>{
		if(this.selectedPoint.x <0 || this.selectedPoint.y <0){return;}
		const i = 3*(this.selectedPoint.x+this.gridWidth*this.selectedPoint.y);
		this.geom.attributes.color.array[i]=1;
		this.geom.attributes.color.array[i+1]=0;
		this.geom.attributes.color.array[i+2]=0;
		this.geom.attributes.color.needsUpdate = true;
	}

}

