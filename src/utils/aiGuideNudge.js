export const AI_GUIDE_NUDGE_IDLE_MS = 120000;
export const AI_GUIDE_NUDGE_DISMISSED_KEY = 'mrboss-ai-guide-nudge-dismissed';

export function isAiGuideNudgeDismissed() {
    try {
        return sessionStorage.getItem(AI_GUIDE_NUDGE_DISMISSED_KEY) === '1';
    } catch {
        return false;
    }
}

export function dismissAiGuideNudge() {
    try {
        sessionStorage.setItem(AI_GUIDE_NUDGE_DISMISSED_KEY, '1');
    } catch {
        // ignore storage errors
    }
}
