let hedgehogify = null;
let running = false;

document.addEventListener('he:hedgehogify:start', function() {
    console.log('start');
    running = true;
}, false);
document.addEventListener('he:hedgehogify:stop', function() {
    console.log('stop');
    running = false;
}, false);

window.onload = function() {
    hedgehogify = new HedgeHogify();
    hedgehogify.konami(function() { 
        console.log('Executing the Konami code...');
        hedgehogify.burst();
    });
}