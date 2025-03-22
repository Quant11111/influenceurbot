const { OpenAI } = require("openai");
const config = require("../../config");

const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

/**
 * Génère un texte via l'API OpenAI
 * @param {string} prompt - Le prompt pour générer du texte
 * @param {string} [model='gpt-4'] - Le modèle à utiliser
 * @returns {Promise<string>} Le texte généré
 */
async function generateText(prompt, model = "gpt-4") {
  try {
    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: "system",
          content: "Tu es un expert en création de contenu viral pour TikTok.",
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error("Erreur lors de la génération du texte:", error);
    throw error;
  }
}

/**
 * Génère des idées de contenu pour TikTok
 * @param {string} topic - Le sujet du contenu
 * @returns {Promise<string>} Idées de contenu
 */
async function generateContentIdeas(topic) {
  const prompt = `Génère 5 idées de contenu TikTok viral sur le thème "${topic}". 
  Pour chaque idée, inclus:
  - Un titre accrocheur
  - Une description courte du contenu
  - 2-3 hashtags pertinents`;

  return generateText(prompt);
}

/**
 * Génère un script pour une vidéo TikTok
 * @param {string} contentIdea - L'idée de contenu
 * @returns {Promise<string>} Le script généré
 */
async function generateVideoScript(contentIdea) {
  const prompt = `Crée un script court et engageant pour une vidéo TikTok basée sur cette idée: "${contentIdea}".
  Le script doit être:
  - Court (15-30 secondes de parole)
  - Captivant dès les premières secondes
  - Inclure un appel à l'action clair`;

  return generateText(prompt);
}

/**
 * Génère une description pour un post TikTok
 * @param {string} contentIdea - L'idée de contenu
 * @returns {Promise<string>} La description générée avec hashtags
 */
async function generatePostDescription(contentIdea) {
  const prompt = `Crée une description captivante pour un post TikTok basé sur: "${contentIdea}".
  La description doit:
  - Être concise (moins de 150 caractères)
  - Inclure des émojis pertinents
  - Contenir 5-7 hashtags populaires et spécifiques`;

  return generateText(prompt);
}

module.exports = {
  generateText,
  generateContentIdeas,
  generateVideoScript,
  generatePostDescription,
};
