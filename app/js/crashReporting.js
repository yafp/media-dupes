
// ----------------------------------------------------------------------------
// Error Handling using: crashReporter (https://electronjs.org/docs/api/crash-reporter)
// ----------------------------------------------------------------------------
//
const { crashReporter } = require("electron");
crashReporter.start({
        productName: "media-dupes",
        companyName: "yafp",
        submitURL: "https://sentry.io/api/1757940/minidump/?sentry_key=bbaa8fa09ca84a8da6a545c04d086859", //?
        uploadToServer: false
});
// To simulate a crash - execute: process.crash();

// ----------------------------------------------------------------------------
// Error Handling using: sentry (see #106)
// ----------------------------------------------------------------------------
//
// https://sentry.io/organizations/yafp/
// https://docs.sentry.io/platforms/javascript/electron/
//
const Sentry = require("@sentry/electron");
Sentry.init({
    dsn: "https://4bd3f512a1e34e24ab9838b00f57d131@sentry.io/1847606"
});
//
// simple way to force a crash:
//myUndefinedFunction();

Sentry.captureMessage("Init completed");

// ----------------------------------------------------------------------------
// Error Handling using: electron-unhandled (https://github.com/sindresorhus/electron-unhandled)
// ----------------------------------------------------------------------------
//
//const unhandled = require("electron-unhandled");
//unhandled();
