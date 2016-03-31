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
                if (addrs_temp[net][j]["OS-EXT-IPS:type"] == "fixed")
                {
                    var header_str;
                    if(num==1)
                        header_str="&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
                    else
                         header_str="";
                    str += header_str+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + addrs_temp[net][j].addr + "<br/>";
                }
                else if (addrs_temp[net][j]["OS-EXT-IPS:type"] == "floating")
                    str += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + "浮动IP<br/>" + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + addrs_temp[net][j].addr + "<br/>";
            }
        } else {
            for (var j = 0; j < addrs_temp[net].length; j++) {
                if (num > 1)
                    str += "<b>" + net + "</b>";
                if (addrs_temp[net][j]["OS-EXT-IPS:type"] == "fixed")
                {
                     var header_str;
                    if(num==1)
                        header_str="&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
                    else
                         header_str="";                   
                    str += header_str+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + addrs_temp[net][j].addr + "<br/>";
                }
                else if (addrs_temp[net][j]["OS-EXT-IPS:type"] == "floating")
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
    var zhour = parseInt(time / (60 * 60)) - zday * 24 - weekend*7*24;
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

function getTimeStr(date_temp)
{
   var UTC8_time = moment.utc(date_temp).zone(-8).format('YYYY-MM-DD HH:mm:ss');
   return  UTC8_time;
}

function flvors_info() {
    $.ajax({
        type: "GET",
        url: config["host"]+"/flavors?token=" + window.localStorage.token,
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
