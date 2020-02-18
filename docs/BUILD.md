![logo](https://raw.githubusercontent.com/yafp/media-dupes/master/.github/images/logo/128x128.png)

# media-dupes
## Build

### Warning
Be aware that you have to **package** and **build** on the platform you want to build for.
Bulding windows on linux works in theory, but this is causing trouble with the ```youtube-dl``` binary.
See [#47](https://github.com/yafp/media-dupes/issues/47) for more details.

### Pre
```
# Cleaning up node_modules
npm run reinstall

# Updating jsdoc files
npm run jsdocs-update

# Check synthax of .js files
npm run standardx
```

### Packaging
```
# linux
npm run pack-linux

# mac
npm run pack-mac

# windows
npm run pack-win
```



### Building

```
# linux
npm run build-linux

# mac
npm run build-mac

# windows
npm run build-win
```
