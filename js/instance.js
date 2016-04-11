var flavors_local;
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

//--------启动云主机--信息准备阶段
$(".start_cloudmonitor").click(function() {
    $(".instance_domanfree").empty();
    $(".instance_imageSelect").empty();
    $(".instance_typeselect").empty();
    $(".instance_imageSelect").append('<option>选择镜像</option>');
    $(".instance_domanfree").append('<option>任何可用域</option>');
    $(".instance_name").val("");
    $(".imageDiv").hide();
    $(".snapDiv").hide();
    $(".instance_startOriginSelect option[value='test']").attr("selected", true);
    $(".instance_num").val(1);
    //--------可用域获取
    $.ajax({
        type: "GET",
        url: config["host"] + "/os_availability_zone?token=" + window.localStorage.token,
        success: function(data) {
            var freeZoo = JSON.parse(data)['availabilityZoneInfo'];
            var str = "";
            for (var i = 0; i < freeZoo.length; i++) {
                str += '<option value="' + freeZoo[i].zoneName + '">' + freeZoo[i].zoneName + '</option>';
            }
            $(".instance_domanfree").append(str);
        }
    });
    //-------云主机类型的获取
    var flavors_str = "";
    $.ajax({
        type: "GET",
        url: config["host"] + "/flavors?token=" + window.localStorage.token,
        success: function(data) {
            flavors_local = data;
            var flavors = JSON.parse(data)['flavors'];
            for (var i = 0; i < flavors.length; i++) {
                var flavor = flavors[i];
                flavors_str += '<option value="' + flavor.id + '">' + flavor.name + '</option>';
            }
            $(".instance_typeselect").append(flavors_str);
            setflavorInfo(flavors[0]);
        }
    });
    //---------主机的限制
    $.ajax({
        type: "GET",
        url: config["host"] + "/tenant_limits?token=" + window.localStorage.token,
        success: function(data) {
            //totalInstancesUsed  maxTotalInstances
            //totalCoresUsed maxTotalCores
            //totalRAMUsed maxTotalRAMSize
            var temp_info = JSON.parse(data)['limits']['absolute'];
            setphoto(temp_info, 1);
            //--------启动云主机--操作准备阶段
            $(".instance_num").on("input", function() {
                var num = new Number($(".instance_num").val());
                var free_num = new Number(temp_info.maxTotalInstances) - new Number(temp_info.totalInstancesUsed);
                if (num > free_num)
                    $(".instance_num").val(free_num);
                else if (num <= 0)
                    $(".instance_num").val(1);
                setphoto(temp_info, num);
            });
        }
    });
    //-------镜像
    $.ajax({
        type: "GET",
        url: config["host"] + "/images?token=" + window.localStorage.token,
        success: function(data) {
            var images = JSON.parse(data)['images'];
            var imag_str = "";
            for (var i = 0; i < images.length; i++) {
                var imag = images[i];
                imag_str += '<option value="' + imag.id + '">' + imag.name + '</option>';
            }
            $(".instance_imageSelect").append(imag_str);
        }
    });

    function setphoto(temp_info, num) {
        //---------主机的设置
        $(".flavor_num").text(temp_info.maxTotalInstances + "中的" + temp_info.totalInstancesUsed + "已使用");
        $(".flavor_usednum").css("width", (new Number(temp_info.totalInstancesUsed) / new Number(temp_info.maxTotalInstances) * 100 + "%"));
        $(".flavor_free").css("width", (num / new Number(temp_info.maxTotalInstances) * 100 + "%"));
        //---------虚拟CPU数量
        $(".virtual_cpunum").text(temp_info.maxTotalCores + "中的" + temp_info.totalCoresUsed + "已使用");
        $(".virtual_usednum").css("width", (new Number(temp_info.totalCoresUsed) / new Number(temp_info.maxTotalCores) * 100 + "%"));
        $(".virtual_free").css("width", (num / new Number(temp_info.maxTotalCores) * 100 + "%"));
        //---------内存总计
        $(".ram_num").text(temp_info.maxTotalRAMSize + "中的" + temp_info.totalRAMUsed + "已使用");
        $(".ram_usednum").css("width", (new Number(temp_info.totalRAMUsed) / new Number(temp_info.maxTotalRAMSize) * 100 + "%"));
        $(".ram_free").css("width", (num / new Number(temp_info.maxTotalRAMSize) * 100 + "%"));
    }
    //---------------设置云主机相应的设置
    function setflavorInfo(flavor) {
        $(".flavor_name").text(flavor.name);
        $(".flavor_core").text(flavor.vcpus);
        $(".flavor_rootdisk").text(flavor.disk + "GB");
        $(".flavor_tempdisk").text(flavor['OS-FLV-EXT-DATA:ephemeral'] + "GB");
        $(".flavor_disktotal").text(new Number(flavor.disk) + new Number(flavor['OS-FLV-EXT-DATA:ephemeral']) + "GB");
        $(".flavor_ram").text(flavor.ram + "MB");
    }
});
//----------启动云主机----提交信息


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
