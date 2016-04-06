$(function() {
    $.ajax({
        type: "GET",
        url: config["host"] + "/subnets?token=" + window.localStorage.token,
        success: function(data) {
            var subnet_infos = JSON.parse(data)['subnets'];
            localStorage.subnets_tempInfo = data;
            /*            localStorage.subnetInfo=data;*/
            $.ajax({
                type: "GET",
                url: config["host"] + "/networks?token=" + window.localStorage.token,
                success: function(data) {
                    localStorage.net_tempInfo = data;
                    var servers = JSON.parse(data);
                    var count_num = 0;
                    for (var i = servers['networks'].length - 1; i >= 0; i--) {
                        var server = servers['networks'][i];
                        if (server.admin_state_up == true)
                            server.admin_state_up = "上";
                        else
                            server.admin_state_up = "下";
                        //----子网
                        var sub_str = "";
                        var subnets = server['subnets'];
                        //console.log(subnets + "=====" + i);
                        var subnet_Info = "[";
                        for (var j = 0; j < subnets.length; j++) {
                            // alert(subnets.length);
                            for (var k = 0; k < subnet_infos.length; k++) {
                                //alert(subnets[i]+"=="+subnet_infos[j].id);
                                if (subnets[j] == subnet_infos[k].id) {
                                    // alert(subnets[i]);
                                    sub_str += "<b>" + subnet_infos[k].name + "</b> " + subnet_infos[k].cidr + "<br/>";
                                    if (subnet_Info = "[")
                                        subnet_Info += JSON.stringify(subnet_infos[k]);
                                    else
                                         subnet_Info += ","+JSON.stringify(subnet_infos[k]);
                                }
                            }
                        }
                        if (sub_str != "") {
                            count_num++;
                            server.subnets = sub_str;
                            localStorage.subnetInfo = subnet_Info + "]";
                            setList(server, i, encodeURI(server.admin_state_up));
                        }
                    };
                    var footer_str = "<tfoot><tr class='active tfoot-dsp'><td colspan='7'>Displaying <span id='item_count'>" + count_num + "</span> items</td></tr></tfoot>";
                    //var footer_str='<div style="background:#E5E5E5" style="height:5rem;width:50rem">'+'Displaying  '+count_num+'  items'+'</div>';
                    $(".instance_info").append(footer_str);
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

function setList(data, i, status) {
    var str = "<tbody><tr><td><input type='checkbox'></td><td><a href='#/net/net-desc?" + i + "&" + status + "'>" + data.name + "</a></td><td>" + data.subnets + "</td><td>" + data.shared + "</td>" +
        "<td>" + data.status + "</td><td>" + data.admin_state_up +
        "</td><td><div class='btn-group'>"+
        "<button type='button' class='btn btn-default btn-sm'>" + "编辑网络" + "</button>"+
        "<button type='button' class='btn btn-default btn-sm dropdown-toggle' data-toggle='dropdown'><span class='caret'></span><span class='sr-only'>" + "切换下拉菜单" + "</span></button>"+
        "<ul class='dropdown-menu' role='menu'>"+
        "<li><a href='#'>" + "增加子网" + "</a></li>"+
        "<li><a href='#'>" + "删除网络" + "</a></li>"+
        "</ul></div></td></tr></tbody>";
    $(".instance_info").append(str);
}