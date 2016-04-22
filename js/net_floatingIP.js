$(function() {
    $.ajax({
        type: "GET",
        url: config["host"] + "/networks?token=" + window.localStorage.token,
        success: function(data) {
            localStorage.net_tempInfo = data;
            var servers = JSON.parse(data)['networks'];
            $.ajax({
                type: "GET",
                url: config["host"] + "/floatingips?token=" + window.localStorage.token,
                success: function(data) {
                    //console.log(data);
                    var floatingIPs = JSON.parse(data)['floatingips'];
                    for (var i = 0; i < floatingIPs.length; i++) {
                        // floating_network_id;
                        for (var j = 0; j < servers.length; j++) {
                            var server = servers[j];
                            if (server.id == floatingIPs[i].floating_network_id) {
                                setFireWallList(floatingIPs[i], server.name);
                            }
                        }
                    }
                },
                error: function(data) {
                    createAndHideAlert("信息获取失败");
                    console.log(data);
                }
            });
        },
        error: function(data) {
            createAndHideAlert("信息获取失败");
            console.log(data);
        }
    });
});

function setFireWallList(data, name) {
    var str = "<tbody><tr><td><input type='checkbox'></td><td>" + data.floating_ip_address +
        "</td><td><a href='computer_instance_desc.html'>" + data.fixed_ip_address +
        "</a></td><td>" + name +
        "</td><td>" + data.status +
        "</td><td><div class='btn-group'><button type='button' class='btn btn-default btn-sm'>" + "创建快照" + "</button><button type='button' class='btn btn-default btn-sm dropdown-toggle' data-toggle='dropdown'><span class='caret'></span><span class='sr-only'>" + "切换下拉菜单" + "</span></button><ul class='dropdown-menu' role='menu'><li><a href='#'>" + "功能" + "</a></li><li><a href='#'>" + "另一个功能" + "</a></li><li><a href='#'>" + "其他" + "</a></li></ul></div></td></tr></tbody>";
    $(".floatingIPs_info").append(str);
}
