const twitch = window.Twitch.ext;

twitch.onAuthorized((auth) => {
    // console.log(auth);
});

twitch.onContext((ctx, changed) => {
    log('changed', changed);
    log('ctx', ctx);

    if (changed.includes('game') && updateTicker) {
        // Update the ticker
        updateTicker();
    }
});

function disableExtension() {
    twitch.configuration.set('broadcaster', '1.0', '{}');

    marathonId.value = '';
}

function getParsedConfig() {
    const configRaw = twitch.configuration.broadcaster?.content ?? '{}';

    return JSON.parse(configRaw);
}

function loadConfig(callback) {
    callback(getParsedConfig());

    twitch.configuration.onChanged(() => {
        log('config changed');
        callback(getParsedConfig());
    });
}

twitch.onError((err) => {
    log(err);
});
