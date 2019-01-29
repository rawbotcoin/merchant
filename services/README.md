# Rawbot - Backend

[![N|Solid](http://rawbot.org/img/rawbot_logo_colored.png)](http://rawbot.org)


### Installing the project
Open your terminal/CLI
```
$ git clone https://github.com/rawbotcoin/merchant/tree/master/services
$ sudo su
$ npm install
```
.env


```
ACCOUNT_ADDRESS="0x6C4f63CA254ed27a112e0FDE0992B52ECA4EdFC0"
ACCOUNT_PRIVATE_KEY="eb12a26a0562862da9fe8fbe0064824477175046d44f5b8ebedc582f1b40704e"

RAWBOT_ADDRESS="0x98ff718b4fe343c92451eac7059bb6f535451dc6"
DEVICE_SPAWNER_ADDRESS="0x02ae27bacd5b057523cd1090717eb6e4e0b0c42d"
IPFS_ADDRESS="0x09112240fc74634d578e7791bbac90c13925794a"
DEVICE_ADDRESS="0x7fcaec6fd33ea7672fe1b1a986d0f6d49e949a1d"
```

### Instructions
In order to be able to activate an action, you have to listen to the device smart contract.
The following is done by using the ABI and listening to the event called "ActionLogs", and it's defined as follows:
```
event ActionLogs(
    uint256 indexed id,
    address from,
    uint256 time,
    bool recurrent,
    bool enable
);
``` 
- id: the action's id
- from: the user executing the action
- time: duration to keep the action alive
- current: flag - boolean true/false
- enable: flag - boolean true/false


### Snippet: Simple code as 1,2,3 to run it on your device
- [Snippet]



### Scripts
You will find a variety of scripts that can be implemented for your use cases.

[Snippet]: <https://raw.githubusercontent.com/rawbotcoin/merchant/master/services/app.js>