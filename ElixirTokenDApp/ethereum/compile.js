const path = require("path");
const solc = require("solc");
const fs = require("fs-extra");

// clean the entire build folder
const buildPath = path.resolve(__dirname, "build");
fs.removeSync(buildPath);

// read contract file
const elixirTokenPath = path.resolve(__dirname, "contracts", "ElixirToken.sol");
const source = fs.readFileSync(elixirTokenPath, "utf-8");

// compile the contract code
const output = solc.compile(source, 1).contracts;

// create build folder again
fs.ensureDirSync(buildPath);

// write the compiled code in JSON files
for (let contract in output) {
  fs.outputJsonSync(
    path.resolve(buildPath, contract.replace(":", "") + ".json"),
    output[contract]
  );
}
