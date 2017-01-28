var gulp = require("gulp"),
    rollup = require('rollup-stream'),
    source = require('vinyl-source-stream'),
    sass = require('gulp-sass'),
    concat = require('gulp-concat'),
    webserver = require("gulp-webserver");

gulp.task("copy", function() {
  return gulp.src("src/*.html")
    .pipe(gulp.dest("dist"));
});

gulp.task("rollup", function() {
  return rollup({
    entry: "src/main.js",
    format: "umd",
    plugins: [
      require("rollup-plugin-json")(),
      require("rollup-plugin-riot")(),
      require("rollup-plugin-node-resolve")({
        jsnext: true,
        main: true,
        browser: true
      }),
      require("rollup-plugin-babel")({
        exclude: 'node_modules/**'
      }),
      require("rollup-plugin-commonjs")()
    ]
  })
    .pipe(source("main.js"))
    .pipe(gulp.dest("dist"));
});

gulp.task("sass", function() {
  gulp.src("src/style/**/*.scss")
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(concat("main.css"))
    .pipe(gulp.dest('dist'));
});

gulp.task("server", function() {
  return gulp.src("dist")
    .pipe(webserver({
      livereload: true,
      open: true
    }));
});

gulp.task("watch", function() {
  gulp.watch("src/**/*.{js,tag}", ["rollup"]);
  gulp.watch("src/style/**/*.scss", ["sass"]);
});

gulp.task("default", ["copy", "rollup", "sass"]);
gulp.task("develop", ["copy", "rollup", "sass", "server", "watch"]);
