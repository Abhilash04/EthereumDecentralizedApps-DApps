import web3 from "./web3";
import ElixirToken from "./build/ElixirToken.json";

const instance = new web3.eth.Contract(
  JSON.parse(ElixirToken.interface),
  "0xbD2C469b35796A2239F2D2a004A6ABEce5072f29"
);

export default instance;
