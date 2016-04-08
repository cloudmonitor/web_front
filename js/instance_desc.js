$(function() {
    if (window.location.href.split('&')[1] != "undefined") {
        var serverInfo = JSON.parse(localStorage.server_tempInfo);

        var id_num = window.location.href.split('?')[1];
        var id = id_num.split('&')[0];
        var num = id_num.split('&')[1];
        var zone = id_num.split('&')[2];

        var addrs_temp = serverInfo['servers'][id].addresses;
        var addrs = pretty_adrr1(addrs_temp);

        var time_str = getTimeLen(serverInfo['servers'][id].created);

        var curr_flavor = JSON.parse(localStorage.flavor).flavors[num];
        //alert(curr_flavor);
        $("#server_AvailabilityZone").html(zone); //
        $("#server_Timesincecreated").html(time_str);
        $("#server_IPAddresses").html(addrs);
        setInfo(serverInfo, id, curr_flavor);
    } else {
        var id_num = window.location.href.split('?')[1];
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
                        var curr_number = 0;
                        for (var i = servers['servers'].length - 1; i >= 0; i--) {
                            if (servers['servers'][i].id == id_num) {
                                curr_number = i;
                                var server = servers['servers'][i];
                                //格式化IP地址
                                var addrs_temp = server.addresses;
                                 addrs = pretty_adrr(addrs_temp);
                                //状态转换
                                var status_temp = server["OS-EXT-STS:vm_state"];
                                var status;
                                if (status_temp == "active")
                                    status = "运行中";
                                else if (status_temp == "noactive")
                                    status = "未运行";
                                //时间的转换
                                 time_str = getTimeLen(server["created"]);
                                //配置
                                var flavor_id = server.flavor.id;
                                var curr_flavor;
                                var num;
                                for (var j = 0; j < flavor.length; j++) {
                                    if (flavor[j].id == flavor_id) {
                                        curr_flavor = flavor[j];
                                    }
                                }
                                 $("#server_Timesincecreated").html(time_str);
                                $("#server_AvailabilityZone").html(servers['servers'][curr_number]["OS-EXT-AZ:availability_zone"]); //
                               
                                $("#server_IPAddresses").html(addrs);
                                setInfo(servers['servers'], curr_number, curr_flavor);
                                break;
                            }
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




    }

});

function setInfo(serverInfo, id, curr_flavor) {
    $("#server_Name").html(serverInfo['servers'][id].name);
    $("#server_ID").html(serverInfo['servers'][id].id);
    $("#server_Status").html(serverInfo['servers'][id].status=="ACTIVE"?"运行中":"未运行");

    $("#server_Created").html(serverInfo['servers'][id].created);

    $("#server_Specs").html(curr_flavor.name); //
    $("#server_FlavorID").html(serverInfo['servers'][id].flavor.id);
    $("#server_RAM").html(curr_flavor.ram+"M"); //
    $("#server_VCPUs").html(curr_flavor.vcpus+" 虚拟内核"); //
    $("#server_Disk").html(curr_flavor.disk+"GB"); //



    $("#server_default").html(serverInfo['servers'][id].name);
}
