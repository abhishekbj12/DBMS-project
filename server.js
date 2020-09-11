var express = require("express");
var session = require("express-session");
var mysql = require('mysql');
var logger = require('morgan');
var path = require('path');

// Creating mysql connection
var connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'Passphrase123',
	database: 'parkingMgmt'
});
connection.connect(function (err) {
	if (!err) {
		console.log("Database is connected ... \n\n");
	} else {
		console.log("Error connecting database ... \n\n", err);
	}
});

var app = express();

// To read post data from client
// to parse json encoded bodies
app.use(express.json());

app.use(logger('dev'));

// to parse application/x-www-form-urlencoded
app.use(express.urlencoded({
	extended: true
}));

// Secret key is a random string and visible for the project purpose
app.use(session({secret:"bejffnhfjkghtv3hf48ncsio",
				resave:false, 
				saveUninitialized: true, 
				cookie: {
					maxAge: 60000000
					}
				}
			));

// To serve static files in 'public' folder with '/static' endpoint
app.use(express.static(path.join(__dirname, 'public')));

// Create Triggers RUN ONLY ONCE, THE FIRST TIME YOU ARE RUNNING THE APPLICATION

// var triggerFunc = (function(){
// 	connection.query("create trigger token_trig \
// 					after update on `token` for each row \
// 					begin \
// 							declare ba float(5,2); \
// 							select bill_amt into @ba \
// 							from token \
// 							where token_no = new.token_no; \
// 							update employee \
// 							set salary = salary - @ba \
// 							where emp_id = new.eid; \
// 					end;", 
// 					function(error, results, fields){
// 						if(error) {
// 							console.log("Error creating update trigger", error);
// 						}
// 						else if(results) {
// 							console.log("Update Trigger Created", results);
// 						}
// 					});
// 	connection.query("create trigger insert_token \
// 					after insert on `token` for each row \
// 					begin \
// 							update slots \
// 							set slots_avail = slots_avail - 1; \
// 					end;",
// 					function(error, results, fields){
// 						if(error) {
// 							console.log("Error creating insert trigger", error);
// 						}
// 						else if(results) {
// 							console.log("Insert Trigger Created", results);
// 						}
// 					});
// 	connection.query("create trigger delete_token \
// 					after delete on `token` for each row \
// 					begin \
// 							update slots \
// 							set slots_avail = slots_avail + 1; \
// 					end;",
// 					function(error, results, fields){
// 						if(error) {
// 							console.log("Error creating delete trigger", error);
// 						}
// 						else if(results) {
// 							console.log("Delete Trigger Created", results);
// 						}
// 					});
// 	return function(){};		
// })();



/* Routes */
// Home
app.get('/', function (req, res) {
	if(req.session.success) {
		res.redirect('/dashboard');
	} else {
		res.sendFile('login.html', {root: __dirname + '/public'});
	}
});

// Dashboard
app.get('/dashboard', function(req, res) {
	if(!req.session.user) {
		res.status(401).send('Unauthorized to access this page');
	} else {
		res.status(200).sendFile('app.html', { root: __dirname + '/public'});
	}
});

/* API */
// Login
app.post('/api/login', function(req, res){
	console.log(req.body);
	var flag = 0;
	connection.query("select * from login", function(error, results, fields) {
		if(error) {
			console.log("Bad query detected!");
		}
		else {
			results.forEach(function(result) {
				if(req.body.username == result.name && req.body.password == result.pswd) {
					req.session.user = req.body.username;
					req.session.success = true
					flag = 1;
				}
			});
			if(!flag){
				res.redirect('back');
			} else {
				res.redirect('/dashboard');
			}
		}
	});
});

// Logout
app.get('/api/logout', function(req, res) {
	req.session.destroy();
	res.redirect('/');
});

var validate = function (req, res, next) {
    if (req.session.success === true) {
        console.log("If True");
        next();
    } else {
        console.log("If False");
        res.redirect("/");
    }
}

app.use(validate);


// Vehicle Entry Updation
app.post('/api/vehicleEntry', function(req, res) {
	
	console.log("Reached here");

	var myFunc = (function(){
		connection.query("create table if not exists `vehicle`( \
			registration varchar(20) not null primary key, \
			color varchar(20), \
			type varchar(20));", 
			function(error, results, fields) {
				if(error) {
					console.log("Error in creating table VEHICLE", error);
				}
			});
		connection.query("create table if not exists `token`( \
			token_no int not null primary key auto_increment, \
			entry_time datetime not null, \
			exit_time datetime , \
			bill_amt bigint , \
			eid int not null, \
			foreign key(eid) references employee(emp_id));",
			function(error, results, fields){
				if(error) {
					console.log("Error in creating table TOKEN", error)
				}
			});
		return function(){};
	})();

	// Vehicle attributes
	var vehicleType = (req.body.vehicleType).toString();
	var vehicleReg = req.body.reg;
	var employeeId = req.body.eid;
	var vehicleColor = (req.body.color).toString();
	
	//insert into vehicle table
	connection.query("insert into `vehicle` values(" + vehicleReg + ",'" + vehicleColor + "','" + vehicleType +  "')",
		function(error, results1, fields) {
		if(error) {
			console.log("Error in inserting values to table `vehicle`", error);
			res.sendStatus(490);
		}
		else if(results1) {
			console.log("Successfully inserted a row into the table `vehicle`", results1);
			// insert into token table
			connection.query("insert into `token` (entry_time, eid) values (now()," + employeeId + ");",
			function(error, results2, fields){
				if(error) {
					console.log("Error in inserting values to table `token`", error);
					res.sendStatus(491);
				}
				else if(results2) {
					console.log("Successfully inserted a row into the table `token`", results2);
					connection.query("select slots_avail from slots", function(error,results3,fields){
						if(error) {
							console.log("Error in retrieving available slots");
							res.sendStatus(492);
						}
						else if(results3) {
							console.log("Slots available", results3);
							res.send(results3);
						}
					});
				}
			});
		}
	});
});

// Vehcile Exit updation
app.post('/api/vehicleExit', function(req, res) {
	
	console.log("REACHED VEHICLE EXIT", req.body);
	var vehicleReg = req.body.reg;
	var employeeId = req.body.eid;
	var dailyHistory;
	connection.query("update `token` set exit_time = now(), bill_amt = if(((time_to_sec(timediff(exit_time, entry_time))/3600)*20) > 20, round((time_to_sec(timediff(exit_time, entry_time))/3600)*20), 20) where eid =" + employeeId + ";",
		function(error, results1, fields) {
			if(error) {
				console.log("Error in updating token", error);
				res.sendStatus(490);
			}
			else if(results1){
				console.log("Updating token ..... Done!", results1);
				connection.query("insert into dailyHistory values((select token_no from token where eid =" + employeeId + ")," + employeeId + "," + vehicleReg + ",(select entry_time from token where eid ="+employeeId + "),(select exit_time from token where eid=" + employeeId + "));",
					function(error, results5, fields){
						if(error) {
							console.log("Error in inserting Daily History",error);
						}
						else if(results5) {
							console.log("Successful");
						}
					});
				connection.query("delete from `vehicle` where registration ="+ vehicleReg + ";",
					function(error, results2, fields) {
						if(error) {
							console.log("Error in deleting from vehicle", error);
							res.sendStatus(491);
						}
						else if(results2) {
							console.log("Deleted from vehicle", results2);	
							connection.query("delete from `token` where eid=" + employeeId + ";",
								function(error, results3, fields) {
									if(error) {
										console.log("Error deleting from token",error);
										res.sendStatus(492);
									}	
									else if(results3) {
										console.log("Deleted token",results3);
										connection.query("select slots_avail from slots", 
											function(error, results4, fields){
												if(error) {
													console.log("Error in retrieving slots", error);
													res.sendStatus(493);
												}
												else if(results4) {
													console.log("All queries successful!", results4);
													res.send(results4);
												}
											});
									}
								});
						}
					});
			}
			
		});
});

// New employee entry
app.post('/api/employeeEntry', function(req, res) {
	
	console.log("Employee Details",req.body);
	var employeeId = req.body.id;
	var employeeName = (req.body.name);
	var employeeGender = (req.body.gender);
	var employeePhone = req.body.phone;
	var employeeSalary = req.body.salary;

	connection.query("insert into `employee` values(" + employeeId + ",'" + employeeName + "','" + employeeGender + "'," + employeePhone + "," + employeeSalary + ");",
		function(error, results, fields){
			if(error) {
				console.log("Could not add new employee", error);
				res.sendStatus(490);
			}
			else if(results) {
				console.log("Successfully inserted new employee", results);
				res.send(results);
			}
		});


});

// Employee Deletion
app.post('/api/employeeDel', function(req, res) {
	console.log("Employee Details",req.body);
	var employeeId = req.body.id;

	connection.query("delete from `employee` where emp_id =" + employeeId + ";", 
		function(error, results, fields){
			if(error) {
				console.log("Delete Unsuccessful", error);
				res.sendStatus(490);
			}
			else if(results) {
				console.log("Successful Delete", results);
				res.send(results);
			}
		});
});

app.get('/api/getEmployees', function(req, res) {
	
	connection.query("select * from employee",
		function(error, results, fields){
			if(error) {
				console.log("Could not get employee details", error);
				res.sendStatus(490);
			}
			else if(results) {
				console.log("Employee Details : \n",results);
				res.send(results);
			}
		});
});

app.get('/api/getDailyHistory', function(req, res) {
	
	connection.query("select * from dailyHistory",
		function(error, results, fields){
			if(error) {
				console.log("Could not get daily history details", error);
				res.sendStatus(490);
			}
			else if(results) {
				console.log("Daily History Details : \n",results);
				res.send(results);
			}
		});
});



app.listen(8888, function () {
	console.log("Started on PORT 8888: http://localhost:8888");
});
