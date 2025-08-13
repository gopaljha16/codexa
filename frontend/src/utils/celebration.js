import confetti from "canvas-confetti";

/**
 * Triggers a single celebratory burst of confetti.
 * Non-blocking and safe to call from any UI event.
 */
export const celebrateSuccess = () => {
    if (typeof window === "undefined") return;
    confetti({
        particleCount: 120,
        spread: 75,
        startVelocity: 45,
        scalar: 1,
        origin: { y: 0.6 },
    });
};

/**
 * Runs bursts from both the left and right sides for 2 seconds.
 * Uses requestAnimationFrame to avoid blocking UI updates.
 */
export const fullCelebration = (durationMs = 2000) => {
    if (typeof window === "undefined") return;
    const endTime = Date.now() + durationMs;

    const frame = () => {
        // Left side
        confetti({
            particleCount: 6,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.7 },
        });
        // Right side
        confetti({
            particleCount: 6,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.7 },
        });

        if (Date.now() < endTime) {
            requestAnimationFrame(frame);
        }
    };

    requestAnimationFrame(frame);
};


