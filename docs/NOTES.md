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
* Progress for stream (non exec use): https://www.npmjs.com/package/progress-stream
* Bootstrap: make log textarea row flexible - to use the available space in height
* autosizing textarea
  * https://stackoverflow.com/questions/18458399/make-a-textarea-fill-remaining-height !!!!
  * https://github.com/javierjulio/textarea-autosize
  * https://www.jacklmoore.com/autosize/
* electron-builder: nsis: check if we should teak the installer a bit: https://www.electron.build/configuration/nsis


### urls
* youtube-dl repository: https://github.com/ytdl-org/youtube-dl
* node-youtube-dl repo: https://github.com/przemyslawpluta/node-youtube-dl
