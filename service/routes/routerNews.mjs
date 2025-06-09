// routes/routesNews.mjs
import express from "express";
import axios from "axios";

const router = express.Router();

router.get("/motorsport-news", async (req, res) => {
  const apiKey = process.env.NEWS_API_KEY;

  const keywords = [
    "Karting", // ¡Prioridad!
    '"Formula 1"',
    "F1",
    "WRC",
    "Rally",
    '"World Rally Championship"',
    "NASCAR",
    "IndyCar",
    "WEC",
    '"World Endurance Championship"',
    '"Le Mans"',
    "Hypercar",
    "Formula E",
    "DTM",
    '"Touring Car"',
    "Dakar",
    "automovilismo",
    '"GT Racing"',
  ];
  // -----------------------------

  const query = keywords.join(" OR ");
  // Mantenemos sortBy=relevancy que nos funcionó bien
  const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=es&sortBy=relevancy&apiKey=${apiKey}`;

  if (!apiKey) {
    console.error("Error: NEWS_API_KEY no está definida en .env");
    return res
      .status(500)
      .json({ error: "Configuración interna incorrecta: Falta API Key." });
  }

  try {
    const response = await axios.get(url);

    const filteredArticles = response.data.articles.filter(
      (article) => article.urlToImage && article.description,
    );

    res.json(filteredArticles);
  } catch (error) {
    if (error.response) {
      console.error(
        "[NEWS] Error desde NewsAPI:",
        error.response.status,
        error.response.data,
      );
      res.status(error.response.status).json({
        error: "Error al obtener noticias desde la fuente externa.",
        details: error.response.data,
      });
    } else {
      console.error("[NEWS] Error genérico en la petición:", error.message);
      res.status(500).json({
        error: "No se pudieron obtener las noticias.",
        details: error.message,
      });
    }
  }
});

export default router;
