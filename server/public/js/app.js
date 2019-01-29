let base_url = "http://localhost:3000";
let temp_address = "";
App = {
    web3Provider: null,
    account: null,

    RawbotInstance: null,
    RawbotAddress: null,

    DeviceSpawnerInstance: null,
    DeviceSpawnerAddress: null,

    DeviceInstance: null,
    DeviceAddress: null,

    IPFSInstance: null,
    IPFSAddress: null,

    latitude: 0,
    longitude: 0,
    getAccount: function () {
        return new Promise((resolve, reject) => {
            web3.eth.getAccounts(function (error, accounts) {
                if (error) {
                    return reject(error);
                } else {
                    return resolve(accounts[0]);
                }
            });
        });
    },

    initWeb3: function () {
        return new Promise((resolve, reject) => {
            if (typeof web3 !== "undefined") {
                App.web3Provider = web3.currentProvider;
            } else {
                App.web3Provider = new Web3.providers.HttpProvider(
                    "http://localhost:8545"
                );
                alert("Please install Metamask before proceeding.");
                return;
            }
            web3 = new Web3(App.web3Provider);
            if (web3 == null || typeof web3 === "undefined") {
                return reject("Something went wrong");
            } else {
                return resolve("Successfully connected to Web3 Provider.");
            }
        });
    },

    getContracts: function () {
        return new Promise((resolve, reject) => {
            $.ajax({
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                },
                method: "GET",
                url: base_url + "/contracts",
                success: function (data, textStatus, jqXHR) {
                    return resolve(data);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    return reject(errorThrown);
                }
            });
        });
    },

    listAllArticles: function () {
        return new Promise((resolve, reject) => {
            $.ajax({
                method: "GET",
                url: base_url + "/api/articles",
                success: function (data, textStatus, jqXHR) {
                    return resolve(data);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    return reject(errorThrown);
                }
            });
        });
    },

    displayAllArticles: async function () {
        let __articles = await App.listAllArticles();
        __articles.forEach(article => {
            let content = `<p><a href="${article.url}" target="_blank">${
                article.title
                }</a><br/>${article.shortdescription}</p>`;
            $("#articles_content").prepend(content);
        });
    },

    getBittrexEthereumPrice: function () {
        return new Promise((resolve, reject) => {
            $.ajax({
                method: "GET",
                url: base_url + "/api/eth-price",
                success: function (data, textStatus, jqXHR) {
                    return resolve(data["eth-usd"]);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    return reject(errorThrown);
                }
            });
        });
    },

    initContracts: async () => {
        let contracts = await App.getContracts();
        return new Promise(async (resolve, reject) => {
            let rawbot_data = await $.getJSON(base_url + "/Rawbot.json");
            let ipfs_data = await $.getJSON(base_url + "/IPFS.json");
            let device_spawner_data = await $.getJSON(
                base_url + "/DeviceSpawner.json"
            );

            var Rawbot = web3.eth.contract(rawbot_data.abi);
            var IPFS = web3.eth.contract(ipfs_data.abi);
            var DeviceSpawner = web3.eth.contract(device_spawner_data.abi);

            App.RawbotInstance = Rawbot.at(contracts.RawbotAddress);
            App.RawbotAddress = Rawbot.at(contracts.RawbotAddress).address;

            App.IPFSInstance = IPFS.at(contracts.IPFSAddress);
            App.IPFSAddress = IPFS.at(contracts.IPFSAddress).address;

            App.DeviceSpawnerInstance = DeviceSpawner.at(
                contracts.DeviceSpawnerAddress
            );
            App.DeviceSpawnerAddress = DeviceSpawner.at(
                contracts.DeviceSpawnerAddress
            ).address;

            return resolve(true);
        });
    },

    initDeviceContract: function (address) {
        temp_address = address;
        $("#modalAddActionLabel").html(address);
        return new Promise((resolve, reject) => {
            $.getJSON(base_url + "/Device.json", function (data) {
                var DeviceContract = web3.eth.contract(data.abi);
                App.DeviceInstance = DeviceContract.at(address);
                App.DeviceAddress = DeviceContract.at(address).address;
                return resolve(true);
            });
        });
    },

    fillLocation: function () {
        $.getJSON("http://ip-api.com/json", function (data) {
            $("#device_country").val(data.country);
            $("#device_location").val(data.city);
        });

        navigator.geolocation.getCurrentPosition(function (location) {
            let latitude = location.coords.latitude;
            let longitude = location.coords.longitude;
            let altitude = location.coords.altitude;
            let accuracy = location.coords.accuracy;
            if (location.coords.latitude == null) {
                latitude = 0;
            }
            if (location.coords.longitude == null) {
                longitude = 0;
            }
            if (location.coords.altitude == null) {
                altitude = 0;
            }
            if (location.coords.accuracy == null) {
                accuracy = 0;
            }
            $("#device_latitude").val(latitude);
            $("#device_longitude").val(longitude);
            $("#device_altitude").val(altitude);
            $("#device_accuracy").val(accuracy);
        });
    },

    addDevice: function () {
        let device_description_input = $("#device_description_input").val();
        let device_manager_address = $("#device_manager_address").val();
        let device_serial_number = $("#device_serial_number").val();
        let device_name = $("#device_name").val();
        let device_owner = $("#device_owner").val();
        let device_country = $("#device_country").val();
        let device_location = $("#device_location").val();
        let device_latitude = $("#device_latitude").val();
        let device_longitude = $("#device_longitude").val();
        let device_altitude = $("#device_altitude").val();
        let device_accuracy = $("#device_accuracy").val();

        if (isNaN(device_latitude)) {
            $("#tx_hash_addDevice").html("Device altitude should be a number");
            return;
        }

        if (isNaN(device_longitude)) {
            $("#tx_hash_addDevice").html("Device longitude should be a number");
            return;
        }

        if (isNaN(device_altitude)) {
            $("#tx_hash_addDevice").html("Device altitude should be a number");
            return;
        }

        if (isNaN(device_accuracy)) {
            console.log("Device accuracy should be a number");
            $("#tx_hash_addDevice").html("Device accuracy should be a number");
            return;
        }

        App.DeviceSpawnerInstance.addDevice(
            device_manager_address,
            device_serial_number,
            device_name,
            device_owner,
            device_country,
            device_location,
            device_latitude * 1e8,
            device_longitude * 1e8,
            device_altitude * 1e8,
            device_accuracy * 1e8,
            device_description_input,
            {
                from: App.account
            },
            function (err, res) {
                if (err) {
                    console.log(err);
                } else {
                    alert(`Transaction hash: https://ropsten.etherscan.io/tx/${res}`);
                }
            }
        );
    },

    getDevice: function (index) {
        return new Promise((resolve, reject) => {
            App.DeviceSpawnerInstance.getDevice(index, function (error, result) {
                if (!error) {
                    return resolve(result);
                } else {
                    return reject(error);
                }
            });
        });
    },

    getDeviceAddressOf: function (owner_address, _index) {
        return new Promise((resolve, reject) => {
            App.DeviceSpawnerInstance.getDeviceAddressOf(
                owner_address,
                _index,
                function (error, result) {
                    if (!error) {
                        return resolve(result);
                    } else {
                        return reject(error);
                    }
                }
            );
        });
    },

    getDeviceSpawnerContractBalance: function () {
        return new Promise((resolve, reject) => {
            App.DeviceSpawnerInstance.getContractBalance.call(function (
                error,
                result
            ) {
                if (!error) {
                    return resolve(result);
                } else {
                    return reject(error);
                }
            });
        });
    },

    getDevices: function () {
        return new Promise((resolve, reject) => {
            App.DeviceSpawnerInstance.getDevices(function (error, result) {
                if (!error) {
                    return resolve(result);
                } else {
                    return reject(error);
                }
            });
        });
    },

    getMerchants: function () {
        return new Promise((resolve, reject) => {
            App.DeviceSpawnerInstance.getMerchants(function (error, result) {
                if (!error) {
                    return resolve(result);
                } else {
                    return reject(error);
                }
            });
        });
    },

    getDeviceAction: function (action_id) {
        return new Promise((resolve, reject) => {
            App.DeviceInstance.getDeviceAction.call(action_id, function (
                error,
                result
            ) {
                if (!error) {
                    return resolve(result);
                } else {
                    return reject(error);
                }
            });
        });
    },

    getIPFSAction: function (ipfs_id) {
        return new Promise((resolve, reject) => {
            App.DeviceInstance.getIPFSAction.call(ipfs_id, function (error, result) {
                if (!error) {
                    return resolve(result);
                } else {
                    return reject(error);
                }
            });
        });
    },

    getIPFSResult: async (address, action_id) => {
        return new Promise((resolve, reject) => {
            App.IPFSInstance.getIPFSResult.call(address, action_id, function (
                error,
                result
            ) {
                if (!error) {
                    return resolve(result);
                } else {
                    return reject(error);
                }
            });
        });
    },

    getHistoryLengthOf: function (address, serial_number) {
        return new Promise((resolve, reject) => {
            App.DeviceInstance.getHistoryLengthOf.call(
                address,
                serial_number,
                function (error, result) {
                    if (!error) {
                        return resolve(result);
                    } else {
                        return reject(error);
                    }
                }
            );
        });
    },

    getAddresses: function () {
        return new Promise((resolve, reject) => {
            App.DeviceInstance.getAddresses.call(function (error, result) {
                if (!error) {
                    return resolve(result);
                } else {
                    return reject(error);
                }
            });
        });
    },

    getBalance: function (address) {
        return new Promise((resolve, reject) => {
            App.RawbotInstance.balanceOf.call(address, function (error, result) {
                if (!error) {
                    return resolve(result);
                } else {
                    return reject(error);
                }
            });
        });
    },

    getSelfBalance: function () {
        return new Promise((resolve, reject) => {
            web3.eth.getBalance(App.account, function (err, balance) {
                if (!err) {
                    return resolve(balance);
                } else {
                    reject(err);
                }
            });
        });
    },

    getDeviceInformation: function (address) {
        return new Promise((resolve, reject) => {
            App.DeviceSpawnerInstance.getDeviceInformation(address, function (
                error,
                result
            ) {
                if (!error) {
                    return resolve(result);
                } else {
                    return reject(error);
                }
            });
        });
    },

    getEthereumBalance: function (address) {
        return new Promise((resolve, reject) => {
            App.DeviceSpawnerInstance.getDeviceBalance.call(address, function (
                error,
                result
            ) {
                if (!error) {
                    return resolve(result);
                } else {
                    return reject(error);
                }
            });
        });
    },

    getDeviceActionHistory: function (action_id, action_history_id) {
        return new Promise((resolve, reject) => {
            App.DeviceInstance.getDeviceActionHistory.call(
                action_id,
                action_history_id,
                function (error, result) {
                    if (!error) {
                        return resolve(result);
                    } else {
                        return reject(error);
                    }
                }
            );
        });
    },

    getContractBalance: function () {
        return new Promise((resolve, reject) => {
            App.DeviceInstance.getDeviceBalance.call(function (error, result) {
                if (!error) {
                    return resolve(result);
                } else {
                    return reject(error);
                }
            });
        });
    },

    getTotalActions: function () {
        return new Promise((resolve, reject) => {
            App.DeviceInstance.getTotalActions.call(function (error, result) {
                if (!error) {
                    return resolve(result);
                } else {
                    return reject(error);
                }
            });
        });
    },

    getTotalActionsHistoryOf: async action_id => {
        return new Promise((resolve, reject) => {
            App.DeviceInstance.getTotalActionsHistoryOf.call(action_id, function (
                error,
                result
            ) {
                if (!error) {
                    return resolve(result);
                } else {
                    return reject(error);
                }
            });
        });
    },

    /**
     *      addAction
     *      string name,
            uint256 price,
            uint256 occurrences,
            uint256 duration,
            bool recurring,
            bool refundable
     */
    addAction: async () => {
        await App.initDeviceContract(temp_address);
        let action_name = $("#action_name").val();
        let action_price = $("#action_price").val();
        let action_occurences = $("#action_occurences").val();
        let action_duration = $("#action_duration").val();
        let action_recurring = $("#action_recurring").is(":checked");
        let action_refundable = $("#action_refundable").is(":checked");
        console.log("Recurring: " + action_recurring);
        console.log("Refundable: " + action_refundable);
        console.log(App.account);
        App.DeviceInstance.addAction(
            action_name,
            action_price,
            action_occurences,
            action_duration,
            action_recurring,
            action_refundable,
            {
                from: App.account
            },
            function (err, res) {
                if (err) {
                    console.log(err);
                } else {
                    alert("Track your tx: https://ropsten.etherscan.io/tx/" + res);
                }
            }
        );
    },

    setTempAddress: function (address) {
        App.tempAddress = address;
        console.log(address);
    },

    addIPFSAction: async () => {
        let action_name = $("#ipfs_action_name").val();
        let action_price = $("#ipfs_action_price").val();
        App.IPFSInstance.addIPFSAction(
            App.tempAddress,
            action_name,
            action_price,
            {
                from: App.account
            },
            function (err, res) {
                if (err) {
                    console.log(err);
                } else {
                    alert("Track your tx: https://ropsten.etherscan.io/tx/" + res);
                }
            }
        );
    },
    // devhassanjawhar@gmail.comue2jW95b
    retrieveIPFSData: function (address, action_id) {
        let email = window.prompt("Enter the email you used for your keys.");
        let comment_pop = window.prompt(
            "Enter the pastebin id: ue2jW95b (https://pastebin.com/raw/ue2jW95b)?"
        );
        App.IPFSInstance.retrieveIPFSData(
            address,
            action_id,
            email,
            comment_pop,
            {
                from: App.account
            },
            function (err, res) {
                if (err) {
                    console.log(err);
                } else {
                    alert("Track your tx: https://ropsten.etherscan.io/tx/" + res);
                }
            }
        );
    },

    enableAction: function (action_id) {
        let comment_pop = window.prompt(
            "Do you have anything to tell the merchant?"
        );
        App.DeviceInstance.enableAction(
            action_id,
            comment_pop,
            {
                from: App.account
            },
            function (err, res) {
                if (err) {
                    console.log(err);
                } else {
                    alert("Track your tx: https://ropsten.etherscan.io/tx/" + res);
                }
            }
        );
    },

    refundCustomer: function (action_id) {
        App.DeviceInstance.refundCustomer(
            action_id,
            {
                from: App.account
            },
            function (err, res) {
                if (err) {
                    console.log(err);
                } else {
                    alert("Track your tx: https://ropsten.etherscan.io/tx/" + res);
                }
            }
        );
    },

    disableAction: function (action_id) {
        App.DeviceInstance.disableAction(
            action_id,
            {
                from: App.account
            },
            function (err, res) {
                if (err) {
                    console.log(err);
                } else {
                    alert("Track your tx: https://ropsten.etherscan.io/tx/" + res);
                }
            }
        );
    },

    refundMerchant: function (action_id, action_history) {
        App.DeviceInstance.refundMerchant(
            action_id,
            action_history,
            {
                from: App.account
            },
            function (err, res) {
                if (err) {
                    console.log(err);
                } else {
                    alert("Track your tx: https://ropsten.etherscan.io/tx/" + res);
                }
            }
        );
    },

    autoRefund: function (action_id) {
        App.DeviceInstance.autoRefund(
            action_id,
            {
                from: App.account
            },
            function (err, res) {
                if (err) {
                    console.log(err);
                } else {
                    alert("Track your tx: https://ropsten.etherscan.io/tx/" + res);
                }
            }
        );
    },

    isEnabled: function (action_id) {
        return new Promise((resolve, reject) => {
            App.DeviceInstance.isEnabled.call(
                action_id,
                {
                    from: App.account
                },
                function (err, res) {
                    if (err) {
                        return reject(err);
                    } else {
                        return resolve(res);
                    }
                }
            );
        });
    },

    signIn: function () {
        var data = toHex("i am a string");
        web3.currentProvider.sendAsync(
            {
                id: 1,
                method: "personal_sign",
                params: [web3.eth.accounts[0], data]
            },
            function (err, result) {
                if (!err) {
                    let sig = result.result;
                    let user = web3.eth.accounts[0];

                    $.ajax({
                        method: "POST",
                        contentType: "application/json",
                        url: "/sign-in",
                        data: JSON.stringify({
                            sig,
                            user
                        }),
                        success: function (data, textStatus, jqXHR) {
                            console.log(data);
                            console.log("Signed in.");
                            window.location.reload();
                        },
                        error: function (jqXHR, textStatus, errorThrown) {
                            console.log("Failed to sign in.");
                        }
                    });
                }
            }
        );
    },

    showDeviceInfo: async address => {
        let device_info = await App.getDeviceInformation(address);
        let serial_number = web3.toAscii(device_info[0]);
        let name = web3.toAscii(device_info[1]);
        let owner = device_info[2];
        let owner_name = web3.toAscii(device_info[3]);
        let country = web3.toAscii(device_info[4]);
        let location = web3.toAscii(device_info[5]);
        let coordinates =
            device_info[6] / 1e8 +
            ", " +
            device_info[7] / 1e8 +
            ", " +
            device_info[8] / 1e8;
        let accuracy = device_info[9].valueOf();
        let rawbot_balance = await App.getBalance(address);
        let eth_balance = await App.getEthereumBalance(address);
        let json_url = device_info[10];

        $("#device_address").html(address);
        $("#device_eth_balance").html(eth_balance.valueOf() / 1e18);
        $("#device_rawbot_balance").html(rawbot_balance.valueOf() / 1e18);
        $("#device_serial_number").html(serial_number);
        $("#device_name").html(name);
        $("#device_owner_address").html(owner);
        $("#device_owner_name").html(owner_name);
        $("#device_location").html(country + " - " + location);
        $("#device_coordinates").html(coordinates);
        $("#device_coordinates_accuracy").html(accuracy);
        console.log(json_url);
        if (typeof json_url !== "undefined") {
            $.ajax({
                method: "POST",
                contentType: "application/json",
                url: base_url + "/device_description",
                data: JSON.stringify({
                    url: json_url
                }),
                success: function (body, textStatus, jqXHR) {
                    console.log(body);
                    let data = JSON.parse(body);
                    $("#device_img").html(
                        `<img src="${data["img"]}" style="width: 250px"/><br/>`
                    );
                    $("#device_description").html(data["description"]);
                },
                error: function (jqXHR, textStatus, errorThrown) {
                    console.log("Failed to sign in.");
                }
            });
        }
    },

    showMinimalDeviceInfo: async address => {
        let device_info = await App.getDeviceInformation(address);
        let serial_number = web3.toAscii(device_info[0]);
        let name = web3.toAscii(device_info[1]);
        let owner = device_info[2];
        let owner_name = web3.toAscii(device_info[3]);
        let country = web3.toAscii(device_info[4]);
        let location = web3.toAscii(device_info[5]);
        let content = `Device address: ${address}<br/>Serial number: ${serial_number} - name: ${name}<br/>Owner: ${owner_name} - Owner address: ${owner}<br/>Location: ${country}, ${location}`;
        $("#device_minimal_info_content").html(content);
    },

    listMyDevices: async () => {
        $("#device_manager_content").html("");
        let total_devices = await App.getDevicesEvent({
            _sender: App.account
        });
        if (total_devices.length > 0) {
            for (let i = 0; i < total_devices.length; i++) {
                let args = total_devices[i]["args"];
                let address = args["_contract"];
                let device_info = await App.getDeviceInformation(address);
                let serial_number = web3.toAscii(device_info[0]);
                let name = web3.toAscii(device_info[1]);
                let country = web3.toAscii(device_info[4]);
                let location = web3.toAscii(device_info[5]);
                let t = `<tr>`;
                t += `<td>${address}</td>`;
                t += `<td>${serial_number}</td>`;
                t += `<td>${name}</td>`;
                t += `<td>${country}</td>`;
                t += `<td>${location}</td>`;
                t += `<td><a href="${base_url}/devices/${address}/information"><button type="button" class="btn btn-primary">Show</button></a></td>`;
                t += `<td><button type="button" class="btn btn-primary" data-toggle="modal" data-target="#deviceAddActionModal" onclick=App.initDeviceContract("${address}")>Add</button></td>`;
                t += `<td><a href="${base_url}/devices/${address}/actions"><button type="button" class="btn btn-primary">Show</button></a></td>`;
                t += `<td><button type="button" class="btn btn-primary" data-toggle="modal" data-target="#deviceAddIPFSActionModal" onclick=App.setTempAddress("${address}")>Add</button></td>`;
                t += `</tr>`;
                $("#device_manager_content").prepend(t);
            }
        }
    },

    listAllDevices: async () => {
        $("#device_manager_content").html("");
        let devices = [];
        let total_devices = await App.getDevicesEvent();
        if (total_devices.length > 0) {
            for (let i = 0; i < total_devices.length; i++) {
                let args = total_devices[i]["args"];
                let address = args["_contract"];
                let device_info = await App.getDeviceInformation(address);
                let latitude = device_info[6] / 1e8;
                let longitude = device_info[7] / 1e8;
                console.log(device_info[0])
                let device = {
                    address: address,
                    serial_number: web3.toAscii(device_info[0]),
                    name: web3.toAscii(device_info[1]),
                    country: web3.toAscii(device_info[4]),
                    location: web3.toAscii(device_info[5]),
                    distanceDiff: distanceDiff(
                        App.latitude,
                        App.longitude,
                        latitude,
                        longitude
                    )
                };
                devices.push(device);
            }

            if (devices.length > 0) {
                devices.sort(function (a, b) {
                    return a.distanceDiff - b.distanceDiff;
                });
                for (let i = 0; i < devices.length; i++) {
                    let device = devices[i];
                    let t = `<tr>`;
                    t += `<td>${device.address}</td>`;
                    t += `<td>${device.serial_number}</td>`;
                    t += `<td>${device.name}</td>`;
                    t += `<td>${device.country}</td>`;
                    t += `<td>${device.location}</td>`;
                    t += `<td>${device.distanceDiff.toFixed(2)}</td>`;
                    t += `<td><a href="${base_url}/devices/${
                        device.address
                        }/information"><button type="button" class="btn btn-primary">Show</button></a></td>`;
                    t += `<td><a href="${base_url}/devices/${
                        device.address
                        }/actions"><button type="button" class="btn btn-primary">Show</button></a></td>`;
                    t += `</tr>`;
                    $("#device_manager_content").append(t);
                }
            }
        }
    },

    getTotalHashes: async () => {
        return new Promise((resolve, reject) => {
            App.IPFSInstance.getTotalHashes.call(function (error, result) {
                if (!error) {
                    return resolve(result);
                } else {
                    return reject(error);
                }
            });
        });
    },

    listIPFSActions: async () => {
        let allEvents = App.IPFSInstance.AddIPFSAction(
            {
                // address: App.account
            },
            {
                fromBlock: 0,
                toBlock: "latest"
            }
        );

        allEvents.watch(function (error, event) {
            if (!error) {
                let result = event["args"];
                let content = `<tr>`;
                content += `<td>${result["ipfs_index"]}</td>`;
                content += `<td>${result["device_address"]}</td>`;
                content += `<td>${web3.toAscii(result["name"])}</td>`;
                content += `<td>${result["price"] / 1e18}</td>`;
                content += `<td><button type="button" class="btn btn-primary" onclick="App.retrieveIPFSData('${
                    result["device_address"]
                    }', ${result["ipfs_index"]})">Perform</button></td>`;
                content += `<td><a href="${base_url}/ipfs/${
                    result["ipfs_index"]
                    }/history">here</a></td>`;
                content += `</tr>`;
                $("#ipfs_actions").prepend(content);
            }
        });
    },

    //     event  (
    //         uint256 indexed ,
    //     uint256 ipfs_action_logs_index,
    //     address indexed user,
    //     bytes32 email,
    //     bytes32 name,
    //     uint256 price,
    //     bytes32 indexed pub_key,
    //     uint256 time
    // );
    //
    listIPFSActionHistory: async action_index => {
        let allEvents = App.IPFSInstance.ExecuteIPFSAction(
            {
                ipfs_action_index: action_index
            },
            {
                fromBlock: 0,
                toBlock: "latest"
            }
        );

        allEvents.watch(async function (error, event) {
            if (!error) {
                let result = event["args"];
                console.log(result);

                // let ipfs_result = await App.getIPFSResult(result['device'], result['ipfs_action_logs_index']);
                // console.log(ipfs_result)
                let content = `<tr>`;
                content += `<td>${result["ipfs_action_index"]}</td>`;
                content += `<td>${result["ipfs_action_logs_index"]}</td>`;
                content += `<td>${result["user"]}</td>`;
                content += `<td>${web3.toAscii(result["name"])}</td>`;
                content += `<td>${result["price"] / 1e18}</td>`;
                content += `<td>${new Date(result["time"] * 1000)}</td>`;
                content += `<td>${web3.toAscii(result["email"])}</td>`;
                content += `<td>${web3.toAscii(result["pub_key"])}</td>`;
                content += `<td>-</td>`;
                content += `</tr>`;
                $("#ipfs_actions_history").prepend(content);
            }
        });
    },
    // string name, uint256 price, uint256 occurrences, uint256 duration, bool recurring, bool refundable
    listActions: async () => {
        let total_actions = await App.getTotalActions();
        if (total_actions > 0) {
            for (let i = 0; i < total_actions; i++) {
                let enabled = await App.isEnabled(i);
                let action = await App.getDeviceAction(i);
                let name = action[0];
                let price = action[1];
                let occurrences = action[2];
                let duration = action[3];
                let recurring = action[4];
                let refundable = action[5];
                let occurrences_left = await App.getUserActionOccurrence(App.account, i);
                let t = "<tr>";
                t += `<td>${i}</td>`;
                t += `<td>${name}</td>`;
                t += `<td>${price / 1e18} </td>`;
                t += `<td>${occurrences} </td>`;
                t += `<td>${occurrences_left} </td>`;
                t += `<td>${duration}</td>`;
                t += `<td>${recurring}</td>`;
                t += `<td>${refundable}</td>`;
                t += `<td>${enabled}</td>`;

                if (!enabled) {
                    t += `<td><button type='button' class='btn btn-primary' onclick='App.enableAction(${i})'>Enable</button></td>`;
                } else {
                    t += `<td><button type='button' class='btn btn-primary' onclick='App.disableAction(${i})'>Disable</button></td>`;
                }

                if (refundable) {
                    t += `<td><button type='button' class='btn btn-primary' onclick='App.refundCustomer(${i})'>Refund</button></td>`;
                } else {
                    t += `<td><button type='button' class='btn btn-primary' onclick='App.refundCustomer(${i})' disabled>Refund</button></td>`;
                }

                t += `<td><a href="${base_url}/devices/${temp_address}/actions/${i}/history"><button type="button" class="btn btn-primary">Show</button></a></td>`;
                t += `</tr>`;
                $("#device_actions").prepend(t);
            }
        }
        console.log("Total actions: " + total_actions);
    },

    getDeviceOwner: function (address) {
        return new Promise((resolve, reject) => {
            App.DeviceSpawnerInstance.getDeviceOwner.call(address, function (
                err,
                res
            ) {
                if (err) {
                    return reject(err);
                } else {
                    return resolve(res);
                }
            });
        });
    },

    getUserActionOccurrence: function (address, id) {
        return new Promise((resolve, reject) => {
            App.DeviceInstance.getUserActionOccurrence.call(address, id, function (
                err,
                res
            ) {
                if (err) {
                    return reject(err);
                } else {
                    return resolve(res);
                }
            });
        });
    },

    listHistory: async filter => {
        let temp = [];
        let actions = await App.getActionLogs(filter);
        //
        console.log(actions);
        if (actions.length > 0) {
            for (let i = 0; i < actions.length; i++) {
                let action = actions[i].args;
                console.log(action);
                temp.push({
                    enable: action["enable"],
                    id: action["id"],
                    time: action["time"],
                    from: action["from"],
                    recurrent: action["recurrent"]
                });
            }
        }
        if (temp.length > 0) {
            temp.sort(function (a, b) {
                return a["time"] > b["time"];
            });

            temp.forEach(action => {
                let t = `<tr>`;
                t += `<td>${action["from"]}</td>`;
                t += `<td>${new Date(action["time"] * 1000)}</td>`;
                t += `<td>${action["recurrent"]}</td>`;
                t += `<td>${action["enable"]}</td>`;
                t += `</tr>`;
                $("#device_action_history").prepend(t);
            });
        }
    },

    load: async () => {
        App.account = await App.getAccount();
        let balance_eth = await App.getSelfBalance();
        let balance_raw = await App.getBalance(App.account);
        $("#balance_eth").html(
            '<i class="fab fa-ethereum"></i> ' + balance_eth.valueOf() / 1e18
        );
        let img = base_url + "/images/rawbot_currency.png";
        $("#balance_rawbot").html(
            '<img src="' +
            img +
            '" style="width: 20px;height:20px"/> ' +
            balance_raw.valueOf() / 1e18
        );
        console.log(
            "User address: " +
            App.account +
            " - Successfully loaded ETH & Rawbot balances."
        );
        $("#user_address").html(App.account);

        navigator.geolocation.getCurrentPosition(function (location) {
            console.log("Successfully loaded coordinates.");
            App.latitude = location.coords.latitude;
            App.longitude = location.coords.longitude;
        });
    },

    buyRawbot: async () => {
        let getBittrexEthereumPrice = await App.getBittrexEthereumPrice();
        $("#bittrex_ethereum_price").html(getBittrexEthereumPrice);
        let wait = await waitSeconds(3);
        let rawbot_amount_trade = $("#rawbot_amount_trade").val();
        var eth_amount = (rawbot_amount_trade * 0.5) / getBittrexEthereumPrice;
        var eth_amount_wei = eth_amount * 1e18;
        web3.eth.sendTransaction(
            {
                from: App.account,
                to: App.RawbotAddress,
                value: eth_amount_wei
            },
            function (err, txHash) {
                if (!err) {
                    $("#tx_hash_addDevice").html(
                        `Transaction hash: <a href='https://ropsten.etherscan.io/tx/${txHash}' target="_blank">${txHash}</a>`
                    );
                } else {
                    console.log(err);
                }
            }
        );
    },

    getRawbotTransactions: function () {
        return new Promise((resolve, reject) => {
            let allEvents = App.RawbotInstance.TransactionEvent(
                {
                    _user: App.account
                },
                {
                    fromBlock: 0,
                    toBlock: "latest"
                }
            );

            allEvents.get((err, res) => {
                if (!err) {
                    return resolve(res);
                } else {
                    return reject(err);
                }
            });
        });
    },

    getActionLogs: function (filter) {
        return new Promise((resolve, reject) => {
            let allEvents = App.DeviceInstance.ActionLogs(filter, {
                fromBlock: 0,
                toBlock: "latest"
            });

            allEvents.get((err, res) => {
                if (!err) {
                    return resolve(res);
                } else {
                    return reject(err);
                }
            });
        });
    },

    getIPFSLogs: function (filter) {
        return new Promise((resolve, reject) => {
            let allEvents = App.DeviceInstance.IPFSLogs(filter, {
                fromBlock: 0,
                toBlock: "latest"
            });

            allEvents.get((err, res) => {
                if (!err) {
                    return resolve(res);
                } else {
                    return reject(err);
                }
            });
        });
    },

    listRawbotTransactions: async () => {
        let txs = await App.getRawbotTransactions();
        if (txs.length > 0) {
            for (let i = 0; i < txs.length; i++) {
                let tx = txs[i].args;
                let t = "<tr>";
                t += "<td>" + tx["_eth_price"] + "</td>";
                t += "<td>" + tx["_input"] / 1e18 + "</td>";
                t += "<td>" + tx["_output"] / 1e18 + "</td>";
                t += "<td>" + formatTime(new Date(tx["_time"] * 1000)) + "</td>";
                t += `<td><a href="https://ropsten.etherscan.io/block/${
                    txs[i]["blockNumber"]
                    }" target="_blank">${txs[i]["blockNumber"]}</a></td>`;
                t += "</tr>";
                $("#transaction_rawbot_history").prepend(t);
            }
        }
    },

    getDevicesEvent: function (filter) {
        return new Promise((resolve, reject) => {
            let allEvents = App.DeviceSpawnerInstance.DeviceAdd(filter, {
                fromBlock: 0,
                toBlock: "latest"
            });

            allEvents.get((err, res) => {
                if (!err) {
                    return resolve(res);
                } else {
                    return reject(err);
                }
            });
        });
    },
    importCurrentAddress: function () {
        $("#device_manager_address").val(App.account)
    }
};

onload = async () => {
    /**
     * Device buttons
     */
    $(document).on("click", "#add_action_button", App.addAction);
    $(document).on("click", "#add_ipfs_action_button", App.addIPFSAction);

    $(document).on("click", "#add_device_button", App.addDevice);
    $(document).on("click", "#fill_location_button", App.fillLocation);
    $(document).on("click", "#rawbot_button_buy", App.buyRawbot);

    await App.initWeb3();
    await App.initContracts();
    await App.load();
    await App.listRawbotTransactions();
    if (window.location.pathname === "/") {
    } else if (window.location.pathname === "/articles") {
        await App.displayAllArticles();
    } else if (window.location.pathname === "/ipfs") {
        await App.listIPFSActions();
    } else if (window.location.pathname === "/p2d") {
        await App.listAllDevices();
    } else if (window.location.pathname === "/devices") {
        await App.listMyDevices();
    } else if (window.location.pathname === "/transactions") {
    } else {
        let link = window.location.href;
        let splitted = link.replace("http://", "");
        splitted = splitted.split("/");
        console.log(splitted);
        let address = splitted[2];

        if (splitted.length === 4) {
            if (splitted[1] === "ipfs" && splitted[3] === "history") {
                await App.listIPFSActionHistory(splitted[2]);
            } else if (splitted[3] === "actions") {
                await App.initDeviceContract(address);
                await App.showMinimalDeviceInfo(address);
                await App.listActions();
            } else if (splitted[3] === "information") {
                await App.showDeviceInfo(address);
            }
        } else if (splitted.length === 6) {
            let action_id = splitted[4];
            await App.initDeviceContract(address);
            if (splitted[3] === "actions") {
                await App.listHistory({
                    id: action_id
                });
            } else if (splitted[3] === "ipfs") {
                await App.listIPFSHistory({
                    address: address,
                    ipfs_action_index: action_id
                });
            }
        }
    }
};

function toHex(s) {
    var hex = "";
    for (var i = 0; i < s.length; i++) {
        hex += "" + s.charCodeAt(i).toString(16);
    }
    return `0x${hex}`;
}

function waitSeconds(seconds) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve();
        }, seconds * 1000);
    });
}

$("#uploadForm1").submit(function (e) {
    e.preventDefault();
    var formData = new FormData(this);
    $.ajax({
        type: "POST",
        url: "/upload",
        data: formData,
        processData: false,
        contentType: false,
        success: function (r) {
            alert(r);
        },
        error: function (e) {
            console.log("Error", e);
        }
    });
});

$("#uploadForm2").submit(function (e) {
    e.preventDefault();
    var formData = new FormData(this);
    $.ajax({
        type: "POST",
        url: "/decrypt",
        data: formData,
        processData: false,
        contentType: false,
        success: function (r) {
            alert(r);
        },
        error: function (e) {
            console.log("Error", e);
        }
    });
});

function distanceDiff(lat1, lon1, lat2, lon2) {
    var R = 6371; // Radius of the earth in km
    var dLat = deg2rad(lat2 - lat1); // deg2rad below
    var dLon = deg2rad(lon2 - lon1);
    var a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c; // Distance in km
    return d;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}

$("#deviceAddIPFSActionModal").on("hidden.bs.modal", function (e) {
    App.abcdef = 9999;
});

function formatTime(_timestamp) {
    let current_date = new Date(_timestamp);
    return `${current_date.getUTCDate()}-${current_date.getUTCMonth() +
        1}-${current_date.getFullYear()} ${current_date.toLocaleTimeString()}`;
}
