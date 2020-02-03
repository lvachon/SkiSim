function Terrain(meshWidth, meshDepth, gridWidth, gridDepth, heightmap, treemap = []){
	this.heightmap = heightmap;
	this.treemap = treemap;
	this.gridWidth = gridWidth;
	this.gridDepth = gridDepth;
	this.meshWidth = meshWidth;
	this.meshDepth = meshDepth;
	this.trees = null;
	this.init = ()=>{
		this.geom = new THREE.PlaneBufferGeometry( this.meshWidth, this.meshDepth, this.gridWidth - 1, this.gridDepth - 1 );
		this.makeTerrain(this.geom, this.gridWidth, this.gridDepth, this.heightmap);
		this.tex = new THREE.TextureLoader().load('img/noise.png');
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
				colors.push(heightmap[i]/3000.0)
				colors.push(0.5+heightmap[i]/6000.0);
				colors.push(heightmap[i]/3000.0);
			}
		}
		pgb.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
		pgb.computeFaceNormals();
		pgb.computeVertexNormals();
	}

	this.initTrees = (maxPerAcre=5)=>{
		this.trees = new Tree();
		for(let i=0;i<treemap.length;i++){
			for(let j=0;j<maxPerAcre*this.treemap[i];j++){
				const x = (i%this.gridWidth)+Math.random();
				const y = Math.floor(i/this.gridWidth)+Math.random();
				const px = this.meshWidth * ((x/this.gridWidth)-0.5);
				const py = this.meshDepth * ((y/this.gridDepth)-0.5);
				this.trees.offsets.push(px,py,this.iTerrain(x-0.5,y+0.5)+10);
			}
		}
		this.trees.init();
	}

	this.iTerrain = (x, y) => {
		let x1 = Math.floor(x);
		let x2 = x1+1;
		let y1 = Math.floor(y);
		let y2 = y1+1;
		if(x1<0){x1=0;}
		if(y1<0){y1=0;}
		if(x2>=this.gridWidth){x2=this.gridWidth;}
		if(y2>=this.gridDepth){y2=this.gridDepth;}
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

}

