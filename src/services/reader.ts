import { fetchTranslation } from "./trasnlate";
import { createFloatingButton } from "./ui";
import { TranslationResult } from "./ai";

interface ReaderImage {
    src: string;
    originalElement: HTMLImageElement;
}

/**
 * Extracts images from the page, prioritizing 'file' attribute and filtering small images.
 */
function extractImages(): ReaderImage[] {
    const images = Array.from(document.querySelectorAll("img"));
    const uniqueSrcs = new Set<string>();
    const validImages: ReaderImage[] = [];

    images.forEach((img) => {
        // Filter out small images (likely icons, spacers)
        const width = img.naturalWidth || img.clientWidth;
        const height = img.naturalHeight || img.clientHeight;

        if (width < 200 || height < 200) {
            return;
        }

        // Prioritize 'file' attribute for lazy-loaded high-res images
        const src = img.getAttribute("file") || img.src;

        if (!src || uniqueSrcs.has(src)) {
            return;
        }

        uniqueSrcs.add(src);
        validImages.push({
            src: src,
            originalElement: img
        });
    });

    return validImages;
}

/**
 * Shows the Reader Mode UI (Split Screen with Overlay Translations).
 */
export function showReaderMode() {
    if (document.getElementById("vtranslate-reader")) return;

    const images = extractImages();
    if (images.length === 0) {
        alert("No suitable images found for Reader Mode.");
        return;
    }

    let currentIndex = 0;
    const translationCache = new Map<string, TranslationResult>();

    // --- UI Construction ---

    // Overlay
    const overlay = document.createElement("div");
    overlay.id = "vtranslate-reader";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.backgroundColor = "#000";
    overlay.style.zIndex = "10002";
    overlay.style.display = "flex";
    overlay.style.flexDirection = "row";

    // Image Container (centered)
    const imageContainer = document.createElement("div");
    imageContainer.style.flex = "1";
    imageContainer.style.height = "100%";
    imageContainer.style.display = "flex";
    imageContainer.style.justifyContent = "center";
    imageContainer.style.alignItems = "center";
    imageContainer.style.position = "relative";
    imageContainer.style.backgroundColor = "#000";

    const mainImage = document.createElement("img");
    mainImage.style.maxHeight = "100%";
    mainImage.style.maxWidth = "100%";
    mainImage.style.objectFit = "contain";
    mainImage.style.display = "block";
    imageContainer.appendChild(mainImage);

    // Overlay container for translations (positioned over the image)
    const translationOverlay = document.createElement("div");
    translationOverlay.style.position = "absolute";
    translationOverlay.style.top = "0";
    translationOverlay.style.left = "0";
    translationOverlay.style.width = "100%";
    translationOverlay.style.height = "100%";
    translationOverlay.style.pointerEvents = "none";
    imageContainer.appendChild(translationOverlay);

    // Navigation Buttons
    const createNavButton = (text: string, right: boolean) => {
        const btn = document.createElement("button");
        btn.innerText = text;
        btn.style.position = "absolute";
        btn.style.top = "50%";
        btn.style.transform = "translateY(-50%)";
        btn.style.backgroundColor = "rgba(0,0,0,0.7)";
        btn.style.color = "#fff";
        btn.style.border = "none";
        btn.style.padding = "20px 10px";
        btn.style.cursor = "pointer";
        btn.style.fontSize = "24px";
        btn.style.zIndex = "100";
        if (right) btn.style.right = "10px";
        else btn.style.left = "10px";
        return btn;
    };

    const prevBtn = createNavButton("❮", false);
    const nextBtn = createNavButton("❯", true);
    imageContainer.appendChild(prevBtn);
    imageContainer.appendChild(nextBtn);

    // Control Panel (bottom overlay)
    const controlPanel = document.createElement("div");
    controlPanel.style.position = "absolute";
    controlPanel.style.bottom = "20px";
    controlPanel.style.left = "50%";
    controlPanel.style.transform = "translateX(-50%)";
    controlPanel.style.display = "flex";
    controlPanel.style.gap = "10px";
    controlPanel.style.zIndex = "100";

    const translateBtn = document.createElement("button");
    translateBtn.innerText = "Translate";
    translateBtn.style.padding = "12px 24px";
    translateBtn.style.backgroundColor = "#4CAF50";
    translateBtn.style.color = "white";
    translateBtn.style.border = "none";
    translateBtn.style.borderRadius = "4px";
    translateBtn.style.cursor = "pointer";
    translateBtn.style.fontSize = "16px";
    translateBtn.style.fontWeight = "bold";
    controlPanel.appendChild(translateBtn);

    const closeBtn = document.createElement("button");
    closeBtn.innerText = "Close";
    closeBtn.style.padding = "12px 24px";
    closeBtn.style.backgroundColor = "#f44336";
    closeBtn.style.color = "white";
    closeBtn.style.border = "none";
    closeBtn.style.borderRadius = "4px";
    closeBtn.style.cursor = "pointer";
    closeBtn.style.fontSize = "16px";
    closeBtn.style.fontWeight = "bold";
    controlPanel.appendChild(closeBtn);

    imageContainer.appendChild(controlPanel);
    overlay.appendChild(imageContainer);
    document.body.appendChild(overlay);

    // --- Logic ---

    const updateView = () => {
        const imgData = images[currentIndex];
        mainImage.src = imgData.src;
        
        // Update navigation buttons
        prevBtn.style.display = currentIndex > 0 ? "block" : "none";
        nextBtn.style.display = currentIndex < images.length - 1 ? "block" : "none";

        // Clear translation overlays
        translationOverlay.innerHTML = "";

        // Update translate button
        if (translationCache.has(imgData.src)) {
            renderTranslationOverlays(translationCache.get(imgData.src)!);
            translateBtn.innerText = "Translated";
            translateBtn.style.backgroundColor = "#888";
        } else {
            translateBtn.innerText = "Translate";
            translateBtn.style.backgroundColor = "#4CAF50";
            translateBtn.disabled = false;
        }
    };

    const renderTranslationOverlays = (result: TranslationResult) => {
        translationOverlay.innerHTML = "";

        result.blocks.forEach((block) => {
            const textBlock = document.createElement("div");
            textBlock.innerText = block.text;
            textBlock.style.position = "absolute";
            textBlock.style.top = `${block.y}%`;
            
            // Position based on side
            if (block.side === "left") {
                textBlock.style.left = "5%";
                textBlock.style.textAlign = "left";
            } else {
                textBlock.style.right = "5%";
                textBlock.style.textAlign = "right";
            }

            textBlock.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
            textBlock.style.color = "#fff";
            textBlock.style.padding = "8px 12px";
            textBlock.style.borderRadius = "4px";
            textBlock.style.fontSize = "16px";
            textBlock.style.lineHeight = "1.5";
            textBlock.style.maxWidth = "40%";
            textBlock.style.pointerEvents = "auto";
            textBlock.style.boxShadow = "0 2px 8px rgba(0,0,0,0.5)";
            textBlock.style.transform = "translateY(-50%)"; // Center on y position

            translationOverlay.appendChild(textBlock);
        });
    };

    const doTranslate = async () => {
        const imgData = images[currentIndex];
        if (translationCache.has(imgData.src)) return;

        translateBtn.disabled = true;
        translateBtn.innerText = "Translating...";
        translateBtn.style.backgroundColor = "#888";

        try {
            const result = await fetchTranslation(imgData.originalElement);
            
            translationCache.set(imgData.src, result);
            renderTranslationOverlays(result);
            translateBtn.innerText = "Translated";
        } catch (e) {
            console.error(e);
            alert("Translation failed. See console.");
            translateBtn.disabled = false;
            translateBtn.innerText = "Retry";
            translateBtn.style.backgroundColor = "#f44336";
        }
    };

    prevBtn.onclick = () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateView();
        }
    };

    nextBtn.onclick = () => {
        if (currentIndex < images.length - 1) {
            currentIndex++;
            updateView();
        }
    };

    translateBtn.onclick = doTranslate;

    // Keyboard navigation
    const handleKeydown = (e: KeyboardEvent) => {
        if (e.key === "ArrowLeft") prevBtn.click();
        if (e.key === "ArrowRight") nextBtn.click();
        if (e.key === "Escape") closeBtn.click();
    };
    window.addEventListener("keydown", handleKeydown);

    // Cleanup on close
    closeBtn.onclick = () => {
        window.removeEventListener("keydown", handleKeydown);
        document.body.removeChild(overlay);
    };

    // Initial View
    updateView();
}

/**
 * Adds a floating reader button to the page.
 */
export function addReaderButton() {
    const icon = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
        </svg>
    `;
    // Place it above the settings button (20px + 48px + 10px gap = 78px)
    createFloatingButton(icon, showReaderMode, "78px");
}
