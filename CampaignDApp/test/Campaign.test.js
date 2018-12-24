const assert = require('assert');
const ganache = require('ganache-cli');
const Web3 = require('web3');
const provider = ganache.provider();
const web3 = new Web3(provider);

const compiledFactory = require('../ethereum/build/CampaignFactory.json');
const compiledCampaign = require('../ethereum/build/Campaign.json');

let accounts;
let factory;
let campaignAddress;
let campaign;

beforeEach(async () => {
  accounts = await web3.eth.getAccounts();
  factory = await new web3.eth.Contract(JSON.parse(compiledFactory.interface))
    .deploy({data: compiledFactory.bytecode})
    .send({from: accounts[0], gas: '6000000'
  });

  await factory.methods.createCampain('100').send({
    from: accounts[0], gas: '6000000'
  });

  // const addresses = await factory.methods.getDeployedCampaigns().call();
  // campaignAddress = addresses[0];
  [campaignAddress] = await factory.methods.getDeployedCampaigns().call();

  campaign = await new web3.eth.Contract(
    JSON.parse(compiledCampaign.interface),
    campaignAddress
  );

});

describe('Campaigns', () => {
  it('deploys a factory and a campaign', ()=> {
    assert.ok(factory.options.address);
    assert.ok(campaign.options.address);
  });

  it('marks caller as the campaign manager', async () => {
    const campaignManager = await campaign.methods.manager().call();
    assert.equal(accounts[0], campaignManager);
  });

  it('allows people to contribute money and marks them as approver', async () => {
    await campaign.methods.contribute().send({
      value: '200',
      from: accounts[1]
    });

    const isApprover = await campaign.methods.approvers(accounts[1]).call();
    assert(isApprover);
  });

  it('requires a minimum contribution', async () => {
    try{
      await campaign.methods.contribute().send({
        value: '99',
        from: accounts[2]
      });
      assert(false);
    }catch(err){
      assert(err);
    }
  });

  it('allows a manager to make a payment request', async () => {
    await campaign.methods
    .createRequest('hire an ERP consultant', '200', accounts[3])
    .send({
      from: accounts[0],
      gas: '6000000'
    });

    const request = await campaign.methods.requests(0).call();
    assert.equal('hire an ERP consultant', request.description);
  });

  it('processes request', async () => {

    await campaign.methods.contribute().send({
      from: accounts[0],
      value: web3.utils.toWei('10', 'ether')
    });

    await campaign.methods
    .createRequest('hire a RPA consultant', web3.utils.toWei('5', 'ether'), accounts[1])
    .send({
      from: accounts[0],
      gas: '6000000'
    });

    await campaign.methods.approveRequest(0).send({
      from: accounts[0],
      gas: '6000000'
    });

    await campaign.methods.finalizeRequest(0).send({
      from: accounts[0],
      gas: '6000000'
    });

    let balance = await web3.eth.getBalance(accounts[1]);
    balance = web3.utils.fromWei(balance, 'ether');
    balance = parseFloat(balance);
    assert(balance > 104);
  });

  it('does not allow manager to finalize request before approval', async () => {
    await campaign.methods.contribute().send({
      from: accounts[0],
      value: web3.utils.toWei('3', 'ether')
    });

    await campaign.methods
    .createRequest('hire HR manager', web3.utils.toWei('1', 'ether'), accounts[1])
    .send({
      from: accounts[0],
      gas: '6000000'
    });

    try{
      await campaign.methods.finalizeRequest(0).send({
        from: accounts[0],
        gas: '6000000'
      });
      assert(false);
    }catch(err){
      assert(err)
    }

  });

  it('allows manager to finalize the request only once', async () => {
    await campaign.methods.contribute().send({
      from: accounts[0],
      value: web3.utils.toWei('3', 'ether')
    });

    await campaign.methods
    .createRequest('hire SharePoint consultant', web3.utils.toWei('1', 'ether'), accounts[1])
    .send({
      from: accounts[0],
      gas: '6000000'
    });

    await campaign.methods.approveRequest(0).send({
      from: accounts[0],
      gas: '6000000'
    });

    await campaign.methods.finalizeRequest(0).send({
      from: accounts[0],
      gas: '6000000'
    });

    try{
      await campaign.methods.finalizeRequest(0).send({
        from: accounts[0],
        gas: '6000000'
      });
      assert(false);
    }catch(err){
      assert(err)
    }

  });

});
