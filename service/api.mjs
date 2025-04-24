//rutas 
// import rutasInsertar from "./routers/rutasInsertar.mjs"
// import rutasEliminar from "./routers/rutasEliminar.mjs"
import rutasRead from "./routes/routesRead.mjs"
// import rutasModificar from "./routers/rutasModificar.mjs"
import rutasRegister from "./routes/routesRegister.mjs"
import express from 'express';
import cors from 'cors';


// ... tus rutas y lógic
//modulos

const app = express()
const puerto = 3000

app.use(cors());

//middlewares
app.use(express.json())
app.use(express.urlencoded({ extended:true }))

// app.use("/api",rutasInsertar)
// app.use("/api",rutasEliminar)
// app.use("/api",rutasListar)
// app.use("/api",rutasModificar)
app.use("/api", rutasRegister)
app.use("/api", rutasRead)



app.get("/", (req, res) =>{
    res.sendStatus(200)
})

app.listen(puerto, () =>{
    console.log("Servidor corriendo en el puerto", puerto)
})