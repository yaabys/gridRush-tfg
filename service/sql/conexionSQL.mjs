/* creacion de la conexion para utilizar en otros archivos */
import { createClient } from "@libsql/client"
import process from "process"

export const conn = createClient({
 url: process.env.DATABASE_URL,
 authToken: process.env.DATABASE_AUTH_TOKEN
})