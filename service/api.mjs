//rutas 
// import rutasInsertar from "./routers/rutasInsertar.mjs"
import rutasEliminar from "./routes/routesDelete.mjs"
import rutasRead from "./routes/routesRead.mjs"
import rutasModificar from "./routes/routesUpdate.mjs"
import rutasRegister from "./routes/routesRegister.mjs"
import rutasUploadFoto from "./routes/routesUploadFoto.mjs"
import express from 'express'

const app = express()
const puerto = 3000

//middlewares
app.use(express.json())
app.use(express.urlencoded({ extended:true }))

// app.use("/api",rutasInsertar)
app.use("/api",rutasEliminar)
// app.use("/api",rutasListar)
app.use("/api",rutasModificar)
app.use("/api", rutasRegister)
app.use("/api", rutasRead)
app.use("/api",rutasUploadFoto)

app.get("/", (req, res) =>{
    res.sendStatus(200)
})

app.listen(puerto, () =>{
    console.log("Servidor corriendo en el puerto", puerto)
})