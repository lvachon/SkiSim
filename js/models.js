function Models(callback){
    this.loader = new THREE.GLTFLoader();
    this.loadme = [
        {file:'obj/snowboarder.glb',name:'snowboarder'},
        {file:'obj/truck.glb', name:'truck'}
    ];
    this.models = {};
    this.doneCount=0;
    this.loadme.forEach(model=>{
        this.loader.load( model.file, gltf=>{
            console.log(gltf.scene.children[0]);
            this.models[model.name]=gltf.scene.children[0];
            this.doneCount++;
            if(this.doneCount==this.loadme.length){
                this.init();
            }
        });
    },
        error=>{
        console.log(error);
    });

    this.init = callback;
}