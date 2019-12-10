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

### media-dupes 0.2.0 (201912xx)
#### ```Added```
* Added icon to os-notifications. See [#5](https://github.com/yafp/ttth/issues/5)
* Custom-titlebar (merging menu and titlebar to one line). See [#6](https://github.com/yafp/ttth/issues/6)
* Added support for urgent window after finishing all download jobs. See [#7](https://github.com/yafp/ttth/issues/7)
* Added loading/spinner to show ongoing download process. See [#8](https://github.com/yafp/ttth/issues/8)
* Added an intro to the UI using introJs. See [#9](https://github.com/yafp/ttth/issues/9)


#### ```Changed```
* Button 'Downloads' now directly opens ~/Downloads/media-dupes if it exists. Otherwise it opens ~/Downloads. See [#9](https://github.com/yafp/ttth/issues/9)
* Dependencies check on launch is now searching for youtube-dl as well.
* Dependencies
  * Updated electron from 7.1.3 to 7.1.4
* Normalized code style using standardx
* Improved youtube-dl flags
  * added: `--add-metadata` for video. See [#10](https://github.com/yafp/ttth/issues/10)
  * added: `--embed-thumbnail` for audio. See [#11](https://github.com/yafp/ttth/issues/11)
  * added: `--ignore-errors` for audio & video. See [#12](https://github.com/yafp/ttth/issues/12)
* Log section now auto-scrolls to bottom of log while downloading content. See [#13](https://github.com/yafp/ttth/issues/13)

***

### media-dupes 0.1.0 (20191209)
#### ```Added```
* Initial version of media-dupes
* Core functions
  * Download video. See [#1](https://github.com/yafp/ttth/issues/1)
  * Downloading/extracting audio. See [#2](https://github.com/yafp/ttth/issues/2)
* Minor functions
  * Show extractor list.See [#4](https://github.com/yafp/ttth/issues/4)
  * Open local download folder
  * Application menu
  * about window
  * check for software updates. See [#3](https://github.com/yafp/ttth/issues/3)
  * Basic support for in-app notification using noty
  * Basic support for os notifications
