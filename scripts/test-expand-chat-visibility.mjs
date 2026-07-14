/**
 * Probe hero-chat visibility during minimize → normal restore expand.
 */
import { chromium } from 'playwright';

const URL = 'http://localhost:5174/';

async function readChat(page) {
    return page.evaluate(() => {
        const chat = document.querySelector('.hero-chat');
        const interaction = document.querySelector('.hero-interaction');
        const styles = chat ? getComputedStyle(chat) : null;
        const rect = chat?.getBoundingClientRect();

        return {
            hasChat: !!chat,
            classes: chat?.className || '',
            rect: rect
                ? {
                      w: Math.round(rect.width),
                      h: Math.round(rect.height),
                      top: Math.round(rect.top),
                      left: Math.round(rect.left),
                  }
                : null,
            computed: styles
                ? {
                      visibility: styles.visibility,
                      opacity: styles.opacity,
                      transform: styles.transform,
                      display: styles.display,
                  }
                : null,
            inline: chat
                ? {
                      transform: chat.style.transform,
                      opacity: chat.style.opacity,
                      width: chat.style.width,
                      height: chat.style.height,
                  }
                : null,
            interactionClasses: interaction?.className || '',
            panelRect: interaction
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

    const fromNormalMinimize = process.argv.includes('--from-normal');

    if (fromNormalMinimize) {
        await page.fill('.hero-interaction__input', 'hello');
        await page.keyboard.press('Enter');
        await page.waitForTimeout(3000);
        await page.locator('.hero-chat__header-actions--overlay button[aria-label="Minimize"]').click();
        await page.waitForTimeout(1200);
    }

    await page.locator('.hero-chat__minimized-trigger').click();

    const samples = [];
    for (let i = 0; i < 20; i += 1) {
        samples.push({ ms: i * 50, ...(await readChat(page)) });
        await page.waitForTimeout(50);
    }

    console.log('EXPAND CHAT TIMELINE:');
    for (const s of samples) {
        console.log(
            `+${String(s.ms).padStart(4)}ms chat=${s.hasChat} revealed=${s.classes.includes('hero-chat--revealed')} rect=${JSON.stringify(s.rect)} transform=${s.computed?.transform?.slice(0, 40)} panel=${JSON.stringify(s.panelRect)}`
        );
    }

    const mid = samples[8];
    const last = samples[samples.length - 1];
    const midVisible = mid.hasChat && mid.rect && mid.rect.w > 80 && mid.rect.h > 40;
    const lastVisible = last.hasChat && last.rect && last.rect.w > 200;

    console.log(`\nMID ANIM VISIBLE (w>80): ${midVisible}`, mid);
    console.log(`LANDING VISIBLE: ${lastVisible}`, last);

    await browser.close();
    process.exit(midVisible ? 0 : 1);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
