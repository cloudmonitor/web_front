$(function() {
    if (localStorage.net_tempInfo != null && localStorage.net_tempInfo != "undefined") {
        var networks = JSON.parse(localStorage.net_tempInfo)['networks'];
        rount_netInfo(networks);
    } else {
        $.ajax({
            type: "GET",
            url: config["host"]+"/networks?token=" + window.localStorage.token,
            success: function(data) {
                var networks = JSON.parse(data)['networks'];
                rount_netInfo(networks);
            },
            error: function() {
                alert("获取网络失败！");
            }
        });
    }
});

function rount_netInfo(networks) {
    $.ajax({
        type: "GET",
        url: config["host"]+"/routers?token=" + window.localStorage.token,
        success: function(data) {
            var rounters = JSON.parse(data)['routers'];
            for (var i = 0; i < rounters.length; i++) {
                var rounter = rounters[i];
                //---管理员状态
                if (rounter.admin_state_up == true)
                    rounter.admin_state_up = "上";
                else
                    rounter.admin_state_up = "下";
                //---外部网络
                if (rounter.external_gateway_info != null && rounter.external_gateway_info != "") {
                   for(var j=0;j<networks.length;j++)
                   {
                        if(networks[j].id==rounter.external_gateway_info.network_id)
                        {
                           setList(rounter,networks[j].name);	
                        }
                   }
                }
                else{
                	setList(rounter,"-");
                }




            }

        },
        error: function() {
            alert("路由获取失败！");
        }
    });
}

function setList(data,out_net) {
    var str = "<tbody><tr><td><input type='checkbox'></td><td><a href='#'>" + data.name + "</a></td><td>" + data.status + "</td><td>" + out_net + "</td>" +
        "<td>" + data.admin_state_up +
        "</td><td><div class='btn-group'><button type='button' class='btn btn-default btn-sm'>" +
         "创建快照" + 
         "</button><button type='button' class='btn btn-default btn-sm dropdown-toggle' data-toggle='dropdown'><span class='caret'></span><span class='sr-only'>" +
          "切换下拉菜单" + "</span></button><ul class='dropdown-menu' role='menu'><li><a href='#'>" +
           "功能" + "</a></li><li><a href='#'>" + "另一个功能" + "</a></li><li><a href='#'>" + "其他" + 
           "</a></li></ul></div></td></tr></tbody>";
    $(".rounter_info").append(str);
}
