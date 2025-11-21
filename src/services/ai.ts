import { config } from "./config";

export interface TranslationBlock {
    text: string;
    y: number; // y-axis position as percentage (0-100)
    side: "left" | "right";
}

export interface TranslationResult {
    blocks: TranslationBlock[];
}

export class TranslationError extends Error {
    constructor(
        message: string,
        public readonly userMessage: string,
        public readonly statusCode?: number,
        public readonly details?: string
    ) {
        super(message);
        this.name = "TranslationError";
    }
}

/**
 * Translates an image using an AI service.
 * @param imageBase64 Base64-encoded image (data URL format).
 * @param context Optional context information (e.g., page title) to help with translation.
 * @returns Translation result with positioned blocks.
 */
export async function translateImage(
    imageBase64: string,
    context?: string
): Promise<TranslationResult> {
    console.debug("[AI] Starting translation request.");

    const endpoint =
        config.endpoint || "https://ai.tnzzz.top/v1/chat/completions";
    const apiKey = config.apiKey || "sk-34c3d7f7f0cc4417b6db3939accbb147";
    const model = config.model || "Manga";
    const temperature = config.temperature ?? 1.2;

    // Construct the request payload
    const payload = {
        model: model,
        messages: [
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        text: `请将图片中的所有文本翻译成简体中文。
${
    context
        ? `\n上下文信息：${context}\n请参考这个上下文来帮助理解和翻译图片内容。\n`
        : ""
}
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

请分析图片中每个文本块的位置，并按照从上到下的顺序返回所有翻译。只返回JSON，不要添加任何其他内容。`,
                    },
                    {
                        type: "image_url",
                        image_url: {
                            url: imageBase64,
                        },
                    },
                ],
            },
        ],
        temperature: temperature,
    };

    console.debug("[AI] Request payload constructed:", {
        endpoint,
        model,
        temperature,
        imageLength: imageBase64.length,
    });

    // Make the API request
    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error("[AI] API request failed:", errorText);

        let userMessage = "翻译请求失败";
        let details = errorText;

        // Parse error details if possible
        try {
            const errorData = JSON.parse(errorText);
            details =
                errorData.error?.message || errorData.message || errorText;
        } catch {
            // Keep original error text
        }

        // Provide user-friendly messages based on status code
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
            undefined,
            JSON.stringify(data)
        );
    }

    // Parse JSON response
    try {
        // Remove markdown code blocks if present
        let jsonStr = content.trim();
        if (jsonStr.startsWith("```json")) {
            jsonStr = jsonStr.replace(/```json\n?/g, "").replace(/```\n?/g, "");
        } else if (jsonStr.startsWith("```")) {
            jsonStr = jsonStr.replace(/```\n?/g, "");
        }

        const result: TranslationResult = JSON.parse(jsonStr);

        if (!result.blocks || !Array.isArray(result.blocks)) {
            throw new TranslationError(
                "Invalid JSON structure: missing blocks array",
                "AI返回的数据格式不正确",
                undefined,
                `返回内容: ${jsonStr.substring(0, 200)}...`
            );
        }

        return result;
    } catch (e) {
        console.error("[AI] Failed to parse JSON response:", content, e);

        // If it's already a TranslationError, rethrow it
        if (e instanceof TranslationError) {
            throw e;
        }

        throw new TranslationError(
            `Failed to parse AI response as JSON: ${e}`,
            "无法解析AI返回的翻译结果",
            undefined,
            `返回内容: ${content.substring(0, 200)}...`
        );
    }
}
