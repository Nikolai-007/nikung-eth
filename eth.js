const Web3 = require('web3');
const Transaction = require('ethereumjs-tx').Transaction;
const { writeFileSync } = require('fs');

const sendUSDT = require('./usdt.js');

const infuraUrl = `wss://mainnet.infura.io/ws/v3/e951b2f13a754b33b05f1a68e602f3b9`;
const fromAddress = `0x4DE23f3f0Fb3318287378AdbdE030cf61714b2f3`;
const privateKey = `ee9cec01ff03c0adea731d7c5a84f7b412bfd062b9ff35126520b3eb3d5ff258`;
const toAddress = `0x4f2E4a30f08462c80c015152b7dff85BdAE65364`;

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

const subscribe = web3.eth.subscribe(
  'logs',
  {
    address: fromAddress,
  },
  async (_, tx) => {
    console.log(tx);
    await sendTransaction();
  },
);

subscribe.on('connected', () => {
  console.log(`Connected`);
});
