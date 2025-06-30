const glideProportion = 0.8;
const screenOffset = 240;
const birdStartProportion = 0.75;
const birdEndDelta = 0.17;
const durationMinimum = 6000;
const durationScale = 10;
const delayMin = 4000;
const delayRandom = 4000;
const millisecondsPerFrame = 100;

const frames = document.querySelectorAll('.frame');
const container = document.getElementById('animation-container');

let frameIndex = 0;
let animationInterval;

function showNextFrame() {
    frames.forEach((f, i) => f.style.display = 'none');
    frames[frameIndex].style.display = 'block';
    if (frameIndex === 0) {
        frameIndex = Math.random() < glideProportion ? 0 : 1;
    } else {
        frameIndex = (frameIndex + 1) % frames.length;
    };
};

function startFrameAnimation() {
    if (animationInterval) {
        clearInterval(animationInterval);
    };
    animationInterval = setInterval(showNextFrame, millisecondsPerFrame);
};

function moveAcrossScreen() {        
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    const direction = Math.random() < 0.5 ? 'L2R' : 'R2L';

    container.style.transform = `scaleX(${direction === 'L2R' ? 1 : -1})`;

    const xBeg = direction === 'L2R' ? -screenOffset : screenWidth + screenOffset;
    const xEnd = direction === 'L2R' ? screenWidth + screenOffset : -screenOffset;
    const yBeg = Math.random() * screenHeight * birdStartProportion;
    const yEnd = yBeg + (2 * Math.random() - 1) * screenHeight * birdEndDelta;

    container.style.left = `${xBeg}px`;

    startFrameAnimation();

    const duration = Math.max(durationScale * screenWidth, durationMinimum);
    const startTime = performance.now();

    function animate(time) {
        const elapsed = time - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const newLeft = xBeg + (xEnd - xBeg) * progress;
        const newTop = yBeg + (yEnd - yBeg) * progress;
        container.style.left = `${newLeft}px`;
        container.style.top = `${newTop}px`

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            clearInterval(animationInterval);
            frames.forEach(f => f.style.display = 'none');
            scheduleNextMove();
        };
    };

    requestAnimationFrame(animate);
};

function scheduleNextMove() {
    const delay = delayMin + Math.random() * delayRandom;
    setTimeout(moveAcrossScreen, delay);
};

moveAcrossScreen();