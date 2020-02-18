![logo](https://raw.githubusercontent.com/yafp/media-dupes/master/.github/images/logo/128x128.png)

# media-dupes
## notes

### todo
* re-enable ASAR
  * Is currently disabled cause otherwise in packaged mode the code does not find the youtube-dl executable
  * Current output: asar using is disabled — it is strongly not recommended  solution=enable asar and use asarUnpack to unpack files that must be externally available

### ideas / brainstorming
* Dependencies:
  * youtube-dl- node: exec has a callback. https://github.com/przemyslawpluta/node-youtube-dl/issues/216
  * ffmpeg: make pull request to https://github.com/pietrop/ffmpeg-static-electron to update from ffmpeg 3.x to 4.x
    * 20191210 - Created pull request for ffmpeg 4.2.1
* Progress for stream (non exec use): https://www.npmjs.com/package/progress-stream
* youtube-dl flags:
  * --socket-timeout    What is a good default value? 120 ?
  * --retries           What is a good default value ? 9999 ?

### urls
* youtube-dl: https://github.com/ytdl-org/youtube-dl
* node-youtube-dl: https://github.com/przemyslawpluta/node-youtube-dl
