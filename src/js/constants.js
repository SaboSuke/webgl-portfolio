const RAND = (a, b) => {
    return a + (b - a) * Math.random();
}

const RAND_FLOOR = (a, b) => {
    return a + Math.floor((b - a) * Math.random());
}

const COLORS = {
    green: 0x0ed105,
    red: 0xff050d,
    orange: 0xff2a03,
    white: 0xFFFFFF,
    black: 0x000000,
    bgLight: 0x260402,
    bgDark: 0x50110c,
};

const SOCIAL_LINKS = {
    linkedin: 'https://www.linkedin.com/in/essam-abed-5bb7a3196/',
    github: 'https://github.com/SaboSuke',
    twitter: 'https://twitter.com/SabosukeMe',
}

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

export {
    RAND,
    RAND_FLOOR,
    COLORS,
    SOCIAL_LINKS,
    CHANNEL_ELEMENTS,
    CHANNEL_SOURCES,
}