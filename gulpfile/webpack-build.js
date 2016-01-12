var gulp = require("gulp");
var gutil = require("gulp-util");
var del = require('del');
var argv = require('minimist')(process.argv.slice(2));
var webpack = require("webpack");
var OpenBrowserPlugin = require('open-browser-webpack-plugin');
var CopyWebpackPlugin = require('copy-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var WebpackDevServer = require("webpack-dev-server");
var fs = require('fs');

// 分别是测试环境和线上环境的配置文件
var devConfig = require("../webpack.config.js");
var proConfig = require("../webpack.config.production.js");

gulp.task('clean',function(){
	del.sync(['app/build/*','app/dist/*']);
	console.log("清理完成");
});

// 生产环境的构建
gulp.task("build:pro", ["clean","webpack:build-pro"]);

// 测试环境的构建
gulp.task("build:dev", ["clean","webpack:build-dev"]);

// 热部署
gulp.task("build:hot", ["clean","webpack:build-hot"]);

// webpack的控制权全部在config上
gulp.task("webpack:build-pro", function(callback) {

	// js运行命令行,传入蚕户
	var myConfig = Object.create(proConfig);
	myConfig.plugins = myConfig.plugins.concat(
		new webpack.DefinePlugin({
			"process.env": {
				// 对react的库大小有影响
				"NODE_ENV": JSON.stringify("production")
			}
		})
	);

	// 线上环境编译
	webpack(myConfig, function(err, stats) {
		if(err) throw new gutil.PluginError("webpack:build", err);
		gutil.log("[线上环境编译构建启动...]", stats.toString({
			colors: true
		}));
		callback();
	});
});

// 据说这样写可以缓存起webpack的测试配置
var myDevConfig = Object.create(devConfig);
	myDevConfig.devtool = "sourcemap";
	myDevConfig.debug = true;
var devCompiler = webpack(myDevConfig);

gulp.task("webpack:build-dev", function(callback) {
	devCompiler.run(function(err, stats) {
		if(err) throw new gutil.PluginError("webpack:build-dev", err);
		gutil.log("[测试环境变变异建启动]", stats.toString({
			colors: true
		}));
		callback();
	});
});

// 热替换(本地测试)	
gulp.task("webpack:build-hot", function(callback) {

	var myConfig = Object.create(devConfig);
	myConfig.devtool = "eval";
	myConfig.debug = true;

	// 传入端口,默认为9090
	var port = argv.port || 9090;
	var hotStr1 = 'webpack/hot/dev-server';
	var hotStr2 = 'webpack-dev-server/client?http://localhost:'+port;

	// 如果入口是这里插入热部署需要的路径,判断是多路径还是单路径
	if(Array.isArray(myConfig.entry)){
		console.log('单入口文件');
		myConfig.entry.unshift(hotStr2);
		myConfig.entry.unshift(hotStr1);
	}else{
		console.log('多入口文件');
		for(var attr in myConfig.entry){
			myConfig.entry[attr].unshift(hotStr2);
			myConfig.entry[attr].unshift(hotStr1);
		}				
	}

	console.log("入口文件最终:");
	console.dir(myConfig.entry);
	
	// 在这里定义热替换
	myConfig.plugins = myConfig.plugins.concat(
		new webpack.HotModuleReplacementPlugin(),	
    	new OpenBrowserPlugin({ url: 'http://localhost:' + port })
	);	

	console.log("content base:",myConfig.output.path);
	// 正式启动服务器
	new WebpackDevServer(webpack(myConfig), {
		contentBase: myConfig.output.path,
		hot:true,
		historyApiFallback: true,
		progress:true,
		inline: true,
		watchOptions: {
		    aggregateTimeout: 300,
		    poll: 1000
		  },		
		stats: {
			colors: true		
		}
	}).listen(port, "localhost", function(err) {
		if(err) throw new gutil.PluginError("webpack-dev-server", err);
		gutil.log("[启动热替换]", "http://localhost:9090/webpack-dev-server/index.html");
		callback();
	});
});