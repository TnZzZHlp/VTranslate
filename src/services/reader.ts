import { fetchTranslation } from "./trasnlate";
import { createFloatingButton } from "./ui";

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
 * Shows the Reader Mode UI (Split Screen).
 */
export function showReaderMode() {
    if (document.getElementById("vtranslate-reader")) return;

    const images = extractImages();
    if (images.length === 0) {
        alert("No suitable images found for Reader Mode.");
        return;
    }

    let currentIndex = 0;
    const translationCache = new Map<string, string>();

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

    // Left Panel (Image)
    const leftPanel = document.createElement("div");
    leftPanel.style.flex = "1";
    leftPanel.style.height = "100%";
    leftPanel.style.display = "flex";
    leftPanel.style.justifyContent = "center";
    leftPanel.style.alignItems = "center";
    leftPanel.style.position = "relative";
    leftPanel.style.backgroundColor = "#000";

    const mainImage = document.createElement("img");
    mainImage.style.maxHeight = "100%";
    mainImage.style.maxWidth = "100%";
    mainImage.style.objectFit = "contain";
    leftPanel.appendChild(mainImage);

    // Navigation Buttons (Overlay on Left Panel)
    const createNavButton = (text: string, right: boolean) => {
        const btn = document.createElement("button");
        btn.innerText = text;
        btn.style.position = "absolute";
        btn.style.top = "50%";
        btn.style.transform = "translateY(-50%)";
        btn.style.backgroundColor = "rgba(0,0,0,0.5)";
        btn.style.color = "#fff";
        btn.style.border = "none";
        btn.style.padding = "20px 10px";
        btn.style.cursor = "pointer";
        btn.style.fontSize = "24px";
        btn.style.zIndex = "10";
        if (right) btn.style.right = "10px";
        else btn.style.left = "10px";
        return btn;
    };

    const prevBtn = createNavButton("❮", false);
    const nextBtn = createNavButton("❯", true);
    leftPanel.appendChild(prevBtn);
    leftPanel.appendChild(nextBtn);

    // Right Panel (Translation)
    const rightPanel = document.createElement("div");
    rightPanel.style.width = "400px";
    rightPanel.style.height = "100%";
    rightPanel.style.backgroundColor = "#1e1e1e";
    rightPanel.style.borderLeft = "1px solid #333";
    rightPanel.style.display = "flex";
    rightPanel.style.flexDirection = "column";
    rightPanel.style.boxSizing = "border-box";

    // Right Panel Header
    const header = document.createElement("div");
    header.style.padding = "15px";
    header.style.borderBottom = "1px solid #333";
    header.style.display = "flex";
    header.style.justifyContent = "space-between";
    header.style.alignItems = "center";

    const title = document.createElement("span");
    title.innerText = "Translation";
    title.style.color = "#fff";
    title.style.fontWeight = "bold";
    header.appendChild(title);

    const closeBtn = document.createElement("button");
    closeBtn.innerText = "✕";
    closeBtn.style.background = "none";
    closeBtn.style.border = "none";
    closeBtn.style.color = "#aaa";
    closeBtn.style.fontSize = "18px";
    closeBtn.style.cursor = "pointer";
    closeBtn.onclick = () => document.body.removeChild(overlay);
    header.appendChild(closeBtn);
    rightPanel.appendChild(header);

    // Right Panel Content
    const contentArea = document.createElement("div");
    contentArea.style.flex = "1";
    contentArea.style.padding = "20px";
    contentArea.style.overflowY = "auto";
    contentArea.style.color = "#ddd";
    contentArea.style.fontSize = "16px";
    contentArea.style.lineHeight = "1.6";
    contentArea.style.whiteSpace = "pre-wrap";
    contentArea.innerText = "Click 'Translate' to view content.";
    rightPanel.appendChild(contentArea);

    // Right Panel Footer (Translate Button)
    const footer = document.createElement("div");
    footer.style.padding = "20px";
    footer.style.borderTop = "1px solid #333";
    
    const translateBtn = document.createElement("button");
    translateBtn.innerText = "Translate Current Image";
    translateBtn.style.width = "100%";
    translateBtn.style.padding = "12px";
    translateBtn.style.backgroundColor = "#4CAF50";
    translateBtn.style.color = "white";
    translateBtn.style.border = "none";
    translateBtn.style.borderRadius = "4px";
    translateBtn.style.cursor = "pointer";
    translateBtn.style.fontSize = "16px";
    footer.appendChild(translateBtn);
    rightPanel.appendChild(footer);

    overlay.appendChild(leftPanel);
    overlay.appendChild(rightPanel);
    document.body.appendChild(overlay);

    // --- Logic ---

    const updateView = () => {
        const imgData = images[currentIndex];
        mainImage.src = imgData.src;
        
        // Update navigation buttons
        prevBtn.style.display = currentIndex > 0 ? "block" : "none";
        nextBtn.style.display = currentIndex < images.length - 1 ? "block" : "none";

        // Update translation content
        if (translationCache.has(imgData.src)) {
            contentArea.innerText = translationCache.get(imgData.src)!;
            translateBtn.disabled = true;
            translateBtn.innerText = "Translated";
        } else {
            contentArea.innerText = "Click 'Translate' to view content.";
            translateBtn.disabled = false;
            translateBtn.innerText = "Translate Current Image";
        }
    };

    const doTranslate = async () => {
        const imgData = images[currentIndex];
        if (translationCache.has(imgData.src)) return;

        translateBtn.disabled = true;
        translateBtn.innerText = "Translating...";
        contentArea.innerText = "Translating...";

        try {
            // We need to pass an HTMLImageElement to fetchTranslation.
            // We can use the original element or the one in the reader.
            // Using the one in the reader ensures we are translating what the user sees,
            // but fetchTranslation might need the 'file' attribute which is on the original.
            // Actually fetchTranslation checks getAttribute("file").
            // Our extractImages preserved the original element.
            
            // Let's use the original element to be safe about attributes, 
            // OR we can just use the mainImage if we copy attributes?
            // The safest is to use the logic in fetchTranslation which handles 'file' attr.
            // Since we already resolved the 'src' in extractImages (prioritizing file),
            // we can just pass a new Image with that src, or the original element.
            
            // Issue: fetchTranslation calls imageToBase64 which checks getAttribute("file").
            // If we pass the original element, it works.
            const text = await fetchTranslation(imgData.originalElement);
            
            translationCache.set(imgData.src, text);
            contentArea.innerText = text;
            translateBtn.innerText = "Translated";
        } catch (e) {
            console.error(e);
            contentArea.innerText = "Translation failed. See console.";
            translateBtn.disabled = false;
            translateBtn.innerText = "Retry Translate";
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
    const originalRemove = overlay.remove.bind(overlay); // or just use the closeBtn handler
    // We need to remove the event listener when overlay is removed.
    // Since we used document.body.removeChild(overlay), we can hook into that or just make a cleanup function.
    
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
