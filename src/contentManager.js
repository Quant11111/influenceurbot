const fs = require("fs-extra");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const config = require("../config");
const openaiService = require("./services/openaiService");
const midjourneyService = require("./services/midjourneyService");
const tiktokService = require("./services/tiktokService");
const { createVideoFromImageAndAudio } = require("./utils/videoGenerator");
const { textToSpeech } = require("./utils/audioGenerator");

class ContentManager {
  constructor() {
    this.contentDirectory = path.join(__dirname, "../data/content");
    this.ensureDirectories();
  }

  async ensureDirectories() {
    await fs.ensureDir(this.contentDirectory);
  }

  /**
   * Sélectionne un sujet aléatoire parmi les sujets configurés
   * @returns {string} Le sujet sélectionné
   */
  selectRandomTopic() {
    const topics = config.contentGeneration.topics;
    const randomIndex = Math.floor(Math.random() * topics.length);
    return topics[randomIndex];
  }

  /**
   * Génère une idée de contenu complète
   * @returns {Promise<object>} L'idée de contenu générée
   */
  async generateContentIdea() {
    try {
      const topic = this.selectRandomTopic();
      console.log(`Génération d'idées de contenu sur le thème: ${topic}`);

      const contentIdeas = await openaiService.generateContentIdeas(topic);

      // Sélectionne une idée aléatoire parmi celles générées
      const contentLines = contentIdeas.split("\n\n");
      const randomIdea =
        contentLines[Math.floor(Math.random() * contentLines.length)];

      console.log("Idée de contenu sélectionnée:", randomIdea);

      return {
        id: uuidv4(),
        topic,
        idea: randomIdea,
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Erreur lors de la génération d'idée de contenu:", error);
      throw error;
    }
  }

  /**
   * Crée un contenu complet prêt à être publié
   * @returns {Promise<object>} Les détails du contenu créé
   */
  async createContent() {
    try {
      // 1. Générer une idée de contenu
      const contentIdea = await this.generateContentIdea();
      const contentId = contentIdea.id;

      // 2. Générer un script pour la vidéo
      console.log("Génération du script vidéo...");
      const videoScript = await openaiService.generateVideoScript(
        contentIdea.idea
      );

      // 3. Générer une description pour le post
      console.log("Génération de la description du post...");
      const postDescription = await openaiService.generatePostDescription(
        contentIdea.idea
      );

      // 4. Générer une image via Midjourney
      console.log("Génération de l'image...");
      const imagePath = await midjourneyService.createContentImage(
        contentIdea.idea,
        contentId
      );

      // 5. Convertir le script en audio via TTS
      console.log("Génération de l'audio...");
      const audioPath = path.join(
        this.contentDirectory,
        `${contentId}_audio.mp3`
      );
      await textToSpeech(videoScript, audioPath);

      // 6. Créer une vidéo à partir de l'image et de l'audio
      console.log("Création de la vidéo...");
      const videoPath = path.join(
        this.contentDirectory,
        `${contentId}_video.mp4`
      );
      await createVideoFromImageAndAudio(imagePath, audioPath, videoPath);

      // 7. Sauvegarder les métadonnées du contenu
      const contentMetadata = {
        ...contentIdea,
        videoScript,
        postDescription,
        imagePath,
        audioPath,
        videoPath,
      };

      await fs.writeJSON(
        path.join(this.contentDirectory, `${contentId}_metadata.json`),
        contentMetadata,
        { spaces: 2 }
      );

      console.log("Contenu créé avec succès:", contentId);
      return contentMetadata;
    } catch (error) {
      console.error("Erreur lors de la création du contenu:", error);
      throw error;
    }
  }

  /**
   * Publie un contenu sur TikTok
   * @param {string} contentId - L'ID du contenu à publier
   * @returns {Promise<object>} Les détails de la publication
   */
  async publishContent(contentId) {
    try {
      const metadataPath = path.join(
        this.contentDirectory,
        `${contentId}_metadata.json`
      );

      if (!(await fs.pathExists(metadataPath))) {
        throw new Error(`Contenu non trouvé: ${contentId}`);
      }

      const contentMetadata = await fs.readJSON(metadataPath);

      console.log(`Publication du contenu ${contentId} sur TikTok...`);

      // En mode développement, simuler la publication
      let publishResult;
      if (config.app.env === "development") {
        publishResult = await tiktokService.simulateAction("post_video", {
          videoPath: contentMetadata.videoPath,
          description: contentMetadata.postDescription,
        });
      } else {
        // En production, publier réellement
        publishResult = await tiktokService.postVideo(
          contentMetadata.videoPath,
          contentMetadata.postDescription
        );
      }

      // Mettre à jour les métadonnées avec les informations de publication
      contentMetadata.published = {
        timestamp: new Date().toISOString(),
        result: publishResult,
      };

      await fs.writeJSON(metadataPath, contentMetadata, { spaces: 2 });

      console.log("Contenu publié avec succès:", publishResult);
      return { contentId, publishResult };
    } catch (error) {
      console.error(
        `Erreur lors de la publication du contenu ${contentId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Crée et publie du contenu en une seule étape
   * @returns {Promise<object>} Les détails du contenu publié
   */
  async createAndPublishContent() {
    try {
      const content = await this.createContent();
      return await this.publishContent(content.id);
    } catch (error) {
      console.error(
        "Erreur lors de la création et publication du contenu:",
        error
      );
      throw error;
    }
  }
}

module.exports = new ContentManager();
