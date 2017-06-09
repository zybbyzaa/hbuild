
### <p align='center'>About Hbuild</p>

<p align="center">
  <img src="http://chuantu.biz/t5/92/1495463272x1822614086.png" alt="vuepack" width="60">
  <br><br><strong>Hbuild</strong> is a modern project starter kit<br>which  allows you to build your own project by cli rapidly
</p>

    
Hbuild使用`hbuild-cli`命令行工具，全局注册后可快速生成项目启动套件。你可以使用Hbuild生成一个h5项目，或者vue项目（默认搭配react-router，可自由选择vuex），或者react项目。该套件包含如下特点：
    
### Features
       
- Vue2 / Vue-Router / Vuex
- Hot reloading for single-file components
- Webpack 2 
- ES6
- LESS
- SASS
- React
- zepto
- autoprefixer
- mock server
- eslint
- Support for building multi-page applications
- offline mode support
- file hash

其中zepto是默认全局引入的，可直接使用。h5项目默认引入ejs模板引擎。默认支持Babel转码。支持HMR。支持文件hash，以解决缓存问题。
    
    
### Get Started
    
    
You'd better have node >=4 and npm >=3 and gulp >=3.9 installed:
    
```bash
$ npm install -g hbuild-cli
$ hbuild init new-project 
$ //or use
$ h init new-project //support short command
$ cd new-project
$ npm install || yarn
 
# edit files and start developing
$ npm run dev
# bundle all scripts and styles for production use
$ npm run prod
 
# lint your js code
$ npm run eslint
```
    

### Local Templates

when you clone this project,you can  use a template on your local file system:

```bash
$ git clone git@github.com:hawx1993/hbuild.git
$ hbuild init ./hbuild new-project
//or
$ h init ./hbuild new-project
```
### 命令

```
$ npm run dev;//本地开发模式，连接mock数据
$ npm run dev-daily;//本地开发模式，连接daily日常环境数据
$ npm run dev-pre;//本地开发模式，连接预发环境数据
$ npm run daily;//线上日常构建模式，连接daily日常环境数据
$ npm run pre;//线上预发构建模式，连接预发环境数据
$ npm run prod;//线上构建模式，连接线上环境数据
$ npm run eslint;//js代码审查，默认检查除lib文件夹下的js代码
```

### 编译

1.js代码默认采用Babel编译，webpack打包构建。

2.编译后的html文件默认输出到`build/pages`目录下，html文件名采用其在`src/pages`下的父级目录的文件名

3.编译后的静态资源文件（图片，字体，js文件等）存放到`build/static`目录下，编译支持文件hash，解决缓存问题

4.支持代码热替换，热替换失败会自动刷新整个页面

### HTML和模板引擎

1.h5项目支持ejs 和 mustache模板引擎，默认支持zepto，可直接使用。

2.当你执行发布线上的命令时，html和js代码会被压缩

3.当你在pages下新建一个目录时，html文件需要手动配置一下静态资源的引用

### CSS和预处理器

1.支持css预处理器LESS、SASS和stylus [optional];

2.默认采用`css-in-js`的方式，可在`hbuild.config.js`文件中配置是否单独提取css，提取出的css文件名称默认为：`[name].extract.css`

3.支持 屏幕适配方案，采用`media-query+rem`的方式，默认在`common.less`文件中

4.支持postcss和`autoprefixer`

### 代码检查

1.npm run eslint 支持检查vue单文件组件，支持es6语法检查

### 其他

- mock：mock 数据只需要接口URI路径和mock目录保持一致即可

- 接口：接口如需根据环境来替换，需在`hbuild.config.js`文件和`common/js/config`文件进行配置

- 支持多入口文件，可在pages下新建目录，文件名需以index开头

- 字符串替换：`$$_CDNPATH_$$`会被编译替换为`build/static/hash串`目录

- 入口文件：脚手架默认会读取pages目录下的index开头的js文件为入口文件，名称是写死的

- 修改默认文件夹的名称，需要在`hbuild.config.js`文件就对应文件变量做修改

- 提取CSS以及sourceMap功能只在非开发模式下进行。


### 目录结构

```bash
.
├── README.md
├── gulpfile.js                 # gulp文件
├── hbuild.config.js            # 脚手架配置文件
├── mock                        # mock数据目录，保持和接口一样的路径即可
│   └── h5
├── package.json    
├── src                         # 源文件 
│   ├── assets                  # 静态资源目录，存放图片或字体
│   │   └── logo.ico
│   ├── common                  # 共用代码目录，css目录存放公用css部分，js同理
│   │   ├── css
│   │   │   ├── common.less
│   │   │   └── common.scss
│   │   └── js
│   │       ├── api.js          # api文件
│   │       ├── config.js       # 配置文件
│   │       └── util.js         # 工具函数文件，可将公用方法存放于此
│   ├── components              # 组件
│   │   ├── counter             # 计数器vue组件
│   │   │   └── index.vue
│   │   ├── index               # vue组件的入口文件
│   │   │   └── index.vue
│   │   ├── meta                # h5 meta头部信息模块
│   │   │   └── index.html
│   │   ├── router              # vue路由模块
│   │   │   └── router.js
│   │   └── store               # vuex store模块
│   │       └── store.js
│   ├── lib                     # 第三方库 
│   └── pages                   # 页面    
│       └── index               # 首页目录，可在pages目录下新建多个目录结构，作为多入口文件
│           ├── index.html
│           ├── index.js        # index.js/index.jsx文件为webpack的入口文件
│           ├── index.jsx
│           ├── index.less      # 样式文件在js文件中引入，可设置是否提取出css文件     
│           ├── index.scss
│           └── module          # 页面模板模块，可在index.js/jsx文件引入该模块文件
│               ├── main.jsx
│               └── main.tpl.html
├── webpack.config.js
└── yarn.lock
```


### ChangeLog

1.新增mustache模板引擎支持，新增stylus预处理器支持，bug fixed --2017/6/9 18:30



### License
    
MIT © [hawx1993](https://github.com/hawx1993)
