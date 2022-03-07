const Blockchain = require('../blockchain');

const blockchain = new Blockchain();

let times = [];
for(let i = 0; i < 10000; i++){

    const currentTime = Date.now();

    blockchain.addBlock({data : `Block Number ${i}`});
    const {timestamp, difficulty} = blockchain.getlastBlock();
    const mineTime = timestamp - currentTime;
    times.push(mineTime);

    let averageTime = times.reduce((prevTime, currTime) => prevTime + currTime)/times.length

    console.log(`Block ${i} | Difficulty: ${difficulty} | Time : ${mineTime}ms | Average Time: ${averageTime}`);
}