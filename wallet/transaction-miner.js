const Transaction = require('./transaction');

class TransactionMiner {
    constructor({transactionPool, blockchain, wallet, pubsub}){
        this.transactionPool = transactionPool;
        this.blockchain = blockchain;
        this.wallet = wallet;
        this.pubsub = pubsub;
    }

    mine(){
        let transactionsList = Object.assign({}, this.transactionPool.transactions);
        const rewardTransaction = Transaction.rewardTransaction(this.wallet);

        transactionsList[rewardTransaction.id] = rewardTransaction;

        this.blockchain.addBlock(transactionsList);
        this.pubsub.broadcastBlockchain();

        this.transactionPool.clear();
    }
}

module.exports = TransactionMiner;