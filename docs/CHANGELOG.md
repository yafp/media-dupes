![logo](https://raw.githubusercontent.com/yafp/media-dupes/master/.github/images/logo/128x128.png)

# media-dupes
## changelog

This project is using [Semantic Versioning](https://semver.org/).

  `
  MAJOR.MINOR.PATCH
  `

* `MAJOR` version (incompatible API changes etc)
* `MINOR` version (adding functionality)
* `PATCH` version (bug fixes)


The following categories are used:

* `Added`: for new features
* `Changed`: for changes in existing functionality.
* `Deprecated`: for soon-to-be removed features.
* `Removed`: for now removed features.
* `Fixed`: for any bug fixes.
* `Security`: in case of vulnerabilities.


***

### media-dupes 0.10.x (2020xxyy)
#### `Changed`
* Updated dependencies:
  * Updated `electron` from `9.0.3` to `9.0.4`.
  * Updated `electron-log` from `4.2.1` to `4.2.2`.
  * Updated `metascraper` from `5.11.21` to `5.12.6`.
  * Updated `metascraper-logo-favicon` from `5.11.21` to `5.12.6`.
  * Updated `metascraper-media-provider` from `5.11.22` to `5.12.5`.
  * Updated `metascraper-soundcloud` from `5.11.21` to `5.12.5`.

***

### media-dupes 0.10.1 (20200609)
#### `Changed`
* Updated dependencies:
  * Updated `electron` from `9.0.2` to `9.0.3`.

#### `Fixed`
* Fixed a dependency error. See [#130](https://github.com/yafp/media-dupes/issues/130)


***

### media-dupes 0.10.0 (20200607)
#### `Added`
* Added todo-list-protection to ensure items of the list arent removed while media-dupes is processing the list. See [#127](https://github.com/yafp/media-dupes/issues/127)
* Added a warning dialog about consequences of not updating media-dupes. See [#129](https://github.com/yafp/media-dupes/issues/129)

#### `Changed`
* Improved update check - using semver for version comparison.
* Updated dependencies:
  * Updated `about-window` from `1.13.2` to `1.13.4`
  * Updated `datatables.net-dt` from `1.10.20` to `1.10.21`
  * Updated `datatables.net-scroller-dt` from `2.0.1` to `2.0.2`
  * Updated `electron` from `8.2.5` to `9.0.2`. See [#128](https://github.com/yafp/media-dupes/issues/128)
  * Updated `electron-builder` from `22.6.0` to `22.7.0`
  * Updated `electron-log` from `4.1.2` to `4.2.1`
  * Updated `eslint` from `6.8.0` to `7.2.0`
  * Updated `got` from `10.7.0` to `11.3.0`
  * Updated `jquery` from `3.5.0` to `3.5.1`
  * Updated `metascraper` from `5.11.10` to `5.11.21`
  * Updated `metascraper-audio` from `5.11.10` to `5.11.21`
  * Updated `metascraper-description` from `5.11.10` to `5.11.21`
  * Updated `metascraper-image` from `5.11.10` to `5.11.21`
  * Updated `metascraper-logo` from `5.11.10` to `5.11.21`
  * Updated `metascraper-logo-favicon` from `5.11.11` to `5.11.21`
  * Updated `metascraper-media-provider` from `5.11.11` to `5.11.22`
  * Updated `metascraper-soundcloud` from `5.11.11` to `5.11.21`
  * Updated `metascraper-title` from `5.11.10` to `5.11.21`
  * Updated `metascraper-video` from `5.11.10` to `5.11.21`
  * Updated `metascraper-youtube` from `5.11.10` to `5.11.21`
  * Updated `v8-compile-cache` from `2.1.0` to `2.1.1`

***

### media-dupes 0.9.0 (20200502)
#### `Added`
* Added prelisten function to todo-list. See [#119](https://github.com/yafp/media-dupes/issues/119)
* Added 'show supported sites' menu entry to the help -> youtube-dl menu. See [#113](https://github.com/yafp/media-dupes/issues/113)
* Added support for cli parameters. See [#115](https://github.com/yafp/media-dupes/issues/115)
* Added icons to menu. See [#118](https://github.com/yafp/media-dupes/issues/118)

#### `Changed`
* UI:
  * Reduced minimal window height from 830px to 730 px. See [#111](https://github.com/yafp/media-dupes/issues/111)
  * Settings icon on settings window now shows its function using a title.
  * ToDoList: Content of column url is now truncated to ensure the table does not break. See [#120](https://github.com/yafp/media-dupes/issues/120)
  * Disclaimer: Added blur and unblur. Changed timing for disclaimer-check call (moved from ready-to-show to show).
* Sentry: Removed several event count events to reduce overall amount of generated reports.
* New default value for `app.allowRendererProcessReuse` is now `true`.
* Updated dependencies:
  * Updated `electron` from `8.2.1` to `8.2.5`
  * Updated `electron-builder` from `22.4.1` to `22.6.0`
  * Updated `electron-log` from `4.1.1` to `4.1.2`
  * Updated `electron-util` from `0.14.0` to `0.14.1`
  * Updated `metascraper` from `5.11.8` to `5.11.10`
  * Updated `metascraper-audio` from `5.11.8` to `5.11.10`
  * Updated `metascraper-description` from `5.11.8` to `5.11.10`
  * Updated `metascraper-image` from `5.11.8` to `5.11.10`
  * Updated `metascraper-logo` from `5.11.8` to `5.11.10`
  * Updated `metascraper-logo-favicon` from `5.11.8` to `5.11.11`
  * Updated `metascraper-media-provider` from `5.11.8` to `5.11.11`
  * Updated `metascraper-soundcloud` from `5.11.8` to `5.11.10`
  * Updated `metascraper-title` from `5.11.8` to `5.11.10`
  * Updated `metascraper-video` from `5.11.8` to `5.11.10`
  * Updated `metascraper-youtube` from `5.11.8` to `5.11.10`

#### `Removed`
* Removed the show extractors function from the main UI. Users can still see a list of supported youtube-dl sites via the help menu. See [#121](https://github.com/yafp/media-dupes/issues/121)

#### `Fixed`
* Fixed a minor issue in todo-list if metascraper got null values. See [#114](https://github.com/yafp/media-dupes/issues/114)

***

### media-dupes 0.8.0 (20200411)
#### `Added`
* ToDo list
  * Single urls can now be removed from list. See [#104](https://github.com/yafp/media-dupes/issues/104)
  * Now shows the url favicon. See [#107](https://github.com/yafp/media-dupes/issues/107)
  * Now shows the preview image. See [#108](https://github.com/yafp/media-dupes/issues/108)
* New Dependencies
  * Added `datatables.net-dt`  version `1.10.20`. See [#102](https://github.com/yafp/media-dupes/issues/102)
  * Added `datatables.net-scroller-dt`  version `2.0.1`. See [#102](https://github.com/yafp/media-dupes/issues/102)
  * Added `md5`  version `2.2.1`.
  * Added `got`  version `10.7.0`.
  * Added `metascraper`  version `5.11.8`.
  * Added `metascraper-audio`  version `5.11.8`.
  * Added `metascraper-description`  version `5.11.8`.
  * Added `metascraper-image`  version `5.11.8`.
  * Added `metascraper-logo`  version `5.11.8`.
  * Added `metascraper-logo-favicon`  version `5.11.8`.
  * Added `metascraper-media-provider`  version `5.11.8`.
  * Added `metascraper-soundcloud`  version `5.11.8`.
  * Added `metascraper-title`  version `5.11.8`.
  * Added `metascraper-video`  version `5.11.8`.
  * Added `metascraper-youtube`  version `5.11.8`.

#### `Changed`
* ToDo list is now a table. See [#102](https://github.com/yafp/media-dupes/issues/102)
* Reset UI is now reloading the UI.
* Changed notifcation-display-time on end of download queue. Info hides itself after a while. Warning and error stay until confirmed.
* Dependencies
  * Updated `electron`  from `8.2.0` to `8.2.1`
  * Updated `jsdoc`  from `3.6.3` to `3.6.4`
  * Updated `jquery`  from `3.4.1` to `3.5.0`

#### `Removed`
* Removed youtube-dl setting 'fetch url informations'. See [#109](https://github.com/yafp/media-dupes/issues/109)
* Removed is-reachable test for urls as it was not reliable. See [#106](https://github.com/yafp/media-dupes/issues/106)
* CI
  * Removing travis and appveyor - as building is now realized using GitHub actions.

#### `Fixed`
* Fixed an error in todo-list saving and restoring. See [#105](https://github.com/yafp/media-dupes/issues/105)
* Fixed an error in todo-list cleanup. See [#110](https://github.com/yafp/media-dupes/issues/110)


***

### media-dupes 0.7.0 (20200403)
#### `Added`
* Energy-management
  * Added a power-save-blocker. Now trying to prevent powerSave while downloads are in progress. See [#97](https://github.com/yafp/media-dupes/issues/97)

#### `Changed`
* Audio-Mode: Added tracknumer as first parameter for the naming pattern of audio files.
* Windows nsis installer. Show install and uninstall details. See [#96](https://github.com/yafp/media-dupes/issues/96)
* Removed most of the event count functions. Only core functionality is counted from now. See [#103](https://github.com/yafp/media-dupes/issues/103)
* Settings
  * youtube-dl: Update button is now disabled if update is technically not possible.
* Dependencies
  * Updated `electron`  from `8.1.0` to `8.2.0`
  * Updated `electron-builder`  from `22.4.0` to `22.4.1`
  * Updated `electron-log`  from `4.0.7` to `4.1.1`
  * Updated `fontaswesome-free`  from `5.12.1` to `5.13.0`
  * Updated `sentry`  from `1.2.1` to `1.3.0`
  * Updated `mocha`  from `7.1.0` to `7.1.1`

#### `Fixed`
* youtube-dl update routine
  * Improved handling  of 'Force updating youtube-dl binary ' function via menu.
  * Added error handling to 'reset youtube-dl binary path' function via menu.
  * Fixed update issues due to missing permissions. See [#98](https://github.com/yafp/media-dupes/issues/98)
* Fixed horizontal scrollbar bug. See [#100](https://github.com/yafp/media-dupes/issues/100)
* Fixed some vulnerabilities in dependencies.
* Fixed an issue when the configured download target no longer exists. Now fallbacks to default

***

### media-dupes 0.6.0 (20200306)
#### `Added`
* URL input: Url-input-field is now color-coded (red = unreachable, yellow = unchecked, green = reachable). See [#82](https://github.com/yafp/media-dupes/issues/82)
* Added splash screen. See [#78](https://github.com/yafp/media-dupes/issues/83)
* Energy-management
  * Added todoList save function on sleep event. See [#79](https://github.com/yafp/media-dupes/issues/79)
  * Added todoList restore function on resume event. See [#79](https://github.com/yafp/media-dupes/issues/79)
* Audio: Added thumbnail-embedding support for .m4a
* Log: Added support for leading timestamps in the log. See [#84](https://github.com/yafp/media-dupes/issues/84)
* Added youtube suggestion function. See [#86](https://github.com/yafp/media-dupes/issues/86)
* Added getInfo routine for urls, executed when Url is added to queue. See [#87](https://github.com/yafp/media-dupes/issues/87)
* Added url thumbnail preview (after adding an url to queue). See [#89](https://github.com/yafp/media-dupes/issues/89)
* Added support for additional youtube-dl flags/parameter by using the settings UI. See [#88](https://github.com/yafp/media-dupes/issues/88)
* Added new setting: Fetch url informations. See [#95](https://github.com/yafp/media-dupes/issues/95)
* Added `v8-compile-cache` to the project.

#### `Changed`
* Changed application icon
* Improved download resume for user. See [#78](https://github.com/yafp/media-dupes/issues/78)
* Changed the configurations options for the Windows Installer (NSIS). See [#72](https://github.com/yafp/media-dupes/issues/72)
* Moved settings code to module. See [#77](https://github.com/yafp/media-dupes/issues/77)
* Changed textarea font to monospace family to ensure correct indenting in the log
* Added youtube-dl flag `--restrict-filenames` to the parameter list.
* URL Restore: Added makeUrgent notification to the end of a successful executed URL restore.
* Settings: Initial settings creation with default values is now silent. See [#80](https://github.com/yafp/media-dupes/issues/80)
* Removed success notification on 'Loading supported extractors'.
* Standardx: Added `snazzy` to `npm run standardx`  and `npm run standardx-fix` scripts to enable funky output for developers.
* OS notifications: Clicking the notification is now raising the application UI. See [#85](https://github.com/yafp/media-dupes/issues/85)
* UI
  * Fonts: Added Arial and ArialMono to the project to ensure the same font is used on all installations. See [#94](https://github.com/yafp/media-dupes/issues/94)
  * mainWindow: Changed the layout. Using the entire window height now - Part 1. See [#42](https://github.com/yafp/media-dupes/issues/42)
  * mainWindow: added fadeIn effect to entire body
  * mainWindow: Blur effect now affects as well the titlebar. See [#91](https://github.com/yafp/media-dupes/issues/91)
  * Settings: added fadeIn effect to entire body
  * Settings: now using tabs. See [#93](https://github.com/yafp/media-dupes/issues/93)
* Update checks
  * Search fopr media-dupes updates is now triggered once 5 second after app start. Might speed up the start
  * Search for youtube-dl updates is now triggered once 5 seconds after app start. Might speed up the start
* Dependencies
  * Updated `custom-electron-titlebar` from `3.2.1` to `3.2.2`
  * Updated `electron`  from `7.1.10` to `8.1.0`
  * Updated `electron-log`  from `4.0.4` to `4.0.7`
  * Updated `electron-packager`  from `14.2.0` to `14.2.1`
  * Updated `electron-builder`  from `22.3.2` to `22.4.0`
  * Updated `electron-util`  from `0.13.1` to `0.14.0`
  * Updated `fontawesome`  from `5.12.0` to `5.12.1`
  * Updated `mocha`  from `7.0.1` to `7.1.0`
  * Updated `rimraf`  from `3.0.1` to `3.0.2`
  * Updated `spectron`  from `10.0.0` to `10.0.1`
  * Updated `sentry`  from `1.2.0` to `1.2.1`
  * Updated `youtube-dl` from `3.0.1` to `3.0.2`

#### `Removed`
* Removed `npx` from project. See [#41](https://github.com/yafp/media-dupes/issues/41)

#### `Fixed`
* Fixed undefined version in sentry error events. See [#75](https://github.com/yafp/media-dupes/issues/75)
* Fixed issues with the windows installer (NSIS). See [#76](https://github.com/yafp/media-dupes/issues/76)
* Fixed a bug with the Intro. See [#92](https://github.com/yafp/media-dupes/issues/92)

***

### media-dupes 0.5.0 (20200129)
#### `Added`
* Added a disclaimer which must be confirmed once per user. See [#52](https://github.com/yafp/media-dupes/issues/52)
* Added support for saving and restoring urls. See [#66](https://github.com/yafp/media-dupes/issues/66)
* Added support for applicationState. Ask user if he really wants to quit when downloads are in progress. See [#59](https://github.com/yafp/media-dupes/issues/59)
* Added some youtube-dl maintenance function to the menu. See [#57](https://github.com/yafp/media-dupes/issues/57)
  * Reset youtube-dl binary path (to revert back to bundled youtube-dl binary)
  * Force updating youtube-dl binary (to redownload the latest stable binary)
* Added general support for UI animations/effects using animate.js. See [#69](https://github.com/yafp/media-dupes/issues/69)
* Adding support for new audio formats. See [#65](https://github.com/yafp/media-dupes/issues/65)
  * Added support for `.aac`
  * Added support for `.flac`
  * Added support for `.opus`
  * Added support for `.ogg/vorbis`
  * Added support for the option `best`
* Added basic support for powerMonitoring (suspend and resume). See [#67](https://github.com/yafp/media-dupes/issues/67)
* Added new user setting `verbose mode`. See [#70](https://github.com/yafp/media-dupes/issues/70)

#### `Changed`
* Update search:
  * Is now ignoring pre-releases. See [#73](https://github.com/yafp/media-dupes/issues/73)
  * Added new setting to configure search for pre-releases. See [#74](https://github.com/yafp/media-dupes/issues/74)
* Setting UI:
  * is now a child window of the main UI. See [#58](https://github.com/yafp/media-dupes/issues/58)
  * is now a modal window. See [#63](https://github.com/yafp/media-dupes/issues/63)
  * while setting UI is open the main UI gets blur'ed. See [#64](https://github.com/yafp/media-dupes/issues/64)
* Improved validation of youtube-dl setup. See [#56](https://github.com/yafp/media-dupes/issues/56)
* Show extractors function not longer resets the log. It appends now the new data.
* Downloading audio:
  * Improved filename pattern for audio downloads. See [#61](https://github.com/yafp/media-dupes/issues/61)
  * Added `--add-metadata` flag.
  * Added `--ignore-errors` flag.
* Download video:
  * Added `--ignore-errors` flag.
  * Improved audio quality setting by using `--audio-quality 0` (was set to 5 before).
* Moved functions from renderer to new modules
  * ffmpeg
  * youtubeDl
  * ui
  * sentry
* Dependencies
  * Updated `youtube-dl`  from 3.0.0 to 3.0.1
  * Updated `popper.js` from 1.16.0 to 1.16.1
  * Updated `electron` from 7.1.9 to 7.1.10
  * Updated `electron-log` from 4.0.3 to 4.0.4
  * Updated `spectron` from 9.0.0 to 10.0.0
  * Updated `mocha` from 7.0.0 to 7.0.1
  * Updated `docdash` from 1.1.0 to 1.2.0
  * Updated `electron-builder` from 22.2.0 to 22.3.2
  * Updated `rimraf` from 3.0.0 to 3.0.1
* Documentation: Improved jsdoc documentation. Adding namespaces and some other changes
* Builds: Improved the macOS .dmg style. New background and icon positions

#### `Fixed`
* Fixed several errors in application log showing wrong urls and progress-state informations. See [#60](https://github.com/yafp/media-dupes/issues/60)
* Fixed error handling when downloading a single url failed. See [#71](https://github.com/yafp/media-dupes/issues/71)
* Fixed a vertical scrollbar bug

***

### media-dupes 0.4.2 (20200116)

#### `Fixed`
* Fixed the broken .icns app icon. See [#54](https://github.com/yafp/media-dupes/issues/54)
* Fixed wrong path information in youtube-dl's detail file. See [#55](https://github.com/yafp/media-dupes/issues/55)


***

### media-dupes 0.4.1 (20200115)

#### `Changed`
* Added `rimraf` to project for package.json scripts to improve clean scripts. See [#48](https://github.com/yafp/media-dupes/issues/48)
* Simplified requirements check on startup. See [#49](https://github.com/yafp/media-dupes/issues/49)
* Dependencies
  * Updated `electron-builder`  from 21.2.0 to 22.2.0

#### `Fixed`
* Fixed a bug in youtube-dl binary update routine. See [#50](https://github.com/yafp/media-dupes/issues/50)

***

### media-dupes 0.4.0 (20200114)
#### `Added`
* Error reporting using sentry is now optional via application settings. See [#31](https://github.com/yafp/media-dupes/issues/31)
* Added background images to textareas (todo-list and log). See [#35](https://github.com/yafp/media-dupes/issues/35)
* Added confirm dialog to UI reset function. See [#37](https://github.com/yafp/media-dupes/issues/37)
* Added update check for youtube-dl binary. See [#40](https://github.com/yafp/media-dupes/issues/40)
* Added update function for youtube-dl binary. See [#34](https://github.com/yafp/media-dupes/issues/34)
* Added update check for youtube-dl binary on app startup. See [#40](https://github.com/yafp/media-dupes/issues/40)

#### `Changed`
* Improving error handling
  * By adding `unhandled` with dialogs & report issue to github function. See [#46](https://github.com/yafp/media-dupes/issues/46)
  * Sentry: Enabled `sentry` debug mode. See [#36](https://github.com/yafp/media-dupes/issues/36)
* UI
  * General: Disabling most UI buttons while execution of some functions (searching for updates, loading extractors) to prevent race-conditions. See [#33](https://github.com/yafp/media-dupes/issues/33)
  * General: Reduced minimal window height about 60px. See [#38](https://github.com/yafp/media-dupes/issues/38)
  * Settings: reduced ui-element size on settings page from default to small. See [#38](https://github.com/yafp/media-dupes/issues/38)
  * Settings: show `youtube-dl` binary version. See [#39](https://github.com/yafp/media-dupes/issues/39)
* Improved handling if user tries to add un-useable urls (focus to input field & selecting the content if possible).
* Moved some helper functions to `app/js/modules/mdUtils.js`
* Dependencies
  * Updated `electron` from 7.1.6 to 7.1.9
  * Updated `electron-log` from 4.0.0 to 4.0.3
  * Updated `electron-packager` from 14.1.1 to 14.2.0
  * Updated `eslint` from 6.7.2 to 6.8.0
  * Updated `mocha` from 6.2.2 to 7.0.0
  * Updated `sentry` from 1.1.0 to 1.2.0
  * Updated `youtube-dl` from 2.3.0 to 3.0.0
  * Switching back from `pj-custom-electron-titlebar` to `custom-electron-titlebar` (3.2.1)
* Added missing timeout = 0 to several noty error dialogs (ensure the error must be confirmed)

#### `Removed`
* Removed any `sentry` usage which was not error-focused (no user tracking). See [#31](https://github.com/yafp/media-dupes/issues/31)

#### `Fixed`
* Fixed error with non-defined array. See [#30](https://github.com/yafp/media-dupes/issues/30)
* Fixed error URIError: URI malformed. See [#25](https://github.com/yafp/media-dupes/issues/25)
* Fixed error where detecting `youtube-dl` binary was not working on packaged-builds. See [#44](https://github.com/yafp/media-dupes/issues/44)
* Fixed a bug affecting all windows build containing the wrong yotube-dl binary. See [#47](https://github.com/yafp/media-dupes/issues/47)

***

### media-dupes 0.3.0 (20191219)
#### `Added`
* Added an error dialog to show issues with the spawned download process. See [#25](https://github.com/yafp/media-dupes/issues/25)
* Settings: Added buttons to visit `youtube-dl` and `ffmpeg` project pages. See [#29](https://github.com/yafp/media-dupes/issues/29)

#### `Changed`
* Reduced build size by only adding ffmpeg for the actual platform. See [#22](https://github.com/yafp/media-dupes/issues/22)
* Improved url detection from clipboard (trim leading and trailing blanks). See [#28](https://github.com/yafp/media-dupes/issues/28)
* Downloading: Added decode function for user urls to avoid the risk of malformed urls. See [#25](https://github.com/yafp/media-dupes/issues/25)
* Added fade-in effect to load process of the .html files (index.html and settings.html).
* Extractors: Show extractors list now shows an error notification if fetching them fails. See [#27](https://github.com/yafp/media-dupes/issues/27)
* Improved adding urls (trim leading and trailing blanks). See [#28](https://github.com/yafp/media-dupes/issues/28)
* Using intro.js now via npm. See [#21](https://github.com/yafp/media-dupes/issues/21)
* UI: Added a left/right/bottom border for the UI (css)
* Dependencies
  * Updated `electron` from 7.1.4 to 7.1.6
  * Updated `youtube-dl` from 2.2.0 to 2.3.0

#### `Fixed`
* Fixed issue where the search for software updates was launched twice on application start. See [#26](https://github.com/yafp/media-dupes/issues/26)
* Fixed an issue where the Loading-animation might be hidden, while it should be still displayed.

***

### media-dupes 0.2.0 (20191213)
#### `Added`
* Added icon to os-notifications. See [#5](https://github.com/yafp/media-dupes/issues/5)
* Added custom-titlebar (merging menu and titlebar to one line). See [#6](https://github.com/yafp/media-dupes/issues/6)
* Added support for urgent window after finishing all download jobs. See [#7](https://github.com/yafp/media-dupes/issues/7)
* Added loading/spinner to show ongoing download process. See [#8](https://github.com/yafp/media-dupes/issues/8)
* Added an intro to the UI using introJs. See [#14](https://github.com/yafp/media-dupes/issues/14)
* Added settings UI. See [#19](https://github.com/yafp/media-dupes/issues/19)
  * Added support for user specific target audio formats (mp3, m4a, wav)
  * Added support for custom download dir
* Added settings entry to the 'File' menu. See [#19](https://github.com/yafp/media-dupes/issues/19)
* Added support for save and restore window position and size. See [#20](https://github.com/yafp/media-dupes/issues/20)
* Added auto-paste of urls on focus. See [#24](https://github.com/yafp/media-dupes/issues/24)


#### `Changed`
* Download directory / handling
  * Audio: downloads are now located in a sub-directory 'Audio' inside the target download dir
  * Audio: media-dupes tries to create download specific directories inside Audio to improve handling of albums. If that fails the download lands in a subfolder called NA-NA
* Dependencies check on application launch is now searching for youtube-dl as well.
* Dependencies
  * Updated `electron` from 7.1.3 to 7.1.4
  * Updated `youtube-dl` from 2.1.0 to 2.2.0
  * Updated `fontawesome` from 5.11.2 to 5.12.0
  * Updated `sentry` from 1.1.0-beta to 1.1.0
* Normalized code style using standardx
* Improved youtube-dl flag usage
  * added: `--add-metadata` for video. See [#10](https://github.com/yafp/media-dupes/issues/10)
  * added: `--embed-thumbnail` for audio/mp3. See [#11](https://github.com/yafp/media-dupes/issues/11)
  * added: `--ignore-errors` for audio & video. See [#12](https://github.com/yafp/media-dupes/issues/12)
* Log section now auto-scrolls to bottom of log while downloading content. See [#13](https://github.com/yafp/media-dupes/issues/13)
* Log section is now showing more informations as we are now using the youtube-dl flag `--verbose`

#### `Removed`
* Menu
  * Removed the option 'View' - 'Hide'. As there was no option to access the hidden window anymore.
* Builds
  * No more .zip Builds for macOS

***

### media-dupes 0.1.0 (20191209)
#### `Added`
* Initial version of media-dupes
* Core functions
  * Download video. See [#1](https://github.com/yafp/media-dupes/issues/1)
  * Downloading/extracting audio. See [#2](https://github.com/yafp/media-dupes/issues/2)
* Minor functions
  * Show extractor list.See [#4](https://github.com/yafp/media-dupes/issues/4)
  * Open local download folder
  * Application menu
  * about window
  * check for software updates. See [#3](https://github.com/yafp/media-dupes/issues/3)
  * Basic support for in-app notification using noty
  * Basic support for os notifications
