function LiftHouse(scale=3.32){
    this.verts=[-1.524,-1.524,0,-1.524,-1.524,3.048,-1.524,4.572,0,-1.524,4.572,3.048,1.524,-1.524,0,1.524,-1.524,3.048,1.524,4.572,0,1.524,4.572,3.048,-1.524,-1.524,3.048,-1.524,4.572,3.048,1.524,4.572,3.048,1.524,-1.524,3.048,-4.580806,-4.566282,3.048,-4.580806,5.480682,3.048,4.580806,5.480682,3.048,4.580806,-4.566282,3.048,-1.518402,-1.524288,5.4864,-1.518402,5.481452,5.4864,1.518402,5.481452,5.4864,1.518402,-1.524288,5.4864,4.11226,5.481117,4.425647,4.112261,-4.156927,4.425646,-4.11226,5.481117,4.425647,-4.112261,-4.156927,4.425647].map(x=>scale*x);
    this.tris=[1,2,0,3,6,2,7,4,6,5,0,4,6,0,2,3,10,7,11,14,15,7,11,5,1,9,3,5,8,1,13,23,22,8,13,9,11,12,8,9,14,10,17,19,18,15,23,12,13,20,14,14,21,15,23,19,16,22,18,20,22,16,17,20,19,21,1,3,2,3,7,6,7,5,4,5,1,0,6,4,0,3,9,10,11,10,14,7,10,11,1,8,9,5,11,8,13,12,23,8,12,13,11,15,12,9,13,14,17,16,19,15,21,23,13,22,20,14,20,21,23,21,19,22,17,18,22,23,16,20,18,19];
    this.colors = [];
    for (let i = 0; i < this.verts.length; i += 3) {
        if(this.verts[i+2]<4*scale){
            this.colors.push(0.8, 0.8, 0.8);
        }else{
            this.colors.push(0, 0.4, 0.6);
        }
    }
    this.geom = new THREE.BufferGeometry();
    this.geom.setIndex(this.tris);
    this.geom.setAttribute('position',new THREE.Float32BufferAttribute(this.verts,3));
    this.geom.setAttribute('color',new THREE.Float32BufferAttribute(this.colors,3));
    this.geom.computeVertexNormals();
    this.geom.computeFaceNormals();
    this.mat = new THREE.MeshPhongMaterial({
        side: THREE.DoubleSide,
        vertexColors: THREE.VertexColors
    });
    this.mesh = new THREE.Mesh(this.geom, this.mat);
}