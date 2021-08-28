/**
 * tv
 */
// tv controls
function hideTvControls() {
    const tl = gsap.timeline();

    tl.to('#tv_contrls>div', {
        stagger: 0.1,
        y: '150px',
        opacity: 0,
        ease: 'Expo.easeInOut'
    }).to('#tv_contrls', {
        duration: .5,
        y: '100%',
        opacity: 0,
        onComplete() {
            gsap.set('#tv_contrls', {
                delay: 0.5,
                display: 'none',
            })
        }
    }, '-=0.5');
}

function showTvControls() {
    const tl = gsap.timeline();

    tl.to('#tv_contrls', {
        duration: 0.5,
        display: 'flex',
        opacity: 1,
        y: '0',
        x: '0',
        ease: 'Expo.easeInOut',
    }).to('#tv_contrls>div', {
        stagger: 0.05,
        y: 0,
        opacity: 1,
        ease: 'Expo.easeInOut'
    }, '-=0.4');
}

/**
 * Stage
 */
// stage intros
var prevStage = 0;
function clearStageIntro(stage) {
    const tl = gsap.timeline();
    const st = `.stage-${stage}`;

    tl.to(st + ' p', {
        duration: .6,
        y: '20%',
        opacity: 0,
        onComplete: () => {
            gsap.set(st + ' p', {
                delay: 0.5,
                display: 'none',
            })
        }
    }).to(st + ' h1', {
        duration: .6,
        y: '20%',
        opacity: 0,
        onComplete: () => {
            gsap.set(st + ' h1', {
                delay: 0.5,
                display: 'none',
            });

            //disable to prevent movement
            gsap.set(st, {
                delay: 0.5,
                display: 'none'
            });
        }
    }, '-=.5');
}

function animateStageIntro(stage, cache = null) {
    if (cache === 1)
        return;

    const tl = gsap.timeline();
    const st = `.stage-${stage}`;

    if (prevStage > 0) {
        clearStageIntro(prevStage);
    }
    prevStage = stage;

    //disable to prevent movement
    gsap.set(st, {
        display: 'flex'
    });

    tl.to(st + ' h1', {
        delay: 1,
        duration: .6,
        y: 0,
        opacity: 1,
        display: 'initial',
    }).to(st + ' p', {
        duration: .6,
        y: 0,
        display: 'initial',
        opacity: 1,
    }, '-=.5');
}

function hideStageIntros() {
    gsap.to('.stage-intro', {
        opacity: 0,
        ease: 'Expo.easeInOut',
    })
}

function showStageIntros() {
    gsap.to('.stage-intro', {
        opacity: 1,
        ease: 'Expo.easeInOut',
    })
}

// stage controls
function hideUpArrow() {
    gsap.to('.stage-controls .btn-wrap.end', {
        y: '-20%',
        display: 'none',
        opacity: 0,
        ease: 'Expo.easeInOut'
    });
}

function hideDownArrow() {
    gsap.to('.stage-controls .btn-wrap.start', {
        y: '10%',
        display: 'none',
        opacity: 0,
        ease: 'Expo.easeInOut'
    });
}

function showUpArrow() {
    gsap.to('.stage-controls .btn-wrap.end', {
        y: '10%',
        display: 'initial',
        opacity: 1,
        ease: 'Expo.easeInOut'
    });
}

function showDownArrow() {
    gsap.to('.stage-controls .btn-wrap.start', {
        y: '-20%',
        display: 'initial',
        opacity: 1,
        ease: 'Expo.easeInOut'
    });
}

function showStageControls() {
    showUpArrow();
    hideDownArrow();
}

function hideStageControls() {
    hideUpArrow();
    hideDownArrow();
}

/**
 * helpers
 */
// message helpers
import { HELPER_MESSAGES } from './constants.js';
function shiftHelperMessage(currentStage, action) {
    const helpers = document.querySelectorAll('.helper-element'),
        current = helpers[action === 'up' ? currentStage - 1 : currentStage - 1],
        prev = helpers[action === 'up' ? currentStage - 2 : currentStage];

    gsap.to(prev, {
        duration: 0.5,
        opacity: 0,
        x: '-50%',
        ease: 'Expo.easeInOut',
        onComplete: () => {
            prev.classList.remove('current');
        }
    });

    setTimeout(() => {
        current.classList.add('current');
        gsap.to(current, {
            duration: 0.5,
            opacity: 1,
            x: '50%',
            ease: 'Expo.easeInOut',
        });
        new Typewriter('.helper-element.current .helper-details p', {
            strings: [HELPER_MESSAGES[currentStage - 1]],
            autoStart: true,
            pause: 10000,
            loop: true,
            delay: 15,
            deleteSpeed: 30,
        });
    }, 500);
}

function initHelper() {
    gsap.to('.helper-element.current', {
        duration: 1,
        opacity: 1,
        x: '50%',
        ease: 'Expo.easeInOut',
    });
}

export {
    /** tv **/
    hideTvControls,
    showTvControls,

    /** stage **/
    //intro
    animateStageIntro,
    hideStageIntros,
    showStageIntros,
    // controls
    showStageControls,
    hideStageControls,
    hideUpArrow,
    hideDownArrow,
    showUpArrow,
    showDownArrow,

    /** helper **/
    shiftHelperMessage,
    initHelper,
};