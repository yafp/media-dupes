![logo](https://raw.githubusercontent.com/yafp/media-dupes/master/.github/logo/128x128.png)

# media-dupes
## notes

### todo
* re-enable ASAR
  * Is currently disabled cause otherwise in packaged mode the code does not find the youtube-dl executable
  * Current output: asar using is disabled — it is strongly not recommended  solution=enable asar and use asarUnpack to unpack files that must be externally available

### ideas / brainstorming
* badge support?
* options for different audio-export formats (mp3, ogg etc)
* options for different video-export formats
* ffmpeg: make pull request to https://github.com/pietrop/ffmpeg-static-electron to update from ffmpeg 3.x to 4.x
  * 20191210 - Created pull request for ffmpeg 4.2.1
* youtube-dl
  * Supports: --geo-bypass to Bypass geographic restriction via faking X-Forwarded-For HTTP header. No idea if that might be helpful to add or not
  * Parameters/Flags?
    * --write-all-thumbnails
    * --embed-subs 
    * --all-subs
* Add support for "custom download dir"


### urls
* youtube-dl repository: https://github.com/ytdl-org/youtube-dl
* node-youtube-dl repo: https://github.com/przemyslawpluta/node-youtube-dl

