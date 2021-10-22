process.on('uncaughtException', (e) => {
    console.error('Uncaught exception occured');
    console.error(e);

    if (e.getRemoteStackTrace) {
        console.error(e.getRemoteStackTrace());
    }
});

process.on('unhandledRejection', (e) => {
    console.error('Unhandled rejection occured');
    console.error(e);

    if (e.getRemoteStackTrace) {
        console.error(e.getRemoteStackTrace());
    }
});