import axios from 'axios';
import { Balance, Address } from './components/AppState';

export default class RPC {
  fnSetBalance: Balance => void;

  fnSetAddresses: ([Address]) => void;

  timerID: TimerID;

  constructor(
    fnSetBalance: Balance => void,
    fnSetAddresses: ([Address]) => void
  ) {
    this.fnSetBalance = fnSetBalance;
    this.fnSetAddresses = fnSetAddresses;
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

    const balance = new Balance(response.result.total);

    this.fnSetBalance(balance);
  }

  // Fetch all addresses and their associated balances
  async fetchAddresses() {
    const response = await RPC.doRPC('z_listaddresses', []);

    // response.result has all the addresses.
    const justAddresses = response.result;

    // Now, for each address, get the balance.
    const balancePromises = justAddresses.map(async address => {
      const balanceResponse = await RPC.doRPC('z_getbalance', [address]);
      return { address, balance: balanceResponse.result };
    });

    const balances = await Promise.all(balancePromises);

    // Go over all the addresses
    const addresses: [Address] = balances.map(
      v => new Address(v.address, v.balance)
    );

    this.fnSetAddresses(addresses);
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
