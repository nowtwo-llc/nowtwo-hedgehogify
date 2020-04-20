window.onload = function() {
    const hedgehogify = new HedgeHogify();
    hedgehogify.konami(function() { 
        console.log('Executing the Konami code...');
        hedgehogify.burst();
    });
}