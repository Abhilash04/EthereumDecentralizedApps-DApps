const assert = require("assert");
const ganache = require("ganache-cli");
const Web3 = require("web3");
const provider = ganache.provider();
const web3 = new Web3(provider);

const elixirToken = require("../ethereum/build/ElixirToken.json");

let accounts;
let token;
let supply = 1000000;
var tokenPrice = 1000000000000000;
var buyer;
var tokensToBuy = 10;
var admin;
var tokensAvailable = 0.75 * supply;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();
  buyer = accounts[2];
  admin = accounts[0];

  token = await new web3.eth.Contract(JSON.parse(elixirToken.interface))
    .deploy({
      data: elixirToken.bytecode,
      arguments: [supply, 1000000000000000]
    })
    .send({ from: accounts[0], gas: "6000000" });
});

describe("Elixir Token", () => {
  it("deploys elixir token contract", async () => {
    assert.ok(token.options.address);
  });

  it("checks initial total supply", async () => {
    totalSupply = await token.methods.totalSupply().call();
    assert.equal(totalSupply, supply);
  });

  it("checks total token of contract owner", async () => {
    balance = await token.methods.balanceOf(accounts[0]).call();
    assert.equal(balance, supply);
  });

  it("checks initial values of contract", async () => {
    name = await token.methods.name().call();
    symbol = await token.methods.symbol().call();
    standard = await token.methods.standard().call();
    totalSupply = await token.methods.totalSupply().call();

    assert.equal(name, "Elixir Token");
    assert.equal(symbol, "ELXR");
    assert.equal(totalSupply, supply);
    assert.equal(standard, "ELXR v1.0");
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
    assert.equal(remainingToken, supply - 25000);
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

describe("Elixir Token Sale", () => {
  it("validates token price in wei", async () => {
    tokenPriceInWei = await token.methods.tokenPrice().call();
    assert.equal(tokenPriceInWei, tokenPrice);
  });

  it("checks buy token functionality", async () => {
    await token.methods
      .transfer(token._address, tokensAvailable)
      .send({ from: admin });

    receipt = await token.methods
      .buyTokens(tokensToBuy)
      .send({ from: buyer, value: tokensToBuy * tokenPrice });

    assert.equal(
      receipt.events.Sell.event,
      "Sell",
      "sell event not triggered."
    );

    buyersTokenBalance = await token.methods.balanceOf(buyer).call();
    assert.equal(
      buyersTokenBalance,
      tokensToBuy,
      "buyers balance not updated."
    );

    contractTokenBalance = await token.methods.balanceOf(token._address).call();
    assert.equal(
      contractTokenBalance,
      tokensAvailable - tokensToBuy,
      "contract balance not updated."
    );

    try {
      await token.methods
        .buyTokens(760000)
        .send({ from: buyer, value: 760000 * tokenPrice });
      assert(false);
    } catch (err) {
      assert(err, "can not purchase more tokens than available.");
    }

    try {
      await token.methods
        .buyTokens(500)
        .send({ from: buyer, value: 400 * tokenPrice });
      assert(false);
    } catch (err) {
      assert(err, "msg.value should equavelant to tokens to buy value.");
    }
  });

  it("ends the token sale", async () => {
    await token.methods
      .transfer(token._address, tokensAvailable)
      .send({ from: admin });

    receipt = await token.methods
      .buyTokens(tokensToBuy)
      .send({ from: buyer, value: tokensToBuy * tokenPrice });

    try {
      await token.methods.endSale().send({ from: buyer });
      assert(false);
    } catch (err) {
      assert(err, "only admin can end the sale.");
    }

    await token.methods.endSale().send({ from: admin });

    // adminBalance = await token.methods.balanceOf(admin).call();
    // assert.equal(adminBalance, supply - tokensToBuy);

    try {
      await token.methods.tokenPrice().call();
      assert(false);
    } catch (err) {
      assert(err, "token price reset after self destruct of contract.");
    }
  });
});
