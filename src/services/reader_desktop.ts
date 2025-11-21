import { fetchTranslation, getCachedTranslation } from "./trasnlate";
import { injectStyles } from "./ui";
import { TranslationResult } from "./ai";
import { ReaderImage } from "./reader_types";
import { showErrorNotification } from "./error_display";

export function showDesktopReader(images: ReaderImage[]) {
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
    overlay.style.flexDirection = "row";

    // Left Translation Panel
    const leftPanel = document.createElement("div");
    leftPanel.style.flex = "1";
    leftPanel.style.minWidth = "150px";
    leftPanel.style.height = "100%";
    leftPanel.style.backgroundColor = "#1a1a1a";
    leftPanel.style.position = "relative";
    leftPanel.style.overflowY = "auto";
    leftPanel.style.borderRight = "1px solid #333";

    // Center Image Container
    const imageContainer = document.createElement("div");
    imageContainer.style.flex = "0 0 auto";
    imageContainer.style.maxWidth = "60%";
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
        const imageAspectRatio =
            mainImage.naturalWidth / mainImage.naturalHeight;
        const windowHeight = window.innerHeight;
        const calculatedWidth = windowHeight * imageAspectRatio;
        const maxWidth = window.innerWidth * 0.6;
        const finalWidth = Math.min(calculatedWidth, maxWidth);
        imageContainer.style.width = `${finalWidth}px`;
    };

    imageContainer.appendChild(mainImage);

    // Right Translation Panel
    const rightPanel = document.createElement("div");
    rightPanel.style.flex = "1";
    rightPanel.style.minWidth = "150px";
    rightPanel.style.height = "100%";
    rightPanel.style.backgroundColor = "#1a1a1a";
    rightPanel.style.position = "relative";
    rightPanel.style.overflowY = "auto";
    rightPanel.style.borderLeft = "1px solid #333";

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

        btn.onmouseenter = () => {
            btn.style.backgroundColor = "rgba(0, 0, 0, 0.6)";
            btn.style.transform = "translateY(-50%) scale(1.1)";
        };
        btn.onmouseleave = () => {
            btn.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
            btn.style.transform = "translateY(-50%) scale(1)";
        };

        return btn;
    };

    imageContainer.style.overflow = "hidden";

    const prevBtn = createNavButton("❮", false);
    const nextBtn = createNavButton("❯", true);
    imageContainer.appendChild(prevBtn);
    imageContainer.appendChild(nextBtn);

    imageContainer.onmouseenter = () => {
        prevBtn.style.opacity = "1";
        prevBtn.style.pointerEvents = "auto";
        nextBtn.style.opacity = "1";
        nextBtn.style.pointerEvents = "auto";
    };
    imageContainer.onmouseleave = () => {
        prevBtn.style.opacity = "0";
        prevBtn.style.pointerEvents = "none";
        nextBtn.style.opacity = "0";
        nextBtn.style.pointerEvents = "none";
    };

    // Control Panel
    const controlPanel = document.createElement("div");
    controlPanel.style.position = "absolute";
    controlPanel.style.top = "0";
    controlPanel.style.left = "50%";
    controlPanel.style.transform = "translate(-50%, -85%)";
    controlPanel.style.display = "flex";
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

    controlPanel.onmouseenter = () => {
        controlPanel.style.transform = "translate(-50%, 0)";
    };
    controlPanel.onmouseleave = () => {
        controlPanel.style.transform = "translate(-50%, -85%)";
    };

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
    translateBtn.style.transition = "transform 0.2s ease, box-shadow 0.2s ease";

    translateBtn.onmouseenter = () => {
        if (!translateBtn.disabled) {
            translateBtn.style.boxShadow = "0 6px 16px rgba(76, 175, 80, 0.4)";
        }
    };
    translateBtn.onmouseleave = () => {
        if (!translateBtn.disabled) {
            translateBtn.style.boxShadow = "0 4px 12px rgba(76, 175, 80, 0.3)";
        }
    };

    controlPanel.appendChild(translateBtn);

    const translateAllBtn = document.createElement("button");
    translateAllBtn.innerText = "翻译全部";
    translateAllBtn.style.padding = "10px 24px";
    translateAllBtn.style.backgroundColor = "#2196F3";
    translateAllBtn.style.backgroundImage =
        "linear-gradient(45deg, #2196F3, #21CBF3)";
    translateAllBtn.style.color = "white";
    translateAllBtn.style.border = "none";
    translateAllBtn.style.borderRadius = "20px";
    translateAllBtn.style.cursor = "pointer";
    translateAllBtn.style.fontSize = "14px";
    translateAllBtn.style.fontWeight = "600";
    translateAllBtn.style.letterSpacing = "0.5px";
    translateAllBtn.style.whiteSpace = "nowrap";
    translateAllBtn.style.boxShadow = "0 4px 12px rgba(33, 150, 243, 0.3)";
    translateAllBtn.style.transition =
        "transform 0.2s ease, box-shadow 0.2s ease";

    translateAllBtn.onmouseenter = () => {
        if (!translateAllBtn.disabled) {
            translateAllBtn.style.boxShadow =
                "0 6px 16px rgba(33, 150, 243, 0.4)";
        }
    };
    translateAllBtn.onmouseleave = () => {
        if (!translateAllBtn.disabled) {
            translateAllBtn.style.boxShadow =
                "0 4px 12px rgba(33, 150, 243, 0.3)";
        }
    };

    controlPanel.appendChild(translateAllBtn);

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
    closeBtn.style.transition = "background-color 0.2s ease";

    closeBtn.onmouseenter = () =>
        (closeBtn.style.backgroundColor = "rgba(255, 255, 255, 0.2)");
    closeBtn.onmouseleave = () =>
        (closeBtn.style.backgroundColor = "rgba(255, 255, 255, 0.1)");

    controlPanel.appendChild(closeBtn);
    imageContainer.appendChild(controlPanel);

    overlay.appendChild(leftPanel);
    overlay.appendChild(imageContainer);
    overlay.appendChild(rightPanel);
    document.body.appendChild(overlay);

    // Logic
    const updateView = () => {
        const imgData = images[currentIndex];
        mainImage.src = imgData.src;

        prevBtn.style.display = currentIndex > 0 ? "block" : "none";
        nextBtn.style.display =
            currentIndex < images.length - 1 ? "block" : "none";

        leftPanel.innerHTML = "";
        rightPanel.innerHTML = "";

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
        leftPanel.innerHTML = "";
        rightPanel.innerHTML = "";

        const leftContainer = document.createElement("div");
        leftContainer.style.position = "relative";
        leftContainer.style.width = "100%";
        leftContainer.style.height = "100%";

        const rightContainer = document.createElement("div");
        rightContainer.style.position = "relative";
        rightContainer.style.width = "100%";
        rightContainer.style.height = "100%";

        leftPanel.appendChild(leftContainer);
        rightPanel.appendChild(rightContainer);

        const renderSide = (
            container: HTMLElement,
            blocks: typeof result.blocks,
            align: "left" | "right"
        ) => {
            blocks.sort((a, b) => a.y - b.y);

            let lastBottom = 0;
            const containerHeight =
                container.clientHeight || window.innerHeight;

            blocks.forEach((block) => {
                const textBlock = document.createElement("div");
                textBlock.innerText = block.text;
                textBlock.style.position = "absolute";
                textBlock.style.width = "fit-content";
                textBlock.style.maxWidth = "90%";

                // Position based on alignment
                if (align === "right") {
                    // Left panel: align to right (near image)
                    textBlock.style.right = "5%";
                } else {
                    // Right panel: align to left (near image)
                    textBlock.style.left = "5%";
                }

                textBlock.style.backgroundColor = "rgba(30, 30, 30, 0.9)";
                textBlock.style.color = "#fff";
                textBlock.style.padding = "10px 12px";
                textBlock.style.borderRadius = "4px";
                textBlock.style.fontSize = "15px";
                textBlock.style.lineHeight = "1.6";
                textBlock.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
                textBlock.style.border = "1px solid #444";
                textBlock.style.textAlign = align;

                let topPx = (block.y / 100) * containerHeight;

                if (topPx < lastBottom + 10) {
                    topPx = lastBottom + 10;
                }

                textBlock.style.top = `${topPx}px`;
                container.appendChild(textBlock);
                lastBottom = topPx + textBlock.offsetHeight;
            });
        };

        const leftBlocks = result.blocks.filter((b) => b.side === "left");
        const rightBlocks = result.blocks.filter((b) => b.side !== "left");

        renderSide(leftContainer, leftBlocks, "right");
        renderSide(rightContainer, rightBlocks, "left");
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
        } catch (e) {
            console.error(e);

            // Show error notification at the top of the overlay
            const errorNotification = showErrorNotification(e);
            document.body.appendChild(errorNotification);

            translateBtn.disabled = false;
            translateBtn.innerText = "重试";
            translateBtn.style.backgroundColor = "#f44336";
        }
    };

    const doTranslateAll = async () => {
        translateAllBtn.disabled = true;
        const originalText = translateAllBtn.innerText;
        let processedCount = 0;
        const total = images.length;
        const CONCURRENCY = 3;
        const queue = [...images];
        const activePromises: Promise<void>[] = [];

        const processNext = async () => {
            if (queue.length === 0) return;
            const imgData = queue.shift()!;

            if (getCachedTranslation(imgData.src)) {
                processedCount++;
                translateAllBtn.innerText = `跳过缓存 (${processedCount}/${total})...`;
                await processNext();
                return;
            }

            try {
                translateAllBtn.innerText = `翻译中 (${
                    processedCount + 1
                }/${total})...`;
                const result = await fetchTranslation(imgData.originalElement);

                if (images[currentIndex].src === imgData.src) {
                    renderTranslations(result);
                    translateBtn.innerText = "已翻译";
                    translateBtn.style.backgroundColor = "#888";
                    translateBtn.disabled = true;
                }

                processedCount++;
            } catch (e) {
                console.error(`Failed to translate image ${imgData.src}:`, e);
            }

            await processNext();
        };

        for (let i = 0; i < CONCURRENCY; i++) {
            activePromises.push(processNext());
        }

        await Promise.all(activePromises);

        translateAllBtn.innerText = "已翻译全部";
        translateAllBtn.style.backgroundColor = "#4CAF50";
        setTimeout(() => {
            translateAllBtn.disabled = false;
            translateAllBtn.innerText = originalText;
            translateAllBtn.style.backgroundColor = "#2196F3";
        }, 3000);
    };

    translateBtn.onclick = doTranslate;
    translateAllBtn.onclick = doTranslateAll;

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

    const handleKeydown = (e: KeyboardEvent) => {
        if (e.key === "ArrowLeft") prevBtn.click();
        if (e.key === "ArrowRight") nextBtn.click();
        if (e.key === "Escape") closeBtn.click();
    };
    window.addEventListener("keydown", handleKeydown);

    let lastScrollTime = 0;
    const SCROLL_COOLDOWN = 50;

    const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        const now = Date.now();
        if (now - lastScrollTime < SCROLL_COOLDOWN) return;
        if (Math.abs(e.deltaY) < 20) return;

        if (e.deltaY > 0) {
            if (currentIndex < images.length - 1) {
                nextBtn.click();
                lastScrollTime = now;
            }
        } else {
            if (currentIndex > 0) {
                prevBtn.click();
                lastScrollTime = now;
            }
        }
    };
    window.addEventListener("wheel", handleWheel, { passive: false });

    closeBtn.onclick = () => {
        window.removeEventListener("keydown", handleKeydown);
        window.removeEventListener("wheel", handleWheel);
        document.body.removeChild(overlay);
    };

    updateView();
}
