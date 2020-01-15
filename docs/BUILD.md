![logo](https://raw.githubusercontent.com/yafp/media-dupes/master/.github/logo/128x128.png)

# media-dupes
## Build

### Warning
Be aware that you have you package and build on the platform you want to build for. 
Bulding windows on linux works in theory, but this is causing trouble with the youtube-dl binary. 
See #47 for more details

### PRE

#### Cleaning up node_modules
* Navigate to repository
* Execute: ```npm run reinstall```

#### Generating jsdoc files
* Navigate to repository
* Execute: ```npm run generate-docs```


### Packaging
* Navigate to repository

#### linux
* Execute: ```npm run pack-linux```

#### mac
* Execute: ```npm run pack-mac```

#### windows
* Execute: ```npm run pack-win```



### Building
* Navigate to repository

#### linux
* Execute: ```npm run build-linux```

#### mac
* Execute: ```npm run build-mac```

#### windows
* Execute: ```npm run build-win```
