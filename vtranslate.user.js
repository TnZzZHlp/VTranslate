// ==UserScript==
// @name       vtranslate
// @namespace  npm/vite-plugin-monkey
// @version    1.1.0
// @icon       https://vitejs.dev/logo.svg
// @match      https://bbs.yamibo.com/thread-*
// @match      https://bbs.yamibo.com/forum.php*
// @grant      GM_getValue
// @grant      GM_setValue
// ==/UserScript==

(function () {
  'use strict';

  var _GM_getValue = (() => typeof GM_getValue != "undefined" ? GM_getValue : void 0)();
  var _GM_setValue = (() => typeof GM_setValue != "undefined" ? GM_setValue : void 0)();
  const CONFIG_STORAGE_KEY = "vtranslate_config";
  const config = new Proxy({}, {
    get: (target, prop) => {
      console.log(`[Config] Reading property: ${String(prop)}`);
      const storedConfig = _GM_getValue(CONFIG_STORAGE_KEY);
      Object.assign(target, storedConfig);
      if (prop in target) {
        const value = target[prop];
        console.log(`[Config] Value for ${String(prop)}:`, value);
        return value;
      }
      console.warn(`[Config] Property ${String(prop)} not found`);
      return void 0;
    },
    set: (target, prop, value) => {
      _GM_setValue(CONFIG_STORAGE_KEY, { ...target, [prop]: value });
      Object.assign(target, { [prop]: value });
      console.log(`[Config] Setting property: ${String(prop)} to`, value);
      return true;
    },
    has: (target, prop) => {
      return prop in target;
    },
    deleteProperty: (_target, prop) => {
      console.warn(
        `[Config] Deleting property is not allowed: ${String(prop)}`
      );
      return false;
    }
  });
  function injectStyles() {
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
  function createFloatingButton(iconSvg, onClick, bottomOffset = "20px") {
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
    button.onmouseover = () => button.style.transform = "scale(1.1)";
    button.onmouseout = () => button.style.transform = "scale(1)";
    button.onclick = onClick;
    document.body.appendChild(button);
    return button;
  }
  function addSettingsButton() {
    const icon = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"></circle>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
        </svg>
    `;
    createFloatingButton(icon, showSettingsPanel, "20px");
  }
  function showSettingsPanel() {
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
    const createField = (label, key, type = "text", placeholder = "") => {
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
      input.onchange = () => {
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
    overlay.onclick = (e) => {
      if (e.target === overlay) document.body.removeChild(overlay);
    };
  }
  class TranslationError extends Error {
    constructor(message, userMessage, statusCode, details) {
      super(message);
      this.userMessage = userMessage;
      this.statusCode = statusCode;
      this.details = details;
      this.name = "TranslationError";
    }
  }
  async function translateImage(imageBase64, context) {
    console.debug("[AI] Starting translation request.");
    const endpoint = config.endpoint || "https://ai.tnzzz.top/v1/chat/completions";
    const apiKey = config.apiKey || "sk-34c3d7f7f0cc4417b6db3939accbb147";
    const model = config.model || "Manga";
    const temperature = config.temperature ?? 1.2;
    const payload = {
      model,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `请将图片中的所有文本翻译成简体中文。
${context ? `
上下文信息：${context}
请参考这个上下文来帮助理解和翻译图片内容。
` : ""}
返回格式必须是JSON，格式如下：
{
  "blocks": [
    {
      "text": "翻译后的文本",
      "y": 25.5,
      "side": "left"
    }
  ]
}

其中：
- text: 翻译后的文本内容
- y: 该文本在图片中的垂直位置，用百分比表示（0-100，0表示顶部，100表示底部）
- side: 文本在图片中的位置是左边("left")还是右边("right")

请分析图片中每个文本块的位置，并按照从上到下的顺序返回所有翻译。只返回JSON，不要添加任何其他内容。`
            },
            {
              type: "image_url",
              image_url: {
                url: imageBase64
              }
            }
          ]
        }
      ],
      temperature
    };
    console.debug("[AI] Request payload constructed:", {
      endpoint,
      model,
      temperature,
      imageLength: imageBase64.length
    });
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const errorText = await response.text();
      console.error("[AI] API request failed:", errorText);
      let userMessage = "翻译请求失败";
      let details = errorText;
      try {
        const errorData = JSON.parse(errorText);
        details = errorData.error?.message || errorData.message || errorText;
      } catch {
      }
      switch (response.status) {
        case 400:
          userMessage = "请求格式错误，请检查配置";
          break;
        case 401:
          userMessage = "API密钥无效，请检查配置";
          break;
        case 403:
          userMessage = "访问被拒绝，请检查API权限";
          break;
        case 404:
          userMessage = "API端点不存在，请检查配置";
          break;
        case 429:
          userMessage = "请求过于频繁，请稍后再试";
          break;
        case 500:
        case 502:
        case 503:
          userMessage = "服务器错误，请稍后再试";
          break;
        default:
          userMessage = `请求失败 (${response.status})`;
      }
      throw new TranslationError(
        `API request failed: ${response.status}`,
        userMessage,
        response.status,
        details
      );
    }
    const data = await response.json();
    console.debug("[AI] API response received:", data);
    const content = data.choices?.[0]?.message?.content || "";
    if (!content) {
      throw new TranslationError(
        "No content in API response",
        "AI返回了空响应，请重试",
        void 0,
        JSON.stringify(data)
      );
    }
    try {
      let jsonStr = content.trim();
      if (jsonStr.startsWith("```json")) {
        jsonStr = jsonStr.replace(/```json\n?/g, "").replace(/```\n?/g, "");
      } else if (jsonStr.startsWith("```")) {
        jsonStr = jsonStr.replace(/```\n?/g, "");
      }
      const result = JSON.parse(jsonStr);
      if (!result.blocks || !Array.isArray(result.blocks)) {
        throw new TranslationError(
          "Invalid JSON structure: missing blocks array",
          "AI返回的数据格式不正确",
          void 0,
          `返回内容: ${jsonStr.substring(0, 200)}...`
        );
      }
      return result;
    } catch (e) {
      console.error("[AI] Failed to parse JSON response:", content, e);
      if (e instanceof TranslationError) {
        throw e;
      }
      throw new TranslationError(
        `Failed to parse AI response as JSON: ${e}`,
        "无法解析AI返回的翻译结果",
        void 0,
        `返回内容: ${content.substring(0, 200)}...`
      );
    }
  }
  const CACHE_KEY = "vtranslate_cache_v1";
  function getCache() {
    return _GM_getValue(CACHE_KEY, {});
  }
  function setCache(cache) {
    _GM_setValue(CACHE_KEY, cache);
  }
  function getCachedTranslation(src) {
    const cache = getCache();
    return cache[src];
  }
  function saveTranslationToCache(src, result) {
    const cache = getCache();
    cache[src] = result;
    setCache(cache);
  }
  function getPageContext() {
    const titleElement = document.getElementById("thread_subject");
    if (titleElement) {
      const title = titleElement.textContent?.trim();
      if (title) {
        console.debug("[Translate] Found context title:", title);
        return title;
      }
    }
    return void 0;
  }
  async function fetchTranslation(img) {
    const src = img.getAttribute("file") || img.src;
    const cached = getCachedTranslation(src);
    if (cached) {
      console.debug("[Translate] Cache hit for:", src);
      return cached;
    }
    console.debug("[Translate] Starting translation for image.", img);
    const context = getPageContext();
    const base64 = await imageToBase64(img);
    console.debug(
      "[Translate] Image converted to base64, length:",
      base64.length
    );
    const translationResult = await translateImage(base64, context);
    console.log("[Translate] Result:", translationResult);
    saveTranslationToCache(src, translationResult);
    return translationResult;
  }
  function imageToBase64(img) {
    return new Promise((resolve, reject) => {
      const fileAttr = img.getAttribute("file");
      const processImage = (image) => {
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth;
        canvas.height = image.naturalHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }
        try {
          ctx.drawImage(image, 0, 0);
          const dataURL = canvas.toDataURL("image/jpeg", 0.8);
          resolve(dataURL);
        } catch (e) {
          reject(e);
        }
      };
      if (fileAttr) {
        console.debug(
          "[Translate] Found 'file' attribute, loading real image:",
          fileAttr
        );
        const realImage = new Image();
        realImage.crossOrigin = "Anonymous";
        realImage.src = fileAttr;
        realImage.onload = () => {
          console.debug("[Translate] Real image loaded.");
          processImage(realImage);
        };
        realImage.onerror = (e) => {
          console.warn(
            "[Translate] Failed to load real image from 'file' attribute, falling back to src.",
            e
          );
          processImage(img);
        };
      } else {
        processImage(img);
      }
    });
  }
  function showErrorNotification(error, container) {
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
    const messageDiv = document.createElement("div");
    messageDiv.style.fontSize = "14px";
    messageDiv.style.lineHeight = "1.5";
    messageDiv.style.opacity = "0.95";
    messageDiv.innerText = userMessage;
    errorDiv.appendChild(messageDiv);
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
    setTimeout(() => {
      if (errorDiv.parentElement) {
        errorDiv.style.animation = "slideUp 0.3s ease-out";
        setTimeout(() => errorDiv.remove(), 300);
      }
    }, 1e4);
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
  function showDesktopReader(images) {
    let currentIndex = 0;
    injectStyles();
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
    const leftPanel = document.createElement("div");
    leftPanel.style.flex = "1";
    leftPanel.style.minWidth = "150px";
    leftPanel.style.height = "100%";
    leftPanel.style.backgroundColor = "#1a1a1a";
    leftPanel.style.position = "relative";
    leftPanel.style.overflowY = "auto";
    leftPanel.style.borderRight = "1px solid #333";
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
      const imageAspectRatio = mainImage.naturalWidth / mainImage.naturalHeight;
      const windowHeight = window.innerHeight;
      const calculatedWidth = windowHeight * imageAspectRatio;
      const maxWidth = window.innerWidth * 0.6;
      const finalWidth = Math.min(calculatedWidth, maxWidth);
      imageContainer.style.width = `${finalWidth}px`;
    };
    imageContainer.appendChild(mainImage);
    const rightPanel = document.createElement("div");
    rightPanel.style.flex = "1";
    rightPanel.style.minWidth = "150px";
    rightPanel.style.height = "100%";
    rightPanel.style.backgroundColor = "#1a1a1a";
    rightPanel.style.position = "relative";
    rightPanel.style.overflowY = "auto";
    rightPanel.style.borderLeft = "1px solid #333";
    const createNavButton = (text, right) => {
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
    controlPanel.style.transition = "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
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
    translateAllBtn.style.whiteSpace = "nowrap";
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
    closeBtn.style.whiteSpace = "nowrap";
    closeBtn.style.transition = "background-color 0.2s ease";
    closeBtn.onmouseenter = () => closeBtn.style.backgroundColor = "rgba(255, 255, 255, 0.2)";
    closeBtn.onmouseleave = () => closeBtn.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
    controlPanel.appendChild(closeBtn);
    imageContainer.appendChild(controlPanel);
    overlay.appendChild(leftPanel);
    overlay.appendChild(imageContainer);
    overlay.appendChild(rightPanel);
    document.body.appendChild(overlay);
    const updateView = () => {
      const imgData = images[currentIndex];
      mainImage.src = imgData.src;
      prevBtn.style.display = currentIndex > 0 ? "block" : "none";
      nextBtn.style.display = currentIndex < images.length - 1 ? "block" : "none";
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
    const renderTranslations = (result) => {
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
      const renderSide = (container, blocks, align) => {
        blocks.sort((a, b) => a.y - b.y);
        let lastBottom = 0;
        const containerHeight = container.clientHeight || window.innerHeight;
        blocks.forEach((block) => {
          const textBlock = document.createElement("div");
          textBlock.innerText = block.text;
          textBlock.style.position = "absolute";
          textBlock.style.width = "fit-content";
          textBlock.style.maxWidth = "90%";
          if (align === "right") {
            textBlock.style.right = "5%";
          } else {
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
          let topPx = block.y / 100 * containerHeight;
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
      const activePromises = [];
      const processNext = async () => {
        if (queue.length === 0) return;
        const imgData = queue.shift();
        if (getCachedTranslation(imgData.src)) {
          processedCount++;
          translateAllBtn.innerText = `跳过缓存 (${processedCount}/${total})...`;
          await processNext();
          return;
        }
        try {
          translateAllBtn.innerText = `翻译中 (${processedCount + 1}/${total})...`;
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
      }, 3e3);
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
    const handleKeydown = (e) => {
      if (e.key === "ArrowLeft") prevBtn.click();
      if (e.key === "ArrowRight") nextBtn.click();
      if (e.key === "Escape") closeBtn.click();
    };
    window.addEventListener("keydown", handleKeydown);
    let lastScrollTime = 0;
    const SCROLL_COOLDOWN = 50;
    const handleWheel = (e) => {
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
  function showMobileReader(images) {
    let currentIndex = 0;
    injectStyles();
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
    const translationsContainer = document.createElement("div");
    translationsContainer.style.position = "absolute";
    translationsContainer.style.bottom = "0";
    translationsContainer.style.left = "0";
    translationsContainer.style.width = "100%";
    translationsContainer.style.maxHeight = "60%";
    translationsContainer.style.zIndex = "10";
    translationsContainer.style.display = "none";
    translationsContainer.style.overflowY = "auto";
    translationsContainer.style.padding = "16px";
    translationsContainer.style.boxSizing = "border-box";
    translationsContainer.style.backgroundColor = "rgba(0, 0, 0, 0.95)";
    translationsContainer.style.backdropFilter = "blur(10px)";
    translationsContainer.style.borderTop = "1px solid rgba(255, 255, 255, 0.1)";
    translationsContainer.style.transition = "transform 0.3s ease-out";
    translationsContainer.style.borderRadius = "16px 16px 0 0";
    translationsContainer.style.boxShadow = "0 -4px 20px rgba(0, 0, 0, 0.5)";
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
    const createNavButton = (text, right) => {
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
    controlPanel.style.transition = "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)";
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
    const updateView = () => {
      const imgData = images[currentIndex];
      mainImage.src = imgData.src;
      prevBtn.style.opacity = currentIndex > 0 ? "1" : "0";
      prevBtn.style.pointerEvents = currentIndex > 0 ? "auto" : "none";
      nextBtn.style.opacity = currentIndex < images.length - 1 ? "1" : "0";
      nextBtn.style.pointerEvents = currentIndex < images.length - 1 ? "auto" : "none";
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
    const renderTranslations = (result) => {
      translationsContainer.innerHTML = "";
      const dragHandle = document.createElement("div");
      dragHandle.style.width = "40px";
      dragHandle.style.height = "4px";
      dragHandle.style.backgroundColor = "rgba(255, 255, 255, 0.3)";
      dragHandle.style.borderRadius = "2px";
      dragHandle.style.margin = "0 auto 16px auto";
      translationsContainer.appendChild(dragHandle);
      const leftBlocks = result.blocks.filter((b) => b.side === "left");
      const rightBlocks = result.blocks.filter((b) => b.side !== "left");
      const sortedLeftBlocks = [...leftBlocks].sort((a, b) => a.y - b.y);
      const sortedRightBlocks = [...rightBlocks].sort((a, b) => a.y - b.y);
      const allBlocks = [...sortedLeftBlocks, ...sortedRightBlocks];
      sortedLeftBlocks.forEach((block) => {
        const textBlock = document.createElement("div");
        textBlock.innerText = block.text;
        textBlock.style.width = "fit-content";
        textBlock.style.maxWidth = "90%";
        textBlock.style.marginBottom = "12px";
        textBlock.style.marginLeft = "0";
        textBlock.style.marginRight = "auto";
        textBlock.style.backgroundColor = "rgba(40, 40, 40, 0.8)";
        textBlock.style.color = "#fff";
        textBlock.style.padding = "12px 14px";
        textBlock.style.borderRadius = "8px";
        textBlock.style.fontSize = "15px";
        textBlock.style.lineHeight = "1.6";
        textBlock.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.2)";
        textBlock.style.border = "1px solid rgba(255, 255, 255, 0.1)";
        textBlock.style.borderLeft = "3px solid rgba(76, 175, 80, 0.6)";
        textBlock.style.wordWrap = "break-word";
        textBlock.style.textAlign = "left";
        textBlock.style.transition = "background-color 0.2s ease";
        textBlock.style.opacity = "0";
        textBlock.style.transform = "translateX(-10px)";
        translationsContainer.appendChild(textBlock);
        const index = allBlocks.indexOf(block);
        setTimeout(() => {
          textBlock.style.transition = "opacity 0.3s ease, transform 0.3s ease, background-color 0.2s ease";
          textBlock.style.opacity = "1";
          textBlock.style.transform = "translateX(0)";
        }, index * 50);
      });
      sortedRightBlocks.forEach((block) => {
        const textBlock = document.createElement("div");
        textBlock.innerText = block.text;
        textBlock.style.width = "fit-content";
        textBlock.style.maxWidth = "90%";
        textBlock.style.marginBottom = "12px";
        textBlock.style.marginLeft = "auto";
        textBlock.style.marginRight = "0";
        textBlock.style.backgroundColor = "rgba(40, 40, 40, 0.8)";
        textBlock.style.color = "#fff";
        textBlock.style.padding = "12px 14px";
        textBlock.style.borderRadius = "8px";
        textBlock.style.fontSize = "15px";
        textBlock.style.lineHeight = "1.6";
        textBlock.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.2)";
        textBlock.style.border = "1px solid rgba(255, 255, 255, 0.1)";
        textBlock.style.borderRight = "3px solid rgba(33, 150, 243, 0.6)";
        textBlock.style.wordWrap = "break-word";
        textBlock.style.textAlign = "right";
        textBlock.style.transition = "background-color 0.2s ease";
        textBlock.style.opacity = "0";
        textBlock.style.transform = "translateX(10px)";
        translationsContainer.appendChild(textBlock);
        const index = allBlocks.indexOf(block);
        setTimeout(() => {
          textBlock.style.transition = "opacity 0.3s ease, transform 0.3s ease, background-color 0.2s ease";
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
        translationsContainer.style.display = "block";
        controlPanel.style.display = "flex";
      } catch (e) {
        console.error(e);
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
    mainImage.onclick = () => {
      if (translateBtn.innerText === "翻译当前" && !translateBtn.disabled) {
        doTranslate();
        return;
      }
      const isVisible = translationsContainer.style.display === "block";
      if (isVisible) {
        translationsContainer.style.opacity = "0";
        translationsContainer.style.transform = "translateY(20px)";
        setTimeout(() => {
          translationsContainer.style.display = "none";
          controlPanel.style.display = "none";
        }, 300);
      } else {
        translationsContainer.style.display = "block";
        translationsContainer.style.opacity = "0";
        translationsContainer.style.transform = "translateY(20px)";
        controlPanel.style.display = "flex";
        setTimeout(() => {
          translationsContainer.style.transition = "opacity 0.3s ease, transform 0.3s ease";
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
  function extractImages() {
    let images = Array.from(
      document.querySelectorAll("ignore_js_op img")
    );
    if (images.length === 0) {
      images = Array.from(
        document.querySelectorAll(".message a img")
      );
    }
    console.debug("[Reader] Extracted images:", images);
    const uniqueSrcs = new Set();
    const validImages = [];
    images.forEach((img) => {
      const src = img.getAttribute("file") || img.src;
      if (!src || uniqueSrcs.has(src)) {
        return;
      }
      uniqueSrcs.add(src);
      validImages.push({
        src,
        originalElement: img
      });
    });
    return validImages;
  }
  function showReaderMode() {
    if (document.getElementById("vtranslate-reader")) return;
    const images = extractImages();
    if (images.length === 0) {
      alert("No suitable images found for Reader Mode.");
      return;
    }
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      showMobileReader(images);
    } else {
      showDesktopReader(images);
    }
  }
  function addReaderButton() {
    const icon = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
        </svg>
    `;
    createFloatingButton(icon, showReaderMode, "78px");
  }
  console.log("[VTranslate] started.");
  addSettingsButton();
  addReaderButton();

})();