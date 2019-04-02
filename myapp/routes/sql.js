var express = require('express');
var router = express.Router();
var fs = require('fs');
var multer = require('multer');
var upload = multer({
	dest: 'upload_tmp'
});

var isTLE = false;
var child_process = require("child_process")
/* GET users listing. */
function runbat(res) {
	child_process.execFile("run.bat", null, {
		cwd: 'D:\\MyOnlineJudge\\myapp\\cpp'
	}, function(error, stdout, stderr) {
		if (error !== null) {
			console.log("exec error" + error)
		} else console.log("运行bat成功");
		console.log('stdout: ' + stdout);
		console.log('stderr: ' + stderr);
		if (isTLE) return;
		if (stderr == "")
			fs.readFile('cpp/result.txt', 'utf8', function(err, data) {
				console.log(data);
				res.send(data);
			});
		else
			res.send('编译错误\n' + stderr);
	});
}

function prepare2(res, id) {
	fs.readFile('data/' + id + '/' + id + '.out', 'utf8', function(err, data) {
		fs.writeFile("cpp/std.out", data, function(error) {
			if (error) {
				throw error;
			} else {
				console.log("输出文件准备完毕");
			}
			runbat(res);
		});
	});
}

function prepare(res, id) {
	fs.readFile('data/' + id + '/' + id + '.in', 'utf8', function(err, data) {
		fs.writeFile("cpp/src.in", data, function(error) {
			if (error) {
				throw error;
			} else {
				console.log("输入文件准备完毕");
			}
			prepare2(res, id);
		});
	});

}

function TLE(res) {
	//res.send('运行超时\n
	//console.log("响应超时.");
}
router.post('/submit', upload.single('code'), function(req, res, next) {
	fs.rename(req.file.path, "cpp/" + "src.cpp", function(err) {
		if (err) {
			throw err;
		}
		console.log('上传成功!');
		isTLE = false;
		res.setTimeout(6000, function(res) {
			isTLE = true;
			this.send('运行超时\n');
		});
		prepare(res, req.query.id);
	});


});
router.post('/insertproblem', upload.array("_file", 2), function(req, res, next) {
	console.log(req.files);
	fs.mkdir("data/" + req.body.id, function(err) {
		if (err) {
			return console.error(err);
		}
		fs.rename(req.files[0].path, "data/" + req.body.id + '/' + req.body.id + ".in", function(err) {
			if (err) {
				throw err;
			}
			console.log('上传输入文件成功!');
		});
		fs.rename(req.files[1].path, "data/" + req.body.id + '/' + req.body.id + ".out", function(err) {
			if (err) {
				throw err;
			}
			console.log('上传输出文件成功!');
		})
		console.log("目录创建成功。");

	});

	var mysql = require('mysql');
	var connection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: '123456'
	});
	connection.connect();
	console.log(req.files);
	var ID = req.body.id;
	let qq =
		"INSERT INTO oj.problems (p_title,p_time,p_memory,p_description,p_input,p_output,p_sampleinput,p_sampleoutput) VALUES('" +
		req.body.name + "','" +
		req.body.time + "','" +
		req.body.memory + "','" +
		req.body.description + "','" +
		req.body.input + "','" +
		req.body.output + "','" +
		req.body.sampleinput + "','" +
		req.body.sampleoutput + "')";
	console.log(qq);
	connection.query(qq, function(err, rows, fields) {
		if (err) throw err;

		res.send();
	});
});
router.get("/insertuser", function(req, res, next) {
	var mysql = require('mysql');
	var connection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: '123456'
	});
	connection.connect();
	let qq = "INSERT INTO oj.user (username,password,type)VALUES('" +
		req.query.username + "','" +
		req.query.password + "','" +
		"normal" + "')";
	console.log(qq);
	connection.query(qq, function(err, rows, fields) {
		if (err) {
			throw err;
		}
		res.send();
	});
	connection.end();
	//return res.json(ans);
});

function getProw(row) {
	now = {};
	now.id = row.p_id;
	now.title = row.p_title;
	now.type = row.p_type;
	now.time = row.p_time;
	now.memory = row.p_memory;
	now.description = row.p_description;
	now.input = row.p_input;
	now.output = row.p_output;
	now.sampleinput = row.p_sampleinput;
	now.sampleoutput = row.p_sampleoutput;
	return now;
}

function getUrow(row) {
	now = {};
	now.id = row.id;
	now.username = row.username;
	now.password = row.password;
	now.type = row.type;
	return now;
}
router.get("/problem", function(req, res, next) {
	var mysql = require('mysql');
	var connection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: '123456'
	});
	connection.connect();
	let qq = "SELECT * FROM oj.problems where p_id=" + req.query.pid;
	console.log(qq);
	var ans = [];
	connection.query(qq, function(err, rows, fields) {
		if (err) {

			throw err;
		}
		if (!rows.length) {
			return res.json([]);
		}
		for (var row of rows) {
			console.log(row);
			var now = getProw(row);
			ans.push(now);
		}
		return res.json(ans);
	});
	connection.end();
	//return res.json(ans);
});
router.get("/user", function(req, res, next) {
	var mysql = require('mysql');
	var connection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: '123456'
	});
	connection.connect();
	let qq = "SELECT * FROM oj.user where username='" + req.query.username + "'";
	console.log(qq);
	var ans = [];
	connection.query(qq, function(err, rows, fields) {
		if (err) {

			throw err;
		}
		if (!rows.length) {
			return res.json([]);
		}
		for (var row of rows) {
			console.log(row);
			var now = getUrow(row);
			ans.push(now);
		}
		return res.json(ans);
	});
	connection.end();
	//return res.json(ans);
});
router.get("/detail", function(req, res, next) {
	var mysql = require('mysql');
	var connection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: '123456'
	});
	connection.connect();
	if (!req.query.id) {
		var qq = "SELECT * FROM movie.movie_detail";
		console.log(qq);
		var ans = [];
		connection.query(qq, function(err, rows, fields) {
			if (err) throw err;
			for (var row of rows) {
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
			if (err) throw err;
			for (var row of rows) {
				var now = getrow(row);
				ans.push(now);
			}
			//console.log(ans);
			return res.json(ans);
		});
	}
});
router.get('/search', function(req, res, next) {
	var mysql = require('mysql');
	var connection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: '123456'
	});
	connection.connect();
	var qq = "SELECT * FROM movie.movie_detail where name like'%" + req.query.moviename + "%'";
	console.log(qq);
	var ans = [];
	connection.query(qq, function(err, rows, fields) {
		if (err) throw err;
		for (var row of rows) {
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
	if (req.query.name) {
		//var qq=["a","b"].join('');
		var qq = "SELECT `seats` FROM movie.data where performance='" + req.query.name + "'";
		console.log(qq);
		var ans;
		connection.query(qq, function(err, rows, fields) {
			if (err) throw err;
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
		if (err) throw err;
		let qq = "delete from movie.data where performance like '" + req.body.id + "-%'";
		console.log(qq);
		connection.query(qq, function(err, rows, fields) {
			if (err) throw err;
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
		if (err) throw err;

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
		if (err) throw err;
		if (rows.length) {
			res.send("fail");
			return;
		}
		let qq = "INSERT INTO movie.mylike (account, movieid) VALUES ('" + req.body.account + "','" + req.body.id + "')";
		console.log(qq);
		connection.query(qq, function(err, rows, fields) {
			if (err) throw err;
			res.send("success");
		});
	});

});
module.exports = router;
