console.log("[VTranslate] started.");

import { config } from "./services/config.js";
import { addButton } from "./panel.js";
import { addSettingsButton } from "./services/ui.js";

// 示例：读取配置
console.log("Current API Key:", config.apiKey);

addButton();
addSettingsButton();
