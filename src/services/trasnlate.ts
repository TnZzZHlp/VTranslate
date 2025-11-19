import { translateImage } from "./ai";
import { showTranslationModal } from "./ui";

export async function translateText(img: HTMLImageElement) {
    console.debug("[Translate] Starting translation for image.", img);

    try {
        // 1. Convert image to Base64
        const base64 = await imageToBase64(img);
        console.debug("[Translate] Image converted to base64, length:", base64.length);

        // 2. Call AI Service
        const translatedText = await translateImage(base64);
        console.log("[Translate] Result:", translatedText);

        // 3. Display result
        showTranslationModal(img, translatedText);

    } catch (error) {
        console.error("[Translate] Error during translation:", error);
        alert("Translation failed. Check console for details.");
    }
}

function imageToBase64(img: HTMLImageElement): Promise<string> {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            reject(new Error("Failed to get canvas context"));
            return;
        }

        try {
            ctx.drawImage(img, 0, 0);
            const dataURL = canvas.toDataURL("image/jpeg", 0.8);
            resolve(dataURL);
        } catch (e) {
            reject(e);
        }
    });
}


