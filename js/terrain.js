function makeTerrain(pgb, width, height, heightmap){
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

function iTerrain(x, y, gridWidth, gridDepth, heightmap){
	let x1 = Math.floor(x);
	let x2 = x1+1;
	let y1 = Math.floor(y);
	let y2 = y1+1;
	if(x2>=gridWidth){x2=gridWidth;}
	if(y2>=gridDepth){y2=gridDepth;}
	let px = (x-x1)/(x2-x1);
	let py = (y-y1)/(y2-y1);
	if(x2==x1){px=0;}
	if(y2==y1){py=0;}
	const zNW = heightmap[x1+gridWidth*y1];
	const zNE = heightmap[x2+gridWidth*y1];
	const zSW = heightmap[x1+gridWidth*y2];
	const zSE = heightmap[x2+gridWidth*y2];
	const zN = zNW * (1.0-px)+zNE*px;
	const zS = zSW * (1.0-px)+zSE*px;

	return zN * (1-py)+zS*py;
}