var gulp = require('gulp');
var debug = require('gulp-debug');
var clean = require('gulp-clean');
var pug = require('gulp-pug');
var changed = require('gulp-changed');
var sass = require('gulp-sass');
var gutil = require('gulp-util');
var browserSync   = require('browser-sync').create();
var autoprefixer = require('gulp-autoprefixer');
var exec = require('child_process').exec;

var DESTINATION = 'build/drinkcircle';

var paths = {
    // This must be in the right order, so linked files are processed first.
    pug: [
      'includes/**/*.pug',
      'assets/vendor/**/*.pug',
      'layout/**/*.pug',
      'partials/**/*.pug',
      'product_maintenance/**/*.pug',
      './*.pug',
      '!**/_*.pug',
      '!node_modules/**/*',
      '!assets/vendor/tooltwist-views-client/boilerplate/**/*',
    ],
    scss: 'assets/css/**/*.scss',
    js: [
      'assets/scripts/**/*.js',
      'assets/vendor/**/*.js'
    ],
    assets: [
      'assets/css/**/*.css',
      'assets/images/**/*.*',
      // 'assets/scripts/**/*.*',
      'assets/vendor/bootstrap/dist/**/*.*',
      'assets/vendor/**/*.*',
      'assets/fonts/**/*.*',
      '!assets/css/*.scss',
      '!assets/vendor/**/*.pug',
      '!ssets/vendor/**/*.js',
    ],
    bower: [
      'bower_components/accounting/**/*.*',
      'bower_components/angular-animate/**/*.*',
      'bower_components/angular-aria/**/*.*',
      'bower_components/angular-bootstrap-toggle/dist/**/*.*',
      'bower_components/angular-ckeditor/**/*.*',
      'bower_components/angular-datatables/**/*.*',
      'bower_components/angular-material/**/*.*',
      'bower_components/angular-sanitize/**/*.*',
      'bower_components/angular/**/*.*',
      'bower_components/animate.css/**/*.*',
      'bower_components/bootbox.js/*.*',
      'bower_components/bootstrap/dist/**/*.*',
      'bower_components/ckeditor/**/*.*',
      'bower_components/cloudinary/**/*.*',
      'bower_components/dx-chartjs/*dx.chartjs.js',
      'bower_components/font-awesome/**/*.*',
      'bower_components/globalize/**/*.*',
      'bower_components/jquery.cookie/**/*.*',
      'bower_components/jquery/dist/**/*.*',
      'bower_components/jwt-decode/build/**/*.*',
      'bower_components/moment/**/*.*',
      'bower_components/mustache.js/*.*',
      'bower_components/ng-file-upload-shim/*.*',
      'bower_components/ng-file-upload/*.*',
      'bower_components/ng-tags-input/**/*.*',
      'bower_components/owl.carousel/dist/**/*.*',
      'bower_components/pastac-login/dist/**/*.*',
      'bower_components/pastac-add-supplier/dist/**/*.*',
      'bower_components/pastac-edit-supplier/dist/**/*.*',
      'bower_components/pastac-edit-product/dist/**/*.*',
      'bower_components/typeahead.js/dist/**/*.*',
      '!bower_components/jquery.cookie/*.json', // Exclude '.json' files
      '!bower_components/font-awesome/scss/**', // Exclude 'scss' folder
      '!bower_components/font-awesome/less/**', // Exclude 'less' folder
      '!bower_components/font-awesome/*.json', // Exclude '.json' files
      '!bower_components/font-awesome/*.txt', // Exclude '.txt' files
      '!bower_components/animate.css/*.js', // Exclude '.json' files
      '!bower_components/animate.css/*.json' // Exclude '.json' files
  ]
}

// - ###########################################################################
// - Runs the 'clean' task first before it run all other tasks.
// - ###########################################################################
gulp.task('default', ['clean'], function(cb) {
    exec('gulp main', function(err,stdout,stderr) {
        console.log(stdout);
        console.log(stderr);
        cb(err);
    });
});
gulp.task('main', ['pug-all', 'sass', 'js', 'copy', 'bower']);

// - ###########################################################################
// - Compile PUG files to HTML
// - ###########################################################################
gulp.task('pug-all', function() {
    /*
    * Compile ALL pug files except files with
    * file names that starts with an underscore('_').
    */
    return gulp.src(paths.pug, { base: './'})
    // Convert the pug files to html files
    .pipe(pug({
        doctype: 'html',
        pretty: true
    }))
    // Handle ug errors nicely
    .on('error', function(err){
        gutil.log(err.message);
        this.emit('end'); // prevents watch from dying
    })
    // Write a message
    .pipe(debug({title:'Installed'}))
    // Place the resultant HTML file into the destination directory.
    .pipe(gulp.dest(DESTINATION))
    // Refresh the page in the browser
    .pipe(browserSync.stream());
});

gulp.task('pug-incremental', (done) => {

    gulp.src(paths.pug, { base: './'})
    // Look for files newer than the corresponding .html
    // file in the destination directory.
    .pipe(changed(DESTINATION, {extension: '.html'}))
    // Convert the pug files to html files
    .pipe(pug({
        doctype: 'html',
        pretty: true
    }))
    // Handle ug errors nicely
    .on('error', function(err){
        gutil.log(err.message);
        this.emit('end'); // prevents watch from dying
    })
    // Write a message
    .pipe(debug({title:'Installed'}))
    // Place the resultant HTML file into the destination directory.
    .pipe(gulp.dest(DESTINATION))
    // Refresh the page in the browser
    .pipe(browserSync.stream());


    done();
});


gulp.task('watch', () => {
  gulp.watch(paths.pug, ['pug-incremental']);
});


// - ###########################################################################
// - Compile JS files
// - ###########################################################################
gulp.task('js', function() {
    return gulp.src(paths.js, { base: './'})
    // .pipe(browserify())
    // .pipe(uglify())
    //.pipe(gulp.dest(DESTINATION + '/assets/scripts'))
    .pipe(gulp.dest(DESTINATION))
    .pipe(browserSync.stream());;
});
gulp.task('js-incremental', function() {

  return gulp.src(paths.js, { base: './'})
  // Look for files newer than the corresponding .html
  // file in the destination directory.
  .pipe(changed(DESTINATION))
  // .pipe(browserify())
  // .pipe(uglify())
  //.pipe(gulp.dest(DESTINATION))
  .pipe(gulp.dest(DESTINATION))
  .pipe(browserSync.stream());;
});

// - ###########################################################################
// - Compile SASS files to CSS
// - ###########################################################################
gulp.task('sass', function() {
    return gulp.src(paths.scss, { base: './'})
    .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(gulp.dest(DESTINATION))
    .pipe(browserSync.stream());
});

// - ###########################################################################
// - Copy assets (css, images, scripts, etc...)
// - ###########################################################################
// var assetsBaseDir = "./assets";
// var assets = [
//     assetsBaseDir + '/css/**/*.css',
//     assetsBaseDir + '/images/**/*.*',
//     // assetsBaseDir + '/scripts/**/*.*',
//     assetsBaseDir + '/vendor/bootstrap/dist/**/*.*',
//     assetsBaseDir + '/vendor/**/*.*',
//     assetsBaseDir + '/fonts/**/*.*',
//     "!" + assetsBaseDir + '/css/*.scss',
//     "!" + assetsBaseDir + '/vendor/**/*.pug',
//     "!" + assetsBaseDir + '/vendor/**/*.js',
// ];
gulp.task('copy', function() {
    gulp.src(paths.assets, { base: './'})
    .pipe(gulp.dest(DESTINATION));
});

// - ###########################################################################
// - Copy plugins from bower
// - ###########################################################################
gulp.task('bower', function() {
    gulp.src(paths.bower, { base: './'})
    .pipe(gulp.dest(DESTINATION));
});

// - ###########################################################################
// - Clean task (deletes the public folder)
// - ###########################################################################
gulp.task('clean', function() {
    return gulp.src(DESTINATION, { read: false })
    .pipe(clean({force: true})); // added the 'force' option because the
    // directory is outside the gulpfile.js's root folder
});

// - ###########################################################################
// - Serve app and watch
// - ###########################################################################
gulp.task('serve', function() {
    browserSync.init({
        server: {
            baseDir: DESTINATION
        },
        port: 3030,
        //reloadDelay: 200 // Give the server time to pick up the new files.
    });
    console.log('')
    console.log('Please note that "serve" compiles and installs changed')
    console.log('pugs, but not other pugs that are dependant upon them.')
    console.log('To force compile every pug, use "gulp serve-all".');
    console.log('')
    console.log('')
    gulp.watch(paths.scss, ['sass']);
    gulp.watch(paths.js, ['js-incremental']);
    //    gulp.watch('./**/*.pug',['pug-watch']);
    gulp.watch(paths.pug,['pug-incremental']);
});

gulp.task('serve-all', function() {
    browserSync.init({
        server: {
            baseDir: DESTINATION
        },
        port: 3030,
        //reloadDelay: 200 // Give the server time to pick up the new files.
    });
    console.log('')
    console.log('Please note that "serve-all" compiles and installs')
    console.log('ALL pugs, so is quite slow. To only compile changed')
    console.log('pugs, use "gulp serve".');
    console.log('')
    console.log('')
    gulp.watch(paths.scss, ['sass']);
    gulp.watch(paths.js, ['js']);
    //    gulp.watch('./**/*.pug',['pug-watch']);
    gulp.watch(paths.pug,['pug-all']);
});
