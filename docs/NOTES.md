![logo](https://raw.githubusercontent.com/yafp/media-dupes/master/.github/logo/128x128.png)

# media-dupes
## notes

### todo
* re-enable ASAR
  * Is currently disabled cause otherwise in packaged mode the code does not find the youtube-dl executable
  * Current output: asar using is disabled — it is strongly not recommended  solution=enable asar and use asarUnpack to unpack files that must be externally available

### ideas / brainstorming
* ffmpeg: make pull request to https://github.com/pietrop/ffmpeg-static-electron to update from ffmpeg 3.x to 4.x
  * 20191210 - Created pull request for ffmpeg 4.2.1
* youtube-dl
  * Parameters/Flags
    * --geo-bypass to Bypass geographic restriction via faking X-Forwarded-For HTTP header. No idea if that might be helpful to add or not
* Progress for stream (non exec use): https://www.npmjs.com/package/progress-stream
* Bootstrap: make log textarea row flexible - to use the available space in height
* Reset UI button: noty confirm dialog. Add checkbox - remember this setting. Store into user-settings.
* autosizing textarea
  * https://stackoverflow.com/questions/18458399/make-a-textarea-fill-remaining-height !!!!
  * https://github.com/javierjulio/textarea-autosize
  * https://www.jacklmoore.com/autosize/
* Generating timestamps for temp filenames: https://www.npmjs.com/package/hh-mm-ss

### urls
* youtube-dl repository: https://github.com/ytdl-org/youtube-dl
* node-youtube-dl repo: https://github.com/przemyslawpluta/node-youtube-dl
