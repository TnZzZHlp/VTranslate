import { createFloatingButton } from "./ui";
import { ReaderImage } from "./reader_types";
import { showDesktopReader } from "./reader_desktop";
import { showMobileReader } from "./reader_mobile";

/**
 * Extracts images from the page, prioritizing 'file' attribute and filtering small images.
 */
function extractImages(): ReaderImage[] {
    // 桌面端
    let images = Array.from(
        document.querySelectorAll("ignore_js_op img")
    ) as HTMLImageElement[];

    // 手机端
    if (images.length === 0) {
        images = Array.from(
            document.querySelectorAll(".message a img")
        ) as HTMLImageElement[];
    }

    console.debug("[Reader] Extracted images:", images);

    const uniqueSrcs = new Set<string>();
    const validImages: ReaderImage[] = [];

    images.forEach((img) => {
        const src = img.getAttribute("file") || img.src;

        if (!src || uniqueSrcs.has(src)) {
            return;
        }

        uniqueSrcs.add(src);
        validImages.push({
            src: src,
            originalElement: img,
        });
    });

    return validImages;
}

/**
 * Shows the Reader Mode UI (Split Screen with Overlay Translations).
 */
export function showReaderMode() {
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

/**
 * Adds a floating reader button to the page.
 */
export function addReaderButton() {
    const icon = `
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
        </svg>
    `;
    // Place it above the settings button (20px + 48px + 10px gap = 78px)
    createFloatingButton(icon, showReaderMode, "78px");
}
