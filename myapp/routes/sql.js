var express = require('express');
var router = express.Router();
var fs = require('fs');
var multer = require('multer');
var upload = multer({
	dest: 'upload_tmp'
});

var isTLE = false;
var child_process = require("child_process");
module.exports = router;
/* GET users listing. */
var running=new Array(100);
for (let i=0;i<running.length;i++) running[i]=0;
function runbat(res,evaluation) {
	child_process.execFile("run.bat", null, {
		cwd: 'D:\\MyOnlineJudge\\myapp\\evaluation\\'+evaluation
	}, function(error, stdout, stderr) {
		if (error !== null) {
			console.log("exec error" + error)
		} else console.log("运行bat成功");
		console.log('stdout: ' + stdout);
		console.log('stderr: ' + stderr);
		console.log(parseInt(evaluation.substring(10)));
		running[parseInt(evaluation.substring(10))]=0;
		if (isTLE) return;
		if (stderr == "")
			fs.readFile('evaluation/'+evaluation+'/result.txt', 'utf8', function(err, data) {
				console.log(data);
				res.send(data);
			});
		else
			res.send('编译错误\n' + stderr);
	});
}

function prepare2(res, id,evaluation) {
	fs.readFile('data/' + id + '/' + id + '.out', 'utf8', function(err, data) {
		fs.writeFile("evaluation/"+evaluation+"/std.out", data, function(error) {
			if (error) {
				throw error;
			} else {
				console.log("输出文件准备完毕");
			}
			runbat(res,evaluation);
		});
	});
}

function prepare(res, id,evaluation) {
	fs.readFile('data/' + id + '/' + id + '.in', 'utf8', function(err, data) {
		fs.writeFile("evaluation/"+evaluation+"/src.in", data, function(error) {
			if (error) {
				throw error;
			} else {
				console.log("输入文件准备完毕");
			}
			prepare2(res, id,evaluation);
		});
	});

}
function findIdleEvaluation(i, length,req,res,next) {
	let evaluation="evaluation"+i;
	if(running[i]==0){
		running[i]=1;
		console.log('评测机：'+i+'空闲');
		fs.rename(req.file.path, "evaluation/"+evaluation+"/" + "src.cpp", function(err) {
			if (err) {
				throw err;
			}
			console.log('上传成功!');
			isTLE = false;
			res.setTimeout(6000, function(res) {
				isTLE = true;
				let taskkill_command = 'taskkill /im '+evaluation+'.exe /f';
				child_process.exec(taskkill_command,{maxBuffer: 5000 * 1024},function(err, stdout, stderr){
					if(err){
						console.log('关闭进程异常：'+err);
					}
					console.log('超时进程关闭成功');

				});
				this.send('运行超时\n');
			});
			prepare(res, req.query.id,evaluation);
		});
	}
	else
	{
		if (++i<length)
		findIdleEvaluation(i,length,req,res,next);
	}
}
router.post('/submit', upload.single('code'), function(req, res, next) {
	findIdleEvaluation(1, 11,req,res,next);
	
});
router.post('/insertproblem', upload.array("_file", 2), function(req, res, next) {
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
	var ID = req.body.id;
	let qq =
		"INSERT INTO oj.problems (p_type,p_title,p_time,p_memory,p_description,p_input,p_output,p_sampleinput,p_sampleoutput) VALUES('" +
		req.body.type + "','" +
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
router.get("/passrecord", function(req, res, next) {
	var mysql = require('mysql');
	var connection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: '123456'
	});
	connection.connect();
	let qq = "SELECT * FROM oj.problems where p_id=" + req.query.pid;
	console.log(qq);
	connection.query(qq, function(err, rows, fields) {
		if (err) {
			throw err;
		}
		let q = "INSERT INTO oj.passrecord (username,p_id,p_type)VALUES('" +
			req.query.username + "','" +
			req.query.pid + "','" +
			rows[0].p_type + "')";
		console.log(q);
		connection.query(q, function(err, rows, fields) {
			if (err) {
				throw err;
			}
			res.send();
		});
	});
	//connection.end();
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
function getBrow(row) {
	now = {};
	now.username = row.username;
	now.algorithmname=row.algorithm_name;
	return now;
}
router.get("/problem", function(req, res, next) {

	if (!req.query.pid) return;
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

router.get("/totaltype", function(req, res, next) {
	var mysql = require('mysql');
	var connection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: '123456'
	});
	connection.connect();
	let qq = "SELECT * FROM oj.problems "
	if (req.query.type!="total")
	qq+="where p_type='" + req.query.type + "'";
	console.log(qq);
	var ans = [];
	connection.query(qq, function(err, rows, fields) {
		if (err) {

			throw err;
		}

		var s = 0;
		for (var row of rows) {
			s++;
		}
		var now = {};
		now.solve = s;
		ans.push(now);
		return res.json(ans);
	});
	connection.end();
	//return res.json(ans);
});
router.get("/passrecodeone", function(req, res, next) {
	var mysql = require('mysql');
	var connection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: '123456'
	});
	connection.connect();
	let qq = "SELECT * FROM oj.passrecord where p_id=" + req.query.pid + "&&username='" + req.query.username + "'";
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

router.get("/maxproblemid", function(req, res, next) {
	var mysql = require('mysql');
	var connection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: '123456'
	});
	connection.connect();
	let qq = "SELECT MAX(p_id) FROM oj.problems ";
	console.log(qq);
	var ans = [];
	connection.query(qq, function(err, rows, fields) {
		for (var row of rows) {
			dataString = JSON.stringify(row);
			var data = JSON.parse(dataString);
			console.log(Object.values(data)[0]);
			var now = {}
			now.id = Object.values(data)[0];
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

router.get("/personpassrecode", function(req, res, next) {
	var mysql = require('mysql');
	var connection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: '123456'
	});
	connection.connect();
	let qq = "SELECT * FROM oj.passrecord where username='" + req.query.username + "'";
	if (req.query.type != "total")
		qq += "&&p_type='" + req.query.type + "'";
	console.log(qq);
	var ans = [];
	connection.query(qq, function(err, rows, fields) {
		if (err) {
			throw err;
		}
		
		let s = 0;
		for (var row of rows) {
			//console.log(row);
			s++;
		}
		var now = {};
		now.solve = s;
		ans.push(now);
		return res.json(ans);
	});
	connection.end();
	//return res.json(ans);
});
router.get("/userability", function(req, res, next) {
	var mysql = require('mysql');
	var connection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: '123456'
	});
	connection.connect();
	let qq = "SELECT * FROM oj.userability where username='" + req.query.username 
	+ "'&&algorithm_name='"+req.query.algorithmname+"'";
	console.log(qq);
	var ans = [];
	connection.query(qq, function(err, rows, fields) {
		if (err) {
			throw err;
		}
		if (!rows.length) {
			return res.json([]);
		}
		let s = 0;
		for (var row of rows) {
			var now=getBrow(row);
			ans.push(now);
		}
		return res.json(ans);
	});
	connection.end();
	//return res.json(ans);
});
router.get("/adduserability", function(req, res, next) {
	var mysql = require('mysql');
	var connection = mysql.createConnection({
		host: 'localhost',
		user: 'root',
		password: '123456'
	});
	connection.connect();
	let qq = "INSERT ignore INTO oj.userability (username,algorithm_name)VALUES('"+
	req.query.username+"','"+
	req.query.algorithmname+"')";
	console.log(qq);
	connection.query(qq, function(err, rows, fields) {
		if (err) {
			throw err;
		}
		res.send();
	});
	//connection.end();
	//return res.json(ans);
});
