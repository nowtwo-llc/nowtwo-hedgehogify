// HedgeHogify comes from the UMD bundle loaded by index.html; it is declared as
// a global in eslint.config.mjs.
const status = document.getElementById('status');
const disableSteve = document.getElementById('disable-steve');
const disableMonsters = document.getElementById('disable-monsters');

let hedgehogify = null;

/**
 * Rebuilds the instance so the checkboxes take effect. Character filtering is
 * applied when the instance is constructed, not per burst.
 */
const instance = () => {
    if (hedgehogify) {
        hedgehogify.destroy();
    }
    hedgehogify = new HedgeHogify({
        disableSteve: disableSteve.checked,
        disableMonsters: disableMonsters.checked
    });
    hedgehogify.konami(() => {
        status.textContent = 'Konami code! 🦔';
        hedgehogify.burst();
    });
    return hedgehogify;
};

document.addEventListener('he:hedgehogify:start', () => {
    status.textContent = 'Hedgehogs incoming…';
});

document.addEventListener('he:hedgehogify:stop', () => {
    status.textContent = '';
});

document.getElementById('burst').addEventListener('click', () => instance().burst());
document.getElementById('burst-small').addEventListener('click', () => instance().burst(8));
document.getElementById('clear').addEventListener('click', () => HedgeHogify.clear());

[disableSteve, disableMonsters].forEach((input) => {
    input.addEventListener('change', instance);
});

instance();
