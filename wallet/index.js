const elliptic = require('elliptic').ec;
const ec = new elliptic('secp256k1');
const Transaction = require('./transaction');
const {STARTING_BALANCE} = require('../config');
const {getHash} = require('../utils');

class Wallet {
    constructor(){
        this.balance = STARTING_BALANCE;
        this.keyPair = ec.genKeyPair();
        this.publicKey = this.keyPair.getPublic().encode('hex');
    }

    sign(data){
        return this.keyPair.sign(getHash(data));
    }

    createTransaction({chain, recipient, amount}){
        if(amount > Wallet.calculateWalletBalance({chain, publicKey: this.publicKey})){
            return null;
        }

        return new Transaction({senderWallet: this, recipient, amount});
    }

    static calculateWalletBalance({chain, publicKey}){
        let addressBalance = 0;
        let isSendersTransaction = false;

        loop1:
            for(let i = chain.length - 1; i > 0; i--){
                const block = chain[i];
                const transactions = Object.values(block.data);
                
                if(typeof block.data === 'string'){
                    break;
                }

                for(let i = transactions.length - 1; i >= 0; i--){
                    const transaction = transactions[i];

                    if(transaction.output[publicKey]){
                        addressBalance += transaction.output[publicKey];
                    }
                    if(transaction.input.address === publicKey){
                        isSendersTransaction = true;
                        break loop1;
                    }
                }
            }
        
        return (isSendersTransaction ? addressBalance : addressBalance + STARTING_BALANCE)
    }
}

module.exports = Wallet;