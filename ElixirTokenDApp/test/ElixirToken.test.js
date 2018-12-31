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
    assert.equal(totalSupply, 1500000);
  });

  it("checks total token of contract owner", async () => {
    balance = await token.methods.balanceOf(accounts[0]).call();
    assert.equal(balance, 1500000);
  });

  it("checks initial values of contract", async () => {
    name = await token.methods.name().call();
    symbol = await token.methods.symbol().call();
    standard = await token.methods.standard().call();
    totalSupply = await token.methods.totalSupply().call();

    assert.equal(name, "Elixir Token");
    assert.equal(symbol, "EXR");
    assert.equal(totalSupply, 1500000);
    assert.equal(standard, "Elixir Token v1.0");
  });

  it("checks transfer token functionality", async () => {
    receipt = "";
    try {
      receipt = await token.methods
        .transfer(accounts[1], 25000)
        .send({ from: accounts[0], gas: "6000000" });
      assert(receipt != undefined && receipt != "");
    } catch (err) {
      console.log(err.message);
      assert(err.message.indexOf("revert") == 0);
    }

    assert.equal(receipt.status, true, "Transfer event status is false!!");
    assert.equal(
      receipt.events.Transfer.event,
      "Transfer",
      "Transfer event not triggered!!"
    );
    transferredToken = await token.methods.balanceOf(accounts[1]).call();
    remainingToken = await token.methods.balanceOf(accounts[0]).call();
    assert.equal(transferredToken, 25000);
    assert.equal(remainingToken, 1475000);
  });

  it("approves tokens for delegated transfer", async () => {
    receipt = await token.methods.approve(accounts[1], 200).send({
      from: accounts[0],
      gas: "6000000"
    });
    allowance = await token.methods.allowance(accounts[0], accounts[1]).call();
    assert.equal(receipt.status, true, "Approval event status is false!!");
    assert.equal(
      receipt.events.Approval.event,
      "Approval",
      "Approval event not triggered."
    );
    assert.equal(
      allowance,
      200,
      "allowance doesn't match with approved token."
    );
  });

  it("handles delegated transfer", async () => {
    fromAccount = accounts[1];
    spendingAccount = accounts[2];
    toAccount = accounts[3];

    await token.methods.transfer(fromAccount, 200).send({
      from: accounts[0],
      gas: "6000000"
    });

    await token.methods.approve(spendingAccount, 100).send({
      from: fromAccount,
      gas: "6000000"
    });

    try {
      await token.methods.transferFrom(fromAccount, toAccount, 101).send({
        from: spendingAccount,
        gas: "6000000"
      });
      assert(false, "able to send the token beyond allowance.");
    } catch (err) {
      assert.ok(err);
    }

    await token.methods.transferFrom(fromAccount, toAccount, 50).send({
      from: spendingAccount,
      gas: "6000000"
    });

    toAccountBalance = await token.methods.balanceOf(toAccount).call();

    assert.equal(
      toAccountBalance,
      50,
      "unable to send tokens using delegated call."
    );
  });
});
