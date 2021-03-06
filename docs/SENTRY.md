![logo](https://raw.githubusercontent.com/yafp/media-dupes/master/.github/images/logo/128x128.png)

# media-dupes

## General
**media-dupes** is using [Sentry](https://sentry.io/for/javascript/) by default to:

* count events
* track errors

This page tries to explain as detailed as possible what is tracked and why.

**Please keep in mind:** *Error reporting and click counting* can be disabled in the application settings at any time.

## Use cases
### Event counting
**media-dupes** is simply counting how often specific events happen. Those counts are overall counters for one particular events and counts for all users and therefor not user-specific.

For example how often the <kbd>Intro</kbd> button was pressed. 

The following screenshot shows the related informations: 

![logo](https://raw.githubusercontent.com/yafp/media-dupes/master/.github/images/sentry/sentry_02.png)

The following event get counted:

* Main User Interface
  * Video button pressed
  * Audio button pressed
  * Overall application starts
  * Overall urls handled
  * Overall urls failed
* Settings User Interface
  * Disabling error reporting in the settings UI

### Error reporting
*Error reporting* heavily helps finding bugs in the source code. Right now **media-dupes** is developed only by a single person on a single linux computer. I am not able to run **media-dupes** on Windows or MacOS myself and even on Linux i will never cause and find all bugs myself. Error reports allow me to see what errors happen on might give me a starting point to try to fix them.


## Data
### What data is stored?
Whenever either an *error* or one of the *event-count* actions is triggered sentry gets informations about

* `browser.name`
* `chrome`
* `chrome.name`
* `device.family`
* `environment`
* `event_type`
* `level`
* `node`
* `node.name`
* `os_name`
* `release`
* `runtime`
* `runtime.name`

The following screenshot shows those informations: 

![logo](https://raw.githubusercontent.com/yafp/media-dupes/master/.github/images/sentry/sentry_01.png)

### What data is not stored?

* no ip addresses

## Questions
Still got questions - feel free to contact me.
