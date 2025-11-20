import { config } from "./config";

export interface TranslationBlock {
    text: string;
    y: number; // y-axis position as percentage (0-100)
    side: "left" | "right";
}

export interface TranslationResult {
    blocks: TranslationBlock[];
}

/**
 * Translates an image using an AI service.
 * @param imageBase64 Base64-encoded image (data URL format).
 * @returns Translation result with positioned blocks.
 */
export async function translateImage(imageBase64: string): Promise<TranslationResult> {
    console.debug("[AI] Starting translation request.");

    // Validate configuration
    if (!config.apiKey) {
        throw new Error("API Key is missing. Please configure it.");
    }
    if (!config.endpoint) {
        throw new Error("API Endpoint is missing. Please configure it.");
    }

    const endpoint = config.endpoint;
    const apiKey = config.apiKey;
    const model = config.model || "Manga";
    const temperature = config.temperature ?? 0.3;

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
        throw new Error(`API request failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    console.debug("[AI] API response received:", data);

    const content = data.choices?.[0]?.message?.content || "";
    if (!content) {
        throw new Error("No content in API response.");
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
            throw new Error("Invalid JSON structure: missing blocks array");
        }

        return result;
    } catch (e) {
        console.error("[AI] Failed to parse JSON response:", content, e);
        throw new Error(`Failed to parse AI response as JSON: ${e}`);
    }
}
