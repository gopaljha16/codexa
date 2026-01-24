import { useEffect, useRef, useState } from "react";

/**
 * Typewriter effect that can animate as text grows (e.g., during streaming).
 * - Appends characters at a controlled pace (default ~30ms per char)
 * - If `skip` becomes true, it finishes instantly
 * - Remains non-blocking and updates smoothly via timeouts
 */
export default function useTypewriterEffect(targetText, options = {}) {
    const {
        enabled = true,
        speedMs = 30, // per-character delay
        step = "char", // future: "word" support
        skip = false,
    } = options;

    const [displayedText, setDisplayedText] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const timeoutRef = useRef(null);
    const lastTargetRef = useRef("");

    // Clear timeout on unmount or option change
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    // If skip requested, finish immediately
    useEffect(() => {
        if (!enabled) return;
        if (skip) {
            setDisplayedText(targetText || "");
            setIsTyping(false);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        }
    }, [skip, targetText, enabled]);

    // Animate towards targetText as it grows
    useEffect(() => {
        if (!enabled) {
            setDisplayedText(targetText || "");
            setIsTyping(false);
            return;
        }

        // If target changed backwards (e.g., reset), sync immediately
        if ((targetText || "").length < displayedText.length) {
            setDisplayedText(targetText || "");
        }

        if (skip) return;

        const typeNext = () => {
            if (skip) return; // re-check
            const current = displayedText;
            const target = targetText || "";
            if (current === target) {
                setIsTyping(false);
                return;
            }

            setIsTyping(true);
            const nextIndex = current.length + 1;
            const nextText = target.slice(0, nextIndex);
            setDisplayedText(nextText);

            // Randomize a bit to feel natural within 20-40ms range
            const base = speedMs;
            const jitter = Math.floor(Math.random() * 20); // 0-19ms
            const delay = Math.max(10, Math.min(40, base + jitter - 10));
            timeoutRef.current = setTimeout(typeNext, delay);
        };

        // Start typing if behind target
        if ((targetText || "").length > (displayedText || "").length) {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(typeNext, speedMs);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [targetText, displayedText, enabled, speedMs, skip]);

    // When the target text reference changes drastically (e.g., new message), ensure we start animating
    useEffect(() => {
        if (lastTargetRef.current !== targetText) {
            lastTargetRef.current = targetText;
            if (!skip && enabled) {
                setIsTyping(true);
            }
        }
    }, [targetText, enabled, skip]);

    const finish = () => {
        setDisplayedText(targetText || "");
        setIsTyping(false);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };

    return { displayedText, isTyping, finish };
}


