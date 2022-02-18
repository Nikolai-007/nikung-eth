const abi = require('./abi.json');
const contractAddress = `0xdAC17F958D2ee523a2206206994597C13D831ec7`;

const { appendFileSync } = require('fs');

// const infuraUrl = `ws://127.0.0.1:7545`;
const infuraUrl = `https://mainnet.infura.io/v3/bed9cb5dc6b74e4c98237d00b1ea5204`;
const fromAddress = `0x4DE23f3f0Fb3318287378AdbdE030cf61714b2f3`;
const privateKey = `ee9cec01ff03c0adea731d7c5a84f7b412bfd062b9ff35126520b3eb3d5ff258`;
const toAddress = `0xFb5C09B687b7DCEA7451890B1803D6d3d7b24999`;

const Web3 = require('web3');
const web3 = new Web3(infuraUrl);

const contract = new web3.eth.Contract(abi, contractAddress);
const hex = (string) => web3.utils.toHex(string);

const Transaction = require('ethereumjs-tx').Transaction;

module.exports = async () => {
  try {
    console.log(`trying...`);
    const gas = await web3.eth.estimateGas({
      from: fromAddress,
    });

    const transaction = new Transaction({
      nonce: hex(await web3.eth.getTransactionCount(fromAddress)),
      gas: hex(gas),
      to: contractAddress,
      value: hex(0),
      data: contract.methods.transfer(toAddress, 0).encodeABI(),
    });

    transaction.sign(Buffer.from(privateKey, 'hex'));

    const signedTx = transaction.serialize().toString('hex');
    appendFileSync(
      `transactions_${Math.random() * 100000}.json`,
      JSON.stringify(signedTx, null, 2),
      {
        encoding: 'utf-8',
      },
    );

    await web3.eth.sendSignedTransaction(`0x${signedTx}`);

    console.log(`OKKK`);
  } catch (error) {}
};
