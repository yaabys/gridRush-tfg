import nodemailer from "nodemailer";
import { google } from "googleapis";
import express from "express";

const app = express();

const CLIENT_ID = process.env.ID_CLIENT_GOOGLE;
const CLIENT_SECRET = process.env.SECRET_CLIENT_GOOGLE;
const REDIRECT_URI = "http://localhost";
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const oAuth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI,
);
oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

app.use("/public", express.static("public"));

export const enviarCorreoRegistro = async (destinatario, nombreUsuario) => {
  try {
    const accessToken = await oAuth2Client.getAccessToken();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "gridrushtfg@gmail.com",
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });

    const info = await transporter.sendMail({
      from: '"GridRush" <gridrushtfg@gmail.com>',
      to: destinatario,
      subject: "¡Bienvenido a GridRush!",
      html: `
        <h1>¡Hola, ${nombreUsuario}!</h1>
        <p>Gracias por unirte a <strong>GridRush</strong>, la plataforma definitiva para los amantes del karting.</p>
        <p>Ahora puedes explorar carreras, competir con otros pilotos y mejorar tu nivel de Elo.</p>
        <p>Prepárate para la emoción de la pista y demuestra tus habilidades al volante.</p>
        <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.</p>
        <p>¡Nos vemos en la pista!</p>
        <p>Atentamente,</p>
        <p>El equipo de GridRush</p>
      `,
    });

    console.log("Correo enviado: %s", info.messageId);
  } catch (error) {
    console.error("Error al enviar el correo:", error);
  }
};
