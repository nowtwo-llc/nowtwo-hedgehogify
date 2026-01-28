let hedgehogify = null;

document.addEventListener('he:hedgehogify:start', () => {
    console.log('start');
});
document.addEventListener('he:hedgehogify:stop', () => {
    console.log('stop');
});

window.onload = () => {
    hedgehogify = new HedgeHogify();
    hedgehogify.konami(() => {
        console.log('Executing the Konami code...');
        hedgehogify.burst();
    });
};
