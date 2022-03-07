const Block = require('./block');
const {getHash} = require('../utils');

class Blockchain {
    constructor(){
        this.chain = [Block.getGenesisBlock()];
    }

    addBlock(data){
        const block = Block.mine(this.getlastBlock(), data);
        this.chain.push(block);
    }

    getlastBlock(){
        return this.chain[this.chain.length - 1];
    }

    replaceBlockchain(chain, callback){
        if(chain.length <= this.chain.length){
            console.error(`Incoming chain is not longer.`);
            return;
        }
        if(JSON.stringify(chain[0]) !== JSON.stringify(this.chain[0])){
            console.error(`Incoming chain genesis block is not valid.`);
            return;
        }
        if(!Blockchain.isChainValid(chain)){
            console.error(`Incoming chain is not valid.`)
            return;
        }

        this.chain = chain;
        if(callback){
            callback();
        }
    }

    static isChainValid(chain){
        for(let i = 1; i < chain.length; i++){
            const {index, timestamp, data, prevHash, nonce, difficulty, hash} = chain[i];
            const {hash : actualLastHash, difficulty : actualLastDifficulty} = chain[i - 1];

            if(getHash(index, timestamp, data, prevHash, nonce, difficulty) !== hash){
                return false;
            }
            if(prevHash !== actualLastHash){
                return false;
            }
            if(Math.abs(difficulty - actualLastDifficulty) > 1){
                return false;
            }
        }

        return true;
    }
}

module.exports = Blockchain;