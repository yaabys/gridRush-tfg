//rutas 
// import rutasInsertar from "./routers/rutasInsertar.mjs"
// import rutasEliminar from "./routers/rutasEliminar.mjs"
// import rutasListar from "./routers/rutasLectura.mjs"
// import rutasModificar from "./routers/rutasModificar.mjs"

//modulos
import express from "express"

const app = express()
const puerto = 3001

//middlewares
app.use(express.json())
app.use(express.urlencoded({extended:true}))

// app.use("/api",rutasInsertar)
// app.use("/api",rutasEliminar)
// app.use("/api",rutasListar)
// app.use("/api",rutasModificar)

app.get("/", (req, res) =>{
    res.sendStatus(200)
})

app.listen(puerto, () =>{
    console.log("Servidor corriendo en el puerto", puerto)
})