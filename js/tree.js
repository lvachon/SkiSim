function Tree(){
	this.geom = new THREE.BufferGeometry();
	
	const verts=[
	-3,-3, 0,
	3 ,-3, 0,
	0 , 3, 0,
	0 , 0, 12
	];
	const colors=[
	0, 0.25, 0,
	0, 0.25, 0,
	0, 0.25, 0,
	0.25, 0.50, 0.25
	];
	const indexes=[
	0,1,2,
	2,0,3,
	0,1,3,
	1,2,3
	];

	this.geom.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));
	this.geom.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
	this.geom.setIndex(indexes);
	this.geom.computeVertexNormals();
	this.geom.computeFaceNormals();
	this.mat = new THREE.MeshPhongMaterial({
		side: THREE.DoubleSide,
		vertexColors: THREE.VertexColors
	});

	this.mesh = new THREE.Mesh(this.geom, this.mat);
}