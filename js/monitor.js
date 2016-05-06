//$(window).load(function(){$("#loading").hide();});
var ajaxbg = $("#loading_monitor,#background_monitor");
ajaxbg.show();
//createAndHideAlert(ajaxbg);
setTimeout("ajaxbg.hide()", 3000);
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
            //   console.log(data);
            var arr = [0, 0, 0, 0, 0];
            var servers = JSON.parse(data)['servers'];
            if (servers.length != 0) {
                for (var i = 0; i < servers.length; i++)
                    $(".monitors_wj").append('<option value="' + servers[i].id + '">' + servers[i].name + '</option>');
                cur_id = servers[0].id;
                if (monitor_id != 'undefined' && monitor_id != undefined) {
                    cur_id = monitor_id;
                    $(".monitors_wj option[value='" + cur_id + "']").attr("selected", true);
                }
                preSetAjax(cur_id, curr_type, arr);
            } else {
                $('.monitors_wj').css("display", "none");
                var show_info = '<div id="content" class="col-md-5 monitor-chart" style="background:pink;width:220px;height:40px;text-align:center;padding-top:12px;position:absolute;left:400px;top:2px;z-index:9999">该租户当前没有虚拟机^.^!</div>';
                $(".content_wj").html(show_info);
            }
        },
        error: function(data) {
            createAndHideAlert("主机信息获取失败！");
        }
    });
    //select事件
    $('.monitors_wj').change(function() {
        ajaxbg.show();
        var id = $(this).children('option:selected').val();
        var arr = [0, 0, 0, 0, 0];
        cur_id = id;
        preSetAjax(id, curr_type, arr);
    });
    //天时分改变
    $('#option1').click(function() {
        changeStatus(this);
        ajaxbg.show();
        curr_type = "minute";
        var arr = [0, 0, 0, 0, 0];
        preSetAjax(cur_id, curr_type, arr);
    });
    $('#option2').click(function() {
        changeStatus(this);
        ajaxbg.show();
        curr_type = "hour";
        var arr = [0, 0, 0, 0, 0];
        preSetAjax(cur_id, curr_type, arr);
    });
    $('#option3').click(function() {
        changeStatus(this);
        ajaxbg.show();
        curr_type = "day";
        var arr = [0, 0, 0, 0, 0];
        preSetAjax(cur_id, curr_type, arr);
    });
});

function changeStatus(that) {
    for (var i = 1; i < 4; i++)
        $("#option" + i).removeClass("active");
    $(that).addClass("active");
}
//servers[0].id
function preSetAjax(id, curr_type, arr) {
    setTimeout("ajaxbg.hide()", 3000);
    setAjax(id, curr_type, "cpu_util", arr);
    setAjax(id, curr_type, "network.incoming.bytes.rate", arr);
    setAjax(id, curr_type, "network.outgoing.bytes.rate", arr);
    setAjax(id, curr_type, "disk.write.bytes.rate", arr);
    setAjax(id, curr_type, "disk.read.bytes.rate", arr);
    setAjax(id, curr_type, "memory.usage", arr);
}

function setAjax(id, curr_type, meter_name, arr) {
    //  主机监控折线图： 1.CPU监控信息    2.磁盘读写信息  3.网络监控信息  4.内网接受速率监控信息
    //---------CPU监控信息
    $.ajax({
        type: "GET",
        url: config["host"] + "/monitor/" + id + "/" + meter_name + "/" + curr_type + "?token=" + window.localStorage.token,
        success: function(data) {
            var cpu_utils = JSON.parse(data)[meter_name];
            if (meter_name == "memory.usage")
                console.error(">>>>>>>>", cpu_utils);
            if (cpu_utils[0] != null && cpu_utils[0] != "") {
                var temp_flag = 0;
                for (var i = 0; i < cpu_utils.length; i++) {
                    var cpu_util = cpu_utils[i];
                    //------------时间格式的控制
                    if (cpu_util.timestamp == undefined) {
                        if (curr_type == 'minute') {
                            var time_1 = parseInt(temp_flag.split(':')[0]);
                            var time_2 = parseInt(temp_flag.split(':')[1]);
                            if (time_2 <= 2) {
                                time_1 -= 1;
                            }
                            var time_temp = time_1 + ":" + (time_2 - 3) % 60;
                            temp_flag = time_temp;
                        } else if (curr_type == 'hour') {
                            var time_1 = parseInt(temp_flag.split(':')[0]);
                            var time_2 = parseInt(temp_flag.split(':')[1]);
                            var time_temp = (parseInt(time_1 - 1) + 24) % 24 + ":" + time_2;
                            temp_flag = time_temp;
                        } else {
                            temp_flag = moment(temp_flag).subtract(1, 'day');
                            var time_str = getTimeStr(temp_flag);
                            var time_temp = time_str.substr(5, 5);
                            temp_flag = time_str.substr(0, 10);
                        }
                    } else {
                        var time_str = getTimeStr(cpu_util.timestamp);
                        if (curr_type != 'day')
                        //时间的转换
                        {
                            var time_temp = time_str.split(" ")[1].substr(0, 5);
                            temp_flag = time_temp;
                        } else {
                            var time_temp = time_str.substr(5, 5);
                            temp_flag = time_str.substr(0, 10);
                        }

                    }
                    cpu_util.timestamp = time_temp;
                    //百分比转换
                    cpu_util.counter_volume = new Number(cpu_util.counter_volume).toFixed(2);
                }
                if (meter_name == "cpu_util") {
                    setCpu(cpu_utils);
                } else if (meter_name == "network.incoming.bytes.rate" || meter_name == "network.outgoing.bytes.rate") {
                    if (meter_name == "network.incoming.bytes.rate")
                        arr[1] = cpu_utils;
                    else
                        arr[2] = cpu_utils;
                    if (arr[1] != 0 && arr[2] != 0)
                        setNet(arr[1], arr[2]);
                } else if (meter_name == "disk.write.bytes.rate" || meter_name == "disk.read.bytes.rate") {
                    if (meter_name == "disk.write.bytes.rate")
                        arr[3] = cpu_utils;
                    if (meter_name == "disk.read.bytes.rate")
                        arr[4] = cpu_utils;
                    if (arr[3] != 0 && arr[4] != 0)
                        sertDisk(arr[3], arr[4]);
                } else {
                    setMem(cpu_utils);
                }
                // createAndHideAlert(arr[0] + arr[1] + arr[2] + arr[3] + arr[4]);
                if ((arr[0] + arr[1] + arr[2] + arr[3] + arr[4]) != 0)
                    ajaxbg.hide();
            } else {
                var show_info = '<div id="content" class="col-md-5 monitor-chart" style="background:pink;width:220px;height:40px;text-align:center;padding-top:12px;position:absolute;left:180px;top:150px;z-index:9999">暂时没有数据!</div>';
                if (meter_name == "cpu_util" || meter_name == "memory.usage") {
                    if (meter_name == "cpu_util") {
                        showInfo_cpu();
                        $("#chart1").append(show_info);
                    } else {
                        showInfo_mem();
                        $("#chart2").append(show_info);
                    }

                } else if (meter_name == "network.incoming.bytes.rate" || meter_name == "disk.write.bytes.rate") {
                    var option = "";
                    var title = "";
                    if (meter_name == "network.incoming.bytes.rate") {
                        option = "chart4";
                        title = "网络监控信息";

                    } else if (meter_name == "disk.write.bytes.rate") {
                        option = "chart3";
                        title = "磁盘读写信息";

                    }
                    showInfo_disk_Net(option, title);
                }
                if (meter_name == "network.incoming.bytes.rate")
                    $("#chart4").append(show_info);
                else if (meter_name == "disk.write.bytes.rate")
                    $("#chart3").append(show_info);
            }
        },
        error: function(data) {
            createAndHideAlert("信息获取失败！");
        }
    });
}

//--------CPU没数据时显示信息
function showInfo_cpu() {
    var myChart1 = echarts.init(document.getElementById('chart1'));
    // 1.CPU监控信息
    var option1 = {
        // backgroundColor: 'grey',
        title: {
            text: 'CPU监控信息',
            left: 'center'
        },
        legend: {
            data: [{
                name: 'CPU频率',
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
    myChart1.setOption(option1);
}
//--------Mem没数据时显示信息
function showInfo_mem() {
    var myChart2 = echarts.init(document.getElementById('chart2'));
    // 1.CPU监控信息
    var option2 = {
        // backgroundColor: 'grey',
        title: {
            text: '内存监控信息',
            left: 'center'
        },
        legend: {
            data: [{
                name: '内存使用率',
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
    myChart2.setOption(option2);
}
//--------磁盘和网络没有数据是显示
function showInfo_disk_Net(option, title) {
    var myChart3 = echarts.init(document.getElementById(option));
    // 3.网络监控信息
    var option3 = {
        // backgroundColor: 'grey',
        title: {
            text: title,
            left: 'center'
        },
        legend: {
            data: [{
                name: '外网接受速率',
                icon: 'rect'
            }, {
                name: '外网发送速率',
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

//-----设置磁盘
function sertDisk(cpu_utils, cpu_outs) {
    //console.log(cpu_utils);
    var myChart3 = echarts.init(document.getElementById('chart3'));
    // 2.磁盘读写信息
    var option3 = {
        // backgroundColor: 'grey',
        title: {
            text: '磁盘读写信息',
            left: 'center'
        },
        tooltip: {
            trigger: 'axis',
            formatter: '{b}<br> {a0}: {c0} B/S<br>{a1}: {c1} B/S'
        },
        legend: {
            data: [{
                name: '磁盘读速率',
                icon: 'rect'
            }, {
                name: '磁盘写速率',
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
            data: [cpu_utils[6].timestamp, cpu_utils[5].timestamp, cpu_utils[4].timestamp, cpu_utils[3].timestamp, cpu_utils[2].timestamp, cpu_utils[1].timestamp, cpu_utils[0].timestamp]
        }],
        yAxis: [{
            type: 'value',
            boundaryGap: [0, '20%'],
            axisLabel: {
                formatter: '{value} B/S'
            }
        }],
        series: [{
            name: '磁盘读速率',
            type: 'line',
            // stack: '磁盘',
            smooth: true,
            data: [cpu_outs[6].counter_volume, cpu_outs[5].counter_volume, cpu_outs[4].counter_volume, cpu_outs[3].counter_volume, cpu_outs[2].counter_volume, cpu_outs[1].counter_volume, cpu_outs[0].counter_volume]
        }, {
            name: '磁盘写速率',
            type: 'line',
            // stack: '磁盘',
            smooth: true,
            color: '#000',
            data: [cpu_utils[6].counter_volume, cpu_utils[5].counter_volume, cpu_utils[4].counter_volume, cpu_utils[3].counter_volume, cpu_utils[2].counter_volume, cpu_utils[1].counter_volume, cpu_utils[0].counter_volume]
        }]
    };
    myChart3.setOption(option3);
}
//-------设置网络
function setNet(cpu_utils, cpu_outs) {
    var myChart4 = echarts.init(document.getElementById('chart4'));
    // 3.网络监控信息
    var option4 = {
        // backgroundColor: 'grey',
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
                name: '外网接受速率',
                icon: 'rect'
            }, {
                name: '外网发送速率',
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
            data: [cpu_utils[6].timestamp, cpu_utils[5].timestamp, cpu_utils[4].timestamp, cpu_utils[3].timestamp, cpu_utils[2].timestamp, cpu_utils[1].timestamp, cpu_utils[0].timestamp]
        }],
        yAxis: [{
            type: 'value',
            boundaryGap: [0, '20%'],
            axisLabel: {
                formatter: '{value} bps'
            }
        }],
        series: [{
            name: '外网接受速率',
            type: 'line',
            // stack: '网速',
            smooth: true,
            lineStyle: {
                normal: {
                    width: '2'
                }
            },
            data: [cpu_utils[6].counter_volume, cpu_utils[5].counter_volume, cpu_utils[4].counter_volume, cpu_utils[3].counter_volume, cpu_utils[2].counter_volume, cpu_utils[1].counter_volume, cpu_utils[0].counter_volume]
        }, {
            name: '外网发送速率',
            type: 'line',
            // stack: '网速',
            smooth: true,
            lineStyle: {
                normal: {
                    width: '2',
                    color: '#0000ff'
                }
            },
            data: [cpu_outs[6].counter_volume, cpu_outs[5].counter_volume, cpu_outs[4].counter_volume, cpu_outs[3].counter_volume, cpu_outs[2].counter_volume, cpu_outs[1].counter_volume, cpu_outs[0].counter_volume]
        }]
    };
    myChart4.setOption(option4);
}
//---------设置CPU信息
function setCpu(data) {
    var myChart1 = echarts.init(document.getElementById('chart1'));
    // 1.CPU监控信息
    var option1 = {
        // backgroundColor: 'grey',
        title: {
            text: 'CPU监控信息',
            left: 'center'
        },
        tooltip: {
            trigger: 'axis',
            formatter: '{b}<br>{a}: {c}%'
        },
        legend: {
            data: [{
                name: 'CPU频率',
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
            data: [data[6].timestamp, data[5].timestamp, data[4].timestamp, data[3].timestamp, data[2].timestamp, data[1].timestamp, data[0].timestamp]
        }],
        yAxis: [{
            type: 'value',
            boundaryGap: [0, '20%'],
            axisLabel: {
                formatter: '{value} %'
            }
        }],
        series: [{
            name: 'CPU频率',
            type: 'line',
            stack: '总量',
            smooth: true,
            data: [data[6].counter_volume, data[5].counter_volume, data[4].counter_volume, data[3].counter_volume, data[2].counter_volume, data[1].counter_volume, data[0].counter_volume]
        }]

    };
    myChart1.setOption(option1);
}
//---------设置Mem信息
function setMem(data) {
    var myChart2 = echarts.init(document.getElementById('chart2'));
    // 1.CPU监控信息
    var option2 = {
        // backgroundColor: 'grey',
        title: {
            text: '内存监控信息',
            left: 'center'
        },
        tooltip: {
            trigger: 'axis',
            formatter: '{b}<br>{a}: {c}%'
        },
        legend: {
            data: [{
                name: '内存使用率',
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
            data: [data[6].timestamp, data[5].timestamp, data[4].timestamp, data[3].timestamp, data[2].timestamp, data[1].timestamp, data[0].timestamp]
        }],
        yAxis: [{
            type: 'value',
            boundaryGap: [0, '20%'],
            max: "100",
            axisLabel: {
                formatter: '{value} %'
            }
        }],
        series: [{
            name: '内存使用率',
            type: 'line',
            stack: '总量',
            smooth: true,
            data: [(data[6].counter_volume / (data[6].resource_metadata == undefined ? -1 : data[6].resource_metadata.memory_mb) * 100).toFixed(2), (data[5].counter_volume / (data[5].resource_metadata == undefined ? -1 : data[5].resource_metadata.memory_mb) * 100).toFixed(2), (data[4].counter_volume / (data[4].resource_metadata == undefined ? -1 : data[4].resource_metadata.memory_mb) * 100).toFixed(2), (data[3].counter_volume / (data[3].resource_metadata == undefined ? -1 : data[3].resource_metadata.memory_mb) * 100).toFixed(2), (data[2].counter_volume / (data[2].resource_metadata == undefined ? -1 : data[2].resource_metadata.memory_mb) * 100).toFixed(2), (data[1].counter_volume / (data[1].resource_metadata == undefined ? -1 : data[1].resource_metadata.memory_mb) * 100).toFixed(2), (data[0].counter_volume / (data[0].resource_metadata == undefined ? -1 : data[0].resource_metadata.memory_mb) * 100).toFixed(2)]
        }]

    };
    myChart2.setOption(option2);
}
