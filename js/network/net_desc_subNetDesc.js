$(function() {
    var id = window.location.href.split("?")[1];
    console.log(localStorage.subnets_tempInfo);
    $.ajax({
        type: "GET",
        url: config["host"] + "/subnets?token=" + window.localStorage.token,
        success: function(data) {
            var subnet_infos = JSON.parse(data)['subnets'];
            setInfo(id, subnet_infos);
        },
        error: function(data) {
            createAndHideAlert("子网信息获取失败!");
        }
    });

});

function setInfo(id, sub_netInfos) {
    var sub_netInfo;
    for (var i = 0; i < sub_netInfos.length; i++) {
        console.log(sub_netInfos[i].id);
        if (sub_netInfos[i].id == id) {
            sub_netInfo = sub_netInfos[i];
            break;
        }
    }
    if (sub_netInfo != null) {
        $("#sub_name").html(sub_netInfo.name);
        $("#sub_id").html(sub_netInfo.id);
        $("#sub_netId").html(sub_netInfo.network_id);
        if (sub_netInfo.subnetpool_id == null || sub_netInfo.subnetpool_id == "")
            sub_netInfo.subnetpool_id = "无";
        $("#sub_resource").html(sub_netInfo.subnetpool_id);
        $("#sub_ipVersion").html("IPv" + sub_netInfo.ip_version);
        $("#sub_CIDR").html(sub_netInfo.cidr);
        // console.error(sub_netInfo);
        $("#start_ip").html((sub_netInfo.allocation_pools.length == 0 ? "(未分配)" : sub_netInfo.allocation_pools[0].start) + "&nbsp;&nbsp;&nbsp;");
        $("#end_ip").html(sub_netInfo.allocation_pools.length == 0 ? "(未分配)" : sub_netInfo.allocation_pools[0].end);
        $("#sub_gateIP").html(sub_netInfo.gateway_ip);
        $("#sub_DHCP").html(sub_netInfo.enable_dhcp);
        if (sub_netInfo.host_routes == null || sub_netInfo.host_routes == "")
            sub_netInfo.host_routes = "无";
        $("#sub_otherRouter").html(sub_netInfo.host_routes);
        var dns_infos = sub_netInfo.dns_nameservers;
        var str = "";
        for (var i = 0; i < dns_infos.length; i++) {
            str += dns_infos[i] + "&nbsp;&nbsp;&nbsp;";
        }
        $("#sub_DNS").html(str);
    }


}
