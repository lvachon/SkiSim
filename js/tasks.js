function Tasks(terrain, workers){
	this.terrain = terrain;
	this.workers = workers;
	this.tasks = [];
	this.addTask = (x,y,task)=>{
		x=Math.floor(x)+0.5;
		y=Math.floor(y)+0.5;
		if(x<0||x>=this.terrain.gridWidth||y<0||y>this.terrain.gridDepth){return false;}
		if(this.tasks.filter(t=>t.x==x&&t.y==y&&t.task==task).length){return false;}
		if(this.workers.filter(w=>w.currentTask&&w.currentTask.x==x&&w.currentTask.y==y&&w.currentTask.task==task&&w.currentState!='IDLE').length){return false;}
		this.tasks.push({x,y,task});
		this.terrain.addWorkingPoint(x, y);
		return true;
	}

	this.processQueue = ()=>{
		const idleWorkers = this.workers.filter(worker=>worker.currentState==='IDLE');
		for(let i=0;i<idleWorkers.length && this.tasks.length;i++){
			idleWorkers[i].assignTask(this.tasks.shift());
		}
	}

	this.getWorkerTable = ()=>{
		return `<table>
					<thead>
						<tr>
							<td>Worker</td>
							<td>Status</td>
							<td>Task</td>
							<td>Position</td>
						</tr>
					</thead>
					<tbody>
						${this.workers.map(worker=>{
							return `<tr>
										<td>${worker.name}</td>
										<td>${worker.currentState}</td>
										<td>${worker.currentTask?worker.currentTask.task:'None'}</td>
										<td>${Math.floor(worker.gridX*10)/10},${Math.floor(worker.gridY*10)/10}</td>
									</tr>`;
						}).join("") }
					</tbody>
				</table>`;
	}

	this.save = (slot)=>{
		localStorage.setItem(`${slot}_tasks_tasks`,JSON.stringify(this.tasks));
		localStorage.setItem(`${slot}_tasks_workers`,JSON.stringify(this.workers.map(worker=>{return {
			name: worker.name,
			gridX:worker.gridX,
			gridY:worker.gridY,
			currentTask:worker.currentTask,
			currentState:worker.currentState,
		}})));
	}
	this.load = (slot)=>{
		this.tasks = JSON.parse(localStorage.getItem(`${slot}_tasks_tasks`));
		this.workers = JSON.parse(localStorage.getItem(`${slot}_tasks_workers`)).map(worker=>{
			const agent = new Agent(worker.gridX, worker.gridY, this.terrain);
			agent.currentTask = worker.currentTask;
			agent.currentState = worker.currentState;
			scene.add(agent.mesh);
			return agent;
		});
	}


}