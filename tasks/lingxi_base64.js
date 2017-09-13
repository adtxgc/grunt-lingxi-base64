/*
 * grunt-lingxi-base64
 * https://github.com/xwliu/plugin
 *
 * Copyright (c) 2017 adtxgc
 * Licensed under the MIT license.
 */

'use strict';

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

module.exports = function(grunt) {

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks
  const htmlImgPattern =
    /("|')\.{0,2}(\/?(\w+|\w-\w))*((\.png|\.jpeg|\.jpg)\s*("|'))/gi;
  const cssImgPattern =
    /url\(("|')?\.{0,2}(\/?(\w+|\w-\w))*((\.png|\.jpeg|\.jpg)("|')?\))/gi;
  grunt.registerMultiTask('lingxi_base64',
    'A grunt task which takes html files,js files or css files,and replaces the image path with base64 string',
    function() {

      //图片文件原始目录和用md5签名重命名之后的目录映射关系列表
      let imgPathMap = {};
      //转成base64字符串的图片文件路径列表
      let imgBase64PathList = {};

      // Merge task-specific and/or target-specific options with these defaults.
      let options = this.options({
        limit: 3072
      });

      //遍历配置
      this.files.forEach((srcObj) =>
        //遍历配置的文件对象
        srcObj.src.forEach((filePath) => {

          if (grunt.file.isFile(filePath)) {
            //找到包含图片路径的文件，把图片路径抽出来
            let dirPath = path.dirname(filePath);
            let fileStr = grunt.file.read(filePath);
            let imgPaths = []; //<img src="test.png">
            let urlImgPaths = []; //background:url("test.png")
            imgPaths = fileStr.match(htmlImgPattern);
            urlImgPaths = fileStr.match(cssImgPattern);

            if (imgPaths && imgPaths.length > 0) {
              imgPaths.forEach((imgPath) => {
                let tempPath = imgPath.replace(/"|'/g, ""); //得到图片路径字符串

                let tempDirPath = dirPath;
                if (dirPath.indexOf("component") > -1) {
                  let tempAry = dirPath.split('/');
                  tempAry.pop();
                  tempAry.pop();
                  tempDirPath = tempAry.join('/');
                }
                tempPath = path.join(tempDirPath, tempPath);
                if (grunt.file.exists(tempPath)) {
                  if (getFileBytes(tempPath) <= options.limit) {
                    let base64 = convertImgUrl2Base64(tempPath);
                    let pat = new RegExp(imgPath, 'g');

                    fileStr = fileStr.replace(pat, base64);

                    //缓存转成base64字符串的图片路径
                    if (!imgBase64PathList[tempPath]) {
                      imgBase64PathList[tempPath] = 1;
                    }
                  } else {
                    //md5签名重命名
                    let newImgPath = renameImgByMd5(tempPath);
                    let pat = new RegExp('/' + path.basename(
                      tempPath), 'g');
                    fileStr = fileStr.replace(pat, '/' + path.basename(
                      newImgPath));
                    //缓存图片文件目录转换前后的映射关系
                    if (!imgPathMap[tempPath]) {
                      imgPathMap[tempPath] = newImgPath;
                    }
                  }
                } else {
                  grunt.log.warn(tempPath + " not exists!");
                }
              });
            }

            if (urlImgPaths && urlImgPaths.length > 0) {
              urlImgPaths.forEach((imgPath) => {
                let tempPath = imgPath.replace(/"|'/g, "");
                tempPath = tempPath.replace(/url\(/, "");
                tempPath = tempPath.replace(/\)/, ""); //得到图片路径字符串

                let tempDirPath = dirPath;
                if (dirPath.indexOf("component") > -1) {
                  let tempAry = dirPath.split('/');
                  tempAry.pop();
                  tempAry.pop();
                  tempDirPath = tempAry.join('/');
                }
                tempPath = path.join(tempDirPath, tempPath);
                if (grunt.file.exists(tempPath)) {
                  if (getFileBytes(tempPath) <= options.limit) {
                    let base64 = convertImgUrl2Base64(tempPath);
                    base64 = 'url(' + base64 + ')';
                    imgPath = imgPath.replace(/\./g, '\\.');
                    imgPath = imgPath.replace(/\(/g, '\\(');
                    imgPath = imgPath.replace(/\)/g, '\\)');
                    let pat = new RegExp(imgPath, 'g');

                    fileStr = fileStr.replace(pat, base64);

                    //缓存转成base64字符串的图片路径
                    if (!imgBase64PathList[tempPath]) {
                      imgBase64PathList[tempPath] = 1;
                    }
                  } else {
                    //md5签名重命名
                    let newImgPath = renameImgByMd5(tempPath);
                    let pat = new RegExp('/' + path.basename(
                        tempPath),
                      'g');
                    fileStr = fileStr.replace(pat, '/' + path.basename(
                      newImgPath));
                    //存储图片文件目录转换前后的映射关系
                    if (!imgPathMap[tempPath]) {
                      imgPathMap[tempPath] = newImgPath;
                    }
                  }
                } else {
                  grunt.log.warn(tempPath + " not exists!");
                }

              });
            }
            //替换base64之后把文件字符串重新写到本地文件中
            grunt.file.write(filePath, fileStr);
          } else {
            grunt.log.warn(file + ' not exists');
          }

        })
      );

      //根据图片文件目录转换前后的映射表，修改图片文件名
      for (let oriImgPath in imgPathMap) {
        fs.renameSync(oriImgPath, imgPathMap[oriImgPath]);
      }
      imgPathMap = null;

      //删除已转成base64字符串的图片文件
      for (let imgPath in imgBase64PathList) {
        fs.unlinkSync(imgPath);
      }
      imgBase64PathList = null;

      grunt.log.write("files has converted");
    });

  /**
   * @desc 根据图片的url生成图片的base64编码的字符串
   * @arg {string} imgUrl 图片url，支持本地地址和网络地址
   * @return {string} base64字符串
   */
  function convertImgUrl2Base64(imgUrl) {
    let buffer = grunt.file.read(imgUrl, {
      encoding: null
    });

    return '"data:image/' + imgUrl.substr(imgUrl.lastIndexOf('.') + 1) +
      ';base64,' + Buffer.from(buffer).toString('base64') + '"';
  }

  /**
   * @desc 获取文件字节大小
   * @arg {string} filePath 文件路径
   */
  function getFileBytes(filePath) {
    let buffer = grunt.file.read(filePath, {
      encoding: null
    });
    return buffer.length;
  }

  /**
   * @desc 计算图片文件的md5值，重命名图片文件
   * @arg {string} filePath 图片文件目录
   * @return {string} 生成的新的图片文件目录
   */
  function renameImgByMd5(filePath) {

    //md5签名重命名
    let md5hash = crypto.createHash('md5');
    let ext = path.extname(filePath);
    let tempFileName = path.basename(filePath).replace(ext, '');

    md5hash.update(grunt.file.read(filePath));

    let newFileName = tempFileName + '_' +
      getShortMD5(md5hash.digest('hex')) + ext;

    return path.join(path.dirname(filePath), newFileName);;
  }

  /**
   * @desc 通过截取的方式把32位的md5加密字符串缩短到6位
   * @arg {string} md5Str 32位的md5加密字符串
   * @return {string} 6位的md5加密字符串
   */
  function getShortMD5(md5Str) {
    return md5Str[0] + md5Str[6] + md5Str[12] + md5Str[18] + md5Str[24] +
      md5Str[30];
  }

};
