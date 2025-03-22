const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const config = require("../../config");

/**
 * Génère une image via l'API Midjourney (ou service similaire)
 * @param {string} prompt - Le prompt pour générer l'image
 * @param {string} [outputPath] - Le chemin où sauvegarder l'image
 * @returns {Promise<string>} Le chemin de l'image générée ou l'URL
 */
async function generateImage(prompt, outputPath = null) {
  try {
    // Ici, nous utilisons une API proxy pour Midjourney
    // Adaptez cette fonction à l'API spécifique que vous utilisez
    const response = await axios({
      method: "post",
      url: config.midjourney.apiUrl,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.midjourney.apiKey}`,
      },
      data: {
        prompt: prompt,
        // Ajoutez d'autres paramètres selon l'API que vous utilisez
        width: 1080,
        height: 1920, // Format portrait pour TikTok
        num_outputs: 1,
      },
      responseType: "arraybuffer",
    });

    // Si un chemin de sortie est spécifié, sauvegardez l'image
    if (outputPath) {
      await fs.ensureDir(path.dirname(outputPath));
      await fs.writeFile(outputPath, response.data);
      return outputPath;
    }

    // Sinon, retournez les données de l'image (ou l'URL si l'API retourne une URL)
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la génération de l'image:", error);
    throw error;
  }
}

/**
 * Génère un prompt pour Midjourney adapté à une idée de contenu TikTok
 * @param {string} contentIdea - L'idée de contenu
 * @returns {string} Le prompt pour Midjourney
 */
function generateMidjourneyPrompt(contentIdea) {
  // Amélioration du prompt pour obtenir des résultats plus adaptés à TikTok
  return `Créer une image vibrante et captivante pour TikTok illustrant: "${contentIdea}". 
    Style: moderne, coloré, tendance, adapté aux jeunes adultes.
    Format: portrait, haute résolution, couleurs vives, composition centrée.
    Aspect: professionnel, accrocheur, optimisé pour les médias sociaux.`;
}

/**
 * Crée une image pour une idée de contenu et la sauvegarde
 * @param {string} contentIdea - L'idée de contenu
 * @param {string} contentId - L'identifiant unique du contenu
 * @returns {Promise<string>} Le chemin de l'image générée
 */
async function createContentImage(contentIdea, contentId) {
  const prompt = generateMidjourneyPrompt(contentIdea);
  const outputPath = path.join(
    __dirname,
    "../../data/content",
    `${contentId}_image.png`
  );

  return generateImage(prompt, outputPath);
}

module.exports = {
  generateImage,
  generateMidjourneyPrompt,
  createContentImage,
};
