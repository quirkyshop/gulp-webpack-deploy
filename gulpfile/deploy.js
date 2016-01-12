var gulp = require('gulp');
var html2jade = require('gulp-html2jade');
var es = require('event-stream');
var useref = require('gulp-useref');
var rev = require('gulp-rev');
var revReplace = require('gulp-rev-replace');
var zip = require('gulp-zip');
var fs = require('fs');
var semver = require('semver');
var request = require('request');
var rsync = require('gulp-rsync');
var revReplace = require('gulp-rev-replace');
var debug = require('gulp-debug');
var gulpSequence = require('gulp-sequence');
var argv = require('minimist')(process.argv.slice(2));
var config = require('../config.js');

var zipVer;
var getDeployVersion = function(cb){
    return request.get(config.verUrl+'?t='+(+new Date()),function(err,res,body){

      if(!body){
        cp(semver.valied('0.0.1'));
      }else{
        var online_version = semver.valid(body.trim());
        var upload_version = semver.inc(online_version,'patch');
        console.log('线上版本为:',online_version,'升级后为:',upload_version);    

        zipVer = upload_version;    
        cb(zipVer);          
      }
      
    });    

};

gulp.task('upload:dev',gulpSequence('env:dev','cache-control','htmlmini','version','zip','rsync'));
gulp.task('upload:pro',gulpSequence('env:pro','cache-control','htmlmini','version','zip','rsync'));

// 这里有挣扎，是否再封一层的make的，这里的决定是不封了，大部分改的地方还是gulp
// 封的层数多了，容易绊倒自己
var env,destPath;
gulp.task('env:dev',function(cb){
  env = 'develope';
  destPath = 'build';
  cb();
});

gulp.task('env:pro',function(cb){
  env = 'prodution';
  destPath = 'dist';
  cb();
});

gulp.task('cache-control',function(){
  console.log('正在构建...');
  var assets = useref.assets();
    return gulp.src('app/'+destPath+'/index.html')
    .pipe(assets)
    .pipe(rev())
    .pipe(gulp.dest('app/'+destPath))
    .pipe(assets.restore())
    .pipe(useref())
    .pipe(revReplace())
    .pipe(gulp.dest('app/'+destPath));
});

gulp.task('htmlmini',function(){

  return gulp.src('app/'+destPath+'/index.html')
    .pipe(gulp.dest('app/'+destPath))
    .pipe(html2jade())
    .pipe(gulp.dest('app/'+destPath))
});

gulp.task('version',function(cb){
  getDeployVersion(function(ver){
    if(!fs.existsSync('version')){
      fs.appendFileSync('version','','utf-8');
    }
    fs.writeFileSync('version',ver,'utf-8');
    console.log('更新本地版本',ver);
    gulp.src('version')
    .pipe(gulp.dest('app/'+destPath+'/'))
    .on('end',function(){
      cb();  
    })    
  })
});

gulp.task('zip',function(){
  console.log('正在打包部署...',zipVer);
    return gulp.src('app/'+destPath+'/*')
    .pipe(zip(destPath+'_'+zipVer+'.zip'))
    .pipe(gulp.dest('app/'+destPath));     
});

gulp.task('rsync',function(){
  console.log('正在发布...');
  var configObj;
  if (env === 'prodution') {
    configObj = config.remote.pro;
  } else {
    configObj = config.remote.dev;
  }

  return gulp.src('app/'+destPath+'/*')
    .pipe(rsync({
      root: 'app/'+destPath+'/',
      hostname: configObj.host,
      username: configObj.user,
      destination: configObj.dest
    }));  
});


