/**
 * Normal-mode chat → minimize animation probe (chat visibility + motion).
 * Run: node scripts/test-minimize-animation.mjs
 */
import { chromium } from 'playwright';

const URL = 'http://localhost:5174/';
const VIEWPORT = { width: 1280, height: 800 };

async function readState(page) {
    return page.evaluate(() => {
        const interaction = document.querySelector('.hero-interaction');
        const chat = document.querySelector('.hero-chat');
        const form = document.querySelector('.hero-interaction__form');
        const interactionRect = interaction?.getBoundingClientRect();
        const chatRect = chat?.getBoundingClientRect();
        const chatStyle = chat ? getComputedStyle(chat) : null;
        const formStyle = form ? getComputedStyle(form) : null;

        return {
            interaction: interactionRect
                ? {
                      top: Math.round(interactionRect.top),
                      left: Math.round(interactionRect.left),
                      width: Math.round(interactionRect.width),
                      height: Math.round(interactionRect.height),
                  }
                : null,
            chat: chatRect
                ? {
                      top: Math.round(chatRect.top),
                      left: Math.round(chatRect.left),
                      width: Math.round(chatRect.width),
                      height: Math.round(chatRect.height),
                  }
                : null,
            chatVisible:
                !!chat &&
                chatStyle.visibility !== 'hidden' &&
                chatStyle.opacity !== '0' &&
                chatRect.width > 0 &&
                chatRect.height > 0,
            chatHiddenClass: interaction?.classList.contains('hero-interaction--minimize-chat-hidden'),
            chatScale: chat ? getComputedStyle(chat).transform : null,
            formVisible:
                !!form &&
                formStyle.visibility !== 'hidden' &&
                formStyle.opacity !== '0',
            classes: interaction?.className || '',
        };
    });
}

async function expandToNormal(page) {
    await page.evaluate(() => sessionStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });
    await page.locator('.hero-chat__minimized-trigger').click();
    await page.waitForTimeout(1100);
}

async function main() {
    let me = process.argv[2] || 'normal';

    let browser;
    try {
        browser = await chromium.launch({ headless: true, channel: 'msedge' });
    } catch {
        browser = await chromium.launch({ headless: true });
    }

    const page = await browser.newPage({ viewport: VIEWPORT });
    await page.goto(URL, { waitUntil: 'networkidle' });
    await expandToNormal(page);

    if (me === 'docked') {
        await page.locator('.hero-chat__header-actions--overlay .hero-chat__header-btn[title="Dock"]').click();
        await page.waitForTimeout(1100);
    }

    const preMinimize = await readState(page);
    console.log('PRE-MINIMIZE:', JSON.stringify(preMinimize, null, 2));

    const minimizeBtn = page.locator(
        me === 'docked'
            ? '.hero-chat__header .hero-chat__header-btn[title="Minimize"]'
            : '.hero-chat__header-actions--overlay .hero-chat__header-btn[title="Minimize"]'
    );
    await minimizeBtn.click();

    const samples = [];
    const clickAt = Date.now();
    for (let i = 0; i < 28; i += 1) {
        samples.push({
            msAfterClick: Date.now() - clickAt,
            ...(await readState(page)),
        });
        await page.waitForTimeout(35);
    }

    const animSamples = samples.filter((s) => s.msAfterClick < 950);
    const chatVisibleSamples = animSamples.filter((s) => s.chatVisible).length;
    const formVisibleSamples = animSamples.filter((s) => s.formVisible).length;
    const first = animSamples[0] || samples[0];
    const last = animSamples[animSamples.length - 1] || samples[samples.length - 1];
    const maxDeltaWidth = Math.max(
        ...animSamples.map((s) => Math.abs((s.interaction?.width || 0) - (first.interaction?.width || 0)))
    );

    const midSamples = animSamples.filter((s) => s.msAfterClick >= 300 && s.msAfterClick <= 550);
    const landingSamples = animSamples.filter((s) => s.msAfterClick >= 750);
    const chatShrinksSmoothly =
        midSamples.length >= 3 &&
        midSamples.every((s) => s.chatVisible) &&
        (midSamples[midSamples.length - 1].chat?.width || 999) <
            (midSamples[0].chat?.width || 0);
    const chatHiddenAtLanding = landingSamples.every(
        (s) => !s.chatVisible || (s.chat?.width || 999) <= 36
    );

    console.log('\nCHAT VISIBLE SAMPLES (during anim):', `${chatVisibleSamples}/${animSamples.length}`);
    console.log('FORM VISIBLE SAMPLES (during anim):', `${formVisibleSamples}/${animSamples.length}`);
    console.log('MAX WIDTH DELTA:', maxDeltaWidth);
    console.log('FIRST:', JSON.stringify(first));
    console.log('LAST:', JSON.stringify(last));

    const pass =
        chatShrinksSmoothly &&
        chatHiddenAtLanding &&
        formVisibleSamples >= animSamples.length * 0.9 &&
        maxDeltaWidth > 80;

    console.log(`\nRESULT (${me}): ${pass ? 'PASS' : 'FAIL'}`);

    await browser.close();
    process.exit(pass ? 0 : 1);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
