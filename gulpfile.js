/** --------------------------
 * @version 1.0.0
 * @name    RevealTemplate
 * @author  Goran Hrustić
 * @host    ElaThemes
 * @year    2020
 * @url     www.elathemes.com
 * -------------------------- */

'use strict';

// -----------------------
// Configuration 
// -----------------------
const DEV =     require('./source/app/data/global.json');
const CONFIG =  require('./config.json');

const SOURCES = CONFIG.SOURCE;
const APP =     CONFIG.APP;
const COPY =    CONFIG.COPY;

var PROD =      DEV.settings.production;

// -----------------------
// Plugins
// -----------------------

var gulp =      require('gulp');
var sass =      require('gulp-sass');
var smaps =     require('gulp-sourcemaps');
var del =       require('del');
var include =   require('gulp-include')
var rename =    require('gulp-rename');
var minifyjs =  require('gulp-uglify');
var htmlmin =   require('gulp-htmlmin');
var gulpif =    require('gulp-if');

// -----------------------
// Handlebars setup
// -----------------------

var Panini = require('panini').Panini;

var BUILDHTML = new Panini(APP);
    BUILDHTML.loadBuiltinHelpers();
    BUILDHTML.refresh();

// -----------------------
// Tasks
// -----------------------

// Deletes the dist folder so the build can start fresh.
// -----------------------------------------------------

gulp.task('reset', gulp.parallel(
    function resetProd() { return del(SOURCES.prod); }
));

// Copies the necessary files from src to dist.
// --------------------------------------------

gulp.task('copy', gulp.parallel(
    async function generateScripts() {
        if(PROD) {
            return gulp
            .src(SOURCES.src_js + '/core.js')
            .pipe(smaps.init())
            .pipe(include())
            .pipe(minifyjs())
            .pipe(rename('bundle.min.js'))
            .pipe(gulp.dest(SOURCES.prod_js))
        } else {
            return gulp
            .src(COPY.js)
            .pipe(gulp.dest(SOURCES.prod_js));
        }
    },
    async function generateStyles() {
        if (PROD) {
                return gulp
                .src(SOURCES.src_css + '/bundle.scss')
                .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
                .pipe(rename('bundle.min.css'))
                .pipe(gulp.dest(SOURCES.prod_css + '/vendor'));
            
        } else {
            return gulp
            .src(COPY.css)
            .pipe(gulp.dest(SOURCES.prod_css));
        }
    },
    async function copyFonts() {
        if(PROD) {
            return gulp 
            .src(COPY.css + 'fonts/**')
            .pipe(gulp.dest(SOURCES.prod_css));
        }
    },
    async function copyMedia() {
        return gulp
            .src(COPY.img)
            .pipe(gulp.dest(SOURCES.prod_img));
    },
    async function copySvg() {
        return gulp
            .src(COPY.svg)
            .pipe(gulp.dest(SOURCES.prod + '/assets/svg'));
    }
));

// Compile stylesheets
// -------------------

gulp.task('sass', function () {
    return gulp
        .src(SOURCES.src_css + '/style.scss')
        .pipe(smaps.init())
        .pipe(rename('style.css'))
        .pipe(sass({ outputStyle: 'expanded' }).on('error', sass.logError))
        .pipe(smaps.write('.'))
        .pipe(gulp.dest(SOURCES.prod_css))
});

// Compiles HTML templates with Panini
// -----------------------------------

gulp.task('html', function () {
    return gulp
        .src(APP.root + '/**/*.hbs')
        .pipe(BUILDHTML.render())
        .pipe(rename({ extname: '.html' }))
        .pipe(gulpif(PROD, htmlmin({ collapseWhitespace: true, removeComments: true })))
        .pipe(gulp.dest(SOURCES.prod));
});

// ------------------------- Build project ---------------------------- //

gulp.task('build', gulp.series('reset', 'copy', 'sass', 'html'));

// ------------------------- Build production -------------------------- //
// -------------------- Make sure to set PROD true --------------------- //

gulp.task('build-production', gulp.series('reset', 'copy', 'html'));

