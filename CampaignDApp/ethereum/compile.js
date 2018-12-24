const path = require('path');
const solc = require('solc');
const fs = require('fs-extra');

// Delete entire build folder first
const buildPath = path.resolve(__dirname, 'build');
fs.removeSync(buildPath);

// Read 'Campaign.sol' file
const campaignPath = path.resolve(__dirname, 'contracts', 'Campaign.sol');
const source = fs.readFileSync(campaignPath, 'utf-8');

// Compile the contract and store the compiled code
const output = solc.compile(source, 1).contracts;

// Create 'build' folder again
fs.ensureDirSync(buildPath);

// Read compiled code and write to 'build' folder files
for(let contract in output){
  fs.outputJsonSync(
    path.resolve(buildPath, contract.replace(':','') + '.json'),
    output[contract]
  );
}
