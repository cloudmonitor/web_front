/*var gloabControlPath = "../actionController.do";*/
var gloabControlPath = "../ajax/Topo_submitTopo";
/**
 * Title: 
 * Description: 共用的JS
 * Author: Z f
 */

/**
 * Description: AJAXOptions 通用的AJAX请求Options对象
 * 一般情况下，对服务器的AJAX请求，只有data, success Method 这两个参数不同
 * @param data JSON数据格式
 * @param success 请求成功后的回调 Method
 * @return
 * Example：
	var ajaxOptions = new AJAXOptions();
	ajaxOptions.data = {"dictData" : inputJsonData};
	ajaxOptions.setSuccess(function(){alert("添加成功！");queryLabList();});
	$.ajax(ajaxOptions);
 */
function AJAXOptions(async,data, success, type, url, dataType, cache, error)
{
	this.async = async || true;
	this.type = type || "post";
	this.url = url || gloabControlPath;
	this.dataType = dataType || "json";
	this.cache = cache || false;
	this.data = data || {"dictData" : ""};
	this.success = success || function(){};
	this.error = error || function(){alert("操作失败!请求提交失败");};
}

/*if(!JSON)
{
	document.write("<script src='json2.js'><\/script>");
}*/

/**
 * 该函数 将JS对象序列化为JSON格式数据后 赋给dictData  JSON在IE8以下需要单独的JSON文件！在FF、chrome、IE8、360浏览器下正常。
 * @param inputJSONObject
 */
AJAXOptions.prototype.setData = function(inputJSONObject)
{
	this.data = {"dictData" : JSON.stringify(inputJSONObject)};
}

/**
 * 该函数设置AJAXOptions对象的success 并在服务器端执行成功时调用sucCallback函数
 * 每个AJAXOptions对象的success成员函数都需要处理服务器端的出错，该函数提炼了那一部分的出错处理
 * @param sucCallback 函数
 */
/*AJAXOptions.prototype.setSuccess = function(sucCallback)
{
	this.success = function(data, textStatus){
		//simetimes, data is null but the request status is OK! maybe it's a bug! need to repair!!!
		if(!data)
			return;
		if(data.resultFlag == 1)
		{
			sucCallback(data);
		}
		else
		{
			alert("操作失败：" + data.resultDesc);
		}
	};
}*/
function sendAjaxRequest(inputJsonData, successCallback)
{
	var ajaxOptions = new AJAXOptions();
	ajaxOptions.data = {dictData :inputJsonData	};
	ajaxOptions.setSuccess(successCallback);
	$.ajax(ajaxOptions);
}


//IE 没有trim() 需要特别添加
// if("".trim)
String.prototype.trim = function () {
return this .replace(/^\s\s*/, '' ).replace(/\s\s*$/, '' );
}

function GetCookie(name) {
	var arg = name + "=";
	var alen = arg.length;
	var clen = document.cookie.length;
	var i = 0;
	while (i < clen) {
		var j = i + alen;
		if (document.cookie.substring(i, j) == arg)
			return getCookieVal(j);
		i = document.cookie.indexOf(" ", i) + 1;
		if (i == 0)
			break;
	}
	return null;
}

function getCookieVal(offset) {
	var endstr = document.cookie.indexOf(";", offset);
	if (endstr == -1)
		endstr = document.cookie.length;
	return decodeURIComponent(document.cookie.substring(offset, endstr));
}

function getValue(name, field) {
	if(GetCookie(name)!=null){
		var arr = GetCookie(name).split("&");
		for ( var i = 0; i < arr.length; i++) {
			var tmp = arr[i].split("=");
			if (tmp[0] == field)
				return tmp[1];
		}
	}
}

function SetCookie(name, value, days) {
	var expire_days = days; // (保存的天数)
	var expire_date = new Date();
	var ms_from_now = expire_days * 24 * 3600 * 1000;
	expire_date.setTime(expire_date.getTime() + ms_from_now);
	var expire_string = expire_date.toGMTString();
//	document.cookie = encodeURIComponent(name + "=" + escape(value) + ";expires=" + expire_string);
	document.cookie = name + "=" + encodeURIComponent(value) + ";expires=" + expire_string+";path=/openlab";
}