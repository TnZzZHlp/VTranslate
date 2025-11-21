import { fetchTranslation, getCachedTranslation } from "./trasnlate";
import { injectStyles } from "./ui";
import { TranslationResult } from "./ai";
import { ReaderImage } from "./reader_types";
import { showErrorNotification } from "./error_display";

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

    // Translation Container (Bottom Sheet Style)
    const translationsContainer = document.createElement("div");
    translationsContainer.style.position = "absolute";
    translationsContainer.style.bottom = "0";
    translationsContainer.style.left = "0";
    translationsContainer.style.width = "100%";
    translationsContainer.style.maxHeight = "60%";
    translationsContainer.style.zIndex = "10";
    translationsContainer.style.display = "none"; // Hidden initially
    translationsContainer.style.overflowY = "auto";
    translationsContainer.style.padding = "16px";
    translationsContainer.style.boxSizing = "border-box";
    translationsContainer.style.backgroundColor = "rgba(0, 0, 0, 0.95)";
    translationsContainer.style.backdropFilter = "blur(10px)";
    translationsContainer.style.borderTop =
        "1px solid rgba(255, 255, 255, 0.1)";
    translationsContainer.style.transition = "transform 0.3s ease-out";
    translationsContainer.style.borderRadius = "16px 16px 0 0";
    translationsContainer.style.boxShadow = "0 -4px 20px rgba(0, 0, 0, 0.5)";

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
    mainImage.style.transition = "opacity 0.2s ease";

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

        // Add a drag handle indicator
        const dragHandle = document.createElement("div");
        dragHandle.style.width = "40px";
        dragHandle.style.height = "4px";
        dragHandle.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
        dragHandle.style.borderRadius = "2px";
        dragHandle.style.margin = "0 auto 16px auto";
        translationsContainer.appendChild(dragHandle);

        // Split blocks by side
        const leftBlocks = result.blocks.filter((b) => b.side === "left");
        const rightBlocks = result.blocks.filter((b) => b.side !== "left");

        // Sort by Y to keep reading order
        const sortedLeftBlocks = [...leftBlocks].sort((a, b) => a.y - b.y);
        const sortedRightBlocks = [...rightBlocks].sort((a, b) => a.y - b.y);

        // Combine and sort all blocks for animation index
        const allBlocks = [...sortedLeftBlocks, ...sortedRightBlocks];

        // Render left blocks
        sortedLeftBlocks.forEach((block) => {
            const textBlock = document.createElement("div");
            textBlock.innerText = block.text;
            textBlock.style.width = "fit-content";
            textBlock.style.maxWidth = "90%";
            textBlock.style.marginBottom = "12px";
            textBlock.style.marginLeft = "0"; // Align to left
            textBlock.style.marginRight = "auto";
            textBlock.style.backgroundColor = "rgba(40, 40, 40, 0.8)";
            textBlock.style.color = "#fff";
            textBlock.style.padding = "12px 14px";
            textBlock.style.borderRadius = "8px";
            textBlock.style.fontSize = "15px";
            textBlock.style.lineHeight = "1.6";
            textBlock.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.2)";
            textBlock.style.border = "1px solid rgba(255, 255, 255, 0.1)";
            textBlock.style.borderLeft = "3px solid rgba(76, 175, 80, 0.6)"; // Left indicator
            textBlock.style.wordWrap = "break-word";
            textBlock.style.textAlign = "left";
            textBlock.style.transition = "background-color 0.2s ease";

            // Add subtle animation on render
            textBlock.style.opacity = "0";
            textBlock.style.transform = "translateX(-10px)";

            translationsContainer.appendChild(textBlock);

            // Trigger animation
            const index = allBlocks.indexOf(block);
            setTimeout(() => {
                textBlock.style.transition =
                    "opacity 0.3s ease, transform 0.3s ease, background-color 0.2s ease";
                textBlock.style.opacity = "1";
                textBlock.style.transform = "translateX(0)";
            }, index * 50);
        });

        // Render right blocks
        sortedRightBlocks.forEach((block) => {
            const textBlock = document.createElement("div");
            textBlock.innerText = block.text;
            textBlock.style.width = "fit-content";
            textBlock.style.maxWidth = "90%";
            textBlock.style.marginBottom = "12px";
            textBlock.style.marginLeft = "auto"; // Align to right
            textBlock.style.marginRight = "0";
            textBlock.style.backgroundColor = "rgba(40, 40, 40, 0.8)";
            textBlock.style.color = "#fff";
            textBlock.style.padding = "12px 14px";
            textBlock.style.borderRadius = "8px";
            textBlock.style.fontSize = "15px";
            textBlock.style.lineHeight = "1.6";
            textBlock.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.2)";
            textBlock.style.border = "1px solid rgba(255, 255, 255, 0.1)";
            textBlock.style.borderRight = "3px solid rgba(33, 150, 243, 0.6)"; // Right indicator
            textBlock.style.wordWrap = "break-word";
            textBlock.style.textAlign = "right";
            textBlock.style.transition = "background-color 0.2s ease";

            // Add subtle animation on render
            textBlock.style.opacity = "0";
            textBlock.style.transform = "translateX(10px)";

            translationsContainer.appendChild(textBlock);

            // Trigger animation
            const index = allBlocks.indexOf(block);
            setTimeout(() => {
                textBlock.style.transition =
                    "opacity 0.3s ease, transform 0.3s ease, background-color 0.2s ease";
                textBlock.style.opacity = "1";
                textBlock.style.transform = "translateX(0)";
            }, index * 50);
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

            // Show error notification in the image container
            const errorNotification = showErrorNotification(e, imageContainer);
            imageContainer.appendChild(errorNotification);

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

        // Toggle visibility with smooth animation
        const isVisible = translationsContainer.style.display === "block";

        if (isVisible) {
            // Hide with fade out
            translationsContainer.style.opacity = "0";
            translationsContainer.style.transform = "translateY(20px)";
            setTimeout(() => {
                translationsContainer.style.display = "none";
                controlPanel.style.display = "none";
            }, 300);
        } else {
            // Show with fade in
            translationsContainer.style.display = "block";
            translationsContainer.style.opacity = "0";
            translationsContainer.style.transform = "translateY(20px)";
            controlPanel.style.display = "flex";

            // Trigger animation
            setTimeout(() => {
                translationsContainer.style.transition =
                    "opacity 0.3s ease, transform 0.3s ease";
                translationsContainer.style.opacity = "1";
                translationsContainer.style.transform = "translateY(0)";
            }, 10);
        }
    };

    closeBtn.onclick = () => {
        document.body.removeChild(overlay);
    };

    updateView();
}
