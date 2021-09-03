// click animation
// document.querySelectorAll('.btn-set:not(.disabled)').forEach(btn => {
//     btn.addEventListener('click', () => {
//         const timeline = gsap.timeline();
//         timeline.to(btn, {
//             delay: 0,
//             duration: .2,
//             scale: 0.001,
//         }).to(btn, {
//             duration: .1,
//             scale: 1,
//         }, '-=.05');
//     });
// });

// reset
const reset = document.querySelector("#reset");
reset.addEventListener("click", () => {
    if (reset.classList.contains('load')) reset.classList.remove('load');
    else {
        reset.classList.add('load');

        setTimeout(() => {
            reset.classList.remove('load');
        }, 800);
    }
});