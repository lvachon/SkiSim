    const fs = require('fs');
    var parseString = require('xml2js').parseString;
    fs.open(process.argv[2],"r",(err,fd)=>{
        fs.readFile(fd,(err,data)=>{
            parseString(data,(err,result)=>{
                const verts = result.COLLADA.library_geometries[0].geometry[0].mesh[0].source[0].float_array[0]._.split(" ");
                const normals = result.COLLADA.library_geometries[0].geometry[0].mesh[0].source[1].float_array[0]._.split(" ");
                const map = result.COLLADA.library_geometries[0].geometry[0].mesh[0].source[2].float_array[0]._.split(" ");
                const tris =  result.COLLADA.library_geometries[0].geometry[0].mesh[0].triangles[0].p[0].split(" ");
                const vertTris = tris.filter((x,i)=>!(i%3));

                process.stdout.write(`const verts=[${verts.join(',')}];\n`);
                process.stdout.write(`const tris=[${vertTris.join(',')}];\n`);
            })
        })
    });

