/**
 * scene & showcase intro
 */
function siteIntro() {
    const tl = gsap.timeline();
    tl.to('.load-clip', {
        duration: 1.2,
        width: '100%',
        left: '0%',
        ease: 'Expo.easeInOut',
        onComplete: () => {
            gsap.set('#loading', { display: 'none' });
        }
    }).to('.load-clip', {
        duration: 1,
        width: '100%',
        left: '100%',
        ease: 'Expo.easeInOut',
        delay: 0.3,
        onComplete: () => {
            tl.set('.load-clip', { left: '-100%' });
        }
    }).from('#scene-intro', {
        duration: 0.5,
        opacity: 0,
        x: '-10%',
        onComplete: () => {
            gsap.to('#scene-intro', {
                duration: 1,
                background: 'rgba(0, 0, 0, 0.1)',
                ease: 'Expo.easeInOut',
            })
        }
    }, '-=.5').from('#scene-intro .top span', {
        duration: 0.5,
        opacity: 0,
        x: '-20%',
        ease: 'Expo.easeInOut',
    }, '-=.4').from('#scene-intro .line', {
        duration: 1,
        height: 0,
        ease: 'Expo.easeInOut',
    }, '-=0.4').from('#scene-intro .dets>*', {
        duration: .6,
        opacity: 0,
        stagger: 0.2,
        y: '-20%',
        ease: 'Expo.easeInOut',
    }, '-=0.6').from('#scene-intro .bottom>*', {
        duration: .6,
        opacity: 0,
        stagger: 0.2,
        x: '-20%',
        ease: 'Expo.easeInOut',
    }, '-=0.5').from('#scene-intro .right #explore', {
        duration: 1,
        x: '-20%',
        opacity: 0,
    }, '-=0.5');
}

const showcase = document.querySelector('#scene-intro');
function siteStartIntro() {
    const tl = gsap.timeline();
    showcase.style.display = "flex";

    let height = '260px';
    const large = window.matchMedia('(max-width:1100px)');
    const medium = window.matchMedia('(max-width:992px)');
    const small = window.matchMedia('(max-width:768px)');
    const extraSmall = window.matchMedia('(max-width:670px)');
    const tiny = window.matchMedia('(max-width:500px)');
    if (large.matches) height = '280px';
    else if (medium.matches || small.matches || extraSmall.matches) height = '270px';
    else if (tiny.matches) height = '300px';

    tl.to('#scene-intro', {
        duration: 0.5,
        x: '0%',
        opacity: 1,
        ease: 'Expo.easeInOut',
    }).to('#scene-intro .top span', {
        duration: 0.5,
        opacity: 1,
        x: '0%',
        ease: 'Expo.easeInOut',
    }, '-=.4').to('#scene-intro .line', {
        duration: 1,
        height,
        ease: 'Expo.easeInOut',
    }, '-=.5').to('#scene-intro .dets>*', {
        duration: .6,
        opacity: 1,
        stagger: 0.2,
        y: '0%',
        ease: 'Expo.easeInOut',
    }, '-=.8').to('#scene-intro .bottom>*', {
        duration: .6,
        opacity: 1,
        stagger: 0.2,
        x: '0%',
        ease: 'Expo.easeInOut',
    }, '-=.55').to('#scene-intro .right #explore', {
        duration: 0.5,
        x: '0%',
        opacity: 1,
    }, '-=.55');
}

function siteEndIntro() {
    const tl = gsap.timeline();
    tl.to('#scene-intro .top span', {
        duration: 0.5,
        opacity: 0,
        x: '-20%',
        ease: 'Expo.easeInOut',
    }, '-=.5').to('#scene-intro .line', {
        duration: 1,
        height: 0,
        ease: 'Expo.easeInOut',
    }, '-=.9').to('#scene-intro .dets>*', {
        duration: .6,
        opacity: 0,
        stagger: 0.2,
        y: '-20%',
        ease: 'Expo.easeInOut',
    }, '-=.6').to('#scene-intro .bottom>*', {
        duration: .6,
        opacity: 0,
        stagger: 0.2,
        x: '-20%',
        ease: 'Expo.easeInOut',
    }, '-=.6').to('#scene-intro .right #explore', {
        duration: 0.5,
        x: '-20%',
        opacity: 0,
    }, '-=.6').to('#scene-intro', {
        duration: 0.5,
        x: '-20%',
        opacity: 0,
        ease: 'Expo.easeInOut',
        onComplete: () => {
            showcase.style.display = "none";
        }
    }, '-=.3');
}

var attempt = 1;
function switchToShowcaseView() {
    clearStageIntro(prevStageIntro);
    hideStageControls();

    gsap.set('#reset', {
        display: 'none',
        opacity: 0,
        scale: 0,
    });

    attempt > 1 && siteStartIntro();
    attempt++;
}

function switchToStageView() {
    siteEndIntro();

    const tl = gsap.timeline();
    const st = `.stage-1`;
    gsap.set(st, {
        display: 'flex'
    });
    tl.to(st + ' h1', {
        delay: 1,
        duration: .5,
        x: '5%',
        opacity: .8,
        display: 'initial',
    }).to(st + ' p', {
        duration: .5,
        x: '5%',
        display: 'initial',
        opacity: 1,
    }, '-=.45').to(st + ' small', {
        duration: .5,
        x: '5%',
        display: 'initial',
        opacity: 1,
    }, '-=.45').to(st + ' .helper-element', {
        duration: 0.5,
        opacity: 1,
        display: 'initial',
        x: '0%',
        ease: 'Expo.easeInOut',
    }, '-=.4');

    typeTipMessage(HELPER_TIPS_1, 1);

    gsap.to('#reset', {
        display: 'initial',
        opacity: 1,
        scale: 1,
    });
}

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
// message helper
import { HELPER_TIPS_1, HELPER_TIPS_2 } from './_constants.js';
function typeTipMessage(array = HELPER_TIPS_1, stage) {
    new Typewriter(`.stage-${stage} .helper-element .helper-details small`, {
        strings: array,
        autoStart: true,
        pause: 10000,
        loop: true,
        delay: 15,
        deleteSpeed: 30,
    });
}

// stage intros
var prevStage = 1;
function clearStageIntro(stage) {
    const tl = gsap.timeline();
    const st = `.stage-${stage}`;

    tl.to(st + ' .helper-element', {
        duration: 0.5,
        opacity: 0,
        x: '-10%',
        ease: 'Expo.easeInOut',
        onComplete: () => {
            gsap.set(st + ' .helper-element', {
                delay: 0.5,
                display: 'none',
            });
        }
    }).to(st + ' small', {
        duration: .5,
        x: '-5%',
        opacity: 0,
        onComplete: () => {
            gsap.set(st + ' small', {
                delay: 0.5,
                display: 'none',
            });
        }
    }, '-=.2').to(st + ' p', {
        duration: .5,
        x: '-5%',
        opacity: 0,
        onComplete: () => {
            gsap.set(st + ' p', {
                delay: 0.5,
                display: 'none',
            });
        }
    }, '-=.45').to(st + ' h1', {
        duration: .5,
        x: '-5%',
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
    }, '-=.45');
}

var prevStageIntro = 1;
function animateStageIntro(stage, cache = null) {
    if (cache === 1)
        return;

    const tl = gsap.timeline();
    const st = `.stage-${stage}`;

    if (prevStage > 0) {
        clearStageIntro(prevStage);
    }
    prevStage = prevStageIntro = stage;
    //disable to prevent movement
    gsap.set(st, {
        display: 'flex'
    });

    tl.to(st + ' h1', {
        delay: 1,
        duration: .5,
        x: '5%',
        opacity: .8,
        display: 'initial',
    }).to(st + ' p', {
        duration: .5,
        x: '5%',
        display: 'initial',
        opacity: 1,
    }, '-=.45').to(st + ' small', {
        duration: .5,
        x: '5%',
        display: 'initial',
        opacity: 1,
    }, '-=.45').to(st + ' .helper-element', {
        duration: 0.5,
        opacity: 1,
        x: '0%',
        display: 'initial',
        ease: 'Expo.easeInOut',
    }), '-=.5';

    if (stage === 1) {
        typeTipMessage(HELPER_TIPS_1, stage);
    } else
        typeTipMessage(HELPER_TIPS_2, stage);
}

function hideStageIntros() {
    gsap.to('.stage-intro', {
        delay: 0.4,
        opacity: 0,
        ease: 'Expo.easeInOut',
    });
}

function showStageIntros() {
    gsap.to('.stage-intro', {
        delay: 0.5,
        opacity: 1,
        ease: 'Expo.easeInOut',
    });
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
 * stage 2
 */
var pulseTimes = 0;
function pulseBack() {
    pulseTimes++;
    const tl = gsap.timeline();
    tl.to('.btn-set#back', {
        duration: 0.8,
        scale: 1.8,
        ease: 'Expo.easeInOut',
    }).to('.btn-set#back', {
        duration: 0.8,
        scale: 1,
        ease: 'Expo.easeInOut',
        onComplete: () => {
            if (pulseTimes < 3) pulseBack();
        }
    });
}
function showStageBackButton() {
    gsap.to('.btn-set#back', {
        duration: 0.8,
        opacity: 1,
        display: 'initial',
        ease: 'Expo.easeInOut',
    });

    pulseBack();
}

function hideStageBackButton() {
    gsap.to('.btn-set#back', {
        duration: 0.5,
        opacity: 0,
        display: 'non',
        ease: 'Expo.easeOut',
    });
}

export {
    /** scene **/
    siteIntro,
    switchToShowcaseView,
    switchToStageView,

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
    typeTipMessage,


    /** stage 2 **/
    showStageBackButton,
    hideStageBackButton,
};
