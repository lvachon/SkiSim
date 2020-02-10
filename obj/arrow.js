function Arrow(scale=5) {
    this.verts=[8.74228e-7,10,-15,-1.950902,9.807853,-15,-3.826834,9.238796,-15,-5.555701,8.314697,-15,-7.071067,7.071068,-15,-8.314696,5.555702,-15,-9.238795,3.826834,-15,-9.807852,1.950904,-15,-10,7.54979e-7,-15,-9.807852,-1.950902,-15,-9.238795,-3.826833,-15,-8.314696,-5.555702,-15,-7.071067,-7.071068,-15,-5.555701,-8.314697,-15,-3.826832,-9.238797,-15,-1.9509,-9.807853,-15,4.13264e-6,-10,-15,1.950908,-9.807852,-15,3.82684,-9.238794,-15,5.555708,-8.314694,-15,7.071074,-7.071063,-15,8.314702,-5.555696,-15,9.2388,-3.826827,-15,-8.74228e-7,0,-35,9.807856,-1.950895,-15,10,9.65599e-6,-15,9.807852,1.950914,-15,9.238792,3.826845,-15,8.314691,5.555713,-15,7.07106,7.071076,-15,5.555692,8.314704,-15,3.826822,9.238801,-15,1.950889,9.807856,-15,0,5,-15,0,5,15,0.9754516,4.903926,-15,0.9754516,4.903926,15,1.913417,4.619398,-15,1.913417,4.619398,15,2.777851,4.157348,-15,2.777851,4.157348,15,3.535534,3.535534,-15,3.535534,3.535534,15,4.157348,2.777851,-15,4.157348,2.777851,15,4.619398,1.913417,-15,4.619398,1.913417,15,4.903926,0.9754518,-15,4.903926,0.9754518,15,5,3.77489e-7,-15,5,3.77489e-7,15,4.903926,-0.975451,-15,4.903926,-0.975451,15,4.619398,-1.913416,-15,4.619398,-1.913416,15,4.157348,-2.777851,-15,4.157348,-2.777851,15,3.535534,-3.535534,-15,3.535534,-3.535534,15,2.777851,-4.157348,-15,2.777851,-4.157348,15,1.913416,-4.619398,-15,1.913416,-4.619398,15,0.9754504,-4.903926,-15,0.9754504,-4.903926,15,-1.62921e-6,-5,-15,-1.62921e-6,-5,15,-0.9754536,-4.903926,-15,-0.9754536,-4.903926,15,-1.913419,-4.619397,-15,-1.913419,-4.619397,15,-2.777853,-4.157347,-15,-2.777853,-4.157347,15,-3.535536,-3.535532,-15,-3.535536,-3.535532,15,-4.15735,-2.777848,-15,-4.15735,-2.777848,15,-4.619399,-1.913413,-15,-4.619399,-1.913413,15,-4.903927,-0.9754473,-15,-4.903927,-0.9754473,15,-5,4.828e-6,-15,-5,4.828e-6,15,-4.903925,0.9754568,-15,-4.903925,0.9754568,15,-4.619395,1.913422,-15,-4.619395,1.913422,15,-4.157345,2.777856,-15,-4.157345,2.777856,15,-3.535529,3.535538,-15,-3.535529,3.535538,15,-2.777846,4.157352,-15,-2.777846,4.157352,15,-1.91341,4.6194,-15,-1.91341,4.6194,15,-0.9754441,4.903928,-15,-0.9754441,4.903928,15,0.5279056,2.654001,-15,4.843359,0.3604899,-15,0.9011909,4.530642,-15,0.7465712,3.753312,-15,-0.5279127,-2.65398,-15,-1.459883,4.703268,-15,-1.520455,4.612614,-15,-4.843356,-0.360467,-15,-1.608393,4.481006,-15,4.948933,0.5184937,-15,-1.414875,4.770627,-15,-4.948935,-0.5184765,-15,1.414857,-4.770634,-15].map(x=>scale*x);
    this.tris=[0,23,1,1,23,2,2,23,3,3,23,4,4,23,5,5,23,6,6,23,7,7,23,8,8,23,9,9,23,10,10,23,11,11,23,12,12,23,13,13,23,14,14,23,15,15,23,16,16,23,17,17,23,18,18,23,19,19,23,20,20,23,21,21,23,22,22,23,24,24,23,25,25,23,26,26,23,27,27,23,28,28,23,29,29,23,30,30,23,31,31,23,32,32,23,0,81,69,49,34,35,33,36,37,35,38,39,37,40,41,39,42,43,41,44,45,43,46,47,45,48,49,47,50,51,49,52,53,51,54,55,53,56,57,55,58,59,57,60,61,59,62,63,61,64,65,63,66,67,65,68,69,67,70,71,69,72,73,71,74,75,73,76,77,75,78,79,77,82,81,108,82,83,81,84,85,83,86,87,85,88,89,87,90,91,89,92,93,91,70,54,38,96,95,107,96,33,95,35,43,63,91,93,107,85,87,108,59,61,109,53,106,51,63,109,61,67,69,14,47,49,106,32,0,49,0,1,81,1,2,81,2,3,81,3,4,81,4,5,81,5,6,81,6,7,81,7,8,81,81,79,77,77,75,73,73,71,77,71,69,77,69,67,65,65,63,69,63,55,69,55,53,51,49,25,26,55,51,69,51,49,69,81,77,69,49,26,27,27,28,49,28,29,49,29,30,49,30,31,49,31,32,49,0,81,49,34,36,35,36,38,37,38,40,39,40,42,41,42,44,43,44,46,45,46,48,47,48,50,49,50,52,51,52,54,53,54,56,55,56,58,57,58,60,59,60,62,61,62,64,63,64,66,65,66,68,67,68,70,69,70,72,71,72,74,73,74,76,75,76,78,77,78,80,79,108,79,80,80,82,108,82,84,83,84,86,85,86,88,87,88,90,89,90,92,91,92,94,93,38,36,34,34,96,94,94,92,90,90,88,86,86,84,82,82,80,78,78,76,74,74,72,78,72,70,78,70,68,66,66,64,70,64,62,70,62,60,54,60,58,54,58,56,54,54,52,50,50,48,46,46,44,42,42,40,38,38,34,86,34,94,86,94,90,86,86,82,78,54,50,46,46,42,54,42,38,54,86,78,38,78,70,38,70,62,54,107,93,94,94,96,107,96,34,33,95,33,35,35,37,39,39,41,35,41,43,35,43,45,47,47,55,43,55,63,43,63,95,35,95,63,107,63,71,107,71,73,107,73,75,107,75,77,107,77,79,107,79,87,107,87,89,107,89,91,107,87,79,108,108,81,83,83,85,108,109,63,55,55,57,109,57,59,109,53,55,106,55,47,106,106,49,51,24,25,49,24,49,51,21,22,53,22,24,51,19,20,59,20,21,57,19,59,61,17,18,61,18,19,61,15,16,65,16,17,63,63,17,61,13,14,69,14,15,67,67,15,65,11,12,75,12,13,73,11,75,77,9,10,79,10,11,77,79,10,77,81,8,79,8,9,79,22,51,53,16,63,65,75,12,73,21,53,55,21,55,57,57,59,20,71,73,13,69,71,13];
    this.colors = [];
    for (let i = 0; i < this.verts.length; i += 3) {
        this.colors.push(1, 0, 0);
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
