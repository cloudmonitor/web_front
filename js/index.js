$(function() {
    $("#first_page").css({
        "color": "#fff",
        "background-color": "#428bca"
    });
    var chart_data;
    $("#curr_userName").html(JSON.parse(window.localStorage.user).username);
    $.ajax({
        type: "GET",
        url: config["host"] + "/tenants?token=" + window.localStorage.token,
        success: function(data) {
            // createAndHideAlert(data);
            var data = JSON.parse(data);
            var tenantname;
            window.localStorage.tenants = JSON.stringify(data.tenants);
            //---------设置租户list
            var device_temp = data["tenants"];
            $("#deviceslist").children('a').remove();
            //alert(localStorage.curr_tenant);
            if (localStorage.curr_tenant == 'undefined' || localStorage.curr_tenant == undefined) {
                localStorage.curr_tenant = device_temp[0].name;
                tenantname = data["tenants"][0]["name"];
            } else {
                tenantname = localStorage.curr_tenant;
            }
            $(".curr_deviceName").html(localStorage.curr_tenant);
            var str = '<a class="devices_list" role="menuitem" tabindex="-1"  href="javascript:void(0);">' + device_temp[0].name + '</a>';
            for (var i = 1; i < device_temp.length; i++) {
                str += '<a class="devices_list" role="menuitem" tabindex=' + (i - 1) + ' href="javascript:void(0);">' + device_temp[i].name + '</a>';
            };
            $("#deviceslist").append(str);
            //-----得到当前租户的信息
            getDevice_info(tenantname);
            $(".devices_list").unbind('click').click(function() {
                var select_deveiceName = $(this).html();
                var curr_deviceName = $(".curr_deviceName").html();
                if (select_deveiceName != curr_deviceName) {
                    localStorage.curr_tenant = select_deveiceName;
                    tenantname = select_deveiceName;
                    $(".curr_deviceName").html(select_deveiceName);
                    getDevice_info(tenantname);
                    location.href = "#/compute/abstract";
                    $(".nav-sidebar > li > a").css({
                        "color": "#337ab7",
                        "background-color": "transparent"
                    })
                    $("#first_page").css({
                        "color": "#fff",
                        "background-color": "#428bca"
                    });
                }
            });

        },
        error: function(data) {
            createAndHideAlert("信息获取失败");
            console.log(data);
        }
    });

    $("#lagout").click(function() {
        //alert(123);
        $('#myModal').modal('toggle')
        window.localStorage.clear();
        location.href = "#/";
        location.reload();
    });


});

function getDevice_info(tenantname) {
    $.ajax({
        type: "GET",
        url: config["host"] + "/tenant/login?token=" + window.localStorage.token + "&tenantname=" + tenantname,
        success: function(data) {
            var data = JSON.parse(data);
            // console.log(data);
            window.localStorage.token = JSON.stringify(data.access.token);
            //console.error("得到的localStorage  ::", window.localStorage.token);
            window.localStorage.user = JSON.stringify(data.access.user);
            $.ajax({
                type: "GET",
                url: config["host"] + "/limits?token=" + window.localStorage.token,
                success: function(data) {
                    // var data = JSON.parse(data);
                    // console.log(data);
                    localStorage.limits = data;
                    // createAndHideAlert(localStorage.limits);
                    console.warn("data", data);
                    draw_charts(data);
                },
                error: function(data) {
                    createAndHideAlert("信息获取失败");
                    console.log(data);
                }
            });
        },
        error: function(data) {
            createAndHideAlert("信息获取失败");
            console.log(data);
        }
    });
}

//draw_charts(chart_data);
function draw_charts(chart_data) {
    var chart_info = JSON.parse(chart_data)["limits"]["absolute"];
    // createAndHideAlert("ok");
    // createAndHideAlert(chart_info);
    //createAndHideAlert(chart_info.maxTotalInstances);
    var myChart1 = echarts.init(document.getElementById('main1'));
    var myChart2 = echarts.init(document.getElementById('main2'));
    var myChart3 = echarts.init(document.getElementById('main3'));
    var myChart4 = echarts.init(document.getElementById('main4'));
    var myChart5 = echarts.init(document.getElementById('main5'));
    var myChart6 = echarts.init(document.getElementById('main6'));
    //---------饼图一
    var option1 = {
        title: {
            text: '实例',
            subtext: '使用率',
            x: 'center'
        },
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        // legend: {     //     orient: 'vertical',     //     x: 'left',
        //     data: ['直接访问', '邮件营销', '联盟广告', '视频广告', '搜索引擎']     // },
        series: [{
            name: '实例',
            type: 'pie',
            radius: '40%',
            center: ['50%', '50%'],
            data: [{
                value: chart_info.totalInstancesUsed,
                name: '已使用'
            }, {
                value: chart_info.maxTotalInstances - chart_info.totalInstancesUsed,
                name: '未使用'
            }],
            label: {
                normal: {
                    show: false
                }
            },
            labelLine: {
                normal: {
                    show: false,
                }
            },
            itemStyle: {
                emphasis: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        }]
    };
    //---------饼图二
    var option2 = {
        title: {
            text: '虚拟内核',
            subtext: '使用率',
            x: 'center'
        },
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        // legend: {     //     orient: 'vertical',     //     x: 'left',
        //     data: ['直接访问', '邮件营销', '联盟广告', '视频广告', '搜索引擎']     // },
        series: [{
            name: '虚拟内核',
            type: 'pie',
            radius: '40%',
            center: ['50%', '50%'],
            data: [{
                value: chart_info.totalCoresUsed,
                name: '已使用'
            }, {
                value: chart_info.maxTotalCores - chart_info.totalCoresUsed,
                name: '未使用'
            }],
            label: {
                normal: {
                    show: false
                }
            },
            labelLine: {
                normal: {
                    show: false,
                }
            },
            itemStyle: {
                emphasis: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        }]
    };
    //---------饼图三
    var option3 = {
        title: {
            text: '内存',
            subtext: '使用率',
            x: 'center'
        },
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        // legend: {     //     orient: 'vertical',     //     x: 'left',
        //     data: ['直接访问', '邮件营销', '联盟广告', '视频广告', '搜索引擎']     // },
        series: [{
            name: '内存',
            type: 'pie',
            radius: '40%',
            center: ['50%', '50%'],
            data: [{
                value: chart_info.totalRAMUsed,
                name: '已使用'
            }, {
                value: chart_info.maxTotalRAMSize - chart_info.totalRAMUsed,
                name: '未使用'
            }],
            label: {
                normal: {
                    show: false
                }
            },
            labelLine: {
                normal: {
                    show: false,
                }
            },
            itemStyle: {
                emphasis: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        }]
    };
    //---------饼图四
    var option4 = {
        title: {
            text: 'Floating IPs',
            subtext: '使用率',
            x: 'center'
        },
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        // legend: {     //     orient: 'vertical',     //     x: 'left',
        //     data: ['直接访问', '邮件营销', '联盟广告', '视频广告', '搜索引擎']     // },
        series: [{
            name: 'Floating IPs',
            type: 'pie',
            radius: '40%',
            center: ['50%', '50%'],
            data: [{
                value: chart_info.totalFloatingIpsUsed,
                name: '已使用'
            }, {
                value: chart_info.maxTotalFloatingIps - chart_info.totalFloatingIpsUsed,
                name: '未使用'
            }],
            label: {
                normal: {
                    show: false
                }
            },
            labelLine: {
                normal: {
                    show: false,
                }
            },
            itemStyle: {
                emphasis: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        }]
    };
    //----饼图五
    var option5 = {
        title: {
            text: '安全组',
            subtext: '使用率',
            x: 'center'
        },
        tooltip: {
            trigger: 'item',
            formatter: "{a} <br/>{b} : {c} ({d}%)"
        },
        // legend: {     //     orient: 'vertical',     //     x: 'left',
        //     data: ['直接访问', '邮件营销', '联盟广告', '视频广告', '搜索引擎']     // },
        series: [{
            name: '安全组',
            type: 'pie',
            radius: '40%',
            center: ['50%', '50%'],
            data: [{
                value: chart_info.totalSecurityGroupsUsed,
                name: '已使用'
            }, {
                value: chart_info.maxSecurityGroups - chart_info.totalSecurityGroupsUsed,
                name: '未使用'
            }],
            label: {
                normal: {
                    show: false
                }
            },
            labelLine: {
                normal: {
                    show: false,
                }
            },
            itemStyle: {
                emphasis: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                }
            }
        }]
    };

    var option6 = {
        legend: {
            orient: 'vertical',
            left: 'left',
            data: ['已使用', '未使用']
        },
        series: [{
            type: 'pie',
            radius: '0',
            center: ['0%', '0%'],
            data: [{
                value: 0,
                name: '已使用'
            }, {
                value: 0,
                name: '未使用'
            }],
            label: {
                normal: {
                    show: false
                }
            },
            labelLine: {
                normal: {
                    show: false
                }
            }
        }]
    };

    myChart1.setOption(option1);
    myChart2.setOption(option2);
    myChart3.setOption(option3);
    myChart4.setOption(option4);
    myChart5.setOption(option5);
    myChart6.setOption(option6);
}
