![logo](https://raw.githubusercontent.com/yafp/media-dupes/master/.github/images/logo/128x128.png)

# media-dupes
## developer notes / reminder

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
* seperate electron-builder.conf from package-json

### urls for screenshots:
* https://www.youtube.com/watch?v=WY0Sap4Q0sg
* https://soundcloud.com/jdilla/thank-you-jay-dee-act-3
