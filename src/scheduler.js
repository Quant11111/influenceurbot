const cron = require("node-cron");
const contentManager = require("./contentManager");
const config = require("../config");
const fs = require("fs-extra");
const path = require("path");

class ContentScheduler {
  constructor() {
    this.scheduledJobs = {};
    this.scheduleTimes = config.contentGeneration.scheduleTimes || [
      "10:00",
      "15:00",
      "20:00",
    ];
    this.historyPath = path.join(__dirname, "../data/publish_history.json");
    this.ensureHistoryFile();
  }

  /**
   * S'assure que le fichier d'historique existe
   */
  async ensureHistoryFile() {
    try {
      if (!(await fs.pathExists(this.historyPath))) {
        await fs.writeJSON(
          this.historyPath,
          {
            lastPublish: null,
            history: [],
          },
          { spaces: 2 }
        );
      }
    } catch (error) {
      console.error(
        "Erreur lors de la création du fichier d'historique:",
        error
      );
    }
  }

  /**
   * Planifie les publications quotidiennes
   */
  schedulePublications() {
    try {
      // Arrêter les jobs existants
      Object.values(this.scheduledJobs).forEach((job) => job.stop());
      this.scheduledJobs = {};

      // Planifier de nouveaux jobs pour chaque horaire configuré
      this.scheduleTimes.forEach((time, index) => {
        const [hour, minute] = time.split(":");
        const cronExpression = `${minute} ${hour} * * *`;

        console.log(`Planification de la publication quotidienne à ${time}`);

        this.scheduledJobs[`publish_${index}`] = cron.schedule(
          cronExpression,
          async () => {
            console.log(`Exécution de la publication planifiée à ${time}`);
            try {
              const result = await contentManager.createAndPublishContent();
              await this.recordPublishHistory(result);
              console.log("Publication planifiée réussie:", result.contentId);
            } catch (error) {
              console.error("Erreur lors de la publication planifiée:", error);
            }
          }
        );
      });

      console.log(
        `${this.scheduleTimes.length} publications planifiées avec succès`
      );
    } catch (error) {
      console.error("Erreur lors de la planification des publications:", error);
    }
  }

  /**
   * Enregistre l'historique des publications
   * @param {object} publishResult - Le résultat de la publication
   */
  async recordPublishHistory(publishResult) {
    try {
      const history = await fs.readJSON(this.historyPath);

      history.lastPublish = new Date().toISOString();
      history.history.push({
        timestamp: new Date().toISOString(),
        contentId: publishResult.contentId,
        result: publishResult.publishResult,
      });

      // Limiter l'historique à 100 entrées maximum
      if (history.history.length > 100) {
        history.history = history.history.slice(-100);
      }

      await fs.writeJSON(this.historyPath, history, { spaces: 2 });
    } catch (error) {
      console.error(
        "Erreur lors de l'enregistrement de l'historique de publication:",
        error
      );
    }
  }

  /**
   * Démarre l'exécution du planificateur
   */
  start() {
    console.log("Démarrage du planificateur de contenu...");
    this.schedulePublications();
  }

  /**
   * Arrête le planificateur
   */
  stop() {
    console.log("Arrêt du planificateur de contenu...");
    Object.values(this.scheduledJobs).forEach((job) => job.stop());
    this.scheduledJobs = {};
  }

  /**
   * Obtient les prochaines publications planifiées
   * @returns {Array} Liste des prochaines publications
   */
  getUpcomingSchedule() {
    const now = new Date();
    const today = now.toISOString().split("T")[0];

    return this.scheduleTimes
      .map((time) => {
        const [hour, minute] = time.split(":");
        const scheduleDate = new Date(`${today}T${time}:00`);

        if (scheduleDate < now) {
          // Si l'heure est déjà passée aujourd'hui, planifier pour demain
          scheduleDate.setDate(scheduleDate.getDate() + 1);
        }

        return {
          scheduledTime: time,
          scheduledDate: scheduleDate.toISOString(),
          timeUntil: Math.round((scheduleDate - now) / 1000 / 60), // Minutes restantes
        };
      })
      .sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));
  }
}

module.exports = new ContentScheduler();
