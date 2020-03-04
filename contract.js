import {makePromise} from './util.js';
import address from './address.js';
import abi from './abi.js';

const contract = {
  instance: null,
  account: null,
  promise: makePromise(),
  async init() {
    if (window.ethereum) {
      window.web3 = new window.Web3(window.ethereum);
      try {
        // Request account access if needed
        await window.ethereum.enable();
        // Acccounts now exposed
        // web3.eth.sendTransaction({/* ... */});

        this.instance = window.web3.eth.contract(abi).at(address);
        this.account = window.web3.eth.accounts[0];

        this.promise.accept(this.instance);
      } catch (err) {
        // User denied account access...
        console.warn(err);
      }
    } else {
      console.warn('no ethereum!');
    }
  },
  async getInstance() {
    return await this.promise;
  },
  async getAccount() {
    return await this.promise.then(() => this.account);
  },
};
window.contract = contract;
export default contract;