// 计算 -- 密钥对
var keyPairApp = angular.module('keyPairApp', []);
keyPairApp.controller('keyPairCtrl', keyPairCtrl);
// 密钥对控制器
function keyPairCtrl($scope, $http) {
    // 初始化值
    $("head title").text("密钥");
    $(".nav-sidebar a[href='#/compute/key-pair']").css({
        "color": "#fff",
        "background-color": "#428bca"
    });
    var linkEle = $(".nav-sidebar li a");
    linkEle.click(function() {
        linkEle.css({
            "color": "#337ab7",
            "background-color": "transparent"
        });
    });
    // 默认禁用删除按钮
    $scope.delBtnDis = true;

    // 获取密钥对
    $scope.getKeyItems = function() {
        var url = config.host + "/keypairs?token=" + window.localStorage.token;
        $http.get(url).then(function(response) {
            // 请求成功
            var data = response.data;
            console.info("返回的数据：", data);
            $scope.keyItems = data.keypairs;
            $scope.itemCount = data.keypairs.length;
        }, function(response) {
            // 请求失败
            $scope.itemCount = 0;
            createAndHideAlert({
                "message": "密钥信息请求失败",
                "className": "alert-danger"
            });
        });
    }();

    // 勾选全选按钮
    $scope.chooseAllBtn = function() {
        console.info("all = ", $scope.all);
        if ($scope.itemCount) {
            // 如果条目数大于0
            $scope.delBtnDis = ($scope.all) ? false : true;
        }
        $scope.one = ($scope.all) ? true : false;
        console.info("$scope.one = ", $scope.one);
    };

    // 勾选表格中的列表项目
    $scope.itemChecked = function(event) {
        var length = $("td input[type='checkbox']:checked").length;
        console.info("该项目的索引值: ", $(event.target));
        if (length) {
            // 勾选数目大于0
            console.info("勾选数目 = ", length);
            $scope.delBtnDis = false;
            $scope.all = (length == $scope.itemCount) ? true : false;
            console.info("$scope.all = ", $scope.all);
        }
    };

    // 删除密钥对
    $scope.delKeyBtn = function() {
        // 分别存放将被删除的密钥及密钥下标
        var deleteItems = [];
        var deleteIndex = [];
        var checkedItems = $("td input[type='checkbox']:checked");
        var keyItems = $scope.keyItems;
        for (var i = 0, len = checkedItems.length; i < len; i++) {
            deleteIndex.push($(checkedItems[i]).attr('index'));
            deleteItems.push(keyItems[deleteIndex[i]].keypair.name);
        }
        $scope.deleteItems = deleteItems;
        console.info("将被删除的key: ", deleteItems);
        // 删除key请求(POST)
        var url = config.host + "/keypairs/delete?token=" + window.localStorage.token;
        var req = {
            method: 'POST',
            url: url,
            headers: {
                'Content-Type': "application/json",
            },
            data: JSON.stringify({ "keypair_names": deleteItems })
        };
        // 点击确认删除按钮
        $scope.confirmeDel = function() {
            console.info("req.data : ", deleteItems);
            $http(req).then(function(response) {
                // POST请求成功  {"name1": 202, "name2": 202}
                console.info("删除后返回的数据: ", response.data);
                var data = response.data;
                var SUCCESS = 202;
                var INCREASE = 0;
                for (var i = 0, len = checkedItems.length; i < len; i++) {
                    var name = deleteItems[i];
                    if (data[name] === SUCCESS) {
                        // 删除成功
                        createAndHideAlert({
                            "message": "<strong>密钥删除成功:</strong><br>" + deleteItems[i],
                            "className": "alert-success"
                        });
                        // 从列表中删除这个元素
                        var index = deleteIndex[i] - INCREASE;
                        INCREASE = INCREASE + 1;
                        keyItems.splice(index, 1);
                    } else {
                        // 设置状态为未选中
                        // checkedItems[i].checked = false;
                        createAndHideAlert({
                            "message": "<strong>密钥删除失败:</strong><br>" + deleteItems[i],
                            "className": "alert-danger"
                        });
                    }
                }
                // 隐藏模态框
                $("#deleteKey-modal").modal('hide');
                console.info("未删除的条目: ", keyItems);
                $scope.keyItems = keyItems;
                $scope.all = false;
                $scope.delBtnDis = true;
                $scope.itemCount = keyItems.length;
            }, function(response) {
                // POST请求失败
                createAndHideAlert({
                    "message": "请求删除失败",
                    "className": "alert-danger"
                });
            });
        };
    };


    // 创建密钥模态框按钮
    $scope.createKeyModal = function() {
        $scope.novalid = false;
        $scope.area_novalid = false;
        $scope.keyName = null;
        $scope.public_key = null;

        // 自动下载本地文件
        function download(filename, text) {
            var element = document.createElement('a');
            element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
            element.setAttribute('download', filename);

            element.style.display = 'none';
            document.body.appendChild(element);

            element.click();

            document.body.removeChild(element);
        }

        // 密钥名称输入框
        $("#key-name, #key-desc").blur(function() {
            var name = $scope.keyName;
            console.info("密钥名称 ", name);

            if (name) {
                // 输入字符串长度大于0
                var len = name.length;
                console.info("密钥长度 ", len);
                // 如果非法字符串长度大于0，则非法
                var res = name.match(/[^a-zA-Z0-9_]/g);
                if (res != null) {
                    $scope.novalid = true;
                    console.info("检查的结果: ", res);
                    return;
                }
            } else {
                $scope.novalid = true;
                return;
            }
            $scope.novalid = false;
        });

        // 公钥输入域
        $("#pub-key").blur(function() {
            var public_key = $scope.pulic_key;
            console.info("公钥名称 ", public_key);
            if (public_key) {
                var patt = /^ssh-ed25519|ssh-rsa|ssh-rsa|ecdsa-sha2-nistp256|ecdsa-sha2-nistp384|ecdsa-sha2-nistp521/g;
                var index = public_key.search(patt);
                if (index != 0) {
                    $scope.area_novalid = true;
                    console.info("公钥开始字符串错误");
                    return;
                }
            } else {
                $scope.area_novalid = true;
                return;
            }
            $scope.area_novalid = false;
        });

        // 创建密钥 -- 方式一
        $scope.createKey = function() {
            if ($scope.novalid) {
                return;
            }
            var url = config.host + "/keypairs/create?token=" + window.localStorage.token;
            var req = {
                method: 'POST',
                url: url,
                headers: {
                    'Content-Type': "application/json",
                },
                data: JSON.stringify({ "keypair": { "name": name } })
            };
            $http(req).then(function(response) {
                // POST请求成功
                var data = response.data;
                console.info("请求成功返回的数据： ", data);
                if (data.length === undefined) {
                    createAndHideAlert({
                        "message": "密钥创建失败",
                        "className": "alert-warning"
                    });
                    return;
                }
                // 删除Object中的private_key、user_id属性
                $scope.keyItems.push(data);
                createAndHideAlert({
                    "message": "密钥创建成功:<br>" + data.keypair.name,
                    "className": "alert-success"
                });
                $scope.itemCount = $scope.keyItems.length;
                $("#createKey-modal").modal('hide');
                // parameters1: 文件名   parameter2: 文件内容
                var filename = data.keypair.name + ".pem";
                var fileContent = data.keypair.private_key;
                download(filename, fileContent);
            }, function(response) {
                // POST请求失败
                createAndHideAlert({
                    "message": "请求创建失败",
                    "className": "alert-danger"
                });
            });
        };

        // 创建密钥 -- 方式二
        $scope.createByImportKey = function() {
            if ($scope.novalid || $scope.area_novalid) {
                return;
            }
            var name = $scope.keyName;
            var public_key = $scope.public_key;
            var url = config.host + "/keypairs/create?token=" + window.localStorage.token;
            var req = {
                method: 'POST',
                url: url,
                headers: {
                    'Content-Type': "application/json",
                },
                data: JSON.stringify({ "keypair": { "name": name, "public_key": public_key } })
            };
            $http(req).then(function(response) {
                var data = response.data;
                console.info("请求成功返回的数据： ", data);
                // 删除Object中的private_key、user_id属性
                data.keypair.private_key = undefined;
                data.keypair.user_id = undefined;
                $scope.keyItems.push(data);
                createAndHideAlert({
                    "message": "密钥创建成功:<br>" + data.keypair.name,
                    "className": "alert-success"
                });
                $scope.itemCount = $scope.keyItems.length;
                $("#createKey-modal").modal('hide');

            }, function(response) {
                // POST请求失败
                createAndHideAlert({
                    "message": "请求创建失败",
                    "className": "alert-danger"
                });
            });
        }
    };
}
