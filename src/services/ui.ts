/**
 * Shows a side-by-side modal with the original image and the translated text.
 */
export function injectStyles() {
    if (document.getElementById("vtranslate-styles")) return;

    const style = document.createElement("style");
    style.id = "vtranslate-styles";
    style.textContent = `
        /* Global Overlay */
        .vtranslate-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background-color: rgba(0, 0, 0, 0.85);
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            backdrop-filter: blur(5px);
        }

        /* Translation Modal */
        .vtranslate-modal {
            display: flex;
            width: 90%;
            height: 80%;
            background-color: #1e1e1e;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            font-family: system-ui, -apple-system, sans-serif;
            flex-direction: row;
        }

        .vtranslate-image-container {
            flex: 1;
            background-color: #000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            overflow: hidden;
        }

        .vtranslate-text-container {
            flex: 1;
            padding: 40px;
            overflow-y: auto;
            color: #e0e0e0;
            font-size: 16px;
            line-height: 1.6;
            background-color: #1e1e1e;
            position: relative;
        }

        /* Settings Panel */
        .vtranslate-settings-panel {
            width: 400px;
            max-width: 90%;
            background-color: #1e1e1e;
            border-radius: 8px;
            padding: 24px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.5);
            color: #fff;
            font-family: system-ui, -apple-system, sans-serif;
        }

        /* Reader Mode */
        .vtranslate-reader-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background-color: #000;
            z-index: 10002;
            display: flex;
            flex-direction: row;
        }

        .vtranslate-reader-panel {
            flex: 1;
            min-width: 150px;
            height: 100%;
            background-color: #1a1a1a;
            position: relative;
            overflow-y: auto;
            border-color: #333;
            border-style: solid;
        }
        .vtranslate-reader-panel-left { border-right-width: 1px; }
        .vtranslate-reader-panel-right { border-left-width: 1px; }

        .vtranslate-reader-center {
            flex: 0 0 auto;
            max-width: 60%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
            background-color: #000;
            overflow: hidden;
        }

        /* Mobile Adaptations */
        @media (max-width: 768px) {
            /* Translation Modal */
            .vtranslate-modal {
                flex-direction: column;
                height: 90%;
            }
            .vtranslate-image-container {
                flex: 0 0 40%;
                padding: 10px;
            }
            .vtranslate-text-container {
                flex: 1;
                padding: 20px;
            }

            /* Reader Mode */
            .vtranslate-reader-overlay {
                flex-direction: column;
                overflow-y: auto;
            }
            .vtranslate-reader-center {
                order: 1;
                max-width: 100%;
                width: 100% !important;
                flex: none;
                height: auto;
                max-height: 60%;
            }
            .vtranslate-reader-panel {
                order: 2;
                min-width: 0;
                width: 100%;
                height: auto;
                flex: none;
                overflow-y: visible;
                border: none;
                border-top: 1px solid #333;
            }
            .vtranslate-reader-panel-left { order: 2; }
            .vtranslate-reader-panel-right { order: 3; }

            .vtranslate-text-block {
                position: relative !important;
                top: auto !important;
                left: auto !important;
                width: 100% !important;
                margin-bottom: 10px;
            }
        }
    `;
    document.head.appendChild(style);
}

/**
 * Shows a side-by-side modal with the original image and the translated text.
 */
export function showTranslationModal(img: HTMLImageElement, text: string) {
    // Create overlay container
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.85)";
    overlay.style.zIndex = "10000";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.backdropFilter = "blur(5px)";

    // Create modal content container
    const modal = document.createElement("div");
    modal.style.display = "flex";
    modal.style.width = "90%";
    modal.style.height = "80%";
    modal.style.backgroundColor = "#1e1e1e";
    modal.style.borderRadius = "12px";
    modal.style.overflow = "hidden";
    modal.style.boxShadow = "0 25px 50px -12px rgba(0, 0, 0, 0.5)";
    modal.style.fontFamily = "system-ui, -apple-system, sans-serif";

    // Left side: Image
    const imageContainer = document.createElement("div");
    imageContainer.style.flex = "1";
    imageContainer.style.backgroundColor = "#000";
    imageContainer.style.display = "flex";
    imageContainer.style.alignItems = "center";
    imageContainer.style.justifyContent = "center";
    imageContainer.style.padding = "20px";

    const displayImg = document.createElement("img");
    displayImg.src = img.src;
    displayImg.style.maxWidth = "100%";
    displayImg.style.maxHeight = "100%";
    displayImg.style.objectFit = "contain";
    imageContainer.appendChild(displayImg);

    // Right side: Text
    const textContainer = document.createElement("div");
    textContainer.style.flex = "1";
    textContainer.style.padding = "40px";
    textContainer.style.overflowY = "auto";
    textContainer.style.color = "#e0e0e0";
    textContainer.style.fontSize = "16px";
    textContainer.style.lineHeight = "1.6";
    textContainer.style.backgroundColor = "#1e1e1e";
    textContainer.style.position = "relative";

    // Title
    const title = document.createElement("h2");
    title.innerText = "Translation Result";
    title.style.marginTop = "0";
    title.style.marginBottom = "20px";
    title.style.fontSize = "24px";
    title.style.fontWeight = "600";
    title.style.color = "#fff";
    title.style.borderBottom = "1px solid #333";
    title.style.paddingBottom = "10px";
    textContainer.appendChild(title);

    // Content
    const content = document.createElement("div");
    content.innerText = text;
    content.style.whiteSpace = "pre-wrap";
    textContainer.appendChild(content);

    // Close button
    const closeBtn = document.createElement("button");
    closeBtn.innerHTML = "&times;";
    closeBtn.style.position = "absolute";
    closeBtn.style.top = "20px";
    closeBtn.style.right = "20px";
    closeBtn.style.background = "transparent";
    closeBtn.style.border = "none";
    closeBtn.style.color = "#fff";
    closeBtn.style.fontSize = "32px";
    closeBtn.style.cursor = "pointer";
    closeBtn.style.lineHeight = "1";
    closeBtn.style.padding = "0";
    closeBtn.style.opacity = "0.7";
    closeBtn.onmouseover = () => (closeBtn.style.opacity = "1");
    closeBtn.onmouseout = () => (closeBtn.style.opacity = "0.7");

    // Close logic
    const close = () => {
        document.body.removeChild(overlay);
    };
    closeBtn.onclick = close;
    overlay.onclick = (e) => {
        if (e.target === overlay) close();
    };

    // Append elements
    textContainer.appendChild(closeBtn);
    modal.appendChild(imageContainer);
    modal.appendChild(textContainer);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
}

import { config } from "./config";

/**
 * Creates a floating button on the page.
 */
export function createFloatingButton(
    iconSvg: string,
    onClick: () => void,
    bottomOffset: string = "20px"
) {
    const button = document.createElement("div");
    button.innerHTML = iconSvg;
    button.style.position = "fixed";
    button.style.bottom = bottomOffset;
    button.style.right = "20px";
    button.style.width = "48px";
    button.style.height = "48px";
    button.style.borderRadius = "50%";
    button.style.backgroundColor = "#1e1e1e";
    button.style.color = "#fff";
    button.style.display = "flex";
    button.style.alignItems = "center";
    button.style.justifyContent = "center";
    button.style.cursor = "pointer";
    button.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";
    button.style.zIndex = "9999";
    button.style.transition = "transform 0.2s";

    button.onmouseover = () => (button.style.transform = "scale(1.1)");
    button.onmouseout = () => (button.style.transform = "scale(1)");
    button.onclick = onClick;

    document.body.appendChild(button);
    return button;
}

/**
 * Adds a floating settings button to the page.
 */
export function addSettingsButton() {
    const icon = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
    `;
    createFloatingButton(icon, showSettingsPanel, "20px");
}

function showSettingsPanel() {
    // Check if panel already exists
    if (document.getElementById("vtranslate-settings-panel")) return;

    const overlay = document.createElement("div");
    overlay.id = "vtranslate-settings-panel";
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.width = "100vw";
    overlay.style.height = "100vh";
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    overlay.style.zIndex = "10001";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.backdropFilter = "blur(2px)";

    const panel = document.createElement("div");
    panel.style.width = "400px";
    panel.style.backgroundColor = "#1e1e1e";
    panel.style.borderRadius = "8px";
    panel.style.padding = "24px";
    panel.style.boxShadow = "0 10px 25px rgba(0,0,0,0.5)";
    panel.style.color = "#fff";
    panel.style.fontFamily = "system-ui, -apple-system, sans-serif";

    const title = document.createElement("h3");
    title.innerText = "VTranslate Settings";
    title.style.marginTop = "0";
    title.style.marginBottom = "20px";
    title.style.fontSize = "20px";
    panel.appendChild(title);

    // Helper to create input fields
    const createField = (
        label: string,
        key: keyof typeof config,
        type: string = "text",
        placeholder: string = ""
    ) => {
        const container = document.createElement("div");
        container.style.marginBottom = "16px";

        const labelEl = document.createElement("label");
        labelEl.innerText = label;
        labelEl.style.display = "block";
        labelEl.style.marginBottom = "8px";
        labelEl.style.fontSize = "14px";
        labelEl.style.color = "#aaa";

        const input = document.createElement("input");
        input.type = type;
        input.value = String(config[key] || "");
        input.placeholder = placeholder;
        input.style.width = "100%";
        input.style.padding = "8px 12px";
        input.style.borderRadius = "4px";
        input.style.border = "1px solid #333";
        input.style.backgroundColor = "#2d2d2d";
        input.style.color = "#fff";
        input.style.boxSizing = "border-box";

        // Save on change
        input.onchange = () => {
            // @ts-ignore
            config[key] = type === "number" ? Number(input.value) : input.value;
        };

        container.appendChild(labelEl);
        container.appendChild(input);
        return container;
    };

    panel.appendChild(createField("API Key", "apiKey", "password", "sk-..."));
    panel.appendChild(
        createField(
            "API Endpoint",
            "endpoint",
            "text",
            "https://api.openai.com/v1/chat/completions"
        )
    );
    panel.appendChild(createField("Model", "model", "text", "gpt-4o"));
    panel.appendChild(
        createField("Temperature", "temperature", "number", "0.7")
    );
    panel.appendChild(createField("QPM Limit", "qpm", "number", "No limit"));

    // Buttons
    const btnContainer = document.createElement("div");
    btnContainer.style.display = "flex";
    btnContainer.style.justifyContent = "flex-end";
    btnContainer.style.marginTop = "24px";
    btnContainer.style.gap = "12px";

    const closeBtn = document.createElement("button");
    closeBtn.innerText = "Close";
    closeBtn.style.padding = "8px 16px";
    closeBtn.style.borderRadius = "4px";
    closeBtn.style.border = "1px solid #333";
    closeBtn.style.backgroundColor = "transparent";
    closeBtn.style.color = "#fff";
    closeBtn.style.cursor = "pointer";
    closeBtn.onclick = () => document.body.removeChild(overlay);

    btnContainer.appendChild(closeBtn);
    panel.appendChild(btnContainer);

    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    // Close on backdrop click
    overlay.onclick = (e) => {
        if (e.target === overlay) document.body.removeChild(overlay);
    };
}
