const express = require('express');
const cors = require('cors');
const axios = require('axios').default;
const Blockchain = require('./blockchain');
const Wallet = require('./wallet');
const TransactionPool = require('./wallet/transaction-pool');
const PubSub = require('./pubsub');
const TransactionMiner = require('./wallet/transaction-miner');
const {PORT, MAIN_NODE_ADDRESS} = require('./config');

const app = express();
const blockchain = new Blockchain();
const wallet = new Wallet();
const transactionPool = new TransactionPool();
const pubsub = new PubSub({blockchain, transactionPool});
const transactionMiner = new TransactionMiner({transactionPool, blockchain, wallet, pubsub});

app.use(express.static('public'));
app.use(cors({
    origin: '*'
}));
app.use(express.json());

app.get('/api/blocks', (req, res)=>{
    res.status(200).json(blockchain.chain);
});

app.post('/api/mine', (req, res)=>{
    blockchain.addBlock(req.body.data);
    pubsub.broadcastBlockchain();
    res.redirect('/api/blocks');
});

app.get('/api/transaction-pool', (req, res)=>{
    res.status(200).json(transactionPool.transactions);
});

app.post('/api/set-transaction', (req, res)=>{
    const {recipient} = req.body;
    let amount = parseFloat(req.body.amount);
    
    let transaction = transactionPool.existingTransaction(wallet.publicKey);

    if(transaction){
        transaction.update({
            senderWallet: wallet,
            recipient,
            amount
        });
    }
    else{
        transaction = wallet.createTransaction({chain: blockchain.chain, recipient, amount})
    }

    if(!transaction){
        return res.status(200).json('You dont have enough money!')
    }

    transactionPool.set(transaction);
    pubsub.broadcastTransaction(transaction);

    res.status(200).json('Your transaction submitted.');
});

app.get('/api/mine-transactions', (req, res)=>{
    transactionMiner.mine();
    res.status(200).json('A new Block has beed mined!');
});

app.get('/api/wallet-address', (req, res)=>{
    res.json(wallet.publicKey);
})

app.post('/api/wallet-balance', (req, res)=>{
    const {publicKey} = req.body;
    const publicKeyBalance = Wallet.calculateWalletBalance({
        chain: blockchain.chain,
        publicKey
    });

    res.status(200).json(publicKeyBalance);
});

app.get('/*', (req, res)=>{
    res.sendFile(`${require.main.path}/public/index.html`);
});

let PEER_PORT;

if(process.env.GENERATE_PEER == 'true'){
    PEER_PORT = PORT + Math.round(Math.random() * 1000);

    syncWithRootNode();
}

app.listen(PEER_PORT || PORT, ()=>{
    console.log(`Server started on port : ${PEER_PORT || PORT}`);
})

function syncWithRootNode(){
    axios.get(`${MAIN_NODE_ADDRESS}api/blocks`).then((res)=>{
        blockchain.replaceBlockchain(res.data);
    }).catch((err)=>{
        console.log(err);
    })

    axios.get(`${MAIN_NODE_ADDRESS}api/transaction-pool`).then((res)=>{
        transactionPool.setList(res.data)
    }).catch((err)=>{
        console.log(err);
    })
}
