import { fetchTranslation, getCachedTranslation } from "./trasnlate";
import { injectStyles } from "./ui";
import { TranslationResult } from "./ai";
import { ReaderImage } from "./reader_types";

export function showMobileReader(images: ReaderImage[]) {
    let currentIndex = 0;

    injectStyles();

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
    overlay.style.flexDirection = "column";

    // Translation Panels (Overlays)
    const translationsContainer = document.createElement("div");
    translationsContainer.style.position = "absolute";
    translationsContainer.style.top = "0";
    translationsContainer.style.left = "0";
    translationsContainer.style.width = "100%";
    translationsContainer.style.height = "100%";
    translationsContainer.style.zIndex = "10";
    translationsContainer.style.pointerEvents = "none";
    translationsContainer.style.display = "none"; // Hidden initially
    translationsContainer.style.overflowY = "auto";
    translationsContainer.style.padding = "20px";
    translationsContainer.style.boxSizing = "border-box";

    // Center Image Container
    const imageContainer = document.createElement("div");
    imageContainer.style.flex = "1";
    imageContainer.style.width = "100%";
    imageContainer.style.maxWidth = "100%";
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

    mainImage.onload = () => {
        imageContainer.style.width = "100%";
    };

    imageContainer.appendChild(mainImage);
    imageContainer.appendChild(translationsContainer);

    // Navigation Buttons
    const createNavButton = (text: string, right: boolean) => {
        const btn = document.createElement("button");
        btn.innerText = text;
        btn.style.position = "absolute";
        btn.style.top = "50%";
        btn.style.transform = "translateY(-50%)";
        btn.style.width = "50px";
        btn.style.height = "50px";
        btn.style.borderRadius = "50%";
        btn.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
        btn.style.backdropFilter = "blur(4px)";
        btn.style.color = "#fff";
        btn.style.border = "1px solid rgba(255, 255, 255, 0.3)";
        btn.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
        btn.style.cursor = "pointer";
        btn.style.fontSize = "20px";
        btn.style.zIndex = "100";
        btn.style.display = "flex";
        btn.style.justifyContent = "center";
        btn.style.alignItems = "center";
        btn.style.transition = "all 0.2s ease, opacity 0.3s ease";

        if (right) btn.style.right = "20px";
        else btn.style.left = "20px";

        btn.style.opacity = "0";
        btn.style.pointerEvents = "none";

        return btn;
    };

    imageContainer.style.overflow = "hidden";

    const prevBtn = createNavButton("❮", false);
    const nextBtn = createNavButton("❯", true);
    imageContainer.appendChild(prevBtn);
    imageContainer.appendChild(nextBtn);

    // Control Panel
    const controlPanel = document.createElement("div");
    controlPanel.style.position = "absolute";
    controlPanel.style.top = "0";
    controlPanel.style.left = "50%";
    controlPanel.style.transform = "translate(-50%, 0)";
    controlPanel.style.display = "none";
    controlPanel.style.gap = "16px";
    controlPanel.style.zIndex = "100";
    controlPanel.style.padding = "20px 30px 10px 30px";
    controlPanel.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    controlPanel.style.borderRadius = "0 0 20px 20px";
    controlPanel.style.backdropFilter = "blur(8px)";
    controlPanel.style.border = "1px solid rgba(255, 255, 255, 0.1)";
    controlPanel.style.borderTop = "none";
    controlPanel.style.transition =
        "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)";

    const translateBtn = document.createElement("button");
    translateBtn.innerText = "翻译当前";
    translateBtn.style.padding = "10px 24px";
    translateBtn.style.backgroundColor = "#4CAF50";
    translateBtn.style.backgroundImage =
        "linear-gradient(45deg, #4CAF50, #45a049)";
    translateBtn.style.color = "white";
    translateBtn.style.border = "none";
    translateBtn.style.borderRadius = "20px";
    translateBtn.style.cursor = "pointer";
    translateBtn.style.fontSize = "14px";
    translateBtn.style.fontWeight = "600";
    translateBtn.style.letterSpacing = "0.5px";
    translateBtn.style.whiteSpace = "nowrap";
    translateBtn.style.boxShadow = "0 4px 12px rgba(76, 175, 80, 0.3)";

    controlPanel.appendChild(translateBtn);

    const closeBtn = document.createElement("button");
    closeBtn.innerText = "关闭";
    closeBtn.style.padding = "10px 24px";
    closeBtn.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
    closeBtn.style.color = "white";
    closeBtn.style.border = "1px solid rgba(255, 255, 255, 0.2)";
    closeBtn.style.borderRadius = "20px";
    closeBtn.style.cursor = "pointer";
    closeBtn.style.fontSize = "14px";
    closeBtn.style.fontWeight = "600";
    closeBtn.style.whiteSpace = "nowrap";

    controlPanel.appendChild(closeBtn);
    imageContainer.appendChild(controlPanel);

    overlay.appendChild(imageContainer);
    document.body.appendChild(overlay);

    // Logic
    const updateView = () => {
        const imgData = images[currentIndex];
        mainImage.src = imgData.src;

        // Mobile navigation buttons are always hidden/shown based on logic, but maybe we want them visible on tap?
        // For now, let's keep them hidden or maybe always visible?
        // Original code had hover logic. Mobile has no hover.
        // Let's make them visible briefly on tap or just always visible but subtle?
        // For now, let's make them visible if there is a prev/next.
        prevBtn.style.opacity = currentIndex > 0 ? "1" : "0";
        prevBtn.style.pointerEvents = currentIndex > 0 ? "auto" : "none";

        nextBtn.style.opacity = currentIndex < images.length - 1 ? "1" : "0";
        nextBtn.style.pointerEvents =
            currentIndex < images.length - 1 ? "auto" : "none";

        translationsContainer.innerHTML = "";

        const cachedResult = getCachedTranslation(imgData.src);
        if (cachedResult) {
            renderTranslations(cachedResult);
            translateBtn.innerText = "已翻译";
            translateBtn.style.backgroundColor = "#888";
        } else {
            translateBtn.innerText = "翻译当前";
            translateBtn.style.backgroundColor = "#4CAF50";
            translateBtn.disabled = false;
        }
    };

    const renderTranslations = (result: TranslationResult) => {
        translationsContainer.innerHTML = "";

        // Just append blocks in order
        // Sort by Y to keep reading order
        const blocks = [...result.blocks].sort((a, b) => a.y - b.y);

        blocks.forEach((block) => {
            const textBlock = document.createElement("div");
            textBlock.innerText = block.text;
            textBlock.style.width = "fit-content";
            textBlock.style.maxWidth = "90%";
            textBlock.style.marginBottom = "10px";
            textBlock.style.backgroundColor = "rgba(30, 30, 30, 0.9)";
            textBlock.style.color = "#fff";
            textBlock.style.padding = "10px 12px";
            textBlock.style.borderRadius = "4px";
            textBlock.style.fontSize = "15px";
            textBlock.style.lineHeight = "1.6";
            textBlock.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
            textBlock.style.border = "1px solid #444";
            textBlock.style.pointerEvents = "auto"; // Allow interaction

            translationsContainer.appendChild(textBlock);
        });
    };

    const doTranslate = async () => {
        const imgData = images[currentIndex];
        if (getCachedTranslation(imgData.src)) return;

        translateBtn.disabled = true;
        translateBtn.innerText = "翻译中...";
        translateBtn.style.backgroundColor = "#888";

        try {
            const result = await fetchTranslation(imgData.originalElement);
            renderTranslations(result);
            translateBtn.innerText = "已翻译";

            // Auto show translations on finish
            translationsContainer.style.display = "block";
            controlPanel.style.display = "flex";
        } catch (e) {
            console.error(e);
            alert("Translation failed. See console.");
            translateBtn.disabled = false;
            translateBtn.innerText = "重试";
            translateBtn.style.backgroundColor = "#f44336";
        }
    };

    translateBtn.onclick = doTranslate;

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

    // Toggle visibility on image click
    mainImage.onclick = () => {
        // If not translated, translate
        if (translateBtn.innerText === "翻译当前" && !translateBtn.disabled) {
            doTranslate();
            return;
        }

        // Toggle visibility
        const display =
            translationsContainer.style.display === "none" ? "block" : "none";
        translationsContainer.style.display = display;
        controlPanel.style.display = display === "none" ? "none" : "flex";
    };

    closeBtn.onclick = () => {
        document.body.removeChild(overlay);
    };

    updateView();
}
