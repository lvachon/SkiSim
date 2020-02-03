function Tree(){
	
	this.verts=[
	-6,-6, 0,
	6 ,-6, 0,
	0 , 6, 0,
	0 , 0, 24
	];
	this.colors=[
	0, 0.25, 0,
	0, 0.25, 0,
	0, 0.25, 0,
	0.25, 0.50, 0.25
	];
	this.indexes=[
	0,1,2,
	2,0,3,
	0,1,3,
	1,2,3
	];
	this.offsets=[];

	this.init = () =>{
		this.geom = new THREE.InstancedBufferGeometry();
		this.geom.addAttribute('offset', new THREE.InstancedBufferAttribute(new Float32Array(this.offsets),3));
		this.geom.setAttribute('position',new THREE.Float32BufferAttribute(this.verts,3));
		this.geom.setAttribute('color',new THREE.Float32BufferAttribute(this.colors,3));
		this.geom.setIndex(this.indexes);
		this.geom.computeVertexNormals();
		this.geom.computeFaceNormals();
		this.mat = new THREE.MeshPhongMaterial({
			side: THREE.DoubleSide,
			vertexColors: THREE.VertexColors
		});
		this.mat.onBeforeCompile = function ( shader ) {
		    shader.vertexShader = 'attribute vec3 offset;\n' + shader.vertexShader;
		    shader.vertexShader = shader.vertexShader.replace( '#include <begin_vertex>',
		       [
		         'vec3 transformed = vec3( position + offset );',
		       ].join( '\n' )
		     );
		     materialShader = shader;
		};

		this.mesh = new THREE.Mesh(this.geom, this.mat);
		this.mesh.frustumCulled = false;
	}
}