![logo](https://raw.githubusercontent.com/yafp/media-dupes/master/.github/logo/128x128.png)

# media-dupes

## General
**media-dupes** is using [Sentry](https://sentry.io/for/javascript/) by default to:

* count user-interface clicks
* track errors

This page tries to explain as detailed as possible what is tracked and why.

**Please keep in mind:** *Error reporting and click counting* can be disabled in the application settings at any time.

## Use cases
### Click counting
**media-dupes** is simply counting how often for example the *intro* button was pressed. This is an overall counter for all users and therefor not user-specific.

The following actions get counted:

* Pressing <kbh>Add URL</kbh>
* Pressing <kbh>Video button</kbh>
* Pressing <kbh>Audio button</kbh>
* Pressing <kbh>Settings</kbh>
* Pressing <kbh>Intro</kbh>
* Pressing <kbh>Extractors</kbh>
* Pressing <kbh>Downloads</kbh>
* Pressing <kbh>Reset Log</kbh>
* Pressing <kbh>Reset UI</kbh>

It helps understanding which functions of **media-dupes** get used and which doesn't.

### Error reporting
*Error reporting* heavily helps finding bugs in the source code. Right now **media-dupes** is developed only by a single person on Linux. I am not able to run **media-dupes** on Windows or MacOS myself and even on Linux i will never cause and find all bugs myself.


## Data
### What data is stored?
Whenever either an *error* or one of the *click-count* actions is triggered sentry gets informations about

* browser.name
* chrome
* chrome.name
* device.family
* environment
* event_type
* level
* node
* node.name
* os_name
* release
* runtime
* runtime.name

![logo](https://raw.githubusercontent.com/yafp/media-dupes/master/.github/images/sentry/sentry_01.jpeg)

### What data is not stored?

* no ip addresses
