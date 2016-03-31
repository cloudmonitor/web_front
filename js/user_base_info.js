$(function(){
	console.log(window.localStorage.user);
	var user=JSON.parse(window.localStorage.user);
	$("#user_name").html(user.username);
/*	$("#email").html(user.);
	$("#phone_num").html(user.);
	$("#password").html(user.);
	$("#email_pre").html(user.);*/
});