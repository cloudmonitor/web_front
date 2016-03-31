$(function() {
    var serverInfo = JSON.parse(localStorage.server_tempInfo);
    var id_num = window.location.href.split('?')[1];
    var id=id_num.split('&')[0];
    var num=id_num.split('&')[1];
    var zone=id_num.split('&')[2];
    var addrs_temp = serverInfo['servers'][id].addresses;
    var addrs = pretty_adrr1(addrs_temp);

    var time_str=getTimeLen(serverInfo['servers'][id].created);

    var curr_flavor=JSON.parse(localStorage.flavor).flavors[num];
    //alert(curr_flavor);

    $("#server_Name").html(serverInfo['servers'][id].name);
    $("#server_ID").html(serverInfo['servers'][id].id);
    $("#server_Status").html(serverInfo['servers'][id].status);
    $("#server_AvailabilityZone").html(zone); //
    $("#server_Created").html(serverInfo['servers'][id].created);
    $("#server_Timesincecreated").html(time_str); 

    $("#server_Specs").html(curr_flavor.name); //
    $("#server_FlavorID").html(serverInfo['servers'][id].flavor.id);
    $("#server_RAM").html(curr_flavor.ram); //
    $("#server_VCPUs").html(curr_flavor.vcpus); //
    $("#server_Disk").html(curr_flavor.disk); //

    $("#server_IPAddresses").html(addrs); 

    $("#server_default").html(serverInfo['servers'][id].name);
});
