import { TranslationError } from "./ai";

/**
 * Creates a styled error notification element
 */
export function showErrorNotification(
    error: unknown,
    container?: HTMLElement
): HTMLElement {
    const errorDiv = document.createElement("div");
    errorDiv.style.position = container ? "relative" : "fixed";
    errorDiv.style.top = container ? "0" : "20px";
    errorDiv.style.left = container ? "0" : "50%";
    errorDiv.style.transform = container ? "none" : "translateX(-50%)";
    errorDiv.style.maxWidth = "500px";
    errorDiv.style.width = container ? "100%" : "auto";
    errorDiv.style.padding = "16px 20px";
    errorDiv.style.backgroundColor = "rgba(220, 38, 38, 0.95)";
    errorDiv.style.backdropFilter = "blur(10px)";
    errorDiv.style.color = "#fff";
    errorDiv.style.borderRadius = "12px";
    errorDiv.style.boxShadow = "0 4px 20px rgba(0, 0, 0, 0.3)";
    errorDiv.style.zIndex = "10003";
    errorDiv.style.fontFamily = "system-ui, -apple-system, sans-serif";
    errorDiv.style.border = "1px solid rgba(255, 255, 255, 0.2)";
    errorDiv.style.animation = "slideDown 0.3s ease-out";

    // Error icon and title
    const titleDiv = document.createElement("div");
    titleDiv.style.display = "flex";
    titleDiv.style.alignItems = "center";
    titleDiv.style.gap = "10px";
    titleDiv.style.marginBottom = "8px";
    titleDiv.style.fontSize = "16px";
    titleDiv.style.fontWeight = "600";

    const icon = document.createElement("span");
    icon.innerText = "⚠️";
    icon.style.fontSize = "20px";

    const title = document.createElement("span");

    let userMessage = "翻译失败";
    let details = "";

    if (error instanceof TranslationError) {
        userMessage = error.userMessage;
        details = error.details || "";
        if (error.statusCode) {
            title.innerText = `${userMessage} (${error.statusCode})`;
        } else {
            title.innerText = userMessage;
        }
    } else if (error instanceof Error) {
        userMessage = error.message;
        title.innerText = "翻译过程出错";
    } else {
        title.innerText = "未知错误";
    }

    titleDiv.appendChild(icon);
    titleDiv.appendChild(title);
    errorDiv.appendChild(titleDiv);

    // Error message
    const messageDiv = document.createElement("div");
    messageDiv.style.fontSize = "14px";
    messageDiv.style.lineHeight = "1.5";
    messageDiv.style.opacity = "0.95";
    messageDiv.innerText = userMessage;
    errorDiv.appendChild(messageDiv);

    // Details (collapsible)
    if (details) {
        const detailsToggle = document.createElement("button");
        detailsToggle.innerText = "查看详情";
        detailsToggle.style.marginTop = "12px";
        detailsToggle.style.padding = "6px 12px";
        detailsToggle.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
        detailsToggle.style.color = "#fff";
        detailsToggle.style.border = "1px solid rgba(255, 255, 255, 0.3)";
        detailsToggle.style.borderRadius = "6px";
        detailsToggle.style.cursor = "pointer";
        detailsToggle.style.fontSize = "12px";
        detailsToggle.style.fontWeight = "500";
        detailsToggle.style.transition = "background-color 0.2s ease";

        const detailsDiv = document.createElement("div");
        detailsDiv.style.marginTop = "8px";
        detailsDiv.style.padding = "10px";
        detailsDiv.style.backgroundColor = "rgba(0, 0, 0, 0.3)";
        detailsDiv.style.borderRadius = "6px";
        detailsDiv.style.fontSize = "12px";
        detailsDiv.style.fontFamily = "monospace";
        detailsDiv.style.maxHeight = "150px";
        detailsDiv.style.overflowY = "auto";
        detailsDiv.style.wordBreak = "break-word";
        detailsDiv.style.display = "none";
        detailsDiv.innerText = details;

        detailsToggle.onclick = () => {
            const isVisible = detailsDiv.style.display === "block";
            detailsDiv.style.display = isVisible ? "none" : "block";
            detailsToggle.innerText = isVisible ? "查看详情" : "隐藏详情";
        };

        detailsToggle.onmouseenter = () => {
            detailsToggle.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
        };
        detailsToggle.onmouseleave = () => {
            detailsToggle.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
        };

        errorDiv.appendChild(detailsToggle);
        errorDiv.appendChild(detailsDiv);
    }

    // Close button
    const closeBtn = document.createElement("button");
    closeBtn.innerText = "×";
    closeBtn.style.position = "absolute";
    closeBtn.style.top = "12px";
    closeBtn.style.right = "12px";
    closeBtn.style.width = "24px";
    closeBtn.style.height = "24px";
    closeBtn.style.borderRadius = "50%";
    closeBtn.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
    closeBtn.style.color = "#fff";
    closeBtn.style.border = "none";
    closeBtn.style.cursor = "pointer";
    closeBtn.style.fontSize = "18px";
    closeBtn.style.fontWeight = "bold";
    closeBtn.style.display = "flex";
    closeBtn.style.alignItems = "center";
    closeBtn.style.justifyContent = "center";
    closeBtn.style.transition = "background-color 0.2s ease";

    closeBtn.onclick = () => {
        errorDiv.style.animation = "slideUp 0.3s ease-out";
        setTimeout(() => errorDiv.remove(), 300);
    };

    closeBtn.onmouseenter = () => {
        closeBtn.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
    };
    closeBtn.onmouseleave = () => {
        closeBtn.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
    };

    errorDiv.appendChild(closeBtn);

    // Auto-dismiss after 10 seconds
    setTimeout(() => {
        if (errorDiv.parentElement) {
            errorDiv.style.animation = "slideUp 0.3s ease-out";
            setTimeout(() => errorDiv.remove(), 300);
        }
    }, 10000);

    // Add CSS animations
    if (!document.getElementById("vtranslate-error-animations")) {
        const style = document.createElement("style");
        style.id = "vtranslate-error-animations";
        style.textContent = `
            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateX(-50%) translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
            }
            @keyframes slideUp {
                from {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
                to {
                    opacity: 0;
                    transform: translateX(-50%) translateY(-20px);
                }
            }
        `;
        document.head.appendChild(style);
    }

    return errorDiv;
}

/**
 * Formats an error for display
 */
export function formatError(error: unknown): string {
    if (error instanceof TranslationError) {
        return error.userMessage;
    } else if (error instanceof Error) {
        return error.message;
    } else {
        return String(error);
    }
}
