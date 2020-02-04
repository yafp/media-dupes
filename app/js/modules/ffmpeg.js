/**
 * @file Contains all ffmpeg functions
 * @author yafp
 * @module ffmpeg
 */
'use strict'

const utils = require('./utils.js')

/**
* @function ffmpegGetBinaryPath
* @summary Get the binary path of the ffmpeg binary
* @description Get the binary path of the ffmpeg binary
* @return {string} ffmpeg.path - The path to the ffmpeg binary
*/
function ffmpegGetBinaryPath () {
    var ffmpeg = require('ffmpeg-static-electron')
    utils.writeConsoleMsg('info', 'ffmpegGetBinaryPath ::: ffmpeg binary path is: _' + ffmpeg.path + '_.')
    return (ffmpeg.path)
}

// Exporting the module functions
//
module.exports.ffmpegGetBinaryPath = ffmpegGetBinaryPath
