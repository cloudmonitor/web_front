/*var gloabControlPath = "../actionController.do";*/
var gloabControlPath = "../ajax/Topo_submitTopo";
/**
 * Title: 
 * Description: ���õ�JS
 * Author: Z f
 */

/**
 * Description: AJAXOptions ͨ�õ�AJAX����Options����
 * һ������£��Է�������AJAX����ֻ��data, success Method ������������ͬ
 * @param data JSON���ݸ�ʽ
 * @param success ����ɹ���Ļص� Method
 * @return
 * Example��
	var ajaxOptions = new AJAXOptions();
	ajaxOptions.data = {"dictData" : inputJsonData};
	ajaxOptions.setSuccess(function(){alert("��ӳɹ���");queryLabList();});
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
	this.error = error || function(){alert("����ʧ��!�����ύʧ��");};
}

/*if(!JSON)
{
	document.write("<script src='json2.js'><\/script>");
}*/

/**
 * �ú��� ��JS�������л�ΪJSON��ʽ���ݺ� ����dictData  JSON��IE8������Ҫ������JSON�ļ�����FF��chrome��IE8��360�������������
 * @param inputJSONObject
 */
AJAXOptions.prototype.setData = function(inputJSONObject)
{
	this.data = {"dictData" : JSON.stringify(inputJSONObject)};
}

/**
 * �ú�������AJAXOptions�����success ���ڷ�������ִ�гɹ�ʱ����sucCallback����
 * ÿ��AJAXOptions�����success��Ա��������Ҫ����������˵ĳ����ú�����������һ���ֵĳ�����
 * @param sucCallback ����
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
			alert("����ʧ�ܣ�" + data.resultDesc);
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


//IE û��trim() ��Ҫ�ر����
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
	var expire_days = days; // (���������)
	var expire_date = new Date();
	var ms_from_now = expire_days * 24 * 3600 * 1000;
	expire_date.setTime(expire_date.getTime() + ms_from_now);
	var expire_string = expire_date.toGMTString();
//	document.cookie = encodeURIComponent(name + "=" + escape(value) + ";expires=" + expire_string);
	document.cookie = name + "=" + encodeURIComponent(value) + ";expires=" + expire_string+";path=/openlab";
}