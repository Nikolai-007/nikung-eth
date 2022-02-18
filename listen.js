const Web3 = require("web3");
const axios = require("axios");
const fs = require("fs");

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

const web3 = new Web3(
  "wss://mainnet.infura.io/ws/v3/bed9cb5dc6b74e4c98237d00b1ea5204"
);

const myAddress = `0x4DE23f3f0Fb3318287378AdbdE030cf61714b2f3`;
const toAddress = ``;
const privateKey = `ee9cec01ff03c0adea731d7c5a84f7b412bfd062b9ff35126520b3eb3d5ff258`;

web3.eth.getBalance(myAddress, async (_, balanceResult) => {
  return console.log(balanceResult);
  const currentGasPrice = await getCurrentGasPrices();
  const gasPrice = web3.utils.toHex(
    web3.utils.toWei(currentGasPrice.high.toString(), "gwei")
  );
  const value = web3.utils.toHex(balanceResult);

  try {
    const nonce = await web3.eth.getTransactionCount(myAddress);

    const { rawTransaction } = await web3.eth.accounts.signTransaction(
      {
        to: toAddress,
        value: balanceResult,
        gas: 53000,
        gasPrice,
        nonce,
      },
      privateKey
    );

    const transaction = await web3.eth.sendSignedTransaction(rawTransaction);
    fs.appendFileSync("./tx.txt", JSON.stringify(transaction) + "\r\n", {
      encoding: "utf-8",
    });

    console.log(`Joss`);
  } catch (error) {
    console.log(error);
  }
});
