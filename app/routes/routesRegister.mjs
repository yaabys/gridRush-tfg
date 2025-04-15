import { Router } from "express";
const router = Router();

router.post("/register", async (req, res) => {
    const { email, password, nombreCompleto, userName, passwordConfirmar } = req.body

    if (!email || !password || !nombreCompleto || !userName || passwordConfirmar !== password) {
        console.log("Falta info")
        return res.status(400).send("Falta información o las contraseñas no coinciden.")
    } else {
        try {
            
            const saltRounds = 10
            const hashPassword = await bcrypt.hash(password, saltRounds)

            const result = await registrar(email, hashPassword)

            if (!result) {
                return res.status(400).send("El correo ya está registrado.")
            }
            
            const usuarios = `INSERT INTO usuarios (nombreCompleto, userName, email, passwordUsuario, rutaFoto) VALUES (?, ?, ?, ?,?)`
            await conn.execute(usuarios, [nombreCompleto, userName, email, hashPassword, "default.png"])

            req.session.usuario = { email: email, tokens: 100 }

            res.redirect("/")
        } catch (error) {
            res.redirect("/register")
        }
    }
})

export default router;
