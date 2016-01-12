'use strict';

const gulp = require('gulp');
const requireDir = require('require-dir');
const tasks = requireDir('./gulpfile');
var gulpSequence = require('gulp-sequence');
var argv = require('minimist')(process.argv.slice(2));

// 热部署,测试构建,线上构建
gulp.task('build',['build:dev']);
gulp.task('dist',['build:pro']);
gulp.task('hot',['build:hot']);

// 测试部署,线上部署
gulp.task('upload',gulpSequence('build','upload:dev'));
gulp.task('production',gulpSequence('dist','upload:pro'));
