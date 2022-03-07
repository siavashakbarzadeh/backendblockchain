const hexToBinary = require('hex-to-binary');
const {getHash} = require('../utils');
const {AVERAGE_MINING_TIME} = require('../config');

class Block {
    constructor({index, timestamp, data, prevHash, nonce, difficulty, hash}){
        this.index = index;
        this.timestamp = timestamp;
        this.data = data;
        this.prevHash = prevHash;
        this.nonce = nonce;
        this.difficulty = difficulty;
        this.hash = hash;
    }

    static mine(lastBlock, data){
        const index = lastBlock.index + 1;
        const prevHash = lastBlock.hash;
        let nonce = 0;
        let timestamp, hash, difficulty;

        do{
            nonce += 1;
            timestamp = Date.now();
            difficulty = this.adjustDifficulty({
                lastBlock,
                currentTime : timestamp
            })
            hash = getHash(index, timestamp, prevHash, nonce, difficulty, data);
        }
        while(
            hexToBinary(hash).substring(0, difficulty) !== '0'.repeat(difficulty)
        )

        return new this({
            index,
            timestamp,
            data,
            prevHash,
            nonce,
            difficulty,
            hash,
        })
    }

    static adjustDifficulty({lastBlock, currentTime}){
        const timeDiff = Math.abs(lastBlock.timestamp - currentTime);
        const {difficulty} = lastBlock;

        if(timeDiff > AVERAGE_MINING_TIME){
            return (difficulty - 1 <= 0 ? 1 : difficulty - 1);
        }

        return difficulty + 1;
    }

    static getGenesisBlock(){
        return new this({
            index : 0,
            data : 'This is Genesis Block',
            timestamp : '1',
            prevHash : null,
            nonce : 1,
            difficulty : 1,
            hash : 'This is Genesis Block Hash'
        });
    }
}

module.exports = Block;