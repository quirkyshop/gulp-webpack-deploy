module.exports = {
	verUrl:'http://120.26.200.225/upload/app/version',

	remote:{
		// 测试上传
		dev:{
			host:'120.26.200.225',
			user:'root',
			dest:'/mnt/blog/public/upload/app/build'
		},

		// 线上上传
		pro:{
			host:'120.26.200.225',
			user:'root',
			dest:'/mnt/blog/public/upload/app/dist'
		} 
	}
	
};