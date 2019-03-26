var express = require('express');
var router = express.Router();
var fs = require('fs');
var multer = require('multer');
var upload = multer({
	dest: 'upload_tmp'
});
var child_process=require("child_process")
/* GET users listing. */
function runbat(res)
{
	child_process.execFile("run.bat",null,{cwd:'D:\\MyOnlineJudge\\myapp\\cpp'},function(error,stdout,stderr){
		if(error !==null){
			console.log("exec error"+error)
		}
		else console.log("运行bat成功");
		console.log('stdout: ' + stdout);
		console.log('stderr: ' + stderr);
		if(stderr=="")
		fs.readFile('cpp/result.txt', 'utf8', function(err, data){
			console.log(data);
			res.send(data);
		});
		else
			res.send('编译错误\n'+stderr);
	});
}
router.post('/insert', upload.single('code'), function(req, res, next) {
	fs.rename(req.file.path, "cpp/" + "src.cpp", function(err) {
		if(err) {
			throw err;
		}
		console.log('上传成功!');
		runbat(res);
	});


});

function getrow(row) {
	now = {};
	now.id = row.id;
	now.name = row.name;
	now.score = row.score;
	now.director = row.director;
	now.image = row.image;
	now.actor = row.actor;
	now.comment = row.comment;
	now.ename = row.ename;
	now.mtime = row.mtime;
	now.ctime = row.ctime;
	now.info = row.info;
	now.type = row.type;
	now.recommend = row.recommend;
	now.background = now.background;
	now.wanted = row.wanted;
	now.accountscore = row.accountscore;
	return now;
}
router.get("/mylike", function(req, res, next) {
	var mysql = require('mysql');
	var connection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: '123456'
	});
	connection.connect();
	let qq = "SELECT movieid FROM movie.mylike where account='" + req.query.account + "'";
	console.log(qq);
	var idarr = "";
	connection.query(qq, function(err, rows, fields) {
		if(err) throw err;
		if(!rows.length) {
			return res.json([]);
		}
		for(var row of rows) {
			//console.log("movieid=",row.movieid);
			idarr += "'" + row.movieid + "',";
		}
		idarr = idarr.substr(0, idarr.length - 1);
		var ans = [];
		let qq = "SELECT * FROM movie.movie_detail where id in(" + idarr + ")";
		console.log(qq);
		connection.query(qq, function(err, rows, fields) {
			if(err) throw err;
			for(var row of rows) {
				var now = getrow(row);
				ans.push(now);
			}
			console.log(ans);
			return res.json(ans);
		});
		//return res.json(ans);
	});

});
router.get("/detail", function(req, res, next) {
	var mysql = require('mysql');
	var connection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: '123456'
	});
	connection.connect();
	if(!req.query.id) {
		var qq = "SELECT * FROM movie.movie_detail";
		console.log(qq);
		var ans = [];
		connection.query(qq, function(err, rows, fields) {
			if(err) throw err;
			for(var row of rows) {
				var now = getrow(row);
				ans.push(now);
			}
			//console.log(ans);
			return res.json(ans);
		});
	} else {
		var qq = "SELECT * FROM movie.movie_detail where id='" + req.query.id + "'";
		console.log(qq);
		var ans = [];
		connection.query(qq, function(err, rows, fields) {
			if(err) throw err;
			for(var row of rows) {
				var now = getrow(row);
				ans.push(now);
			}
			//console.log(ans);
			return res.json(ans);
		});
	}
});
router.get('/search',function(req,res,next){
	var mysql = require('mysql');
	var connection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: '123456'
	});
	connection.connect();
	var qq = "SELECT * FROM movie.movie_detail where name like'%"+req.query.moviename+"%'";
		console.log(qq);
		var ans = [];
		connection.query(qq, function(err, rows, fields) {
			if(err) throw err;
			for(var row of rows) {
				var now = getrow(row);
				ans.push(now);
			}
			//console.log(ans);
			return res.json(ans);
		});
});
router.get(/\w*/, function(req, res, next) {
	var mysql = require('mysql');
	var connection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: '123456'
	});

	connection.connect();
	if(req.query.name) {
		//var qq=["a","b"].join('');
		var qq = "SELECT `seats` FROM movie.data where performance='" + req.query.name + "'";
		console.log(qq);
		var ans;
		connection.query(qq, function(err, rows, fields) {
			if(err) throw err;
			ans = new String(rows[0].seats);
			console.log('The solution is: ', ans);
			res.send(ans);

		});
	} 

});
router.delete(/\w*/, function(req, res, next) {
	var mysql = require('mysql');
	var connection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: '123456'
	});
	connection.connect();
	//console.log(req);
	console.log(req.body.id);
	let qq = "delete from movie.movie_detail where id='" + req.body.id + "'";
	console.log(qq);
	connection.query(qq, function(err, rows, fields) {
		if(err) throw err;
		let qq = "delete from movie.data where performance like '" + req.body.id + "-%'";
		console.log(qq);
		connection.query(qq, function(err, rows, fields) {
			if(err) throw err;
			res.send("success");
		});
	});
});
router.put(/\w*/, function(req, res, next) {
	var mysql = require('mysql');
	var connection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: '123456'
	});
	connection.connect();
	//console.log(req);
	console.log(req.body.name);
	console.log(req.body.val);
	var qq = "UPDATE movie.data SET seats = " + req.body.val + "  WHERE performance ='" + req.body.name + "'";
	console.log(qq);
	connection.query(qq, function(err, rows, fields) {
		if(err) throw err;

		res.send("success");
	});
});
router.post("/like", function(req, res, next) {
	var mysql = require('mysql');
	var connection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: '123456'
	});
	connection.connect();
	//console.log(req);
	console.log(req.body.account);
	console.log(req.body.id);
	let qq = "select * from movie.mylike where account='" + req.body.account + "' and movieid='" + req.body.id + "'";
	console.log(qq);
	connection.query(qq, function(err, rows, fields) {
		if(err) throw err;
		if(rows.length) {
			res.send("fail");
			return;
		}
		let qq = "INSERT INTO movie.mylike (account, movieid) VALUES ('" + req.body.account + "','" + req.body.id + "')";
		console.log(qq);
		connection.query(qq, function(err, rows, fields) {
			if(err) throw err;
			res.send("success");
		});
	});

});
module.exports = router;