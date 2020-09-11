$(document).ready(function(){
	
	// Navigation
	document.querySelectorAll('.sidenav__btn').forEach(function(ele) {
		console.log(ele);
		ele.addEventListener('click', function () {
			console.log("clicked!");
			// Change ative color
			document.querySelector('.sidenav__btn--active').classList.remove('sidenav__btn--active');
			this.classList.add('sidenav__btn--active');
			
			// Switch section
			document.querySelector('.main--active').classList.remove('main--active');
			switch (this.innerHTML) {
				case 'Data Entry': switchSection('vehicleEntryForm'); break;
				case 'Parking Layout': switchSection('layout'); break;
				case 'Manage Employees': switchSection('manage'); break;
			}

			function switchSection(className) {
				document.querySelector('.main .' + className).classList.add('main--active');
			}
		});
	});

	$("#entry").click(function(){
		$("#vehicleExit").css("display","none");
		$("#vehicleEntry").css("display","block");
	});

	$("#exit").click(function(){
		$("#vehicleEntry").css("display","none");
		$("#vehicleExit").css("display","block");
	});
	
	//Toast initialization
	iziToast.settings({
		timeout: 10000,
		icon: 'material-icons',
		transitionIn: 'flipInX',
		transitionOut: 'flipOutX',
		animateInside: true,
		pauseOnHover: true,
		position: 'topRight'
	});

	$("#submit").click(function(){
		var vehicleForm = document.querySelector('.vehicleEntryForm');
		var vehicleData = {};
		vehicleData.vehicleType = vehicleForm.querySelector('[name="vehicleType"]').value;
		vehicleData.reg = vehicleForm.querySelector('[name="reg"]').value;
		vehicleData.eid = vehicleForm.querySelector('[name="eid"]').value;
		vehicleData.color = vehicleForm.querySelector('[name="color"]').value;
		console.log("Vehicle info", vehicleData);
	
		$.ajax({
			type: "POST",
			url: "/api/vehicleEntry",
			data: vehicleData,
			dataType: "JSON",
			success: function(result) {
				console.log("Got result",result[0].slots_avail);
				for(var i = 0; i < document.getElementsByClassName("right").length; i++) {
					document.getElementsByClassName("right")[i].style.backgroundColor = "green";
				}
				for(var i = 0; i < (20 - result[0].slots_avail); i++) {
					document.getElementsByClassName("right")[i].style.backgroundColor = "red";
				}
				iziToast.success({
					title: "Success",
					message: "Parking token generated successfully!"
				});
			},
			error: function(error) {
				if(error.status == 490) {
					iziToast.error({
						title: "Error",
						message: "Could not insert values to 'Vehicle' table"
					});
				}
				else if(error.status == 491) {
					iziToast.error({
						title: "Error",
						message: "Could not insert values to 'Token' table"
					});
				}
				else if(error.status == 492) {
					iziToast.error({
						title: "Error",
						message: "Could not retrieve available slots"
					});
				}
			}
		});
	});

	$("#submit2").click(function(){
		var vehicleForm = document.querySelector('.vehicleEntryForm');
		var vehicleData = {}; 
		vehicleData.reg = vehicleForm.querySelector('[name="reg2"]').value;
		vehicleData.eid = vehicleForm.querySelector('[name="eid2"]').value;
		$.ajax({
			type: "POST",
			url: "/api/vehicleExit",
			data: vehicleData,
			dataType: "JSON",
			success: function(result) {
				console.log("Got result",result[0].slots_avail);
				for(var i = 0; i < document.getElementsByClassName("right").length; i++) {
					document.getElementsByClassName("right")[i].style.backgroundColor = "green";
				}
				for(var i = 0; i < (20 - result[0].slots_avail); i++) {
					document.getElementsByClassName("right")[i].style.backgroundColor = "red";
				}

				iziToast.success({
					title: "Success",
					message: "Bill amount updated in employee's salary!"
				});
			},
			error: function(error) {
				if(error.status == 490) {
					iziToast.error({
						title: "Error",
						message: "Could not update token"
					});
				}
				else if(error.status == 491) {
					iziToast.error({
						title: "Error",
						message: "Could not delete from 'vehicle' table"
					});
				}
				else if(error.status == 492) {
					iziToast.error({
						title: "Error",
						message: "Could not delete from 'token' table"
					});
				}
				else if(error.status == 493) {
					iziToast.error({
						title: "Error",
						message: "Could not retrieve available slots"
					});
				}
			}
		})
	});

	$("#addButton").click(function(){
		$("#getEmployee").css("display","none");
		$("#delEmployee").css("display","none");
		$("#getToken").css("display", "none");
		$("#addEmployee").css("display","block");
		$(".manageEmployee").css("border", "none");
		$(this).css("border", "4px solid slateblue");
	});

	$("#getButton").click(function(){
		$("#addEmployee").css("display","none");
		$("#delEmployee").css("display","none");
		$("#getToken").css("display", "none");
		$("#getEmployee").css("display","block");
		$(".manageEmployee").css("border", "none");
		$(this).css("border", "4px solid slateblue");
	});

	$("#delButton").click(function(){
		$("#addEmployee").css("display","none");
		$("#getEmployee").css("display","none");
		$("#getToken").css("display", "none");
		$("#delEmployee").css("display","block");
		$(".manageEmployee").css("border", "none");
		$(this).css("border", "4px solid slateblue");
	});

	$("#tokenButton").click(function(){
		$("#addEmployee").css("display","none");
		$("#getEmployee").css("display","none");
		$("#delEmployee").css("display","none");
		$("#getToken").css("display", "block");
		$(".manageEmployee").css("border", "none");
		$(this).css("border", "4px solid slateblue");
	});

	$("#submit3").click(function(){
		var employeeForm = document.querySelector('#addEmployee');
		var employeeData = {};
		employeeData.id = employeeForm.querySelector('[name="id"]').value;
		employeeData.name = employeeForm.querySelector('[name="name"]').value;
		employeeData.gender = employeeForm.querySelector('[name="gender"]').value;
		employeeData.phone = employeeForm.querySelector('[name="phone"]').value;
		employeeData.salary = employeeForm.querySelector('[name="salary"]').value;
		console.log("Employee info", employeeData);
		$.ajax({
			type: "POST",
			data: employeeData,
			dataType: "JSON",
			url: "/api/employeeEntry",
			success: function(result) {
				console.log("RESULT FROM new employee",result);
				iziToast.success({
					title: "Success",
					message: "Added New Employee to database!"
				});
			},
			error: function(error) {
				console.log("ERROR");
				if(error.status == 490) {
					iziToast.error({
						title: "Error",
						message: "Employee details could not be added to database!"
					});
				}
			}
		});
	});

	$("#submit4").click(function(){
		var employeeForm = document.querySelector('#delEmployee');
		var employeeData = {};
		employeeData.id = employeeForm.querySelector('[name="id2"]').value;
		console.log("Employee info", employeeData);
		$.ajax({
			type: "POST",
			data: employeeData,
			dataType: "JSON",
			url: "/api/employeeDel",
			success: function(result) {
				console.log("Successfully deleted employee details from database",result);
				iziToast.success({
					title: "Success",
					message: "Deleted Employee details from database!"
				});
			},
			error: function(error) {
				if(error.status == 490) {
				console.log("ERROR");
					iziToast.error({
						title: "Error",
						message: "Employee details could not be deleted from database!"
					});
				}
			}
		});
	});

	$("#getButton").click(function(){
		console.log("EMPLOYEE GET CLICKED");
		$.ajax({
			type: "GET",
			url: "/api/getEmployees",
			dataType: "JSON",
			success: function(result) {
				console.log("Employee Details", result);
				var divId = "employeeTable";
				createTable(result, divId);
			},
			error: function(error) {
				console.log("Error", error);
				if(error.status == 490) {
					iziToast.error({
						title: "Error",
						message: "Could not retrieve employee details"
					});
				}
			}
		});
	});

	$("#tokenButton").click(function(){
		console.log("Token GoT CLICKED");
		$.ajax({
			type: "GET",
			url: "/api/getDailyHistory",
			dataType: "JSON",
			success: function(result) {
				console.log("Daily History Details", result);
				result = dateTimeConverter(result);
				var divId = "tokenTable";
				createTable(result, divId);
			},
			error: function(error) {
				console.log("Error", error);
				if(error.status == 490) {
					iziToast.error({
						title: "Error",
						message: "Could not retrieve daily history details"
					});
				}
			}
		});
	});

	function createTable(result, divId) {
		console.log("Inside create table", divId);
		var tableHeadings = [];
		Object.keys(result[0]).forEach(function(key){
			tableHeadings.push(key);
		});
		document.getElementById(divId).innerHTML = "";
		var newTable = document.createElement("table");
		document.getElementById(divId).appendChild(newTable);
		var headingRow = newTable.insertRow(0); 
		for(var i = 0; i < tableHeadings.length; i++) {
			var cell = headingRow.insertCell(i);
			cell.innerHTML = tableHeadings[i];
		}
		for(var i = 1; i <= result.length; i++) {
			var newRow = newTable.insertRow(i);
			for(var j = 0; j < tableHeadings.length; j++) {
				var newCell = newRow.insertCell(j);
				newCell.innerHTML = result[i-1][tableHeadings[j]];
			}
		}
	}

	function dateTimeConverter(result) {
		result.forEach(function(res){
			var entry_time = new Date(res.entry_time);
			var exit_time = new Date(res.exit_time);
			var dFormatEntry = [entry_time.getMonth()+1,
				entry_time.getDate(),
				entry_time.getFullYear()].join('/')+' '+
			   [entry_time.getHours(),
				entry_time.getMinutes(),
				entry_time.getSeconds()].join(':');

			var dFormatExit = [exit_time.getMonth()+1,
				exit_time.getDate(),
				exit_time.getFullYear()].join('/')+' '+
			   [exit_time.getHours(),
				exit_time.getMinutes(),
				exit_time.getSeconds()].join(':');

			res.entry_time = dFormatEntry;
			res.exit_time = dFormatExit;

		});
		return result;
	}

});