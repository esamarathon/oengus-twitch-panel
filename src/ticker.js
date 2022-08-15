const localstate = { next: null, current: null };

function fillWithData(data, slot) {
    data.forEach((item) => {
        const span = document.createElement('span');

        span.innerHTML = item;

        slot.appendChild(span);
    });
}

function insetTemplate(target, data) {
    const template = document.getElementById('run-template');

    // Clone the new row and insert it into the table
    const clone = template.content.cloneNode(true);

    if (data.runInfo && data.runInfo.length) {
        fillWithData(data.runInfo, clone.querySelector('.run-info'));
    }

    if (data.runners && data.runners.length) {
        fillWithData(data.runners, clone.querySelector('.runner-info'));
    }

    const clsToAdd = data.next ? 'is-secondary' : 'is-primary';

    clone.querySelector('article').classList.add(clsToAdd);
    const runLink = clone.querySelector('a');

    runLink.dataset.run = data.runId;
    runLink.setAttribute('href', `#/runs/${data.runId}`);

    if (data.next) {
        runLink.innerHTML = `Next run ${formatDate(Date.parse(data.date))}`;
    } else {
        runLink.innerHTML = 'Current run';
    }

    target.appendChild(clone);
}

function updateTicker() {
    log('Updating ticker');

    const marathonId = window.marathonId;
    // TODO: Implement i18n
    const link = `https://oengus.io/en-GB/marathon/${marathonId}/schedule#current`;

    document.getElementById('schedule-link').setAttribute('href', link);

    getTickerData(marathonId, (current, next) => {
        localstate.current = current;
        localstate.next = next;

        if (!current && !next) {
            log('Ticker data missing, clearing config');
            updateTwitchConfig({
                marathonId: null,
                marathonName: null,
            });
            return;
        }

        redrawTicker(true);
    });
}

function redrawTicker(fromUpdate) {
    if (localstate.next) {
        const nextHasStarted = Date.parse(localstate.next.date) < Date.now();

        // Update the ticker if the next run has already started
        if (!fromUpdate && nextHasStarted) {
            updateTicker();
            return;
        }

        // in case the schedule does not align with current run
        const nextGameToTwitch = similarity(localstate.next.gameName, window.currentGame);

        // log(`Comparing '${localstate.next.gameName}' to '${window.currentGame}':`, nextGameToTwitch)

        // if we are not from an update (prevent infinite loops)
        // AND
        // The current game on twitch matches
        // OR
        // The next run has started
        // Set the next game as the current game
        if (!fromUpdate && (
            nextGameToTwitch >= 0.50 || nextHasStarted
        )) {
            log('Forcing next run to be current');
            localstate.current = localstate.next;
            localstate.next = null;
        }
    }

    log('Redrawing ticker');

    const target = document.querySelector('.container');

    target.innerHTML = '';

    if (localstate.current) {
        const current = localstate.current;
        let data;

        if (current.setupBlock) {
            data = {
                next: false,
                runId: current.id,
                runInfo: [
                    current.setupBlockText ?? 'Setup block',
                ],
                date: current.date,
            };
        } else {
            data = {
                next: false,
                runId: current.id,
                runInfo: [
                    current.gameName,
                    current.categoryName,
                    current.console,
                ],
                date: current.date,
                runners: current.runners.map((runner) => runner.username),
            };
        }

        insetTemplate(target, data);
    }

    if (localstate.next) {
        const next = localstate.next;
        let data;

        if (next.setupBlock) {
            data = {
                next: true,
                runId: next.id,
                runInfo: [
                    next.setupBlockText ?? 'Setup block',
                ],
                date: next.date,
            };
        } else {
            data = {
                next: true,
                runId: next.id,
                runInfo: [
                    next.gameName,
                    next.categoryName,
                    next.console,
                ],
                date: next.date,
                runners: next.runners.map((runner) => runner.username),
            };
        }

        insetTemplate(target, data);
    }
}
