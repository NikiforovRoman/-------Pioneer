const {src, dest, watch, parallel, series} = require("gulp");

const htmlmin = require('gulp-htmlmin');
const browserSync = require("browser-sync").create();
const scss = require("gulp-sass")(require("sass"));
const concat = require("gulp-concat");
const uglify = require("gulp-uglify-es").default;
const autoprefixer = require("gulp-autoprefixer");
const clean = require("gulp-clean");
const avif = require("gulp-avif");
const webp = require("gulp-webp");
const imagemin = require("gulp-imagemin");
const newer = require("gulp-newer");
const fonter = require("gulp-fonter");
const ttf2woff2 = require("gulp-ttf2woff2");

function htmlMin() {
    return src("src/*.html")
        .pipe(htmlmin({
            collapseWhitespace: true
        }))
        .pipe(dest("build"))
}

function styles() {
    return src("src/scss/style.scss")
        .pipe(autoprefixer({
            overrideBrowserslist: ["last 10 version"]
        }))
        .pipe(concat("style.min.css"))
        .pipe(scss({
            outputStyle: "compressed"
        }))
        .pipe(dest("src/css"))
        .pipe(browserSync.stream())
}

function fonts() {
    return src("src/fonts/source/*.*")
        .pipe(fonter({
            formats: ['woff', 'ttf']
        }))
        .pipe(src("src/fonts/*.ttf"))
        .pipe(ttf2woff2())
        .pipe(dest("src/fonts"))
}

function images() {
    return src(["src/img/source/*.*", "!src/img/source/*.svg"])
    .pipe(newer("src/img/dist"))
    .pipe(avif({
        quality: 50
    }))

    .pipe(src("src/img/source/*.*"))
    .pipe(newer("src/img/dist"))
    .pipe(webp())

    .pipe(src("src/img/source/*.*"))
    .pipe(newer("src/img/dist"))
    .pipe(imagemin())

    .pipe(dest("src/img/dist"))
}

function watching() {
    browserSync.init({
        server: {
            baseDir: "src/"
        },
        notify: false
    })
    watch(["src/scss/**/*.scss"], styles)
    watch(["src/img/source"], images)
    watch(["src/**/*.html"]).on("change", browserSync.reload);
}

function cleanBuild() {
    return src("build")
        .pipe(clean())
}

function building() {
    return src([
        "src/css/style.min.css",
        "src/img/dist/*.*",
        "src/fonts/*.*",
    ], {base: "src"})
        .pipe(dest("build"))
}

exports.styles = styles;
exports.images = images;
exports.fonts = fonts;
exports.building = building;
exports.watching = watching;
exports.htmlMin = htmlMin;

exports.build = series(htmlMin, cleanBuild, building, htmlMin);
exports.default = parallel(styles, images, watching);