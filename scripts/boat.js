// Animates the SVG waves and boat bobbing motion on the landing view.
const backWave = document.getElementById('waveBackPath');
const frontWave = document.getElementById('waveFrontPath');
const boat = document.querySelector('.boat');

const params = {
    svgWidth: 1440,
    svgHeight: 320,
    stepSize: 10,
    boat: {
        xFreq: 0.115 / window.innerWidth,
        xMax: 10,
        yMax: 2.5,
        rFreq: 0.001,
        rMax: 0.6,
    },
    back: {
        wFreq: 0.003,
        wMax: 5,
        wHeight: 190,
    },
    front: {
        wFreq: 0.005,
        wMax: 14,
        wHeight: 110,
    },
};

function oscillate(time) {

    let dB = `M0,${params.back.wHeight}`;
    let dF = `M0,${params.front.wHeight}`;

    for (let i = 0; i <= params.svgWidth; i += params.stepSize) {
        let yB = Math.sin((i + time) * params.back.wFreq);
        let yF = Math.sin((i + time) * params.front.wFreq);
        yB *= params.back.wMax;
        yB += params.back.wHeight;
        dB += `L${i},${yB}`;
        yF *= params.front.wMax;
        yF += params.front.wHeight;
        dF += `L${i},${yF}`;
    };

    dB += ` L${params.svgWidth},${params.svgHeight}`;
    dB += ` L0,${params.svgHeight} Z`;
    dF += ` L${params.svgWidth},${params.svgHeight}`;
    dF += ` L0,${params.svgHeight} Z`;

    backWave.setAttribute('d', dB);
    frontWave.setAttribute('d', dF);

    const boatX = params.boat.xMax * Math.sin(time * params.boat.xFreq);
    const boatR = params.boat.rMax * Math.sin(time * params.boat.rFreq);


    let boatY = Math.sin((2 * params.svgWidth + time) * params.back.wFreq);
    boatY *= params.boat.yMax;


    boat.style.transform = `
        translateX(calc(-50% + ${boatX}vw))
        translateY(${boatY}px)
        rotate(${boatR}deg
    `;
    requestAnimationFrame(oscillate);
};

requestAnimationFrame(oscillate);
