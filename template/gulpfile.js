/**
 * Created by trigkit4 on 2017/5/8.
 */
const path = require('path');
const fs = require('fs');
const gulp = require("gulp");
const del = require("del");
const ejs = require('gulp-ejs');
const crypto = require('crypto');
const replace = require('gulp-replace');
const htmlmin = require("gulp-htmlmin");
const gulpSequence = require('gulp-sequence');
const connect = require('gulp-connect');
const eslint = require('gulp-eslint');
const rename = require('gulp-rename');
const webpack = require('webpack');
const express = require('express');
const config = require('./hbuild.config');
const ParallelUglifyPlugin = require('webpack-parallel-uglify-plugin');
const webpackConfig = require('./webpack.config');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const StringReplacePlugin = require("string-replace-webpack-plugin");

const MYCONFIG = Object.create(webpackConfig);

let util = {
    getHash() {
        const secret = 'hbuild';
        let md5 = crypto.createHash('md5',secret),
            date = new Date(),
            str = date.getTime().toString(),
            hash;
        md5.update(str);
        hash = md5.digest('hex').substr(0, 6);

        return hash;
    },
    getEnvironment() {
        let env = {
                //是否是开发环境
                dev: false,
                environment: 3
            },
            argv = process.argv.pop() || '--dev';
        switch (argv) {
            case '--dev':
                env = {
                    dev: true, environment: 0
                };
                break;
            case '--dev-daily':
                env = {
                    dev: true, environment: 1
                };
                break;
            case '--dev-pre':
                env = {
                    dev: true, environment: 2
                };
                break;
            case '--daily':
                env = {
                    dev: false, environment: 1
                };
                break;
            case '--pre':
                env = {
                    dev: false, environment: 2
                };
                break;
            case '--prod':
                env = {
                    dev: false, environment: 3
                }
        }
        return env;
    }
};
let hash = util.getHash();
let args = util.getEnvironment();

function resolve(arg1,arg2,arg3) {
    return path.join(config[arg1],config[arg2]||'',arg3||'')
}
gulp.task("clean", ()=> {
    if (!config.buildPath) return null;

    del.sync(config.buildPath);
});

gulp.task("assets", ()=> {
    return gulp.src([resolve('src','assets')+'/*.+(ico|png|jpeg|jpg|gif|eot|svg|ttf|woff)'])
        .pipe(gulp.dest(resolve('buildPath','staticPath',hash)))
        .pipe(connect.reload());

});
gulp.task("html", ()=> {
    if (args.dev) {
        return gulp.src([resolve('src','pages')+'/*/+([^\.]).html'])
            .pipe(ejs())
            .pipe(replace(/\$\$_CDNPATH_\$\$/g, resolve('staticPath','',hash)))
            .pipe(rename(function(path) {
                path.basename = path.dirname;
                path.dirname = "";
            }))
            .pipe(gulp.dest(resolve('buildPath','pages'))).pipe(connect.reload());
    } else {
        return gulp.src([resolve('src','pages')+'/*/+([^\.]).html'])
            .pipe(ejs())
            .pipe(replace(/\$\$_CDNPATH_\$\$/g, '../'+resolve('staticPath','',hash)))
            .pipe(htmlmin({
                minifyJS: true,
                minifyCSS: true,
                collapseWhitespace: true,
                removeComments: true
            }))
            .pipe(rename(function(path) {
                path.basename = path.dirname;
                path.dirname = "";
            }))
            .pipe(gulp.dest(resolve('buildPath','pages')));
    }
});

//监听文件变化
gulp.task("watch", ["html"], ()=> {
    //watch html
    let urls = [config.src+"/**/*.html"];
    gulp.watch(urls, ()=> {
        gulp.start("html");
    });
    //watch assets
    let assets = config.src+'/'+config.assets+'/*.+(ico|png|jpeg|jpg|gif|eot|svg|ttf|woff)';
    gulp.watch(assets,()=>{
        gulp.start('assets')
    })
});

gulp.task("webpack", ()=> {

    let sourceMap = config.style.sourceMap;
    let extractFile = config.style.extractFileName;
    let rules = webpackConfig.module.rules;
    let plugins = webpackConfig.plugins;
    let replacements = config.replacement;
    let rep = replacements.map((val)=>{
        return {
            pattern: val.pattern,
            replacement: function () {
                return val.replace(args)
            }
        }
    });
    rules.push({
        test: /\.jsx?$/,
        include: [path.join(__dirname, 'src')],
        loader: StringReplacePlugin.replace({
            replacements: rep
        })
    });
    plugins.push(
        new StringReplacePlugin()
    );
    webpackConfig.output.path = path.join(__dirname,config.buildPath,
        config.staticPath,hash);
    let cssProcessors = [
        {{#if_eq preProcessor 'SASS'}}
    {loader: 'sass-loader?', test: /\.scss$/}{{else}}
    {loader: 'less-loader?', test: /\.less$/}
    {{/if_eq}}
    ];

    if(config.style.extract && !args.dev){
        cssProcessors.forEach(processor => {
            if(!processor.loader.indexOf('less-loader')){
                rules.push({
                    test: processor.test,
                    use: ExtractTextPlugin.extract({
                        use: [{
                            loader: 'css-loader',options:{
                                sourceMap: sourceMap
                            }
                        },{
                            loader: 'less-loader',options:{
                                sourceMap: sourceMap
                            }
                        }]
                    })
                });
                plugins.push(new ExtractTextPlugin(extractFile))
            }else if(!processor.loader.indexOf('sass-loader')){
                rules.push({
                    test: processor.test,
                    use: ExtractTextPlugin.extract({
                        use: [{
                            loader: 'css-loader',options:{
                                sourceMap: sourceMap
                            }
                        },{
                            loader: 'sass-loader',options:{
                                sourceMap: sourceMap
                            }
                        }]
                    })
                });
                plugins.push(new ExtractTextPlugin(extractFile))
            }
        });
    }else{
        rules.push(
            {{#if_eq preProcessor 'LESS'}}
            {
                test: /\.css$|\.less$/,
                loaders: ['style-loader','css-loader','less-loader']
            }{{/if_eq}}
            {{#if_eq preProcessor 'SASS'}},
            {
                test:  /\.css$|\.scss$/,
                loaders: ['style-loader', 'css-loader', 'sass-loader']
            }{{/if_eq}}
        )
    }
    //开发环境
    if (args.dev) {
        let hotMiddlewareScript = 'webpack-hot-middleware/client?reload=true';
        for(let k in webpackConfig.entry){
            webpackConfig.entry[k].unshift(hotMiddlewareScript)
        }
        webpackConfig.plugins.push(
            new webpack.DefinePlugin({
                'process.env': {
                    'NODE_ENV': '"development"'
                }
            }),
            new webpack.HotModuleReplacementPlugin()
        )
    //线上环境
    }else {
        //开发过程无需打开sourcemap
        let webpackSourceMap = config.sourceMap;
        if(webpackSourceMap){
            webpackConfig["devtool"] = 'source-map';
        }
        webpackConfig.plugins.push(
            new webpack.DefinePlugin({
                'process.env': {
                    'NODE_ENV': JSON.stringify("production")
                }
            }),
            new ParallelUglifyPlugin({
                cacheDir: 'node_modules/.cache/uglifyjs_cache',
                uglifyJS: {
                    output: {
                        comments: false
                    },
                    compress: {
                        warnings: false
                    }
                }
            })
        );
    }
    let compiler = webpack(MYCONFIG);

    return new Promise((resolve, reject)=> {
        let compilerRunCount = 0;

        function bundle(err, stats) {
            if (err) {
                return reject(err);
            }
            if (++compilerRunCount === (global.watch ? config.length : 1)) {
                return resolve();
            }
        }
        if (args.dev) {
            compiler.watch(200, bundle);
        } else {
            compiler.run(bundle);
        }
    });
});
//本地开发模式或连接本地mock数据
gulp.task("dev",()=> {
    gulp.start("server");
});
//部署日常，预发或线上
let taskName = process.argv.pop();
taskName !== 'dev' && gulp.task(taskName, ()=> {
    gulp.start("build");
});

gulp.task('build', (cb)=> {
    if (args.dev) {
        gulpSequence('clean', 'webpack','html', 'assets', 'watch', cb);
    } else {
        gulpSequence('clean', 'webpack', 'html', 'assets', cb);
    }
});

//启动本地服务器及mock server
gulp.task('server', ['build'], ()=> {
    let compiler = webpack(webpackConfig);
    const app = express();
    const devMiddleWare = require('webpack-dev-middleware')(compiler, {
        publicPath: webpackConfig.output.publicPath,
        quiet: true
    });
    connect.server({
        root: ['./', resolve('buildPath'),resolve('buildPath','pages')],
        port: config.port,
        host: config.host,
        middleware: ()=> {
            return [
                function(req, res, next) {
                    if (req.url.indexOf('mock') !== -1 && req.url.indexOf('.json') === -1) {
                        req.url = req.url.replace(/\?.*/, '') + '.json';
                    }
                    let filepath = path.join('./', req.url);
                    if ('POSTPUTDELETE'.indexOf(req.method.toUpperCase()) > -1 &&
                        fs.existsSync(filepath) && fs.statSync(filepath).isFile()) {
                        return res.end(fs.readFileSync(filepath));
                    }
                    next();
                },
                app.use(devMiddleWare),
                app.use(require('webpack-hot-middleware')(compiler, {
                    log: () => {}
                }))
            ];
        },
        livereload: true
    });
    if(config.open){
        require('opn')(`http://${config.host}:${config.port}`)
    }
});
//eslint
gulp.task('eslint', ()=> {
    let source = [path.join(config.src, '/**/*.{js,vue,jsx}'),
        '!' + path.join(config.lib, '/**/*.js')];
    return gulp.src(source)
        .pipe(eslint())
        .pipe(eslint.format())
});
