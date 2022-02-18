const Web3 = require("web3");
const axios = require("axios");
const fs = require("fs");
// const Common, { Chain } from "@ethereumjs/common";
// const tx = require("@ethereumjs/tx");
// const { Transaction } = tx;

const Transaction = require("ethereumjs-tx").Transaction;

async function getCurrentGasPrices() {
  const { data } = await axios.get(
    "https://ethgasstation.info/json/ethgasAPI.json"
  );

  return {
    low: data.safeLow / 10,
    medium: data.average / 10,
    high: data.fast / 10,
  };
}

const infuraUrl = `https://rinkeby.infura.io/v3/bed9cb5dc6b74e4c98237d00b1ea5204`;
const networkId = `5777`;

const web3 = new Web3(infuraUrl);

const myAddress = `0xC299Fa920579c1d73780EF708DA14056EAEdDa36`;
const privateKey = `eef2fc1f1b219d20fd12cc91200137bf41d81694c695bd0ae7814362df52fad8`;
const toAddress = `0x4B1715420AcF64162b0f0287433dA8a94d348a2f`;

(async () => {
  const balance = await web3.eth.getBalance(myAddress);
  const gas = await web3.eth.estimateGas({
    from: myAddress,
    to: toAddress,
  });
  const gasPrice = await web3.eth.getGasPrice();

  web3.eth.getTransactionCount(myAddress).then(async (nonce) => {
    const value = balance - gasPrice;

    const details = {
      from: myAddress,
      to: toAddress,
      gas: web3.utils.toHex(gas),
      gasPrice: web3.utils.toHex(gasPrice),
      value: 0,
      nonce: web3.utils.toHex(nonce),
    };

    const transaction = new Transaction(details);
    transaction.sign(Buffer.from(privateKey, "hex"));

    const serializedTransaction = `0x${transaction
      .serialize()
      .toString("hex")}`;

    const asu = await web3.eth.sendSignedTransaction(serializedTransaction);
    console.log(asu);
  });
})();

web3.eth.subscribe(
  "logs",
  {
    address: toAddress,
  },
  (_, data) => {}
);
