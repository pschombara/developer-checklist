const gulp = require('gulp');
const src = 'src/';
const build = 'build/';

const newer = require('gulp-newer');
const imagemin = require('gulp-imagemin');
const htmlclean = require('gulp-htmlclean');

const terser = require('gulp-terser');
const jsonMinify = require('gulp-jsonminify');
const zip = require('gulp-zip');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const cssnano = require('cssnano');
const rollup = require('gulp-better-rollup');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const del = require('del');

const images = () => {
    const out = build + 'images/';

    return gulp.src(src + 'images/**/*')
        .pipe(newer(out))
        .pipe(imagemin({ optimizationLevel: 5 }))
        .pipe(gulp.dest(out));
};

const html = () => {
    const out = build + 'html/';

    return gulp.src(src + 'html/**/*')
        .pipe(newer(out))
        .pipe(htmlclean())
        .pipe(gulp.dest(out));
};

const js = async () => {
    gulp.src('src/js/*.js')
        .pipe(rollup(
            {
                plugins: [resolve(), commonjs()],
                onwarn: (message) => {
                    if (message.code === 'CIRCULAR_DEPENDENCY') {
                        return;
                    }
                    console.error(message);
                }
            },
            'esm'
        ))
        .pipe(terser())
        .pipe(gulp.dest('build/js'));

    gulp.src(src + 'background.js')
        .pipe(terser())
        .pipe(gulp.dest(build));
};


const css = async () => {
    gulp.src(src + 'scss/app.scss')
        .pipe(sass())
        .pipe(postcss([cssnano]))
        .pipe(gulp.dest(build + 'css/'));
};

const json = () => {
    return gulp.src([src + 'config.json', src + 'manifest.json'])
        .pipe(jsonMinify())
        .pipe(gulp.dest(build));
};

const fonts = () => {
    return gulp.src('node_modules/font-awesome/fonts/*')
        .pipe(gulp.dest(build + 'fonts/'));
};

const archive = () => {
    return gulp.src(build)
        .pipe(zip('jiraDevChecklist.zip'))
        .pipe(gulp.dest('./'));
};

exports.js = js;
exports.css = css;
exports.html = gulp.series(images, html);
exports.images = images;
exports.clean = del.bind(null, [build, 'jiraDevChecklist.zip']);
exports.json = json;
exports.fonts = fonts;
exports.archive = archive;

exports.build = (done) => {
    gulp.series(exports.clean, gulp.parallel(exports.html, exports.js, exports.css, exports.fonts, exports.json), exports.archive)(done);
};

exports.watch = () => {
    gulp.watch([src + 'js/**', src + 'background.js'], { ignoreInitial: false }, js);
    gulp.watch(src + 'scss/**', { ignoreInitial: false }, css);
    gulp.watch(src + 'html/**', { ignoreInitial: false }, html);
    gulp.watch(src + 'images/**', { ignoreInitial: false }, images);
};
