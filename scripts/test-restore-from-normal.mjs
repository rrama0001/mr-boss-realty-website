/**
 * Minimize from normal → restore landing probe.
 */
import { chromium } from 'playwright';

const URL = 'http://localhost:5174/';

async function readLandingState(page) {
    return page.evaluate(() => {
        const interaction = document.querySelector('.hero-interaction');
        const chat = document.querySelector('.hero-chat');
        const overlay = document.querySelector('.hero-chat__header-actions--overlay');
        const chatStyle = chat ? getComputedStyle(chat) : null;
        const interactionStyle = interaction ? getComputedStyle(interaction) : null;

        return {
            interactionClasses: interaction?.className || '',
            hasChat: !!chat,
            chatVisible:
                chatStyle &&
                chatStyle.visibility !== 'hidden' &&
                parseFloat(chatStyle.opacity || '1') > 0.05 &&
                chat.getBoundingClientRect().height > 10,
            chatRect: chat
                ? {
                      w: Math.round(chat.getBoundingClientRect().width),
                      h: Math.round(chat.getBoundingClientRect().height),
                  }
                : null,
            chatInline: chat
                ? {
                      transform: chat.style.transform,
                      opacity: chat.style.opacity,
                      height: chat.style.height,
                      width: chat.style.width,
                  }
                : null,
            chatComputed: chatStyle
                ? {
                      visibility: chatStyle.visibility,
                      opacity: chatStyle.opacity,
                      transform: chatStyle.transform,
                      position: chatStyle.position,
                  }
                : null,
            hasOverlay: !!overlay,
            overlayVisible: overlay ? getComputedStyle(overlay).display !== 'none' : false,
            interactionPosition: interactionStyle?.position,
            interactionRect: interaction
                ? {
                      w: Math.round(interaction.getBoundingClientRect().width),
                      h: Math.round(interaction.getBoundingClientRect().height),
                  }
                : null,
        };
    });
}

async function main() {
    let browser;
    try {
        browser = await chromium.launch({ headless: true, channel: 'msedge' });
    } catch {
        browser = await chromium.launch({ headless: true });
    }

    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    await page.goto(URL, { waitUntil: 'networkidle' });
    await page.evaluate(() => sessionStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });

    await page.fill('.hero-interaction__input', 'hello');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);

    const beforeMin = await readLandingState(page);
    console.log('BEFORE MIN:', JSON.stringify(beforeMin, null, 2));

    const minBtn = page.locator('.hero-chat__header-actions--overlay button[aria-label="Minimize"]');
    await minBtn.waitFor({ state: 'visible', timeout: 5000 });
    await minBtn.click();
    await page.waitForTimeout(1200);

    const afterMin = await readLandingState(page);
    console.log('AFTER MIN:', JSON.stringify(afterMin, null, 2));

    await page.locator('.hero-chat__minimized-trigger').click();

    const samples = [];
    for (let i = 0; i < 25; i += 1) {
        samples.push({ ms: i * 80, ...(await readLandingState(page)) });
        await page.waitForTimeout(80);
    }

    const last = samples[samples.length - 1];
    console.log('AFTER RESTORE (final):', JSON.stringify(last, null, 2));

    console.log('\nTIMELINE (chat + overlay):');
    for (const s of samples.filter((_, i) => i % 3 === 0 || i === samples.length - 1)) {
        console.log(
            `  +${String(s.ms).padStart(4)}ms chat=${s.hasChat}/${s.chatVisible} overlay=${s.hasOverlay}/${s.overlayVisible} classes=${s.interactionClasses}`
        );
    }

    const pass = last.hasChat && last.chatVisible && last.hasOverlay && last.overlayVisible;
    console.log(`\nRESULT: ${pass ? 'PASS' : 'FAIL'}`);

    await browser.close();
    process.exit(pass ? 0 : 1);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
