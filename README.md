# grunt-lingxi-base64

> 处理html,js,css文件中的图片引用，把引用的小图片（图片大小可以配置）转成base64字符串，并且把图片引用替换成base64字符串；对不能转成base64字符串的图片，用图片文件内容的md5签名重命名，并同步到图片引用中，避免图片更新时，仍从缓存取的问题


## The "lingxi_base64" task

### Overview
In your project's Gruntfile, add a section named `lingxi_base64` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  lingxi_base64: {
    options: {
      limit: 5120 //限制要转成base64字符串的图片大小，单位是字节，默认是3KB
    },
    files: {
      src: []   //需要处理那些文件里面的图片引用
    }
  },
});
```

### Options

#### options.separator
Type: `String`
Default value: `',  '`

A string value that is used to do something with whatever.

#### options.punctuation
Type: `String`
Default value: `'.'`

A string value that is used to do something else with whatever else.

### Usage Examples

```js
grunt.initConfig({
  lingxi_base64: {
    options: {
      limit: 5120
    },
    files: {
      src: ['test/Target/*html', 'test/Target/css/*.css']
    }
  }
});
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_(Nothing yet)_
