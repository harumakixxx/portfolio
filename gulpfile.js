//gulp4仕様
/*
https://qiita.com/KazuyoshiGoto/items/d00ccfcbc3d27c9eb3f6
//npm init -y 初期化
//npm i gulp -D Gulpをインストール
//既存package.jsonがあれば、npm install で各モジュールインストール可能。
//新規モジュール↓
//npm install --save-dev gulp-nunjucks-render gulp-data gulp-beautify browser-sync gulp-imagemin gulp-plumber gulp-uglify gulp-concat
//npm install --save-dev gulp-html-beautify
////npm i -D gulp-imagemin@7.1.0
//npm i -D gulp gulp-sass sass
src 参照元を指定
dest 出力さきを指定
watch ファイル監視
series(直列処理)とparallel(並列処理)
*/
const { src, dest, watch, series, parallel } = require('gulp');

//SCSS---------------------
//更にアップデート https://flex-box.net/gulp-sass-5/
var sass = require('gulp-sass')(require('sass'));
// プラグインの処理をまとめる const{で最上段のgulpが実行される}
const cssSass = () => {
    return src('src/assets/sass/*.scss') //コンパイル元
        .pipe(sass({ outputStyle: 'expanded' }))
        .pipe(dest('dist/css'))     //コンパイル先
}

//nunjucks---------------------
//https://qiita.com/sygnas/items/149d52ec80b7d87bf697
//https://www.granfairs.com/blog/cto/nunjucks2
var nunjucksRender = require('gulp-nunjucks-render'); //gulp-nunjucks-renderを参照します
var beautify = require('gulp-html-beautify');
var data = require('gulp-data');
//const browsersync = require('browser-sync').create();;
var paths = {
    'src': {
        'root': './src/',
        'html': './src/html/',
        'html': './src/html/pages/',
        'json': './src/html/_data/site.json'
    },
    'dest': {
        'root': 'dist/'
    }
}

var beautify_option = {
    "indent_size": 2,
    "indent_char": " ",
    "max_preserve_newlines": 0,
    "preserve_newlines": false,
    "extra_liners": []
}


const compile = () => {
    return src(['src/html/pages/**/*.njk', '!src/html/pages/**/_*.njk'])
        .pipe(data(function () {
            return require(paths.src.json);
        }))
        //コンパイル
        .pipe(nunjucksRender({
            path: ['./src/html/'] //njkファイルの基点になるパス
        }))

        // HTML整形
        //https://dezanari.com/gulp-html-beautify/
        .pipe(beautify(beautify_option))
        .pipe(dest('./dist/'))     //コンパイル先
}

//画像圧縮 8.0系はESM形式なので、7.0系にダウングレード---------------------
//npm i -D gulp-imagemin@7.1.0
const imagemin = require('gulp-imagemin');
const imagemins = () => {
    return src('./src/assets/images/**')
        .pipe(imagemin())
        .pipe(dest('dist/images'))
}


//JS
//https://cly7796.net/blog/other/join-javascript-files-with-gulp/
var plumber = require('gulp-plumber');
var uglify = require("gulp-uglify")
var concat = require('gulp-concat');
const jscompiles = () => {
    return src(['src/assets/js/_*.js', 'src/assets/js/**/_*.js'])//階層差で読み込み順変更
        .pipe(plumber())
        .pipe(concat('script.js'))
        .pipe(dest('dist/js/'))
}


//ブラウザー
//https://designsupply-web.com/media/programming/3785/
//browser-sync
//exports.default = parallel(taskServer, taskWatch);
//解除 Ctr+C
const browsersync = require('browser-sync').create();

const taskServer = (done) => {
    browsersync.init({
        server: {
            baseDir: 'dist/',
            index: 'index.html'
        },
        port: 2000
    })
    done();
};
const taskReload = (done) => {
    browsersync.reload();
    done();
};

// Wacth-------------------------------
const WatchSass = () =>
    watch([
        'src/assets/sass/*.scss'
    ], cssSass);
const WatchCompile = () =>
    watch(['src/html/pages/**/*.njk', '!src/html/pages/**/_*.njk'], compile);
const Watchimagemins = () =>
    watch([
        './src/assets/images/**'
    ], imagemins);
const Watchjscompile = () =>
    watch(['src/assets/js/_*.js', 'src/assets/js/**/_*.js'], jscompiles);
const taskWatch = (done) => {
    watch('dist/**/*', taskReload);
    done();
}
// タスクをまとめて実行--------------------
//gulp.series(...tasks) ... 順番に実行する
//exports.default = series(cssSass, imagemins, compile, jscompiles);
//gulp.parallel(...tasks) ... 並列実行する
//exports.default = parallel(taskServer, taskWatch);
exports.default = parallel(WatchSass, WatchCompile, Watchimagemins, Watchjscompile, taskServer, taskWatch);
