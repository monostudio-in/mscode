
import { ThemeIcon } from '../../../common/themables.js';
import { getWindow, $ } from '../../dom.js';

var ClickAnimation;
(function (ClickAnimation) {
    ClickAnimation[ClickAnimation["Confetti"] = 1] = "Confetti";
    ClickAnimation[ClickAnimation["FloatingIcons"] = 2] = "FloatingIcons";
    ClickAnimation[ClickAnimation["PulseWave"] = 3] = "PulseWave";
    ClickAnimation[ClickAnimation["RadiantLines"] = 4] = "RadiantLines";
})(ClickAnimation || (ClickAnimation = {}));
const confettiColors = [
    '#007acc',
    '#005a9e',
    '#0098ff',
    '#4fc3f7',
    '#64b5f6',
    '#42a5f5',
];
let activeOverlay;
function createOverlay(element) {
    if (activeOverlay) {
        return undefined;
    }
    const rect = element.getBoundingClientRect();
    const ownerDocument = getWindow(element).document;
    const overlay = $('.animation-overlay');
    overlay.style.position = 'fixed';
    overlay.style.left = `${rect.left}px`;
    overlay.style.top = `${rect.top}px`;
    overlay.style.width = `${rect.width}px`;
    overlay.style.height = `${rect.height}px`;
    overlay.style.pointerEvents = 'none';
    overlay.style.overflow = 'visible';
    overlay.style.zIndex = '10000';
    ownerDocument.body.appendChild(overlay);
    activeOverlay = overlay;
    return { overlay, cx: rect.width / 2, cy: rect.height / 2 };
}
function cleanupOverlay(duration) {
    setTimeout(() => {
        if (activeOverlay) {
            activeOverlay.remove();
            activeOverlay = undefined;
        }
    }, duration);
}
function bounceElement(element, opts) {
    const frames = [];
    const steps = Math.max(opts.scale?.length ?? 0, opts.rotate?.length ?? 0, opts.translateY?.length ?? 0);
    if (steps === 0) {
        return;
    }
    for (let i = 0; i < steps; i++) {
        const frame = { offset: steps === 1 ? 1 : i / (steps - 1) };
        let transformParts = '';
        const scale = opts.scale?.[i];
        if (scale !== undefined) {
            transformParts += `scale(${scale})`;
        }
        const rotate = opts.rotate?.[i];
        if (rotate !== undefined) {
            transformParts += ` rotate(${rotate}deg)`;
        }
        const translateY = opts.translateY?.[i];
        if (translateY !== undefined) {
            transformParts += ` translateY(${translateY}px)`;
        }
        if (transformParts) {
            frame.transform = transformParts.trim();
        }
        frames.push(frame);
    }
    element.animate(frames, {
        duration: opts.duration ?? 350,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        fill: 'forwards',
    });
}
function triggerConfettiAnimation(element) {
    const result = createOverlay(element);
    if (!result) {
        return;
    }
    const { overlay, cx, cy } = result;
    const rect = element.getBoundingClientRect();
    bounceElement(element, {
        scale: [1, 1.3, 1],
        rotate: [0, -10, 10, 0],
        duration: 350,
    });
    const particleCount = 10;
    for (let i = 0; i < particleCount; i++) {
        const size = 3 + (i % 3) * 1.5;
        const angle = (i * 36 * Math.PI) / 180;
        const distance = 35;
        const particleOpacity = 0.6 + (i % 4) * 0.1;
        const part = $('.animation-particle');
        part.style.position = 'absolute';
        part.style.width = `${size}px`;
        part.style.height = `${size}px`;
        part.style.borderRadius = '50%';
        part.style.backgroundColor = confettiColors[i % confettiColors.length];
        part.style.left = `${cx - size / 2}px`;
        part.style.top = `${cy - size / 2}px`;
        overlay.appendChild(part);
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        part.animate([
            { opacity: 0, transform: 'scale(0) translate(0, 0)' },
            { opacity: particleOpacity, transform: `scale(1) translate(${tx * 0.5}px, ${ty * 0.5}px)`, offset: 0.3 },
            { opacity: particleOpacity, transform: `scale(1) translate(${tx}px, ${ty}px)`, offset: 0.7 },
            { opacity: 0, transform: `scale(0) translate(${tx}px, ${ty}px)` },
        ], {
            duration: 1100,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            fill: 'forwards',
        });
    }
    const ring = $('.animation-particle');
    ring.style.position = 'absolute';
    ring.style.left = '0';
    ring.style.top = '0';
    ring.style.width = `${rect.width}px`;
    ring.style.height = `${rect.height}px`;
    ring.style.borderRadius = '50%';
    ring.style.border = '2px solid var(--vscode-focusBorder, #007acc)';
    ring.style.boxSizing = 'border-box';
    overlay.appendChild(ring);
    ring.animate([
        { transform: 'scale(1)', opacity: 1 },
        { transform: 'scale(2)', opacity: 0 },
    ], {
        duration: 800,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        fill: 'forwards',
    });
    cleanupOverlay(2000);
}
function triggerFloatingIconsAnimation(element, icon) {
    const result = createOverlay(element);
    if (!result) {
        return;
    }
    const { overlay, cx, cy } = result;
    const rect = element.getBoundingClientRect();
    bounceElement(element, {
        translateY: [0, -6, 0],
        duration: 350,
    });
    const iconCount = 6;
    for (let i = 0; i < iconCount; i++) {
        const size = 12 + (i % 3) * 2;
        const iconEl = $('.animation-particle');
        iconEl.style.position = 'absolute';
        iconEl.style.left = `${cx}px`;
        iconEl.style.top = `${cy}px`;
        iconEl.style.fontSize = `${size}px`;
        iconEl.style.lineHeight = '1';
        iconEl.style.color = 'var(--vscode-focusBorder, #007acc)';
        iconEl.classList.add(...ThemeIcon.asClassNameArray(icon));
        overlay.appendChild(iconEl);
        const driftX = (Math.random() - 0.5) * 50;
        const floatY = -50 - (i % 3) * 10;
        const rotate1 = (Math.random() - 0.5) * 20;
        const rotate2 = (Math.random() - 0.5) * 40;
        iconEl.animate([
            { opacity: 0, transform: `translate(-50%, -50%) scale(0) rotate(${rotate1}deg)` },
            { opacity: 1, transform: `translate(calc(-50% + ${driftX * 0.3}px), calc(-50% + ${floatY * 0.3}px)) scale(1) rotate(${(rotate1 + rotate2) * 0.3}deg)`, offset: 0.3 },
            { opacity: 1, transform: `translate(calc(-50% + ${driftX * 0.7}px), calc(-50% + ${floatY * 0.7}px)) scale(1) rotate(${(rotate1 + rotate2) * 0.7}deg)`, offset: 0.7 },
            { opacity: 0, transform: `translate(calc(-50% + ${driftX}px), calc(-50% + ${floatY}px)) scale(0.8) rotate(${rotate2}deg)` },
        ], {
            duration: 800 + (i % 3) * 200,
            delay: i * 80,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            fill: 'forwards',
        });
    }
    const ring = $('.animation-particle');
    ring.style.position = 'absolute';
    ring.style.left = '0';
    ring.style.top = '0';
    ring.style.width = `${rect.width}px`;
    ring.style.height = `${rect.height}px`;
    ring.style.borderRadius = '50%';
    ring.style.border = '2px solid var(--vscode-focusBorder, #007acc)';
    ring.style.boxSizing = 'border-box';
    overlay.appendChild(ring);
    ring.animate([
        { transform: 'scale(1)', opacity: 1 },
        { transform: 'scale(2)', opacity: 0 },
    ], {
        duration: 500,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        fill: 'forwards',
    });
    cleanupOverlay(2000);
}
function triggerPulseWaveAnimation(element) {
    const result = createOverlay(element);
    if (!result) {
        return;
    }
    const { overlay, cx, cy } = result;
    const rect = element.getBoundingClientRect();
    bounceElement(element, {
        scale: [1, 1.1, 1],
        rotate: [0, -12, 0],
        duration: 400,
    });
    for (let i = 0; i < 2; i++) {
        const ring = $('.animation-particle');
        ring.style.position = 'absolute';
        ring.style.left = '0';
        ring.style.top = '0';
        ring.style.width = `${rect.width}px`;
        ring.style.height = `${rect.height}px`;
        ring.style.borderRadius = '50%';
        ring.style.border = '2px solid var(--vscode-focusBorder, #007acc)';
        ring.style.boxSizing = 'border-box';
        overlay.appendChild(ring);
        ring.animate([
            { transform: 'scale(0.8)', opacity: 0 },
            { transform: 'scale(0.8)', opacity: 0.6, offset: 0.01 },
            { transform: 'scale(2.5)', opacity: 0 },
        ], {
            duration: 800,
            delay: i * 150,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            fill: 'forwards',
        });
    }
    for (let i = 0; i < 6; i++) {
        const angle = (i * 60 * Math.PI) / 180;
        const distance = 30 + (i % 2) * 10;
        const size = 3.5;
        const dot = $('.animation-particle');
        dot.style.position = 'absolute';
        dot.style.width = `${size}px`;
        dot.style.height = `${size}px`;
        dot.style.borderRadius = '50%';
        dot.style.backgroundColor = '#0098ff';
        dot.style.left = `${cx - size / 2}px`;
        dot.style.top = `${cy - size / 2}px`;
        overlay.appendChild(dot);
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        dot.animate([
            { opacity: 0, transform: 'scale(0) translate(0, 0)' },
            { opacity: 1, transform: `scale(1) translate(${tx}px, ${ty}px)`, offset: 0.5 },
            { opacity: 0, transform: `scale(0) translate(${tx}px, ${ty}px)` },
        ], {
            duration: 600,
            delay: 100 + i * 50,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            fill: 'forwards',
        });
    }
    const glow = $('.animation-particle');
    glow.style.position = 'absolute';
    glow.style.left = '0';
    glow.style.top = '0';
    glow.style.width = `${rect.width}px`;
    glow.style.height = `${rect.height}px`;
    glow.style.borderRadius = '50%';
    glow.style.backgroundColor = 'var(--vscode-focusBorder, #007acc)';
    overlay.appendChild(glow);
    glow.animate([
        { transform: 'scale(0.9)', opacity: 0 },
        { transform: 'scale(0.9)', opacity: 0.5, offset: 0.01 },
        { transform: 'scale(1.5)', opacity: 0 },
    ], {
        duration: 500,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        fill: 'forwards',
    });
    cleanupOverlay(2000);
}
function triggerRadiantLinesAnimation(element) {
    const result = createOverlay(element);
    if (!result) {
        return;
    }
    const { overlay, cx, cy } = result;
    bounceElement(element, {
        scale: [1, 1.15, 1],
        duration: 350,
    });
    for (let i = 0; i < 8; i++) {
        const size = 3;
        const dotOpacity = 0.7;
        const angle = ((i * 45 + 22.5) * Math.PI) / 180;
        const startDistance = 14;
        const endDistance = 30;
        const dot = $('.animation-particle');
        dot.style.position = 'absolute';
        dot.style.width = `${size}px`;
        dot.style.height = `${size}px`;
        dot.style.borderRadius = '50%';
        dot.style.backgroundColor = 'var(--vscode-editor-foreground, #ffffff)';
        dot.style.left = `${cx - size / 2}px`;
        dot.style.top = `${cy - size / 2}px`;
        overlay.appendChild(dot);
        const startX = Math.cos(angle) * startDistance;
        const startY = Math.sin(angle) * startDistance;
        const endX = Math.cos(angle) * endDistance;
        const endY = Math.sin(angle) * endDistance;
        dot.animate([
            { opacity: 0, transform: `scale(0) translate(${startX}px, ${startY}px)` },
            { opacity: dotOpacity, transform: `scale(1.2) translate(${(startX + endX) / 2}px, ${(startY + endY) / 2}px)`, offset: 0.25 },
            { opacity: dotOpacity, transform: `scale(1) translate(${endX * 0.8}px, ${endY * 0.8}px)`, offset: 0.5 },
            { opacity: dotOpacity * 0.5, transform: `scale(1) translate(${endX}px, ${endY}px)`, offset: 0.75 },
            { opacity: 0, transform: `scale(0.5) translate(${endX}px, ${endY}px)` },
        ], {
            duration: 1100,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            fill: 'forwards',
        });
    }
    for (let i = 0; i < 8; i++) {
        const angleDeg = i * 45;
        const lineWrapper = $('.animation-particle');
        lineWrapper.style.position = 'absolute';
        lineWrapper.style.left = `${cx}px`;
        lineWrapper.style.top = `${cy}px`;
        lineWrapper.style.width = '0';
        lineWrapper.style.height = '0';
        lineWrapper.style.transform = `rotate(${angleDeg}deg)`;
        overlay.appendChild(lineWrapper);
        const line = $('.animation-particle');
        line.style.position = 'absolute';
        line.style.width = '2px';
        line.style.height = '10px';
        line.style.backgroundColor = 'var(--vscode-focusBorder, #007acc)';
        line.style.left = '-1px';
        line.style.top = '-22px';
        line.style.transformOrigin = 'bottom center';
        lineWrapper.appendChild(line);
        line.animate([
            { transform: 'scale(1, 0)', opacity: 0.6 },
            { transform: 'scale(1, 1)', opacity: 0.6, offset: 0.2 },
            { transform: 'scale(1, 1)', opacity: 0.6, offset: 0.6 },
            { transform: 'scale(1, 1)', opacity: 0.6, offset: 0.8 },
            { transform: 'scale(0, 0.3)', opacity: 0 },
        ], {
            duration: 1200,
            delay: 150,
            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
            fill: 'forwards',
        });
    }
    cleanupOverlay(2000);
}
function triggerClickAnimation(element, animation, icon) {
    switch (animation) {
        case ClickAnimation.Confetti:
            triggerConfettiAnimation(element);
            break;
        case ClickAnimation.FloatingIcons:
            if (icon) {
                triggerFloatingIconsAnimation(element, icon);
            }
            break;
        case ClickAnimation.PulseWave:
            triggerPulseWaveAnimation(element);
            break;
        case ClickAnimation.RadiantLines:
            triggerRadiantLinesAnimation(element);
            break;
    }
}

export { ClickAnimation, bounceElement, triggerClickAnimation, triggerConfettiAnimation, triggerFloatingIconsAnimation, triggerPulseWaveAnimation, triggerRadiantLinesAnimation };
