function getTickerData(marathon, callback) {
    fetch(
        `https://oengus.io/api/marathons/${marathon}/schedule/ticker`
    )
        .then((r) => r.json())
        .then((data) => {
            callback(data.current, data.next);
        })
        .catch((e) => {
            console.error(e);
        });
}
