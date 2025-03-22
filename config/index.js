require("dotenv").config();

module.exports = {
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },
  midjourney: {
    apiKey: process.env.MIDJOURNEY_API_KEY,
    apiUrl: process.env.MIDJOURNEY_API_URL,
  },
  tiktok: {
    apiKey: process.env.TIKTOK_API_KEY,
    apiSecret: process.env.TIKTOK_API_SECRET,
    accessToken: process.env.TIKTOK_ACCESS_TOKEN,
  },
  app: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || "development",
  },
  contentGeneration: {
    topics: [
      "tendances mode",
      "astuces beauté",
      "fitness",
      "lifestyle",
      "technologie",
      "voyage",
      "cuisine",
      "développement personnel",
    ],
    postFrequency: 3, // Nombre de posts par jour
    scheduleTimes: ["10:00", "15:00", "20:00"], // Heures de publication
  },
};
