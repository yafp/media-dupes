// ----------------------------------------------------------------------------
// Error Handling using: sentry
// ----------------------------------------------------------------------------
//
// https://sentry.io/organizations/yafp/
// https://docs.sentry.io/platforms/javascript/electron/
// https://docs.sentry.io/error-reporting/configuration/?platform=electron
//
const Sentry = require('@sentry/electron')
Sentry.init({
    dsn: 'https://4bd3f512a1e34e24ab9838b00f57d131@sentry.io/1847606',
    debug: true
})
//
// simple way to force a crash:
// myUndefinedFunction();

function enableSentry () {
    Sentry.getCurrentHub().getClient().getOptions().enabled = true
    console.log('Sentry is now enabled')
}

function disableSentry () {
    Sentry.getCurrentHub().getClient().getOptions().enabled = false
    console.warn('Sentry is now disabled')
}

// export both functions
// exports.enableSentry = enableSentry
// exports.disableSentry = disableSentry
