/**
 * Created by lwj on 2016/12/15.
 */
var ajaxbg = $("#loading_monitor,#background_monitor");
ajaxbg.show();
setTimeout("ajaxbg.hide()", 2000);

$(function() {
    $('#option1').click();
    var monitor_id = window.location.href.split('?')[1];
    var curr_type = "minute";
    var cur_id;
    //主机的获取
    $.ajax({
        type: "GET",
        url: config["host"] + "/instances?token=" + window.localStorage.token,
        success: function(data) {
            var arr = [0, 0];
            var servers = JSON.parse(data)['servers'];
            if (servers.length != 0) {
                for (var i = 0; i < servers.length; i++){
                    var addresses = servers[i].addresses;
                    var mac_addr = "";
                    for(var key in addresses){
                        mac_addr =  addresses[key][0]["OS-EXT-IPS-MAC:mac_addr"].replace(/:/g, "").toUpperCase();
                    }
                    var id_mac_addr = servers[i].id + " " + mac_addr;
                    $(".monitor_traffic").append('<option value="' + id_mac_addr  + '">' + servers[i].name + '</option>');
                }
                cur_id = servers[0].id;
                if (monitor_id != 'undefined' && monitor_id != undefined) {
                    cur_id = monitor_id;
                    $(".monitor_traffic option[value='" + cur_id + "']").attr("selected", true);
                }
                setTimeout("ajaxbg.hide()", 2000);
                set_net_meter(cur_id, "network.incoming.bytes.rate", arr);
                set_net_meter(cur_id, "network.outgoing.bytes.rate", arr);
            } else {
                $('.monitor_traffic').css("display", "none");
                var show_info = '<div id="content" class="col-md-5 monitor-chart" style="background:pink;width:220px;height:40px;text-align:center;padding-top:12px;position:absolute;left:400px;top:2px;z-index:9999">该租户当前没有虚拟机^.^!</div>';
                $(".content_traffic").html(show_info);
            }
        },
        error: function(data) {
            createAndHideAlert("当前没有主机或主机信息获取失败！");
        }
    });
    //select事件
    $('.monitor_traffic').change(function() {
        ajaxbg.show();
        var id_mac = $(this).children('option:selected').val().split(" ");
        cur_id = id_mac[0];
        var arr = [0, 0];
        setTimeout("ajaxbg.hide()", 2000);
        set_net_meter(cur_id, "network.incoming.bytes.rate", arr);
        set_net_meter(cur_id, "network.outgoing.bytes.rate", arr);
    });
    //天时分改变
    $('#option1').click(function() {
        changeStatus(this);
        ajaxbg.show();
        curr_type = "minute";
        // preSetAjax(cur_id, curr_type, arr);
    });
    $('#option2').click(function() {
        changeStatus(this);
        ajaxbg.show();
        curr_type = "hour";
        // preSetAjax(cur_id, curr_type, arr);
    });
    $('#option3').click(function() {
        changeStatus(this);
        ajaxbg.show();
        curr_type = "day";
        // preSetAjax(cur_id, curr_type, arr);
    });
});

function changeStatus(that) {
    for (var i = 1; i < 4; i++)
        $("#option" + i).removeClass("active");
    $(that).addClass("active");
}


function get_net_meter(id, meter_name) {
    var meter_data = "";
    $.ajax({
        type: "GET",
        url: config["host"] + "/v1.0/monitor/" + id + "/" + meter_name + "/minute?limit=1&token=" + window.localStorage.token,
        async: false,
        success: function (data) {
            meter_data = JSON.parse(data)[meter_name][0];
            var time_str = getTimeStr(meter_data.timestamp);
            var time_temp = "";
            //时间的转换
            time_temp = time_str.split(" ")[1];
            meter_data.timestamp = time_temp;
            meter_data = JSON.stringify(meter_data);
        },
        error: function (data) {
            createAndHideAlert("信息获取失败！");
        }
    });
    return meter_data;
}

function set_net_meter(id, meter_name, arr) {
    $.ajax({
        type: "GET",
        url: config["host"] + "/v1.0/monitor/" + id + "/" + meter_name + "/minute?limit=15&token=" + window.localStorage.token,
        success: function(data) {
            // console.log(data);
            var meter_datas = JSON.parse(data)[meter_name];
            if (meter_datas[0] != null && meter_datas[0] != "") {
                var temp_flag = "";
                for (var i = 0; i < meter_datas.length; i++) {
                    //------------时间格式的控制
                    // 返回数据为空的时间格式为前一个不空的数据的时间依次往后
                    if (meter_datas[i] == null) {
                        temp_flag = moment(temp_flag, "HH:mm:ss").subtract(10, "seconds").format("HH:mm:ss");
                        meter_datas[i] = {};
                        meter_datas[i].timestamp = temp_flag;
                        meter_datas[i].counter_volume = 0;
                    } else {
                        var time_str = getTimeStr(meter_datas[i].timestamp);
                        temp_flag = time_str.split(" ")[1];
                        meter_datas[i].timestamp = temp_flag;
                        //百分比转换
                        meter_datas[i].counter_volume = new Number(meter_datas[i].counter_volume).toFixed(2);
                    }
                }
                if (meter_name == "network.incoming.bytes.rate")
                    arr[0] = meter_datas;
                else
                    arr[1] = meter_datas;
                if (arr[0] != 0 && arr[1] != 0)
                    set_net_traffic(id, arr[0], arr[1]);
                // 等待图片消失
                if ((arr[0] + arr[1]) != 0)
                    ajaxbg.hide();
            }
            else {
                var show_info = '<div id="content" class="col-md-12 monitor-chart" style="background:pink;width:220px;height:40px;text-align:center;padding-top:12px;position:absolute;left:40%;top:100px;z-index:0"><b>暂时没有数据!</b></div>';
                var option = "rt_traffic";
                var title = "网络监控信息";
                showInfo_disk_Net(option, title);
                $("#rt_traffic").append(show_info);
            }
        },
        error: function(data) {
            createAndHideAlert("信息获取失败！");
        }
    });
}

function showInfo_disk_Net(option, title) {
    var myChart3 = echarts.init(document.getElementById(option));
    // 3.网络监控信息
    var option3 = {
        title: {
            text: title,
            left: 'center'
        },
        legend: {
            data: [{
                name: '网络接受速率',
                icon: 'rect'
            }, {
                name: '网络发送速率',
                icon: 'rect'
            }],
            itemHeight: '5',
            left: 'center',
            top: '8%'
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        }
    };
    myChart3.setOption(option3);
}


//-------设置网络
function set_net_traffic(id, net_ins, net_outs) {
    var rt_traffic = echarts.init(document.getElementById('rt_traffic'));
    // 3.网络监控信息
    var option4 = {
        title: {
            text: '网络监控信息',
            left: 'center'
        },
        tooltip: {
            trigger: 'axis',
            formatter: '{b}<br> {a0}: {c0} B/S<br>{a1}: {c1} B/S'
        },
        legend: {
            data: [{
                name: '网络接受速率',
                icon: 'rect'
            }, {
                name: '网络发送速率',
                icon: 'rect'
            }],
            itemHeight: '5',
            left: 'center',
            top: '8%'
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
        },
        xAxis: [{
            type: 'category',
            boundaryGap: false,
            data:
            // [net_ins[6].timestamp, net_ins[5].timestamp, net_ins[4].timestamp, net_ins[3].timestamp, net_ins[2].timestamp, net_ins[1].timestamp, net_ins[0].timestamp]
                (function (){
                    var res = [];
                    for(var i=net_ins.length; i>=1; i--){
                        res.push(net_ins[i-1].timestamp);
                    }
                    return res;
                })()
        }],
        yAxis: [{
            type: 'value',
            boundaryGap: [0, '20%'],
            axisLabel: {
                formatter: '{value} bps'
            }
        }],
        series: [{
            name: '网络接受速率',
            type: 'line',
            smooth: true,
            lineStyle: {
                normal: {
                    width: '2'
                }
            },
            data:
                (function (){
                    var res = [];
                    for(var i=net_ins.length; i>=1; i--){
                        res.push(net_ins[i-1].counter_volume);
                    }
                    return res;
                })()
        }, {
            name: '网络发送速率',
            type: 'line',
            smooth: true,
            lineStyle: {
                normal: {
                    width: '2',
                    color: '#0000ff'
                }
            },
            data:
                (function (){
                    var res = [];
                    for(var i=net_outs.length; i>=1; i--){
                        res.push(net_outs[i-1].counter_volume);
                    }
                    return res;
                })()
        }]
    };
    rt_traffic.setOption(option4);
    setInterval(function () {
        var meter_data1 = get_net_meter(id, "network.incoming.bytes.rate");
        var meter_data2 = get_net_meter(id, "network.outgoing.bytes.rate");
        var last_data1 = JSON.parse(meter_data1);
        var last_data2 = JSON.parse(meter_data2);
        var data0 = option4.series[0].data;
        var data1 = option4.series[1].data;
        data0.shift();
        data0.push(last_data1.counter_volume);
        data1.shift();
        data1.push(last_data2.counter_volume);
        option4.xAxis[0].data.shift();
        option4.xAxis[0].data.push(last_data1.timestamp);
        rt_traffic.setOption(option4);
    }, 10000);
}