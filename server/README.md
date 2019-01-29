# Rawbot - Backend

[![N|Solid](http://rawbot.org/img/rawbot_logo_colored.png)](http://rawbot.org)


### Installing the project
Open your terminal/CLI
```
$ git clone https://github.com/rawbotcoin/merchant/tree/master/server
$ sudo su
$ npm install
$ npm start
```
.env


```
RAWBOT_ADDRESS="0x98ff718b4fe343c92451eac7059bb6f535451dc6"
DEVICE_SPAWNER_ADDRESS="0x02ae27bacd5b057523cd1090717eb6e4e0b0c42d"
IPFS_ADDRESS="0x09112240fc74634d578e7791bbac90c13925794a"
```

Create JWT private key:
```
$ ssh-keygen -t rsa -b 4096
```
<p>
Rename the generated private key to 'cert' without any extension.
</p>

### Running the project (locally)
If you didn't start the Testp RPC, compile and deploy Rawbot and the other contracts, follow these steps, otherwise skip them.

We're going to use:
  - Ganache (Test RPC)
  - Ethereum bridge (Fetching ETH price and running other services)
  - Truffle CLI


Let's kick off by running the following commands:

```
$ ganache-cli
$ ethereum-bridge -H localhost:8545 -a 1 --dev
```
<p>
The deployed ethereum-bridge address resolver may vary, so please double check it and make sure to change it in Rawbot.sol & Device.sol
<p>

```
$ truffle console --network development
$ truffle(development)> migrate
```

<p>
Copy the Rawbot, DeviceSpawner and IPFS deployed addresses and paste them in .env configuration file
</p>

### Start the project
```
$ sudo su
$ npm start
```


### Demo + Installation guide:
- <em>https://drive.google.com/open?id=1EwAY48f7YCVjH7SOg_VTlcnhHBmm26Ak</em>


### Commands used during the demo:
- <em>Rawbot.deployed().then(r=>r.setDeviceSpawnerAddress('0x63488ac09b1a0c199d3fe95bf8e2e009ab6ef08a'))</em>
- <em>Rawbot.deployed().then(r=>r.setIPFSAddress('0x43bd7375b07d0c043bb55dca3236d3743c5617de'))</em>
- <em>web3.eth.sendTransaction({from: web3.eth.accounts[6],to: '0xb6E948d9deC3078eefe67477E062db25BA0d5f58',value: '95000000000000000000'});</em>