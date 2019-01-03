const path = require("path");
const solc = require("solc");
const fs = require("fs-extra");

// clean the entire build folder
const buildPath = path.resolve(__dirname, "build");
fs.removeSync(buildPath);

// read token contract file
const elixirTokenPath = path.resolve(__dirname, "contracts", "ElixirToken.sol");
const sourceToken = fs.readFileSync(elixirTokenPath, "utf-8");

// compile the contract code
const outputToken = solc.compile(sourceToken, 1).contracts;

// create build folder again
fs.ensureDirSync(buildPath);

// write the compiled code in JSON files
for (let contract in outputToken) {
  fs.outputJsonSync(
    path.resolve(buildPath, contract.replace(":", "") + ".json"),
    outputToken[contract]
  );
}
