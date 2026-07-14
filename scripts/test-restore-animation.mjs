/**
 * First-load minimized orb → normal restore animation probe.
 * Run: node scripts/test-restore-animation.mjs
 */
import { chromium } from 'playwright';

const URL = 'http://localhost:5174/';
const VIEWPORT = { width: 1280, height: 800 };

function summarize(samples) {
    if (!samples.length) return { count: 0, animated: false };

    const first = samples[0];
    const last = samples[samples.length - 1];
    const maxDeltaTop = Math.max(...samples.map((s) => Math.abs(s.top - first.top)));
    const maxDeltaLeft = Math.max(...samples.map((s) => Math.abs(s.left - first.left)));
    const maxDeltaWidth = Math.max(...samples.map((s) => Math.abs(s.width - first.width)));

    return {
        count: samples.length,
        first,
        last,
        maxDeltaTop: Math.round(maxDeltaTop),
        maxDeltaLeft: Math.round(maxDeltaLeft),
        maxDeltaWidth: Math.round(maxDeltaWidth),
        animated: maxDeltaTop > 40 || maxDeltaLeft > 40 || maxDeltaWidth > 80,
    };
}

async function readRects(page) {
    return page.evaluate(() => {
        const interaction = document.querySelector('.hero-interaction');
        const orb = document.querySelector('.hero-chat__orb');
        const trigger = document.querySelector('.hero-chat__minimized-trigger');
        const chat = document.querySelector('.hero-chat');

        const interactionRect = interaction?.getBoundingClientRect();
        const orbRect = orb?.getBoundingClientRect();
        const orbStyle = orb ? getComputedStyle(orb) : null;
        const anims = interaction
            ? [...interaction.getAnimations()].map((a) => ({
                  playState: a.playState,
                  currentTime: a.currentTime,
                  progress: a.effect?.getComputedTiming?.()?.progress ?? null,
              }))
            : [];

        return {
            interaction: interactionRect
                ? {
                      top: Math.round(interactionRect.top),
                      left: Math.round(interactionRect.left),
                      width: Math.round(interactionRect.width),
                      height: Math.round(interactionRect.height),
                  }
                : null,
            orb: orbRect
                ? {
                      top: Math.round(orbRect.top),
                      left: Math.round(orbRect.left),
                      width: Math.round(orbRect.width),
                      height: Math.round(orbRect.height),
                  }
                : null,
            orbStyle: orbStyle
                ? {
                      position: orbStyle.position,
                      display: orbStyle.display,
                      visibility: orbStyle.visibility,
                      top: orbStyle.top,
                      left: orbStyle.left,
                  }
                : null,
            triggerVisible: !!trigger && getComputedStyle(trigger).display !== 'none',
            chatVisible: !!chat && getComputedStyle(chat).visibility !== 'hidden',
            classes: interaction?.className || '',
            anims,
        };
    });
}

async function main() {
    let browser;
    try {
        browser = await chromium.launch({ headless: true, channel: 'msedge' });
    } catch {
        try {
            browser = await chromium.launch({ headless: true, channel: 'chrome' });
        } catch {
            browser = await chromium.launch({ headless: true });
        }
    }

    const page = await browser.newPage({ viewport: VIEWPORT });
    await page.goto(URL, { waitUntil: 'networkidle' });
    await page.evaluate(() => sessionStorage.clear());
    await page.reload({ waitUntil: 'networkidle' });

    const trigger = page.locator('.hero-chat__minimized-trigger');
    await trigger.waitFor({ state: 'visible', timeout: 10000 });

    const preClick = await page.evaluate(() => {
        const triggerEl = document.querySelector('.hero-chat__minimized-trigger');
        const content = document.querySelector('.home-hero__content');
        const triggerRect = triggerEl?.getBoundingClientRect();

        const probe = document.createElement('div');
        probe.style.cssText =
            'position:absolute;visibility:hidden;width:var(--hero-normal-chat-width);top:var(--hero-normal-chat-top)';
        content?.appendChild(probe);
        const probeStyle = getComputedStyle(probe);
        const targetWidth = parseFloat(probeStyle.width) || 0;
        const targetTop = parseFloat(probeStyle.top) || 0;
        content?.removeChild(probe);

        const contentRect = content?.getBoundingClientRect();
        const targetLeft = contentRect
            ? contentRect.left + (contentRect.width - targetWidth) / 2
            : 0;

        return {
            trigger: triggerRect
                ? {
                      top: Math.round(triggerRect.top),
                      left: Math.round(triggerRect.left),
                      width: Math.round(triggerRect.width),
                      height: Math.round(triggerRect.height),
                  }
                : null,
            target: {
                top: contentRect ? Math.round(contentRect.top + targetTop) : 0,
                left: Math.round(targetLeft),
                width: Math.round(targetWidth),
            },
        };
    });

    console.log('PRE-CLICK:', JSON.stringify(preClick, null, 2));

    const samples = [];
    const clickAt = Date.now();
    await trigger.click();

    for (let i = 0; i < 30; i += 1) {
        const sample = await readRects(page);
        samples.push({
            msAfterClick: Date.now() - clickAt,
            ...sample,
        });
        await page.waitForTimeout(35);
    }

    const interactionSamples = samples.map((s) => s.interaction).filter(Boolean);
    const orbSamples = samples.map((s) => s.orb).filter(Boolean);

    const interactionSummary = summarize(interactionSamples);
    const orbSummary = summarize(orbSamples);

    const first = samples[0];
    const startsNearTrigger =
        first.interaction &&
        Math.abs(first.interaction.top - preClick.trigger.top) < 80 &&
        Math.abs(first.interaction.left - preClick.trigger.left) < 80;

    const endsNearTarget =
        interactionSummary.last &&
        Math.abs(interactionSummary.last.top - preClick.target.top) < 80 &&
        Math.abs(interactionSummary.last.left - preClick.target.left) < 80;

    console.log('\nSTARTS NEAR TRIGGER:', startsNearTrigger, first.interaction);
    console.log('ENDS NEAR TARGET:', endsNearTarget, interactionSummary.last);
    console.log('INTERACTION MOTION:', JSON.stringify(interactionSummary, null, 2));
    console.log('ORB MOTION:', JSON.stringify(orbSummary, null, 2));

    console.log('\nTIMELINE:');
    for (const s of samples.filter((_, i) => i % 3 === 0 || i === samples.length - 1)) {
        console.log(
            `  +${String(s.msAfterClick).padStart(4)}ms panel=${JSON.stringify(s.interaction)} orb=${JSON.stringify(s.orb)} orbStyle=${JSON.stringify(s.orbStyle)} anims=${s.anims.length}`
        );
    }

    const pass =
        startsNearTrigger &&
        endsNearTarget &&
        (interactionSummary.animated || orbSummary.animated);

    console.log(`\nRESULT: ${pass ? 'PASS' : 'FAIL'}`);

    await browser.close();
    process.exit(pass ? 0 : 1);
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
