export function rand(a, b) {
    return a + (b - a) * Math.random();
}

export function randFloor(a, b) {
    return a + Math.floor((b - a) * Math.random());
}