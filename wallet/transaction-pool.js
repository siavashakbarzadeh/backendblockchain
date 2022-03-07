const Transaction = require('./transaction');

class TransactionPool {
    constructor(){
        this.transactions = {};
    }

    set(transaction){
        if(!Transaction.isValidTransaction(transaction)){
            return;
        }
        this.transactions[transaction.id] = transaction;
    }

    existingTransaction(inputAddress){
        const transactionList = Object.values(this.transactions);

        return transactionList.find((transaction)=>{
            return transaction.input.address === inputAddress
        })
    }

    clear(){
        this.transactions = {};
    }

    clearBlockchainTransactions(chain){
        for(let i = 1; i < chain.length; i++){
            const block = chain[i];
            const blockTransactions = Object.values(block.data);
            for(let transaction of blockTransactions){
                if(this.transactions[transaction.id]){
                    delete this.transactions[transaction.id];
                }
            }
        }
    }

    setList(transactionList){
        this.transactions = transactionList;
    }
}

module.exports = TransactionPool;