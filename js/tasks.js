function Tasks(terrain, workers){
	this.terrain = terrain;
	this.workers = workers;
	this.tasks = [];
	this.addTask = (x,y,task)=>{
		if(x<0||x>=this.terrain.gridWidth||y<0||y>this.terrain.gridDepth){return false;}
		this.tasks.push({x,y,task});
		return true;
	}

	this.processQueue = ()=>{
		const idleWorkers = this.workers.filter(worker=>worker.currentState==='IDLE');
		for(let i=0;i<idleWorkers.length && this.tasks.length;i++){
			idleWorkers[i].assignTask(this.tasks.shift());
		}
	}


}