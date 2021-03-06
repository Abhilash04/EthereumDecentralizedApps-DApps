import Web3 from 'web3';

let web3;

if (typeof window !== 'undefined' && typeof window.web3 !== 'undefined'){
    // We are on browser and metamask is running
    web3 = new Web3(window.web3.currentProvider);
}else{
    // We are on server *OR* metamask is not running in the browser
    const provider = new Web3.providers.HttpProvider(
      'https://rinkeby.infura.io/v3/770d87f62c3d4e7a9fe11bb2fee6b5d0'
    );
    web3 = new Web3(provider);
}

export default web3;
