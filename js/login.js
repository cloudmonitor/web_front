 $(document).ready(function() {
     $("#submit").click(function() {
         var userName = $("#userName").val();
         var userKey = $("#userId").val();
         if (userName == null || userName == "") {
             alert("用户名不能为空！");
             return;
         }
         if (userKey == null || userKey == "") {
             alert("密码不能为空！");
             return;
         }
         if (userName == "Username" && userKey == "Password") {
             alert("请输入用户名和密码！");
             return;
         }
         /*var data={"auth": {"tenantName": "", "passwordCredentials": {"username": userName, "password": userId}}};*/
         //var data = { data: JSON.stringify({ "username": userName, "password": userKey }) };
         //console.error( JSON.stringify({ "username": userName, "password": userKey }));
         $.ajax({
             type: "POST",
             data: JSON.stringify({ "username": userName, "password": userKey }),
             contentType: "application/json",
             url: config["host"] + "/login",
             success: function(data) {
                console.error(data);
                 var data = JSON.parse(data);
                 // console.log(data);
                 window.localStorage.token = JSON.stringify(data.access.token);
                 window.localStorage.user = JSON.stringify(data.access.user);
                 location.href = "/";
             },
             error: function(data) {
                 alert("登录失败");
             }
         });
     });

 });
