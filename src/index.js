const express = require("express");
const path = require("path");
const config = require("../config");
const contentManager = require("./contentManager");
const scheduler = require("./scheduler");
const fs = require("fs-extra");

// Initialisation de l'application Express
const app = express();
const port = config.app.port;

// Middleware pour le parsing du JSON
app.use(express.json());

// Middleware pour servir les fichiers statiques
app.use("/content", express.static(path.join(__dirname, "../data/content")));

// Point d'entrée API
app.get("/api/status", (req, res) => {
  res.json({
    status: "running",
    environment: config.app.env,
    upcomingSchedule: scheduler.getUpcomingSchedule(),
  });
});

// API pour générer du contenu manuellement
app.post("/api/content/generate", async (req, res) => {
  try {
    const content = await contentManager.createContent();
    res.json({
      success: true,
      content: {
        id: content.id,
        topic: content.topic,
        idea: content.idea,
        createdAt: content.createdAt,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la génération de contenu:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// API pour publier du contenu manuellement
app.post("/api/content/publish/:contentId", async (req, res) => {
  try {
    const { contentId } = req.params;
    const result = await contentManager.publishContent(contentId);
    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error("Erreur lors de la publication de contenu:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// API pour créer et publier du contenu en une seule étape
app.post("/api/content/create-and-publish", async (req, res) => {
  try {
    const result = await contentManager.createAndPublishContent();
    res.json({
      success: true,
      result,
    });
  } catch (error) {
    console.error(
      "Erreur lors de la création et publication de contenu:",
      error
    );
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// API pour obtenir l'historique des publications
app.get("/api/history", async (req, res) => {
  try {
    const historyPath = path.join(__dirname, "../data/publish_history.json");
    if (await fs.pathExists(historyPath)) {
      const history = await fs.readJSON(historyPath);
      res.json(history);
    } else {
      res.json({ lastPublish: null, history: [] });
    }
  } catch (error) {
    console.error("Erreur lors de la récupération de l'historique:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Démarrage de l'application
app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);

  // Démarrage du planificateur de contenu
  scheduler.start();

  console.log("Planificateur de contenu démarré");
  console.log(
    "Prochaines publications:",
    scheduler
      .getUpcomingSchedule()
      .map((s) => s.scheduledTime)
      .join(", ")
  );
});

// Gestion de l'arrêt propre
process.on("SIGINT", () => {
  console.log("Arrêt du bot influenceur...");
  scheduler.stop();
  process.exit(0);
});
