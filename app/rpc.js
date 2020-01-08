import axios from 'axios';
import _ from 'underscore';
import { TotalBalance, AddressBalance } from './components/AppState';
import { resolveConfig } from 'prettier';

export default class RPC {
  fnSetTotalBalance: TotalBalance => void;

  fnSetAddressesWithBalance: ([AddressBalance]) => void;

  timerID: TimerID;

  constructor(
    fnSetTotalBalance: TotalBalance => void,
    fnSetAddressesWithBalance: ([AddressBalance]) => void
  ) {
    this.fnSetTotalBalance = fnSetTotalBalance;
    this.fnSetAddressesWithBalance = fnSetAddressesWithBalance;
  }

  async configure() {
    if (!this.timerID) {
      this.timerID = setTimeout(() => this.refresh(), 1000);
    }
  }

  async refresh() {
    this.fetchTotalBalance();
    this.fetchTandZAddressesWithBalances();
  }

  // This method will get the total balances
  async fetchTotalBalance() {
    const response = await RPC.doRPC('z_gettotalbalance', [0]);

    const balance = new TotalBalance(response.result.total);
    balance.private = response.result.private;
    balance.transparent = response.result.transparent;

    this.fnSetTotalBalance(balance);
  }

  // Fetch all addresses and their associated balances
  async fetchTandZAddressesWithBalances() {
    const zresponse = RPC.doRPC('z_listunspent', []);
    const tresponse = RPC.doRPC('listunspent', []);

    // Do the Z addresses
    // response.result has all the unspent notes.
    const unspentNotes = (await zresponse).result;
    const zgroups = _.groupBy(unspentNotes, 'address');
    const zaddresses = Object.keys(zgroups).map(address => {
      const balance = zgroups[address].reduce(
        (prev, obj) => prev + obj.amount,
        0
      );
      return new AddressBalance(address, balance);
    });

    // Do the T addresses
    const unspentTXOs = (await tresponse).result;
    const tgroups = _.groupBy(unspentTXOs, 'address');
    const taddresses = Object.keys(tgroups).map(address => {
      const balance = tgroups[address].reduce(
        (prev, obj) => prev + obj.amount,
        0
      );
      return new AddressBalance(address, balance);
    });

    const addresses = zaddresses.concat(taddresses);

    this.fnSetAddressesWithBalance(addresses);
  }

  static async doRPC(method: string, params: []) {
    const response = await axios('http://127.0.0.1:8232/', {
      data: {
        jsonrpc: '2.0',
        id: 'curltest',
        method,
        params
      },
      method: 'POST',
      auth: {
        username: 'zec-qt-wallet',
        password: 'Zd2fcYO88l'
      }
    });

    return response.data;
  }
}
