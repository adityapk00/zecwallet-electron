import axios from 'axios';
import _ from 'underscore';
import { TotalBalance, AddressBalance } from './components/AppState';

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
    this.fetchBalance();
    this.fetchAddresses();
  }

  async fetchBalance() {
    const response = await RPC.doRPC('z_gettotalbalance', [0]);

    const balance = new TotalBalance(response.result.total);

    this.fnSetTotalBalance(balance);
  }

  // Fetch all addresses and their associated balances
  async fetchAddresses() {
    const response = await RPC.doRPC('z_listunspent', []);

    // response.result has all the unspent notes.
    const unspentNotes = response.result;
    const groups = _.groupBy(unspentNotes, 'address');

    const addresses = Object.keys(groups).map(address => {
      const balance = groups[address].reduce(
        (prev, obj) => prev + obj.amount,
        0
      );
      return new AddressBalance(address, balance);
    });

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
