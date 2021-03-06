const HDWalletProvider = require("truffle-hdwallet-provider");
const Web3 = require("web3");
const elixirToken = require("./build/ElixirToken.json");

// Setup provider

const provider = new HDWalletProvider(
  "again good series state hamster learn frog south crazy measure trip observe",
  "https://rinkeby.infura.io/v3/770d87f62c3d4e7a9fe11bb2fee6b5d0"
);

const web3 = new Web3(provider);

// Need to create a function to use async-await

const deploy = async () => {
  // Mnemonic can have many accounts
  const accounts = await web3.eth.getAccounts();
  console.log("Attempting to deploy from account", accounts[0]);
  const initialSupply = 1000000;
  const tokenPrice = 1000000000000000;
  // Deployment Process
  const result = await new web3.eth.Contract(JSON.parse(elixirToken.interface))
    .deploy({
      data: "0x" + elixirToken.bytecode,
      arguments: [initialSupply, tokenPrice]
    })
    .send({ from: accounts[0] });

  console.log("Contract Deployed To:\n", result.options.address);
};

deploy();
