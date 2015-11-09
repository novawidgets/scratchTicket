var gulp = require('gulp'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    plugins = gulpLoadPlugins();

gulp.task('build-component', function() {
  // place code for your default task here
    gulp.src('src/*/main.html')
        .pipe(plugins.watch('src/*/*.html'))
        .pipe(plugins.nova({
            combo: {
                baseUrl: '.'
            }
        }))
        .pipe(plugins.rename(function(path) {
            path.extname = '.js';
        }))
        //.pipe(plugins.babel())
        .pipe(gulp.dest('src'));
});

gulp.task('default', ['build-component']);
