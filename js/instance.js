$(function() {
    $.ajax({
        type: "GET",
        url: config["host"] + "/flavors?token=" + window.localStorage.token,
        success: function(data) {
            var flavor = JSON.parse(data).flavors;
            localStorage.flavor = data;
            $.ajax({
                type: "GET",
                url: config["host"] + "/instances?token=" + window.localStorage.token,
                success: function(data) {
                    localStorage.server_tempInfo = data;
                    var servers = JSON.parse(data);
                    for (var i = servers['servers'].length - 1; i >= 0; i--) {
                        var server = servers['servers'][i];
                        //格式化IP地址
                        var addrs_temp = server.addresses;
                        var addrs = pretty_adrr(addrs_temp);
                        //状态转换
                        var status_temp = server["OS-EXT-STS:vm_state"];
                        var status;
                        if (status_temp == "active")
                            status = "运行中";
                        else if (status_temp == "noactive")
                            status = "XX";
                        //时间的转换
                        var time_str = getTimeLen(server["created"]);
                        //配置
                        var flavor_id = server.flavor.id;
                        var peizhi = "";
                        var num;
                        for (var j = 0; j < flavor.length; j++) {
                            if (flavor[j].id == flavor_id) {
                                peizhi = flavor[j].name;
                                num = j;
                            }
                        }
                        setList(i, num, server, addrs, status, time_str, peizhi);

                    };
                },
                error: function(data) {
                    alert("信息获取失败！");
                }
            });
        },
        error: function(data) {
            alert("配置获取失败！");
        }
    });
});
//--------启动云主机预备工作
$(".instance_startOriginSelect").change(function() {
    if ($(".instance_startOriginSelect").val() == "test") {
        $(".imageDiv").hide();
        $(".snapDiv").hide();
    } else if ($(".instance_startOriginSelect").val() == "image") {
        $(".imageDiv").show();
        $(".snapDiv").hide();
    } else {
        $(".imageDiv").hide();
        $(".snapDiv").show();
    }

});
//--------启动云主机
$(".start_cloudmonitor").click(function() {
    $(".instance_domanfree").empty();
    $(".instance_domanfree").append('<option>任何可用域</option>');
    $(".instance_name").val("");
    $(".imageDiv").hide();
    $(".snapDiv").hide();
    $(".instance_startOriginSelect option[value='test']").attr("selected", true);
    $(".instance_num").val(1);
});

function setList(i, num, data, addrs, status, UTC8_time, peizhi) {
    var str = "<tbody><tr><td><input type='checkbox'></td>" +
        "<td><a href='#/compute/instance_desc?" + i + "&" + num + "&" + data["OS-EXT-AZ:availability_zone"] + "'>" + data.name + "</a></td><td>" + addrs + "</td>" +
        "<td>" + peizhi + "</td>" +
        "<td>" + "-" + "</td>" +
        "<td>" + status + "</td>" +
        "<td>" + data["OS-EXT-AZ:availability_zone"] + "</td>" +
        "<td>" + "无" + "</td>" +
        "<td>" + (data['OS-EXT-STS:vm_state'] == "active" ? "运行中" : "关闭") + "</td>" +
        "<td>" + UTC8_time + "</td>" +
        "<td><div class='btn-group'>" +
        "<button type='button' class='btn btn-default btn-sm'>" + "创建快照" + "</button>" +
        "<button type='button' class='btn btn-default btn-sm dropdown-toggle' data-toggle='dropdown'>" +
        "<span class='caret'></span>" +
        "<span class='sr-only'>" + "切换下拉菜单" + "</span>" +
        "</button><ul class='dropdown-menu' role='menu'>" +
        "<li><a href='#'>" + "功能" + "</a></li>" +
        "<li><a href='#'>" + "另一个功能" + "</a></li>" +
        "<li><a href='#'>" + "其他" + "</a></li>" +
        "</ul></div></td></tr></tbody>";
    $(".instance_info").append(str);
}
