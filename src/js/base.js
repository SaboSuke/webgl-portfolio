// tv controls
function hideTvControls() {
    gsap.to('#tv_contrls>div', {
        delay: 0.1,
        stagger: 0.1,
        y: '150px',
        opacity: 0,
        ease: 'Expo.easeInOut'
    });
}

function showTvControls() {
    gsap.to('#tv_contrls>div', {
        delay: 0.06,
        stagger: 0.1,
        y: 0,
        opacity: 1,
        ease: 'Expo.easeInOut'
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

// message helpers
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
    hideTvControls,
    showTvControls,
    showStageControls,
    hideStageControls,
    hideUpArrow,
    hideDownArrow,
    showUpArrow,
    showDownArrow,
    shiftHelperMessage,
    initHelper,
};