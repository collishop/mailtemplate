import gulp from "gulp";
import plugins from "gulp-load-plugins";
import browser from "browser-sync";
import rimraf from "rimraf";
import yargs from "yargs";
import lazypipe from "lazypipe";
import inky from "inky";
import fs from "fs";
import siphon from "siphon-media-query";
import path from "path";
import merge from "merge-stream";
import pug from "gulp-pug";
import rename from "gulp-rename";
import postcss from "gulp-postcss";
import precss from "precss";
import autoprefixer from "autoprefixer";

const $ = plugins();

const PRODUCTION = !!yargs.argv.production;

// Delete the "dist" folder (on new build)
function clean(done) {
  rimraf("dist", done);
}

// Pug → HTML → Inky
function pages() {
  return gulp
    .src(["src/views/index.pug"])
    .pipe(pug({}))
    .pipe(
      rename({
        extname: ".html"
      })
    )
    .pipe(inky())
    .pipe(gulp.dest("dist"));
}

// Sass → CSS
function sass() {
  return gulp
    .src("src/assets/sass/mail.sass")
    .pipe($.sourcemaps.init())
    .pipe(
      $.sass({
        includePaths: ["node_modules/foundation-emails/scss"]
      }).on("error", $.sass.logError)
    )
    .pipe(
      $.if(PRODUCTION, postcss([require("precss"), require("autoprefixer")]))
    )
    .pipe($.if(!PRODUCTION, $.sourcemaps.write()))
    .pipe(gulp.dest("dist/css"));
}

// Copy images
function images() {
  return (
    gulp
      .src(["src/assets/img/**/*", "!src/assets/img/archive/**/*"])
      // .pipe($.imagemin())
      .pipe(gulp.dest("./dist/assets/img"))
  );
}

// Inline CSS and minify HTML
function inline() {
  return gulp
    .src("dist/**/*.html")
    .pipe($.if(PRODUCTION, inliner("dist/css/mail.css")))
    .pipe(gulp.dest("dist"));
}

// Start LiveReload server
function server(done) {
  browser.init({
    server: "dist"
  });
  done();
}

// Watch for file changes
function watch() {
  gulp
    .watch("src/views/**/*.pug")
    .on("all", gulp.series(pages, inline, browser.reload));
  gulp
    .watch(["src/assets/sass/**/*.sass"])
    .on("all", gulp.series(sass, pages, inline, browser.reload));
  gulp
    .watch("src/assets/img/**/*")
    .on("all", gulp.series(images, browser.reload));
}

// Inlines CSS in HTML, add media query CSS in <style> tag, compresses the HTML
function inliner(css) {
  var css = fs.readFileSync(css).toString();
  var mqCss = siphon(css);

  var pipe = lazypipe()
    .pipe(
      $.inlineCss,
      {
        applyStyleTags: false,
        removeStyleTags: true,
        preserveMediaQueries: true,
        removeLinkTags: false
      }
    )
    .pipe(
      $.replace,
      "<!-- <style>-->",
      `<style>${mqCss}</style>`
    )
    .pipe(
      $.replace,
      '<link rel="stylesheet" href="css/mail.css">',
      ""
    )
    .pipe(
      $.htmlmin,
      { collapseWhitespace: true, minifyCSS: true }
    );

  return pipe();
}

// Copy and compress into Zip
function zip() {
  var dist = "dist";
  var ext = ".html";

  function getHtmlFiles(dir) {
    return fs.readdirSync(dir).filter(function(file) {
      var fileExt = path.join(dir, file);
      var isHtml = path.extname(fileExt) == ext;
      return fs.statSync(fileExt).isFile() && isHtml;
    });
  }

  var htmlFiles = getHtmlFiles(dist);

  var moveTasks = htmlFiles.map(function(file) {
    var sourcePath = path.join(dist, file); //           dist/index.html
    var fileName = path.basename(sourcePath, ext); //    index

    var moveHTML = gulp.src(sourcePath).pipe(
      $.rename(function(path) {
        path.dirname = fileName;
        return path;
      })
    );

    var moveImages = gulp
      .src(sourcePath)
      .pipe($.htmlSrc({ selector: "img" }))
      .pipe(
        $.rename(function(path) {
          path.dirname = fileName + path.dirname.replace("dist", "");
          return path;
        })
      );

    return merge(moveHTML, moveImages)
      .pipe($.zip(fileName + ".zip"))
      .pipe(gulp.dest("dist"));
  });

  return merge(moveTasks);
}

// Build the "dist" folder by running all of the below tasks
gulp.task("build", gulp.series(clean, pages, sass, images, inline));

// Build emails, run the server, and watch for file changes
gulp.task("default", gulp.series("build", server, watch));

// Build emails, then zip
gulp.task("zip", gulp.series("build", zip));
