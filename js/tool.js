function pretty_adrr(addrs_temp) {
    var str = "";
    var num = 0;
    for (var net in addrs_temp)
        num++;
    for (var net in addrs_temp) {
        if (addrs_temp[net].length > 1) {
            if (num > 1)
                str += "<b>" + net + "</b><br/>";
            for (var j = 0; j < addrs_temp[net].length; j++) {
                if (addrs_temp[net][j]["OS-EXT-IPS:type"] == "fixed")
                    str += addrs_temp[net][j].addr + "<br/>";
                else if (addrs_temp[net][j]["OS-EXT-IPS:type"] == "floating")
                    str += "浮动IP<br/>" + addrs_temp[net][j].addr + "<br/>";
            }
        } else {
            for (var j = 0; j < addrs_temp[net].length; j++) {
                if (num > 1)
                    str += "<b>" + net + "</b><br/>";
                if (addrs_temp[net][j]["OS-EXT-IPS:type"] == "fixed")
                    str += addrs_temp[net][j].addr + "<br/>";
                else if (addrs_temp[net][j]["OS-EXT-IPS:type"] == "floating")
                    str += "浮动IP<br/>" + addrs_temp[net][j].addr + "<br/>";
            }
        }
    }
    return str;
}

function pretty_adrr1(addrs_temp) {
    var str = "";
    var num = 0;
    for (var net in addrs_temp)
        num++;
    for (var net in addrs_temp) {
        if (addrs_temp[net].length > 1) {
            if (num > 1)
                str += "<b>" + net + "</b>";
            for (var j = 0; j < addrs_temp[net].length; j++) {
                if (addrs_temp[net][j]["OS-EXT-IPS:type"] == "fixed") {
                    var header_str;
                    if (num == 1)
                        header_str = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
                    else
                        header_str = "";
                    str += header_str + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + addrs_temp[net][j].addr + "<br/>";
                } else if (addrs_temp[net][j]["OS-EXT-IPS:type"] == "floating")
                    str += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + "浮动IP<br/>" + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + addrs_temp[net][j].addr + "<br/>";
            }
        } else {
            for (var j = 0; j < addrs_temp[net].length; j++) {
                if (num > 1)
                    str += "<b>" + net + "</b>";
                if (addrs_temp[net][j]["OS-EXT-IPS:type"] == "fixed") {
                    var header_str;
                    if (num == 1)
                        header_str = "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
                    else
                        header_str = "";
                    str += header_str + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + addrs_temp[net][j].addr + "<br/>";
                } else if (addrs_temp[net][j]["OS-EXT-IPS:type"] == "floating")
                    str += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + "浮动IP<br/>" + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + addrs_temp[net][j].addr + "<br/>";
            }
        }
    }
    return str;
}

function getTimeLen(date_temp) {
    var UTC8_time = moment(date_temp).utc().zone(-8).format('YYYY-MM-DD HH:mm:ss');
    var now = moment(new Date()).utc().zone(-8).format('YYYY-MM-DD HH:mm:ss');
    //alert(UTC8_time+"==="+now);
    var time = moment.utc((moment(moment(new Date()).utc().zone(-8).format('YYYY-MM-DD HH:mm:ss'))).diff(UTC8_time)).zone(-8) / 1000; //.format("DD天 HH小时");
    var weekend = parseInt(time / (60 * 60 * 24 * 7));
    var zday = parseInt(time / (60 * 60 * 24)) - weekend * 7;
    var zhour = parseInt(time / (60 * 60)) - zday * 24 - weekend * 7 * 24;
    // alert(weekend+"/"+zday+"/"+zhour);
    var time_str = "";
    if (weekend != 0) {
        time_str += weekend + "周 ";
    }
    if (zday != 0) {
        time_str += zday + "日 ";
    }
    if (zhour != 0) {
        time_str += zhour + "时";
    }
    return time_str;
}

function getTimeStr(date_temp) {
    var UTC8_time = moment.utc(date_temp).zone(-8).format('YYYY-MM-DD HH:mm:ss');
    return UTC8_time;
}

function flvors_info() {
    $.ajax({
        type: "GET",
        url: config["host"] + "/flavors?token=" + window.localStorage.token,
        success: function(data) {
            var flavor = JSON.parse(data).flavors;
            //alert(">>>" + flavor_id);
            for (var i = 0; i < flavor.length; i++) {
                if (flavor[num].id == flavor_id) {
                    peizhi = flavor[num].name;
                }
            }
        },
        error: function(data) {
            alert("配置获取失败！");
        }
    });

}

function createInstanceFun() {
    //--------------------------------------------------创建虚拟机start
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
        $("#loading_monitor1,#background_monitor1").show();
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
                setTimeout(function() {
                    window.location.reload();
                }, 3000);
            }
        });
    }
    //--------------------------------------------------创建虚拟机end
}

function create_networkFun() {
    //------------创建网络面板的控制--start
    $(".create_networkCancel").click(function() {
        if (!flag) {
            $(".info_pic").removeClass("fa fa-angle-double-up");
            $(".info_pic").addClass("fa fa-angle-double-down");
            $(".subnet_multi").slideToggle();
            flag = true;
        }
        $("createnetwork_name").val("");
        $("subnet_name").val("");
        $(".subnet_check").prop("checked", true);
        $(".subnet_mangerStatuscheck").prop("checked", true);
    });
    //--------是否显示子网详细
    var flag = true;
    $(".choose_subnet").click(function() {
        $(".subnet_multi").slideToggle();
        if (flag) {
            $(".info_pic").removeClass("fa fa-angle-double-down");
            $(".info_pic").addClass("fa fa-angle-double-up");
            flag = false;
        } else {
            $(".info_pic").removeClass("fa fa-angle-double-up");
            $(".info_pic").addClass("fa fa-angle-double-down");
            flag = true;
        }
    });
    //-------是否显示子网
    $(".subnet_check").change(function() {
        if ($(".subnet_check").is(":checked")) {
            $(".subNet_infos").fadeToggle();
        } else {
            $(".subNet_infos").fadeToggle();
        }
    });

    //------------创建网络面板的控制--end
    //-------------创建网络
    $(".create_networkOk").click(function() {
        var network_json;
        var net_managerStatus;
        var net_name = $(".createnetwork_name").val();
        if ($(".subnet_mangerStatuscheck").prop("checked"))
            net_managerStatus = true;
        else
            net_managerStatus = false;
        if (!$(".subnet_check").prop("checked")) {
            var network = [{
                "network": {
                    "name": "",
                    "admin_state_up": true
                }
            }];
            if (net_name != "")
                network[0]['network'].name = net_name;
            network[0]['network'].admin_state_up = net_managerStatus;
            createNetAjax(network);
        } else {
            var netWork_info = [{
                "network": {
                    "name": "",
                    "admin_state_up": true
                }
            }, {
                "subnet": {
                    "name": "",
                    "ip_version": 4,
                    "cidr": ""
                }
            }];
            var network = netWork_info[0]['network'];
            var subnet = netWork_info[1]['subnet'];
            if (net_name != "")
                network.name = net_name;
            else
                network.name = "";
            network.admin_state_up = net_managerStatus;
            //--------校验子网信息
            var subnet_name = $(".subnet_name").val();
            //---获取子网的地址
            var object = $(".radio_subnetaddr:checked");
            console.log($(".radio_subnetaddr:checked"));
            var num_1 = object.parent().siblings().eq(0).val();
            var num_2 = object.parent().siblings().eq(2).val();
            var num_3 = object.parent().siblings().eq(4).val();
            var num_4 = object.parent().siblings().eq(6).val();
            var num_5 = object.parent().siblings().eq(8).val();
            var str_ip = num_1 + "." + num_2 + "." + num_3 + "." + num_4 + "/" + num_5;
            subnet.name = subnet_name;
            subnet.cidr = str_ip;
            if (subnet_name == "") {
                alert("请填写子网名称和地址！");
            } else {
                createNetAjax(netWork_info);
            }
        }
    });

}
