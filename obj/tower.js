function Tower(scale=1){

    this.verts=[-2,-2,0,-2,-2,50,-2,2,0,-2,2,50,2,-2,0,2,-2,50,2,2,0,2,2,50,-10,-2,50,-10,2,50,10,2,50,10,-2,50,-10,-2,52,-10,2,52,10,2,52,10,-2,52].map(x=>scale*x);
    this.tris=[1,2,0,3,6,2,7,4,6,5,0,4,6,0,2,3,10,7,10,15,11,7,11,5,1,9,3,5,8,1,13,15,14,8,13,9,11,12,8,9,14,10,1,3,2,3,7,6,7,5,4,5,1,0,6,4,0,3,9,10,10,14,15,7,10,11,1,8,9,5,11,8,13,12,15,8,12,13,11,15,12,9,13,14];
    this.colors = [];
    for (let i = 0; i < this.verts.length; i += 3) {
        this.colors.push(0.1, 0.1, 0.1);
    }
    this.offsets=[];


    this.geom = new THREE.InstancedBufferGeometry();
    this.geom.addAttribute('offset', new THREE.InstancedBufferAttribute(new Float32Array(this.offsets),3));
    this.geom.setAttribute('position',new THREE.Float32BufferAttribute(this.verts,3));
    this.geom.setAttribute('color',new THREE.Float32BufferAttribute(this.colors,3));
    this.geom.setIndex(this.tris);
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
    this.mesh.visible = false;
    this.mesh.frustumCulled = false;


}