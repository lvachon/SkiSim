function updateStats(){
    cash_ui.innerHTML=`Cash: \$${Math.floor(CASH*100)/100}`;
    workers_ui.innerHTML = tm.getWorkerTable();
    riders_ui.innerHTML = `
<table>
	<thead>
		<tr>
			<td>Rider</td>
			<td>Status</td>
			<td>Position</td>
		</tr>
	</th>
	<tbody>
	${riders.map(rider=>{
        return `<tr><td>${rider.name}</td><td>${rider.currentState}</td><td>${Math.floor(rider.gridX*10)/10},${Math.floor(rider.gridY*10)/10}</td></tr>`
    }).join("\n")}
	</tbody>
</table>
`;
    setTimeout(this.updateStats,500);
}

function keydown(event){
    godcam.keydown(event);
}
function keyup(event){
    godcam.keyup(event);
}
function mousemove(event){
    godcam.mouseX = event.offsetX;
    godcam.mouseY = event.offsetY;
}
function mousedown(event){
    const {x, y, z} = godcam.mousemove(terrain.mesh);
    if(x<0||y<0||z<0){
        return;
    }
    if(toolMode==='ADDWORKER'){
        const newWorker = new Agent(x,y,terrain);
        CASH-=500;
        tm.workers.push(newWorker);
        scene.add(newWorker.mesh);
        event.preventDefault();
        return false;
    }
    if(toolMode==='ADDRIDER'){
        const newRider = new Rider(x,y,terrain);
        riders.push(newRider);
        //scene.add(newRider.mesh);
        event.preventDefault();
        return false;
    }
    if(toolMode==='CLEARCUT'){
        tm.addTask(x,y,'CLEARCUT');
    }

    if(toolMode==='BUILDLIFTTOP'){
        if(!maybeLift){return false;}
        const i = Math.floor(x)+Math.floor(y)*gridWidth;
        if(terrain.treemap[i]>0){tm.addTask(x,y,'CLEARCUT');}
        CASH-=10000;
        maybeLift.setEnd(x,y);
        CASH-=1000*maybeLift.towerCount;
        scene.add(maybeLift.topHouse.mesh);
        scene.add(maybeLift.towers.mesh);
        scene.add(maybeLift.cable);
        lifts.push(maybeLift);
        setToolMode('NONE');
    }

    if(toolMode==='BUILDLIFTBASE'){
        const i = Math.floor(x)+Math.floor(y)*gridWidth;
        if(terrain.treemap[i]>0){tm.addTask(x,y,'CLEARCUT');}
        CASH-=10000;
        maybeLift = new Lift(x,y,terrain);
        scene.add(maybeLift.baseHouse.mesh);
        setToolMode('BUILDLIFTTOP');
    }
    terrain.setSelectedPoint(x,y,z);

}
function setToolMode(mode){
    toolMode = mode;
    Array.from(document.getElementsByTagName("button")).forEach(elem=>{elem.classList.remove("active");});
    Array.from(document.getElementsByTagName("button")).filter(elem=>elem.attributes.rel&&elem.attributes.rel.value==mode)[0].classList.add("active");
}