import { fetchTranslation, getCachedTranslation } from "./trasnlate";
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
    const images = Array.from(document.querySelectorAll("ignore_js_op img")) as HTMLImageElement[];

    console.debug("[Reader] Extracted images:", images);
    
    const uniqueSrcs = new Set<string>();
    const validImages: ReaderImage[] = [];

    images.forEach((img) => {
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
    // Removed local cache map

    // --- UI Construction ---
    // ... (UI construction code remains same, omitted for brevity in this tool call if possible, but replace_file_content needs context)
    // Actually I should just replace the logic parts.
    
    // Let's replace the whole file content to be safe or just the logic parts.
    // I'll target the logic part 'updateView' and 'doTranslate' and the top imports.
    
    // Wait, I can't easily replace non-contiguous blocks without multi_replace.
    // I'll use multi_replace_file_content.


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

    // Left Translation Panel
    const leftPanel = document.createElement("div");
    leftPanel.style.flex = "1"; // Fill available space
    leftPanel.style.minWidth = "150px";
    leftPanel.style.height = "100%";
    leftPanel.style.backgroundColor = "#1a1a1a";
    leftPanel.style.position = "relative";
    leftPanel.style.overflowY = "auto";
    leftPanel.style.borderRight = "1px solid #333";

    // Center Image Container
    const imageContainer = document.createElement("div");
    imageContainer.style.flex = "0 0 auto"; // Don't grow, don't shrink, auto size
    imageContainer.style.maxWidth = "60%"; // Maximum 60% of screen width
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
    
    // Adjust container width based on actual image size
    mainImage.onload = () => {
        const imageAspectRatio = mainImage.naturalWidth / mainImage.naturalHeight;
        const windowHeight = window.innerHeight;
        const calculatedWidth = windowHeight * imageAspectRatio;
        
        // Use the smaller of calculated width or 60% of window width
        const maxWidth = window.innerWidth * 0.6;
        const finalWidth = Math.min(calculatedWidth, maxWidth);
        
        imageContainer.style.width = `${finalWidth}px`;
    };
    
    imageContainer.appendChild(mainImage);

    // Right Translation Panel
    const rightPanel = document.createElement("div");
    rightPanel.style.flex = "1"; // Fill available space
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
        btn.style.backgroundColor = "rgba(0, 0, 0, 0.3)"; // Darker background for contrast
        btn.style.backdropFilter = "blur(4px)";
        btn.style.color = "#fff";
        btn.style.border = "1px solid rgba(255, 255, 255, 0.3)";
        btn.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)"; // Add shadow
        btn.style.cursor = "pointer";
        btn.style.fontSize = "20px";
        btn.style.zIndex = "100";
        btn.style.display = "flex";
        btn.style.justifyContent = "center";
        btn.style.alignItems = "center";
        btn.style.transition = "all 0.2s ease, opacity 0.3s ease";
        
        if (right) btn.style.right = "20px";
        else btn.style.left = "20px";

        // Initial state: hidden
        btn.style.opacity = "0";
        btn.style.pointerEvents = "none";

        btn.onmouseenter = () => {
            btn.style.backgroundColor = "rgba(0, 0, 0, 0.6)"; // Darker on hover
            btn.style.transform = "translateY(-50%) scale(1.1)";
        };
        btn.onmouseleave = () => {
            btn.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
            btn.style.transform = "translateY(-50%) scale(1)";
        };

        return btn;
    };

    // Allow buttons to sit inside the container
    imageContainer.style.overflow = "hidden";

    const prevBtn = createNavButton("❮", false);
    const nextBtn = createNavButton("❯", true);
    imageContainer.appendChild(prevBtn);
    imageContainer.appendChild(nextBtn);

    // Show/Hide buttons on hover
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

    // Control Panel (top overlay)
    const controlPanel = document.createElement("div");
    controlPanel.style.position = "absolute";
    controlPanel.style.top = "0";
    controlPanel.style.left = "50%";
    controlPanel.style.transform = "translate(-50%, -85%)"; // Initially hidden 85% up
    controlPanel.style.display = "flex";
    controlPanel.style.gap = "16px";
    controlPanel.style.zIndex = "100";
    controlPanel.style.padding = "20px 30px 10px 30px"; // More padding top for better grab area
    controlPanel.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    controlPanel.style.borderRadius = "0 0 20px 20px"; // Rounded bottom corners only
    controlPanel.style.backdropFilter = "blur(8px)";
    controlPanel.style.border = "1px solid rgba(255, 255, 255, 0.1)";
    controlPanel.style.borderTop = "none";
    controlPanel.style.transition = "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)"; // Smooth transition

    // Slide down on hover
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
    translateBtn.style.backgroundImage = "linear-gradient(45deg, #4CAF50, #45a049)";
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
    translateAllBtn.style.backgroundImage = "linear-gradient(45deg, #2196F3, #21CBF3)";
    translateAllBtn.style.color = "white";
    translateAllBtn.style.border = "none";
    translateAllBtn.style.borderRadius = "20px";
    translateAllBtn.style.cursor = "pointer";
    translateAllBtn.style.fontSize = "14px";
    translateAllBtn.style.fontWeight = "600";
    translateAllBtn.style.letterSpacing = "0.5px";
    translateAllBtn.style.whiteSpace = "nowrap"; // Prevent wrapping
    translateAllBtn.style.boxShadow = "0 4px 12px rgba(33, 150, 243, 0.3)";
    translateAllBtn.style.transition = "transform 0.2s ease, box-shadow 0.2s ease";

    translateAllBtn.onmouseenter = () => {
        if (!translateAllBtn.disabled) {
            translateAllBtn.style.boxShadow = "0 6px 16px rgba(33, 150, 243, 0.4)";
        }
    };
    translateAllBtn.onmouseleave = () => {
        if (!translateAllBtn.disabled) {
            translateAllBtn.style.boxShadow = "0 4px 12px rgba(33, 150, 243, 0.3)";
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
    closeBtn.style.whiteSpace = "nowrap"; // Prevent wrapping
    closeBtn.style.transition = "background-color 0.2s ease";

    closeBtn.onmouseenter = () => closeBtn.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
    closeBtn.onmouseleave = () => closeBtn.style.backgroundColor = "rgba(255, 255, 255, 0.1)";

    controlPanel.appendChild(closeBtn);

    imageContainer.appendChild(controlPanel);
    
    overlay.appendChild(leftPanel);
    overlay.appendChild(imageContainer);
    overlay.appendChild(rightPanel);
    document.body.appendChild(overlay);

    // --- Logic ---

    const updateView = () => {
        const imgData = images[currentIndex];
        mainImage.src = imgData.src;
        
        // Update navigation buttons
        prevBtn.style.display = currentIndex > 0 ? "block" : "none";
        nextBtn.style.display = currentIndex < images.length - 1 ? "block" : "none";

        // Clear translation panels
        leftPanel.innerHTML = "";
        rightPanel.innerHTML = "";

        // Update translate button
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

        // Create positioned containers for each side
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

        // Helper to render blocks for one side with collision detection
        const renderSide = (container: HTMLElement, blocks: typeof result.blocks, align: "left" | "right") => {
            // Sort by Y position to process from top to bottom
            blocks.sort((a, b) => a.y - b.y);

            let lastBottom = 0;
            const containerHeight = container.clientHeight || window.innerHeight; // Fallback if not yet rendered

            blocks.forEach((block) => {
                const textBlock = document.createElement("div");
                textBlock.innerText = block.text;
                textBlock.style.position = "absolute";
                textBlock.style.width = "90%";
                textBlock.style.left = "5%";
                
                textBlock.style.backgroundColor = "rgba(30, 30, 30, 0.9)";
                textBlock.style.color = "#fff";
                textBlock.style.padding = "10px 12px";
                textBlock.style.borderRadius = "4px";
                textBlock.style.fontSize = "15px";
                textBlock.style.lineHeight = "1.6";
                textBlock.style.boxShadow = "0 2px 8px rgba(0,0,0,0.3)";
                textBlock.style.border = "1px solid #444";
                textBlock.style.textAlign = align;

                // Calculate ideal top in pixels
                let topPx = (block.y / 100) * containerHeight;

                // Collision detection: ensure we don't overlap with the previous block
                // Add a 10px gap
                if (topPx < lastBottom + 10) {
                    topPx = lastBottom + 10;
                }

                textBlock.style.top = `${topPx}px`;
                
                // We need to append first to get the height
                container.appendChild(textBlock);

                // Update lastBottom for the next block
                lastBottom = topPx + textBlock.offsetHeight;
            });
        };

        // Split blocks by side
        const leftBlocks = result.blocks.filter(b => b.side === "left");
        const rightBlocks = result.blocks.filter(b => b.side !== "left"); // Default to right if not left

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
            
            // fetchTranslation handles saving to cache
            renderTranslations(result);
            translateBtn.innerText = "已翻译";
        } catch (e) {
            console.error(e);
            alert("Translation failed. See console.");
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

        // Concurrency limit
        const CONCURRENCY = 3;
        const queue = [...images];
        const activePromises: Promise<void>[] = [];

        const processNext = async () => {
            if (queue.length === 0) return;
            const imgData = queue.shift()!;

            // Skip if cached
            if (getCachedTranslation(imgData.src)) {
                processedCount++;
                translateAllBtn.innerText = `跳过缓存 (${processedCount}/${total})...`;
                await processNext();
                return;
            }

            try {
                translateAllBtn.innerText = `翻译中 (${processedCount + 1}/${total})...`;
                const result = await fetchTranslation(imgData.originalElement);
                
                // If this is the current image, update view immediately
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

        // Start initial batch
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

    translateBtn.onclick = doTranslate;

    // Keyboard navigation
    const handleKeydown = (e: KeyboardEvent) => {
        if (e.key === "ArrowLeft") prevBtn.click();
        if (e.key === "ArrowRight") nextBtn.click();
        if (e.key === "Escape") closeBtn.click();
    };
    window.addEventListener("keydown", handleKeydown);

    // Wheel navigation with cooldown
    let lastScrollTime = 0;
    const SCROLL_COOLDOWN = 50; // ms

    const handleWheel = (e: WheelEvent) => {
        // Only prevent default if we are actually handling the scroll
        // But in reader mode overlay, we probably want to prevent page scroll always
        e.preventDefault();
        
        const now = Date.now();
        if (now - lastScrollTime < SCROLL_COOLDOWN) return;

        // Threshold to avoid accidental small scrolls
        if (Math.abs(e.deltaY) < 20) return;

        if (e.deltaY > 0) {
            // Scroll down -> Next
            if (currentIndex < images.length - 1) {
                nextBtn.click();
                lastScrollTime = now;
            }
        } else {
            // Scroll up -> Prev
            if (currentIndex > 0) {
                prevBtn.click();
                lastScrollTime = now;
            }
        }
    };
    // passive: false is required to use preventDefault
    window.addEventListener("wheel", handleWheel, { passive: false });

    // Cleanup on close
    closeBtn.onclick = () => {
        window.removeEventListener("keydown", handleKeydown);
        window.removeEventListener("wheel", handleWheel);
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
