import axios from 'axios';
import _ from 'underscore';
import {
  TotalBalance,
  AddressBalance,
  Transaction
} from './components/AppState';

export default class RPC {
  fnSetTotalBalance: TotalBalance => void;

  fnSetAddressesWithBalance: ([AddressBalance]) => void;

  fnSetTransactionsList: ([Transaction]) => void;

  timerID: TimerID;

  constructor(
    fnSetTotalBalance: TotalBalance => void,
    fnSetAddressesWithBalance: ([AddressBalance]) => void,
    fnSetTransactionsList: ([Transaction]) => void
  ) {
    this.fnSetTotalBalance = fnSetTotalBalance;
    this.fnSetAddressesWithBalance = fnSetAddressesWithBalance;
    this.fnSetTransactionsList = fnSetTransactionsList;
  }

  async configure() {
    if (!this.timerID) {
      this.timerID = setTimeout(() => this.refresh(), 1000);
    }
  }

  async refresh() {
    this.fetchTotalBalance();
    this.fetchTandZAddressesWithBalances();
    this.fetchTandZTransactions();
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

  // Fetch all T and Z transactions
  async fetchTandZTransactions() {
    const tresponse = await RPC.doRPC('listtransactions', []);

    const ttxlist = tresponse.result.map(tx => {
      const transaction = new Transaction();
      transaction.address = tx.address;
      transaction.type = tx.category;
      transaction.amount = tx.amount;
      transaction.confirmations = tx.confirmations;
      transaction.txid = tx.txid;
      transaction.time = tx.time;

      return transaction;
    });

    this.fnSetTransactionsList(ttxlist);

    // Now get Z txns
    const zaddresses = await RPC.doRPC('z_listaddresses', []);

    const alltxnsPromise = zaddresses.result.map(async zaddr => {
      // For each zaddr, get the list of incoming transactions
      const incomingTxns = await RPC.doRPC('z_listreceivedbyaddress', [zaddr]);
      const txns = incomingTxns.result
        .filter(itx => !itx.change)
        .map(incomingTx => {
          return {
            address: zaddr,
            txid: incomingTx.txid,
            memo: incomingTx.memo,
            amount: incomingTx.amount
          };
        });

      return txns;
    });

    const alltxns = (await Promise.all(alltxnsPromise)).flat();

    // Now, for each tx in the array, call gettransaction
    const ztxlist = await Promise.all(
      alltxns.map(async tx => {
        const txresponse = await RPC.doRPC('gettransaction', [tx.txid]);

        const transaction = new Transaction();
        transaction.address = tx.address;
        transaction.type = 'receive';
        transaction.amount = tx.amount;
        transaction.confirmations = txresponse.result.confirmations;
        transaction.txid = tx.txid;
        transaction.time = txresponse.result.time;

        return transaction;
      })
    );

    // Now concat the t and z transactions, and call the update function again
    const alltxlist = ttxlist.concat(ztxlist).sort((tx1, tx2) => {
      if (tx1.confirmations === tx2.confirmations) {
        return tx1.time - tx2.time;
      }
      return tx1.confirmations - tx2.confirmations;
    });

    this.fnSetTransactionsList(alltxlist);
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
