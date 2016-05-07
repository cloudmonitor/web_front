$(function() {
    var sec_group_count = 0;
    $.ajax({
        type: "GET",
        url: config["host"] + "/security_groups?token=" + window.localStorage.token,
        success: function(data) {
            /*            console.log("---------------");
                        console.log(data);*/
            window.localStorage.securitys_temp = data;
            var securitys = JSON.parse(data)['security_groups'];
            for (var i = 0; i < securitys.length; i++) {
                var security = securitys[i];
                setSecurityGroupList(security, security.id);
            }
            sec_group_count = securitys.length;
            var footer_info = '<tfoot><tr class="active tfoot-dsp footerID"><td colspan="6">Displaying <span id="item_count">' + sec_group_count + '</span> items</td></tr></tfoot>';
            $(".security_info").append(footer_info);
        },
        error: function(data) {
            createAndHideAlert("信息获取失败");
            console.log(data);
        }
    });

    //--------------创建安全组
    $(".createSgInfo").unbind('click').click(function() {
        $("#update_info").attr("data-toggle", "");
        $("#update_info").attr("data-target", "");
        var name = "";
        name = $(".sg_name").val();
        var desc = $(".sg_desc").val();
        var sec_group;
        sec_group = {
            "security_group": {
                "name": null,
                "description": null
            }
        }

        var sec_gourp_temp = sec_group['security_group'];
        if (name.trim().length != 0 && name != "default")
            sec_gourp_temp.name = name;
        else {
            $(".sg_name").attr("placeholder", "该项必填并且不能命名为default！")
            return;
        }
        sec_gourp_temp.description = desc;
        console.error(JSON.stringify(sec_group));
        console.error(createOrupdate);
        if (createOrupdate == 0) {
            $.ajax({
                type: "POST",
                data: JSON.stringify(sec_group),
                contentType: "application/json",
                url: config["host"] + "/security_groups/create?token=" + window.localStorage.token,
                success: function(data) {
                    $(".close_temp").click();
                    setSecurityGroupList(JSON.parse(data)['security_group'], JSON.parse(data)['security_group'].id);
                    $(".footerID").remove();
                    var footer_info = '<tr class="active tfoot-dsp footerID"><td colspan="6">Displaying <span id="item_count">' + (++sec_group_count) + '</span> items</td></tr>';
                    $(".rule_footer").append(footer_info);
                },
                error: function(data) {
                    createAndHideAlert("创建失败！");
                }
            });
        } else {
            sg_id = createOrupdate;
            createOrupdate = 0;
            //console.log(JSON.stringify(sec_group));
            $.ajax({
                type: "POST",
                data: JSON.stringify(sec_group),
                contentType: "application/json",
                url: config["host"] + "/security_groups/update/" + sg_id + "?token=" + window.localStorage.token,
                success: function(data) {
                    $(".close_temp").click();
                    $("#" + JSON.parse(data)['security_group'].id + "").parent().parent().remove();
                    setSecurityGroupList(JSON.parse(data)['security_group'], JSON.parse(data)['security_group'].id);
                    $(".sg_name").val("");
                    $(".sg_desc").val("");

                },
                error: function(data) {
                    createAndHideAlert("更新失败！");
                }
            });
        }
    });

    //----------------全选的控制
    $(document).on("change", ".all_check", function() {
        var isChecked = $(this).prop("checked");
        $(".secGoup_id").prop("checked", isChecked);
        if (isChecked) {
            $(".sg_del").attr("disabled", false);
        } else {
            $(".sg_del").attr("disabled", true);
        }
    });
    //-----------------删除云主机
    $(document).on("change", ".secGoup_id", function() {
        if ($(".secGoup_id:checked").length == $(".secGoup_id").length) {
            $(".sg_del").attr("disabled", false);
            $(".all_check").prop("checked", true);
        } else if ($(".instance_checks:checked").length > 0) {
            $(".sg_del").attr("disabled", false);
            $(".all_check").prop("checked", false);
        } else {
            $(".sg_del").attr("disabled", true);
            $(".all_check").prop("checked", false);
        }
    });
    //--------------删除安全组  tenant_id
    $(".sg_del").unbind('click').click(function() {
        var count = 0;
        var json_array = '{"sg_ids":[';
        $(".secGoup_id:checked").each(function() {
            if ($(this).attr("name") == "default")
                createAndHideAlert($(this).attr("name") + "不可删除！");
            else {
                count++;
                if (json_array != '{"sg_ids":[')
                    json_array += ',"' + $(this).attr("id") + '"';
                else
                    json_array += '"' + $(this).attr("id") + '"';
            }
        });
        json_array += "]}";
        console.log(json_array);
        if (count > 0) {
            $.ajax({
                type: "POST",
                data: json_array,
                contentType: "application/json",
                url: config["host"] + "/security_groups/delete?token=" + window.localStorage.token,
                success: function(data) {
                    var id_status = JSON.parse(data);
                    for (var x in id_status) {
                        if (id_status[x] == 204) {
                            createAndHideAlert(x + "删除成功！");
                            $("#" + x + "").parent().parent().remove();
                            $(".footerID").remove();
                            var str_footer = '<tr class="active tfoot-dsp footerID"><td colspan="13">Displaying <span id="item_count">' + (--sec_group_count) + '</span> items</td></tr>';
                            $(".rule_footer").append(str_footer);
                        } else
                            createAndHideAlert(x + "删除失败");
                    }
                    //window.location.reload();
                },
                error: function(data) {

                }
            });
        }
    });

    $(".close_temp").unbind('click').click(function() {
        $("#update_info").attr("data-toggle", "");
        $("#update_info").attr("data-target", "");
    });
    var createOrupdate = 0;
    //----------------修改安全组
    $("#update_info").unbind('click').click(function() {
        createOrupdate = 0;
        if ($(".secGoup_id:checked").length != 1) {
            createAndHideAlert("请选择一条信息进行修改 ^.^");
            return;
        } else {
            $("#update_info").attr("data-toggle", "modal");
            $("#update_info").attr("data-target", "#create-sec-group");
            //data-toggle="modal" data-target="#myModal"
            $(".secGoup_id:checked").each(function() {
                createOrupdate = $(this).attr("id");
                $(".sg_name").val($(this).parent().next().html());
                $(".sg_desc").val($(this).parent().next().next().html());
            });
        }
    });
});

function setSecurityGroupList(data, id) {
    var str = "<tbody><tr><td><input class='secGoup_id' type='checkbox' id='" + data.id + "'+name='" + data.name + "'></td><td>" + data.name +
        "</td><td>" + data.description +
        "</td><td><a href='#/net/secGroup_desc?" + id + "' class='btn btn-primary' style='background:white'><font style = 'color:black'> <i class = 'fa fa-plus' > </i>" + "管理规则" +
        "</font></a></td></tr>";
    $(".security_info").append(str);
}
