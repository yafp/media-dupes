![logo](https://raw.githubusercontent.com/yafp/media-dupes/master/.github/logo/128x128.png)

# media-dupes
## changelog

This project is using [Semantic Versioning](https://semver.org/).

  ```
  MAJOR.MINOR.PATCH
  ```

* ```MAJOR``` version (incompatible API changes etc)
* ```MINOR``` version (adding functionality)
* ```PATCH``` version (bug fixes)


The following categories are used:

* ```Added```: for new features
* ```Changed```: for changes in existing functionality.
* ```Deprecated```: for soon-to-be removed features.
* ```Removed```: for now removed features.
* ```Fixed```: for any bug fixes.
* ```Security```: in case of vulnerabilities.


***

### media-dupes 0.4.0 (202001xxyy)
#### ```Added```
* Error reporting using sentry is now optional via application settings. See [#31](https://github.com/yafp/media-dupes/issues/31)
* Added background images to textareas (todo-list and log). See [#35](https://github.com/yafp/media-dupes/issues/35)
* Added confirm dialog to UI reset function. See [#37](https://github.com/yafp/media-dupes/issues/37)
* Added update check for youtube-dl binary. See [#40](https://github.com/yafp/media-dupes/issues/40)
* Added update function for youtube-dl binary. See [#34](https://github.com/yafp/media-dupes/issues/34)
* Added update check for youtube-dl binary on app startup. See [#40](https://github.com/yafp/media-dupes/issues/40)

#### ```Changed```
* Dependencies
  * Updated electron from 7.1.6 to 7.1.7
  * Updated electron-log from 4.0.0 to 4.0.2
  * Updated eslint from 6.7.2 to 6.8.0
  * Updated mocha from 6.2.2 to 7.0.0
* Sentry: Enabled debug mode. See [#36](https://github.com/yafp/media-dupes/issues/36)
* UI/Settings: reduced ui-element size on settings page from default to small. See [#38](https://github.com/yafp/media-dupes/issues/38)
* UI/General: Reduced minimal window height about 60px. See [#38](https://github.com/yafp/media-dupes/issues/38)
* Disabling most UI buttons while execution of some functions (searching for updates, loading extractors) to prevent race-conditions. See [#33](https://github.com/yafp/media-dupes/issues/33)
* Improved handling if user tries to add unuseable urls (focus to input field & selecting the content if possible).

#### ```Removed```
* Removed any sentry usage which was not error-focused (no user tracking). See [#31](https://github.com/yafp/media-dupes/issues/31)

#### ```Fixed```
* Fixed error with non-defined array. See [#30](https://github.com/yafp/media-dupes/issues/30)

***

### media-dupes 0.3.0 (20191219)
#### ```Added```
* Added an error dialog to show issues with the spawned download process. See [#25](https://github.com/yafp/media-dupes/issues/25)
* Settings: Added buttons to visit youtube-dl and ffmpeg project pages. See [#29](https://github.com/yafp/media-dupes/issues/29)

#### ```Changed```
* Reduced build size by only adding ffmpeg for the actual platform. See [#22](https://github.com/yafp/media-dupes/issues/22)
* Improved url detection from clipboard (trim leading and trailing blanks). See [#28](https://github.com/yafp/media-dupes/issues/28)
* Downloading: Added decode function for user urls to avoid the risk of malformed urls. See [#25](https://github.com/yafp/media-dupes/issues/25)
* Added fade-in effect to load process of the .html files (index.html and settings.html).
* Extractors: Show extraxtors list now shows an error notification if fetching them fails. See [#27](https://github.com/yafp/media-dupes/issues/27)
* Improved adding urls (trim leading and trailing blanks). See [#28](https://github.com/yafp/media-dupes/issues/28)
* Using intro.js now via npm. See [#21](https://github.com/yafp/media-dupes/issues/21)
* UI: Added a left/right/bottom border for the UI (css)
* Dependencies
  * Updated electron from 7.1.4 to 7.1.6
  * Updated youtube-dl from 2.2.0 to 2.3.0

#### ```Fixed```
* Fixed issue where the search for software updates was launched twice on application start. See [#26](https://github.com/yafp/media-dupes/issues/26)
* Fixed an issue where the Loading-animation might be hidden, while it should be still displayed.

***

### media-dupes 0.2.0 (20191213)
#### ```Added```
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


#### ```Changed```
* Download directory / handling
  * Audio: downloads are now located in a sub-directory 'Audio' inside the target download dir
  * Audio: media-dupes tries to create download specific directories inside Audio to improve handling of albums. If that fails the download lands in a subfolder called NA-NA
* Dependencies check on application launch is now searching for youtube-dl as well.
* Dependencies
  * Updated electron from 7.1.3 to 7.1.4
  * Updated youtube-dl from 2.1.0 to 2.2.0
  * Updated fontawesome from 5.11.2 to 5.12.0
  * Updated sentry from 1.1.0-beta to 1.1.0
* Normalized code style using standardx
* Improved youtube-dl flag usage
  * added: `--add-metadata` for video. See [#10](https://github.com/yafp/media-dupes/issues/10)
  * added: `--embed-thumbnail` for audio/mp3. See [#11](https://github.com/yafp/media-dupes/issues/11)
  * added: `--ignore-errors` for audio & video. See [#12](https://github.com/yafp/media-dupes/issues/12)
* Log section now auto-scrolls to bottom of log while downloading content. See [#13](https://github.com/yafp/media-dupes/issues/13)
* Log section is now showing more informations as we are now using the youtube-dl flag `--verbose`

#### ```Removed```
* Menu
  * Removed the option 'View' - 'Hide'. As there was no option to access the hidden window anymore.
* Builds
  * No more .zip Builds for macOS

***

### media-dupes 0.1.0 (20191209)
#### ```Added```
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
