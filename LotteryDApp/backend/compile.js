// require('.contract/Lottery.sol'); //bad !!
// becuase contract files are not js files so it'll throw an error
// we need to read the contract file from hard drive using different modules

const path = require('path');
const fs = require('fs');
const solc = require('solc');

const lotteryPath = path.resolve(__dirname, 'contracts', 'Lottery.sol');
const source = fs.readFileSync(lotteryPath, 'utf8');

module.exports = solc.compile(source, 1).contracts[':Lottery'];
