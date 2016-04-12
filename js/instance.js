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
    $(".free_netsInfo").empty();
    $(".all_subnet").remove();
    $(".instance_imageSelect").empty();
    $(".instance_typeselect").empty();
    $(".instance_imageSelect").append('<option value="test">选择镜像</option>');
    $(".instance_domanfree").append('<option value="test">任何可用域</option>');
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
            var num = 0;
            var free_num = 0;
            num = new Number($(".instance_num").val());
            free_num = new Number(temp_info.maxTotalInstances) - new Number(temp_info.totalInstancesUsed);
            $(".instance_num").on("input", function() {
                if (num > free_num) {
                    $(".instance_num").val(free_num);
                    setphoto(temp_info, num);

                } else if (num <= 0) {
                    $(".instance_num").val(1);
                    setphoto(temp_info, num);

                }
            });
            $(".up_num").click(function() {
                if (num < free_num) {
                    $(".instance_num").val(++num);
                    setphoto(temp_info, num);
                }
            });
            $(".desc_num").click(function() {
                if (num > 1) {
                    $(".instance_num").val(--num);
                    setphoto(temp_info, num);
                }
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
    //----------访问安全
    $.ajax({
        type: "GET",
        url: config["host"] + "/security_groups?token=" + window.localStorage.token,
        success: function(data) {
            var securitys = JSON.parse(data)['security_groups'];
            var security_str = "";
            for (var i = 0; i < securitys.length; i++) {
                var security = securitys[i];
                security_str += '<li><label class="control-lable" ><input type="checkbox" class="securities_li" id="' + security.id + '"  name="' + security.name + '"> ' + security.name + ' </label></li>';
            }
            $(".security_ul").html(security_str);
        }
    });
    //----------子网的选择
    $.ajax({
        type: "GET",
        url: config["host"] + "/new_subnets?token=" + window.localStorage.token,
        success: function(data) {
            var subnet_infos = JSON.parse(data)['subnets'];
            $.ajax({
                type: "GET",
                url: config["host"] + "/networks?token=" + window.localStorage.token,
                success: function(data) {
                    var servers = JSON.parse(data)['networks'];
                    for (var j = 0; j < servers.length; j++) {
                        var server = servers[j];
                        var net_infoDiv = "<B class='tabel'>" + server.name + "</B><br/>" + '<div ondrop="drop(event)" ondragover="allowDrop(event)" parent_tag="' + j + '" class="alert alert-success  all_subnet free_subnet' + j + '" id="free_subnet' + j + '" name="' + j + '" hidden></div>';
                        $(".free_netsInfo").append(net_infoDiv);
                        var subnet_str = "";
                        for (var i = 0; i < subnet_infos.length; i++) {
                            var subnet_info = subnet_infos[i];
                            if (subnet_info.network_id == server.id) {
                                subnet_str += '<div class="net-item" draggable="true" ondragstart="drag(event)" tag="' + j + '" id="' + server.id + '" name="' + subnet_info.id + '"><span class="net_name">' + subnet_info.name + '</span>' +
                                    '<span class="shadow-span subnet_id">(' + subnet_info.cidr + ')</span><button class = "btn btn-primary btn-xs net_add" name="' + j + '"> <span class = "fa fa-plus"></span></button></div>';
                            }
                        }
                        $(".free_subnet" + j).html(subnet_str);
                    }
                    $(".free_subnet0").show();
                }
            });
        }
    });
});
$(document).on("click", ".tabel", function() {
    $(this).next().next().slideToggle();
});
//------------拖拽处理
function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData("Text", ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    var id = $(ev.target).attr("id");
    var parent_tag = $(ev.target).attr("parent_tag");
    var data = ev.dataTransfer.getData("Text");
    // alert(new String(id));
    var move_tag = $("#" + data).attr("tag");
    if (id == "selected_subnet") {
        $("#" + data).find("button").removeClass("net_add");
        $("#" + data).find("button").addClass("net_detract");
        $("#" + data).find("button").find("span").removeClass("fa-plus");
        $("#" + data).find("button").parent().addClass("selected_netTag");
        $("#" + data).find("button").find("span").addClass("fa-minus");
        //console.error(document.getElementById(data));
        ev.target.appendChild(document.getElementById(data));
    } else if (move_tag == parent_tag) {
        $("#" + data).find("button").removeClass("net_detract");
        $("#" + data).find("button").addClass("net_add");
        $("#" + data).find("button").find("span").removeClass("fa-minus");
        $("#" + data).find("button").parent().removeClass("selected_netTag");
        $("#" + data).find("button").find("span").addClass("fa-plus");
        ev.target.appendChild(document.getElementById(data));
    }

}
//-----------增加移除处理
$(document).on("click", ".net_add", function() {
    var node = document.getElementById("selected_subnet");
    $(this).removeClass("net_add");
    $(this).addClass("net_detract");
    $(this).find("span").removeClass("fa-plus");
    $(this).parent().addClass("selected_netTag");
    $(this).find("span").addClass("fa-minus");
    node.appendChild($(this).parent().get(0));
});
$(document).on("click", ".net_detract", function() {
    var node = document.getElementById("free_subnet" + $(this).attr("name"));
    $(this).removeClass("net_detract");
    $(this).addClass("net_add");
    $(this).find("span").removeClass("fa-minus");
    $(this).parent().removeClass("selected_netTag");
    $(this).find("span").addClass("fa-plus");
    node.appendChild($(this).parent().get(0));
});
//------------设置进度条
function setphoto(temp_info, num) {
    if (num / (new Number(temp_info.maxTotalInstances) - new Number(temp_info.totalInstancesUsed)) > 0.8) {
        $(".flavor_free").addClass("progress-bar-danger");
        $(".flavor_free").removeClass("progress-bar-warning");
    } else if (num / (new Number(temp_info.maxTotalInstances) - new Number(temp_info.totalInstancesUsed)) > 0.6) {
        $(".flavor_free").removeClass("progress-bar-danger");
        $(".flavor_free").addClass("progress-bar-warning");
    } else {
        $(".flavor_free").removeClass("progress-bar-warning");
        $(".flavor_free").removeClass("progress-bar-danger");
    }
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
//----------启动云主机----提交信息
$(".instance_run").click(function() {
    var instance = {
        "server": {
            "security_groups": [],
            "availability-zone": "",
            "name": "",
            "imageRef": "",
            "flavorRef": "",
            "max_count": 1,
            "network_info": [],
            "networks": []
        }
    };
    var server = instance['server'];
    //---------可用域
    var free_domain = $(".instance_domanfree").val();
    if (free_domain != "test")
        server['availability-zone'] = free_domain;
    //--------云主机名称
    var instanceName = $(".instance_name").val();
    if (instanceName != "")
        server.name = instanceName;
    if (instanceName == "") {
        alert("云主机名称必填！");
        return;
    }
    //---------云主机类型
    var instancetypeselect = $(".instance_typeselect").val();
    if (instancetypeselect != "test")
        server.flavorRef = instancetypeselect;
    //---------云主机数量
    var instance_num = $(".instance_num").val();
    server.max_count = instance_num;
    //----------云主机启动源
    var selected_name = $(".instance_startOriginSelect").val();
    if (selected_name == "image") {
        if ($(".instance_imageSelect").val() != "test") {
            server.imageRef = $(".instance_imageSelect").val();
        } else {
            alert("请选择镜像！");
            return;
        }
    } else if (selected_name == "snap") {
        if ($(".instance_snapSelect").val() != "test") {
            //-------不做该功能 
        }
    } else {
        alert("请选择启动源！");
        return;
    }
    //----------安全组
    var security_i = 0;
    $(".securities_li").each(function() {
        if ($(this).prop('checked')) {
            var obj = { "name": "" };
            obj.name = $(this).attr("name");
            server.security_groups[security_i++] = obj;
        }
    });
    //----------网络
    var temp0 = 0,
        temp1 = 0;
    if ($(".selected_netTag") == 'undefined' || $(".selected_netTag") == null) {
        alert("请选择子网！");
        return;
    }
    if ($(".selected_netTag").length < 1) {
        alert("请选择子网！");
        return;
    }
    $(".selected_netTag").each(function() {
        var obj = {
            "network_id": "",
            "subnet_id": "",
        };
        var obj1 = {
            "uuid": "",
        };
        obj.network_id = $(this).attr("id");
        obj.subnet_id = $(this).attr("name");
        obj1.uuid = $(this).attr("id");
        if ($(this).attr("id") != "" && $(this).attr("id") != 'undefined') {
            server.network_info[temp0++] = obj;
            if (temp1 == 0)
                server.networks[temp1++] = obj1;
            else {
                var len = server.networks.length;
                for (var j = 0; j < len; j++) {
                    if ($(this).attr("id") != server.networks[j] && j == (len - 1)) {
                        server.networks[temp1++] = obj1;
                    }
                }
            }
        }
    });
    //-------------------提交数据
    instance_info(instance);
});

function instance_info(json_array) {
    //  console.error(JSON.stringify(json_array));
    $.ajax({
        type: "POST",
        data: JSON.stringify(json_array),
        contentType: "application/json",
        url: config["host"] + "/servers/create?token=" + window.localStorage.token,
        success: function(data) {
            //console.error(data);
            window.location.reload();
        }
    });
}

//-----------------删除云主机
$(document).on("change", ".instance_checks", function() {
    if ($(".instance_checks:checked").length > 0) {
        $(".stop_instance").attr("disabled", false);
    } else {
        $(".stop_instance").attr("disabled", true);
    }
});
//------多删
$(".stop_instance").click(function() {
    var servers = { "servers_ids": [] };
    var server_ids = servers['servers_ids'];
    var i = 0;
    $(".instance_checks:checked").each(function() {
        server_ids[i++] = $(this).attr("id");
    });
    deleteInstance_AJAX(servers);
});
//------单删
$(document).on("click", ".delete_instanceSimple", function() {
    var servers = { "servers_ids": [] };
    var server_ids = servers['servers_ids'];
    server_ids[0] = this.id;
    deleteInstance_AJAX(servers);
});

function deleteInstance_AJAX(servers) {
    $.ajax({
        type: "POST",
        data: JSON.stringify(servers),
        contentType: "application/json",
        url: config['host'] + "/servers/delete?token=" + window.localStorage.token,
        success: function(data) {
            window.location.reload();
        }
    });
}
//----------浮动IP的处理
var servers_id;
var flag_type;
$(document).on("click", ".bind_floatIp", function() {
    flag_type = "floatIP";
    $(".IP_select").empty();
    $(".show_info0").text("管理浮动IP的关联");
    $(".show_info1").html("IP地址");
    $(".show_info2").html("请为选中的云主机或端口选择要绑定的IP地址。");
    $(".IP_select").append('<option value="test">请选择一个IP地址</option>');
    servers_id = this.id;
    $.ajax({
        type: "GET",
        url: config["host"] + "/dis_floatingips?token=" + window.localStorage.token,
        success: function(data) {
            // console.error(data);
            var IPs = JSON.parse(data)['floatingips'];
            var ip_str = "";
            for (var i = 0; i < IPs.length; i++) {
                ip_str += '<option value="' + IPs[i].floating_ip_address + '">' + IPs[i].floating_ip_address + '</option>';
            }
            $(".IP_select").append(ip_str);
        }
    });
});
$(document).on("click", ".unbind_floatIp", function() {
    var ip = $(this).attr("IP_id").replace("<br></li>", "").replace("<br/>", "");
    servers_id = this.id;
    var IP_selected = {
        "removeFloatingIp": {
            "address": ''
        }
    };
    IP_selected['removeFloatingIp'].address = ip;
    setInstanceAjax(IP_selected, "/servers_action/");
});


//-------接口的处理
$(document).on("click", ".bind_Inteface", function() {
    flag_type = "inteface";
    $(".IP_select").empty();
    $(".show_info0").text("绑定接口");
    $(".show_info1").html("网络");
    $(".show_info2").html("选择附属接口的网络");
    $(".IP_select").append('<option value="test">选择网络</option>');
    servers_id = this.id;
    $.ajax({
        type: "GET",
        url: config["host"] + "/new_subnets?token=" + window.localStorage.token,
        success: function(data) {
            // console.error(data);
            var subnets = JSON.parse(data)['subnets'];
            var net_str = "";
            for (var i = 0; i < subnets.length; i++) {
                net_str += '<option id="' + subnets[i].id + '" value="' + subnets[i].network_id + '">' + subnets[i].name + '</option>';
            }
            $(".IP_select").append(net_str);
        }
    });
});
$(document).on("click", ".unbind_Inteface", function() {
    flag_type = "un_inteface";
    $(".IP_select").empty();
    $(".show_info0").text("解绑接口");
    $(".show_info1").html("端口");
    $(".show_info2").html("选择分离的端口");
    $(".IP_select").append('<option value="test">选择端口</option>');
    servers_id = this.id;
    $.ajax({
        type: "GET",
        url: config["host"] + "/instance/interfaces/" + servers_id + "?token=" + window.localStorage.token,
        success: function(data) {
            // console.error(data);
            var net_str = "";
            var servers = JSON.parse(data)['interfaceAttachments'];
            for (var i = 0; i < servers.length; i++) {
                var fixedIPs = servers[i].fixed_ips;
                for (var j = 0; j < fixedIPs.length; j++) {
                    net_str += '<option value="' + fixedIPs[j].ip_address + '">' + fixedIPs[j].ip_address + '</option>';
                }
            }
            $(".IP_select").append(net_str);
        }
    });
});
//----------编辑云主机
$(document).on("click", ".edit_instance", function() {
    flag_type = "edit_instance";
    $(".IP_select").empty();
    $(".edit_instance_name").val($(this).attr("name"));
    servers_id = this.id;
    $.ajax({
        type: "GET",
        url: config["host"] + "/sever_sg/" + servers_id + "?token=" + window.localStorage.token,
        success: function(data) {
            // console.error("现存的：", data);
            var security_groups = JSON.parse(data)['security_groups'];
            var subnet_str = "";
            for (var i = 0; i < security_groups.length; i++) {
                var security_group = security_groups[i];
                subnet_str += '<div class="net-item selected_sg" id="' + security_group.id + '" name="' + security_group.name + '"><span class="sg_name">' + security_group.name + '</span>' +
                    '<button class = "btn btn-primary btn-xs sg_detract"> <span class = "fa fa-minus"></span></button></div>';
            }
            if (subnet_str == "")
                $(".usedinstance_security").html('<span class="used" style="background:#E0EEEE">无授权的安全组</span>');
            else
                $(".usedinstance_security").html(subnet_str);
        }
    });
    $.ajax({
        type: "GET",
        url: config["host"] + "/disserver_sg/" + servers_id + "?token=" + window.localStorage.token,
        success: function(data) {
            // console.error("全部的：", data);
            var security_groups = JSON.parse(data)['security_groups'];
            var subnet_str = "";
            for (var i = 0; i < security_groups.length; i++) {
                var security_group = security_groups[i];
                subnet_str += '<div class="net-item" id="' + security_group.id + '" name="' + security_group.name + '"><span class="sg_name">' + security_group.name + '</span>' +
                    '<button class = "btn btn-primary btn-xs sg_add"> <span class = "fa fa-plus"></span></button></div>';
            }
            if (subnet_str == "")
                $(".all_securities").html('<span class="all" style="background:#E0EEEE">无法找到安全组</span>');
            else
                $(".all_securities").html(subnet_str);
        }
    });
});
//-----------云主机增加移除处理
$(document).on("click", ".sg_add", function() {
    var node = document.getElementById("usedinstance_security");
    $(this).removeClass("sg_add");
    $(this).addClass("sg_detract");
    $(this).find("span").removeClass("fa-plus");
    $(this).parent().addClass("selected_sg");
    $(this).find("span").addClass("fa-minus");
    if ($(".usedinstance_security").children("div").length == 0)
        $(".usedinstance_security").empty();
    if ($(".all_securities").children("div").length == 1)
        $(".all_securities").append('<span class="all" style="background:#E0EEEE">无法找到安全组</span>');
    node.appendChild($(this).parent().get(0));
});
$(document).on("click", ".sg_detract", function() {
    var node = document.getElementById("all_securities");
    $(this).removeClass("sg_detract");
    $(this).addClass("sg_add");
    $(this).find("span").removeClass("fa-minus");
    $(this).parent().removeClass("selected_sg");
    $(this).find("span").addClass("fa-plus");
    if ($(".usedinstance_security").children("div").length == 1)
        $(".usedinstance_security").append('<span class="used" style="background:#E0EEEE">无授权的安全组</span>');
    if ($(".all_securities").children("div").length == 0)
        $(".all_securities").empty();
    node.appendChild($(this).parent().get(0));
});
$(".sg_keep").click(function() {
    var name = $(".edit_instance_name").val();
    $(".selected_sg").each(function() {

    });



});
//-----------------------------------------------------------提交数据
$(".add_IP").click(function() {
    if (flag_type == "floatIP") {
        var IP_selected = {
            "addFloatingIp": {
                "address": "172.24.4.4"
            }
        };
        IP_selected['addFloatingIp'].address = $(".IP_select").val();
        setInstanceAjax(IP_selected, "/servers_action/");
    } else if (flag_type == "inteface") {
        var inteface = { "interface": { "network_id": "", "subnet_id": "" } };
        inteface['interface'].network_id = $(".IP_select").val();
        inteface['interface'].subnet_id = $(".IP_select option:selected").attr("id");
        setInstanceAjax(inteface, "/interfaces/bind/");
    } else if (flag_type == "un_inteface") {
        var ip_addr = { "ip_address": "" };
        ip_addr['ip_address'] = $(".IP_select").val();;
        setInstanceAjax(ip_addr, "/interfaces/delete/");
    }
});

function setInstanceAjax(data, url) {
    $.ajax({
        type: "POST",
        data: JSON.stringify(data),
        contentType: "application/json",
        url: config['host'] + url + servers_id + "?token=" + window.localStorage.token,
        success: function(data) {
            window.location.reload();
        }
    });
}

function setList(i, num, data, addrs, status, UTC8_time, peizhi) {
    var str = "<tbody><tr><td><input type='checkbox' class='instance_checks' id='" + data.id + "'></td>" +
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
        "<li id='" + data.id + "' class='delete_instanceSimple'><a href='javascript:void(0)'>" + "终止实例" + "</a></li>";
    if (addrs.indexOf("浮动IP") == -1)
        str += "<li id='" + data.id + "' class='bind_floatIp' data-toggle='modal' data-target='#bind_floatingIP'><a href='javascript:void(0)' >" + "绑定浮动IP" + "</a></li>";
    else
        str += "<li id='" + data.id + "' IP_id='" + addrs.slice(addrs.indexOf("浮动IP") + 4) + "' class='unbind_floatIp'><a href='javascript:void(0)'><font color='red'>" + "解除浮动IP的绑定" + "</font></a></li>";
    str += "<li id='" + data.id + "' class='bind_Inteface' data-toggle='modal' data-target='#bind_floatingIP'><a href='javascript:void(0)' >" + "绑定接口" + "</a></li>";
    str += "<li id='" + data.id + "' class='unbind_Inteface' data-toggle='modal' data-target='#bind_floatingIP'><a href='javascript:void(0)' >" + "解绑接口" + "</a></li>";
    str += "<li name='" + data.name + "' id='" + data.id + "' class='edit_instance' data-toggle='modal' data-target='#instance_security'><a href='javascript:void(0)' >" + "编辑云主机" + "</a></li>";
    str += "</ul></div></td></tr></tbody>";
    $(".instance_info").append(str);
}
