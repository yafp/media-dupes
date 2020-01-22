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
    release: 'media-dupes@' + process.env.npm_package_version,
    dsn: 'https://4bd3f512a1e34e24ab9838b00f57d131@sentry.io/1847606',
    debug: true
})
//
// simple way to force a crash:
//myUndefinedFunction();

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

// ----------------------------------------------------------------------------
// Error Handling using unhandled
// ----------------------------------------------------------------------------
const unhandled = require('electron-unhandled')
const { openNewGitHubIssue, debugInfo } = require('electron-util')

unhandled({
    showDialog: true,
    reportButton: error => {
        openNewGitHubIssue({
            user: 'yafp',
            repo: 'media-dupes',
            body: `\`\`\`\n${error.stack}\n\`\`\`\n\n---\n\n${debugInfo()}`
        })
    }
})
