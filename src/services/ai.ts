import { config } from "./config";

interface ChatCompletionRequest {
    model: string;
    messages: {
        role: string;
        content: string | { type: string; text?: string; image_url?: { url: string } }[];
    }[];
    temperature?: number;
}

interface ChatCompletionResponse {
    choices: {
        message: {
            content: string;
        };
    }[];
}

export async function translateImage(imageBase64: string): Promise<string> {
    if (!config.apiKey) {
        throw new Error("API Key is missing. Please configure it in the script settings.");
    }

    const endpoint = config.endpoint || "https://ai.tnzzz.top/v1/chat/completions";
    const model = config.model || "Manga";
    const apiKey = config.apiKey || "sk-34c3d7f7f0cc4417b6db3939accbb147";

    const payload: ChatCompletionRequest = {
        model: model,
        messages: [
            {
                role: "user",
                content: [
                    {
                        type: "text",
                        text: "Please translate the text in this image to Simplified Chinese. Output only the translated text, without any explanation or extra characters. If there are multiple blocks of text, separate them with newlines."
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
        temperature: config.temperature ?? 0.7
    };

    try {
        console.debug("[AI] Sending request to:", endpoint);
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const data: ChatCompletionResponse = await response.json();
        const content = data.choices[0]?.message?.content;

        if (!content) {
            throw new Error("No content received from AI.");
        }

        return content;
    } catch (error) {
        console.error("[AI] Translation failed:", error);
        throw error;
    }
}
