const redis = require('redis');

const CHANNELS = {
    BLOCKCHAIN : 'BLOCKCHAIN',
    TRANSACTION : 'TRANSACTION'
} 

class PubSub {
    constructor({blockchain, transactionPool}){
        this.subscriber = redis.createClient();
        this.publisher = redis.createClient();
        this.blockchain = blockchain;
        this.transactionPool = transactionPool;

        this.subscribeChannels();

        this.subscriber.on('message', (channel, message)=> this.handleMessages(channel, message));

    }

    subscribeChannels(){
        Object.values(CHANNELS).forEach((channel) => {
            this.subscriber.subscribe(channel);
        });
    }

    publish({channel, message}){
        this.subscriber.unsubscribe(channel, ()=>{
            this.publisher.publish(channel, message, ()=>{
                this.subscriber.subscribe(channel);
            });
        });
    }

    broadcastBlockchain(){
        this.publish({
            channel : CHANNELS.BLOCKCHAIN,
            message : JSON.stringify(this.blockchain.chain)
        })
    }

    broadcastTransaction(transaction){
        this.publish({
            channel : CHANNELS.TRANSACTION,
            message : JSON.stringify(transaction)
        })
    }

    handleMessages(channel, message){
        console.log(`Message recived from ${channel}: ${message}`);
        let parsedMessage = JSON.parse(message);

        switch(channel){
            case CHANNELS.BLOCKCHAIN:{
                this.blockchain.replaceBlockchain(parsedMessage, ()=>{
                    this.transactionPool.clearBlockchainTransactions(parsedMessage);
                });
                break;
            }
            case CHANNELS.TRANSACTION:{
                this.transactionPool.set(parsedMessage)
                break;
            }
        }
    }
}

module.exports = PubSub;