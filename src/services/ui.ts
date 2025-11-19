/**
 * Shows a side-by-side modal with the original image and the translated text.
 */
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
 * Adds a floating settings button to the page.
 */
export function addSettingsButton() {
    const button = document.createElement("div");
    button.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
    `;
    button.style.position = "fixed";
    button.style.bottom = "20px";
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
    button.onclick = showSettingsPanel;

    document.body.appendChild(button);
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
    const createField = (label: string, key: keyof typeof config, type: string = "text", placeholder: string = "") => {
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
    panel.appendChild(createField("API Endpoint", "endpoint", "text", "https://api.openai.com/v1/chat/completions"));
    panel.appendChild(createField("Model", "model", "text", "gpt-4o"));
    panel.appendChild(createField("Temperature", "temperature", "number", "0.7"));

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

