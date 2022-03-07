const elliptic = require('elliptic').ec;
const ec = new elliptic('secp256k1');
const uuid = require('uuid');
const {getHash} = require('../utils');
const {REWARD_AMOUNT, REWARD_ADDRESS} = require('../config');

class Transaction {
    constructor({senderWallet, recipient, amount, input, output}){
        this.id = uuid.v4();
        this.output = output || this.createOutput({senderWallet, recipient, amount});
        this.input = input || this.createInput({senderWallet, output: this.output});
    }

    createOutput({senderWallet, recipient, amount}){
        let output = {};

        output[recipient] = amount;
        output[senderWallet.publicKey] = senderWallet.balance - amount;

        return output;
    }

    createInput({senderWallet, output}){
        return {
            timestamp: Date.now(),
            amount: senderWallet.balance,
            address: senderWallet.publicKey,
            signature: senderWallet.sign(output)
        }
    }

    update({senderWallet, recipient, amount}){
        if(amount > this.output[senderWallet.publicKey]){
            console.error(`Amount is greater than balance.`)
            return;
        }

        if(this.output[recipient]){
            this.output[recipient] += amount;
        }
        else{
            this.output[recipient] = amount;
        }
        
        this.output[senderWallet.publicKey] -= amount;
        this.input = this.createInput({senderWallet, output: this.output});
    }

    static rewardTransaction(minerWallet){
        return new Transaction({
            input : {
                timestamp: Date.now(),
                amount: REWARD_AMOUNT,
                address: REWARD_ADDRESS,
            },
            output : {[minerWallet.publicKey] : REWARD_AMOUNT}
        })
    }

    static verifySignature({address, data, signature}){
        const keyFromPublic = ec.keyFromPublic(address, 'hex');
        return keyFromPublic.verify(getHash(data), signature);
    }

    static isValidTransaction(transaction){
        const {input: {amount, address, signature}, output} = transaction;
        const outputTotalAmount = Object.values(output).reduce((prevValue, currValue)=>{
            return prevValue + currValue;
        });

        if(outputTotalAmount !== amount){
            console.error(`Transaction output total amounts is not equel to input amount.`);
            return false;
        }
        if(!Transaction.verifySignature({address, data: output, signature})){
            console.error(`Transaction signature is not valid.`)
            return false;
        }

        return true;
    }
}

module.exports = Transaction;