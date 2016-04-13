$(function() {
    var id = window.location.href.split("?")[1];
    var temp = id.substr(0, 4);
    if (temp != "gate") {
        var port_Info;
        var port_Infos = JSON.parse(localStorage.portInfos)["ports"];
        for (var i = 0; i < port_Infos.length; i++) {
            if (port_Infos[i].id == id) {
                alert(id);
                port_Info = port_Infos[i];
                break;
            }
        }
        if (port_Info.name == null || port_Info.name == "") {
            port_Info.name = "无";
        }
        $("#port_name").html(port_Info.name);
        $("#port_ID").html(port_Info.id);
        $("#port_NetId").html(port_Info.network_id);
        $("#port_proId").html(port_Info.tenant_id);
        $("#port_MACaddr").html(port_Info.mac_address);
        if (port_Info.status == "ACTIVE")
            port_Info.status = "运行中";
        else
            port_Info.status = "状态待补充";
        $("#port_status").html(port_Info.starus);
        if (port_Info.admin_state_up == true || port_Info.admin_state_up == 'true')
            port_Info.admin_state_up = "上";
        else
            port_Info.admin_state_up = "状态待补充";
        $("#port_adminStatus").html(port_Info.admin_state_up);
        $("#port_Ipaddr").html((port_Info.fixed_ips)[0].ip_address);
        $("#port_subNetId").html((port_Info.fixed_ips)[0].subnet_id);
        $("#port_deviceOwner").html(port_Info.device_owner);
        $("#port_deviceId").html(port_Info.device_id);
        $("#port_VNCType").html(port_Info["binding:vnic_type"]);

    } else {
        window.location = "#/net/topology";
    }


});
