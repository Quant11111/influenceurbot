const fs = require("fs-extra");
const path = require("path");
const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);

/**
 * Crée une vidéo à partir d'une image et d'un fichier audio
 * @param {string} imagePath - Le chemin de l'image
 * @param {string} audioPath - Le chemin du fichier audio
 * @param {string} outputPath - Le chemin où sauvegarder la vidéo
 * @param {Object} options - Options additionnelles
 * @param {number} options.duration - Durée de la vidéo (en secondes)
 * @param {string} options.resolution - Résolution de la vidéo (ex: 1080x1920)
 * @returns {Promise<string>} Le chemin de la vidéo générée
 */
async function createVideoFromImageAndAudio(
  imagePath,
  audioPath,
  outputPath,
  options = {}
) {
  try {
    console.log("Création de la vidéo à partir de l'image et de l'audio...");

    // Vérifier que les fichiers d'entrée existent
    if (!(await fs.pathExists(imagePath))) {
      throw new Error(`L'image n'existe pas: ${imagePath}`);
    }

    if (!(await fs.pathExists(audioPath))) {
      throw new Error(`Le fichier audio n'existe pas: ${audioPath}`);
    }

    // Créer le répertoire de sortie s'il n'existe pas
    await fs.ensureDir(path.dirname(outputPath));

    // Options par défaut
    const resolution = options.resolution || "1080x1920"; // Format portrait pour TikTok

    // Pour le développement, nous allons simuler la création de vidéo
    // En production, utilisez ffmpeg pour créer une vraie vidéo

    // Option 1: Simplement copier l'image comme une vidéo factice (pour le développement)
    await fs.copyFile(imagePath, outputPath);

    // Option 2: Si ffmpeg est installé, créer une vraie vidéo
    // Décommentez cette section si ffmpeg est disponible sur votre système
    /*
    try {
      // Obtenir la durée du fichier audio (si non spécifiée dans les options)
      let duration = options.duration;
      if (!duration) {
        const { stdout } = await execPromise(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${audioPath}"`);
        duration = parseFloat(stdout.trim());
      }
      
      // Créer la vidéo avec ffmpeg
      await execPromise(`ffmpeg -loop 1 -framerate 30 -i "${imagePath}" -i "${audioPath}" -c:v libx264 -tune stillimage -c:a aac -b:a 192k -pix_fmt yuv420p -shortest -vf "scale=${resolution}:force_original_aspect_ratio=decrease,pad=${resolution}:(ow-iw)/2:(oh-ih)/2" "${outputPath}"`);
      
      console.log('Vidéo générée avec ffmpeg');
    } catch (ffmpegError) {
      console.warn('Erreur avec ffmpeg, création d\'un fichier placeholder à la place', ffmpegError);
      // Fallback: copier simplement l'image
      await fs.copyFile(imagePath, outputPath);
    }
    */

    console.log("Vidéo générée et sauvegardée à:", outputPath);
    return outputPath;
  } catch (error) {
    console.error("Erreur lors de la création de la vidéo:", error);
    throw error;
  }
}

/**
 * Ajoute des effets visuels à une vidéo
 * @param {string} inputVideoPath - Le chemin de la vidéo d'entrée
 * @param {string} outputVideoPath - Le chemin où sauvegarder la vidéo modifiée
 * @param {Array} effects - Liste des effets à appliquer
 * @returns {Promise<string>} Le chemin de la vidéo modifiée
 */
async function addVideoEffects(inputVideoPath, outputVideoPath, effects = []) {
  try {
    // Nécessite ffmpeg installé sur le système
    // Exemple d'application d'effets visuels
    const effectsStr = effects.join(",");

    await execPromise(
      `ffmpeg -i "${inputVideoPath}" -vf "${effectsStr}" -c:a copy "${outputVideoPath}"`
    );

    console.log("Vidéo avec effets générée:", outputVideoPath);
    return outputVideoPath;
  } catch (error) {
    console.error("Erreur lors de l'ajout d'effets à la vidéo:", error);
    throw error;
  }
}

/**
 * Ajoute du texte à une vidéo
 * @param {string} inputVideoPath - Le chemin de la vidéo d'entrée
 * @param {string} outputVideoPath - Le chemin où sauvegarder la vidéo modifiée
 * @param {string} text - Le texte à ajouter
 * @param {Object} options - Options pour le texte
 * @returns {Promise<string>} Le chemin de la vidéo modifiée
 */
async function addTextToVideo(
  inputVideoPath,
  outputVideoPath,
  text,
  options = {}
) {
  try {
    // Options par défaut
    const fontFile = options.fontFile || "Arial";
    const fontSize = options.fontSize || 48;
    const fontColor = options.fontColor || "white";
    const position = options.position || "center"; // 'top', 'center', 'bottom'
    const backgroundColor = options.backgroundColor || "black@0.5"; // transparent black

    // Déterminer les coordonnées selon la position
    let coordinates;
    switch (position) {
      case "top":
        coordinates = "(w-text_w)/2:h/10";
        break;
      case "bottom":
        coordinates = "(w-text_w)/2:h-h/10-text_h";
        break;
      case "center":
      default:
        coordinates = "(w-text_w)/2:(h-text_h)/2";
    }

    // Nécessite ffmpeg installé sur le système
    const drawTextFilter = `drawtext=text='${text}':fontfile=${fontFile}:fontsize=${fontSize}:fontcolor=${fontColor}:box=1:boxcolor=${backgroundColor}:x=${
      coordinates.split(":")[0]
    }:y=${coordinates.split(":")[1]}`;

    await execPromise(
      `ffmpeg -i "${inputVideoPath}" -vf "${drawTextFilter}" -c:a copy "${outputVideoPath}"`
    );

    console.log("Vidéo avec texte générée:", outputVideoPath);
    return outputVideoPath;
  } catch (error) {
    console.error("Erreur lors de l'ajout de texte à la vidéo:", error);
    throw error;
  }
}

module.exports = {
  createVideoFromImageAndAudio,
  addVideoEffects,
  addTextToVideo,
};
