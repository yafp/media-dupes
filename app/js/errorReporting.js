/**
* @file Contains all errorReporting code
* @author yafp
* @namespace errorReporting
*/

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
