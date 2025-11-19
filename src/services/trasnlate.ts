import { translateImage, TranslationResult } from "./ai";
import { showTranslationModal } from "./ui";

/**
 * Fetches the translation for an image.
 * @param img The image element to translate.
 * @returns The translation result with positioned blocks.
 */
export async function fetchTranslation(img: HTMLImageElement): Promise<TranslationResult> {
    console.debug("[Translate] Starting translation for image.", img);
    // 1. Convert image to Base64
    const base64 = await imageToBase64(img);
    console.debug("[Translate] Image converted to base64, length:", base64.length);

    // 2. Call AI Service
    const translationResult = await translateImage(base64);
    console.log("[Translate] Result:", translationResult);
    return translationResult;
}

export async function translateText(img: HTMLImageElement) {
    try {
        const result = await fetchTranslation(img);
        // 3. Display result - convert blocks to text for modal
        const text = result.blocks.map(b => b.text).join("\n\n");
        showTranslationModal(img, text);
    } catch (error) {
        console.error("[Translate] Error during translation:", error);
        alert("Translation failed. Check console for details.");
    }
}

function imageToBase64(img: HTMLImageElement): Promise<string> {
    return new Promise((resolve, reject) => {
        const fileAttr = img.getAttribute("file");

        const processImage = (image: HTMLImageElement) => {
            const canvas = document.createElement("canvas");
            canvas.width = image.naturalWidth;
            canvas.height = image.naturalHeight;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
                reject(new Error("Failed to get canvas context"));
                return;
            }

            try {
                ctx.drawImage(image, 0, 0);
                const dataURL = canvas.toDataURL("image/jpeg", 0.8);
                resolve(dataURL);
            } catch (e) {
                reject(e);
            }
        };

        if (fileAttr) {
            console.debug("[Translate] Found 'file' attribute, loading real image:", fileAttr);
            const realImage = new Image();
            realImage.crossOrigin = "Anonymous"; // Try to handle CORS if possible
            realImage.src = fileAttr;
            
            realImage.onload = () => {
                console.debug("[Translate] Real image loaded.");
                processImage(realImage);
            };

            realImage.onerror = (e) => {
                console.warn("[Translate] Failed to load real image from 'file' attribute, falling back to src.", e);
                processImage(img);
            };
        } else {
            processImage(img);
        }
    });
}


