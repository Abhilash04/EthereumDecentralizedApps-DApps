import web3 from "./web3";
import CampaignFactory from "./build/CampaignFactory.json";

const instance = new web3.eth.Contract(
  JSON.parse(CampaignFactory.interface),
  "0x25759370Cb02C1bf8764B72BD45933f0621FB49a"
);

export default instance;
