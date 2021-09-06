const RAND = (a, b) => {
    return a + (b - a) * Math.random();
}

const RAND_FLOOR = (a, b) => {
    return a + Math.floor((b - a) * Math.random());
}

const ENV_PATH = '/src/';

const HELPER_TIPS_1 = [
    '>> Hover on the TV!',
    '>> Click on the icons!'
];

const HELPER_TIPS_2 = [
    '>> Click on a table!',
];

const COLORS = {
    green: 0x0ed105,
    red: 0xff050d,
    orange: 0xff2a03,
    white: 0xFFFFFF,
    black: 0x000000,
    bgLight: 0x260402,
    bgDark: 0x50110c,
    bgPink: 0xa7547e,
    bgPinkDark: 0x2d0d1e,
};

const SOCIAL_LINKS = {
    linkedin: 'https://www.linkedin.com/in/essam-abed-5bb7a3196/',
    github: 'https://github.com/SaboSuke',
    twitter: 'https://twitter.com/SabosukeMe',
};

const CHANNEL_ELEMENTS = [
    document.querySelector('#tv video.vid1'),
    document.querySelector('#tv video.vid2'),
    document.querySelector('#tv video.vid3'),
    document.querySelector('#tv video.vid4'),
];

const CHANNEL_SOURCES = [
    '/src/vid/Design Agency Webgl LandingPage.mp4',
    '/sr/vid/WebGL Slider And Card Effects.mp4',
    '/sr/vid/WebGL Ripple Effect.mp4',
    '/sr/vid/webgl-pointlights-animation-LowEnd.mp4',
];

const STAGE_0_SHOWCASE = {
    position: {
        x: 1,
        y: -0.5,
        z: 10,
    },
    target: {
        x: -6.5,
        y: -2.5,
        z: -10,
    }
};

const STAGE_1_VEC = {
    position: {
        x: -2,
        y: 2.5,
        z: 14,
    },
    target: {
        x: -2.5,
        y: 0,
        z: 0,
    }
};

const STAGE_2_VEC = {
    position: {
        x: -1.5,
        y: 6,
        z: 14,
    },
    target: {
        x: 7.5,
        y: 3,
        z: -5,
    }
};

export {
    RAND,
    RAND_FLOOR,
    ENV_PATH,
    HELPER_TIPS_1,
    HELPER_TIPS_2,
    COLORS,
    SOCIAL_LINKS,
    CHANNEL_ELEMENTS,
    CHANNEL_SOURCES,
    STAGE_0_SHOWCASE,
    STAGE_1_VEC,
    STAGE_2_VEC,
}