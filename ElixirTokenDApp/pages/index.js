import React, { Component } from "react";
import elixir from "../ethereum/elixir";
import web3 from "../ethereum/web3";

class ElixirTokenIndex extends Component {
  static async getInitialProps() {
    const totalSupply = await elixir.methods.totalSupply().call();
    const symbol = await elixir.methods.symbol().call();
    const tokenPrice = await elixir.methods.tokenPrice().call();
    const tokenPriceInEther = web3.utils.fromWei(tokenPrice, "Ether");

    const accounts = await web3.eth.getAccounts();
    console.log(accounts);

    // const tokenBalanceOfCurrentAccount = await elixir.methods
    //   .balanceOf(accounts[0])
    //   .call();
    return {
      totalSupply,
      symbol,
      tokenPriceInEther,
      accounts
      // ,tokenBalanceOfCurrentAccount
    };
  }
  render() {
    return (
      <div>
        <h1>ELIXIR TOKEN ICO SALE</h1>
        <p>
          Introducing "Elixir Token" {this.props.symbol}. Token price is{" "}
          {this.props.tokenPriceInEther} Ether. {this.props.accounts} currently
          have {this.props.symbol}.
        </p>
      </div>
    );
  }
}

export default ElixirTokenIndex;
