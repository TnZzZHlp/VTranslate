import { translateText } from "./services/trasnlate";

export function addButton() {
    let imgs = document.querySelectorAll<HTMLImageElement>("ignore_js_op img");

    imgs.forEach((img) => {
        // 如果已经处理过，跳过
        if (
            img.parentElement?.classList.contains("vtranslate-img-wrapper") ||
            img.closest(".vtranslate-img-wrapper")
        ) {
            return;
        }

        const parent = img.parentElement; // 必存在于 DOM 中
        if (!parent) return;

        // 获取图片的位置
        const rect = img.getBoundingClientRect();

        // 创建按钮元素并定位到右上角
        let button = document.createElement("button");
        button.innerText = "Translate";
        button.style.position = "absolute";
        button.style.top = `${rect.top + 6}px`; // 与图片顶部留一定间距
        button.style.right = `${window.innerWidth - rect.right - 6}px`; // 与图片右侧留一定间距
        button.style.zIndex = "1000";
        button.style.padding = "4px 8px";
        button.style.fontSize = "12px";
        // 小样式美化：圆角与半透明背景
        button.style.borderRadius = "4px";
        button.style.background = "rgba(0,0,0,0.6)";
        button.style.color = "#fff";
        button.style.border = "none";
        button.style.cursor = "pointer";
        parent.appendChild(button);

        console.debug("[Panel] Button added to top-right of image.", button);

        // 按钮点击事件
        button.addEventListener("click", () => {
            console.debug("[Panel] Translate button clicked.", img);
            translateText(img);
        });
    });
}
