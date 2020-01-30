function makeTerrain(pgb, width, height, heightmap){
	const z = pgb.attributes.position.array;
	const colors = [];// = pgb.attributes.color.array;
	for(let y=0;y<height;y++){
		for(let x=0;x<width;x++){
			const i = (height-1-y)*width+x;
			z[i*3+2] = heightmap[i];
			colors.push(heightmap[i]/3000.0)
			colors.push(0.5+heightmap[i]/6000.0);
			colors.push(heightmap[i]/3000.0);
		}
	}
	console.log(colors);
	pgb.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
	pgb.computeFaceNormals();
	pgb.computeVertexNormals();
}