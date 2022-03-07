const sha256 = require('sha256');

const getHash = (...inputs)=>{
    return sha256(
        inputs.sort().join(' ')
    );
}

module.exports = {
    getHash
}