import { GM_getValue, GM_setValue } from "$";

export interface Config {
    apiKey: string;
    endpoint: string;
    model: string;
    temperature: number;
    qpm?: number;
}

const CONFIG_STORAGE_KEY = "vtranslate_config";

// 创建并导出代理配置对象
export const config = new Proxy({} as Config, {
    get: (target: Config, prop: string | symbol) => {
        console.log(`[Config] Reading property: ${String(prop)}`);

        // 从存储中加载当前配置
        const storedConfig = GM_getValue<Config>(CONFIG_STORAGE_KEY);

        Object.assign(target, storedConfig);

        // 检查属性是否存在
        if (prop in target) {
            const value = target[prop as keyof Config];
            console.log(`[Config] Value for ${String(prop)}:`, value);
            return value;
        }

        // 如果属性不存在，返回 undefined
        console.warn(`[Config] Property ${String(prop)} not found`);
        return undefined;
    },

    set: (target: Config, prop: string | symbol, value: any): boolean => {
        GM_setValue(CONFIG_STORAGE_KEY, { ...target, [prop as string]: value });

        Object.assign(target, { [prop as string]: value });

        console.log(`[Config] Setting property: ${String(prop)} to`, value);

        return true;
    },

    has: (target: Config, prop: string | symbol): boolean => {
        return prop in target;
    },

    deleteProperty: (_target: Config, prop: string | symbol): boolean => {
        console.warn(
            `[Config] Deleting property is not allowed: ${String(prop)}`
        );
        return false;
    },
});
