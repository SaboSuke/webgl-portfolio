// btn click animation
document.querySelectorAll('.btn-set').forEach(btn => {
    btn.addEventListener('click', () => {
        const timeline = gsap.timeline();
        timeline.to(btn, {
            delay: 0,
            duration: .2,
            scale: 0.001,
        }).to(btn, {
            duration: .1,
            scale: 1,
        }, '-=.05');
    })
});