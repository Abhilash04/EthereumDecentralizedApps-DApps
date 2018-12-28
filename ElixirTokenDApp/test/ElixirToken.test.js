const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const provider = ganache.provider();
const web3 = new Web3(provider);

const elixirToken = require("../ethereum/build/ElixirToken.json");

let accounts;
let token;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();

  token = await new web3.eth.Contract(JSON.parse(elixirToken.interface))
    .deploy({ data: elixirToken.bytecode, arguments: ["1500000"] })
    .send({ from: accounts[0], gas: "6000000" });
});

describe("Elixir Token", () => {
  it("deploys elixir token contract", async () => {
    assert.ok(token.options.address);
  });

  it("checks initial total supply", async () => {
    totalSupply = await token.methods.totalSupply().call();
    assert(totalSupply, 1500000);
  });

  it("checks total token of contract owner", async () => {
    balance = await token.methods.balanceOf(accounts[0]).call();
    assert(balance, 1500000);
  });

  it("checks initial values of contract", async () => {
    name = await token.methods.name().call();
    symbol = await token.methods.symbol().call();
    standard = await token.methods.standard().call();
    totalSupply = await token.methods.totalSupply().call();

    assert(name, "Elixir Token");
    assert(symbol, "EXR");
    assert(totalSupply, "Elixir Token v1.0");
    assert(standard, "");
  });

  it("checks transfer token functionality", async () => {
    try {
      receipt = await token.methods
        .transfer(accounts[1], 25000)
        .send({ from: accounts[0], gas: "6000000" });
    } catch (err) {
      console.log(err.message);
      assert(err.message.indexOf("revert") == 0);
    }
    transferredToken = await token.methods.balanceOf(accounts[1]).call();
    remainingToken = await token.methods.balanceOf(accounts[0]).call();
    assert(transferredToken, 1500000);
    assert(remainingToken, 1475000);
  });
});
