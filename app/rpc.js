import axios from 'axios';
import _ from 'underscore';
import {
  TotalBalance,
  AddressBalance,
  Transaction,
  RPCConfig,
  TxDetail
} from './components/AppState';
import Utils from './utils/utils';

const parseMemo = (memoHex: string): string | null => {
  if (!memoHex || memoHex.length < 2) return null;

  // First, check if this is a memo (first byte is less than 'f6' (246))
  if (parseInt(memoHex.substr(0, 2), 16) >= 246) return null;

  // Else, parse as Hex string
  const memo = _.chunk(memoHex.split(''), 2)
    .map(hexChunk => parseInt(hexChunk.join(''), 16))
    .filter(c => c > 0)
    .map(c => String.fromCharCode(c))
    .join('');

  if (memo === '') return null;

  return memo;
};

export default class RPC {
  rpcConfig: RPCConfig;

  fnSetTotalBalance: TotalBalance => void;

  fnSetAddressesWithBalance: (AddressBalance[]) => void;

  fnSetTransactionsList: (Transaction[]) => void;

  fnSetAllAddresses: (string[]) => void;

  fnSetSinglePrivateKey: (string, string) => void;

  timerID: TimerID;

  constructor(
    fnSetTotalBalance: TotalBalance => void,
    fnSetAddressesWithBalance: (AddressBalance[]) => void,
    fnSetTransactionsList: (Transaction[]) => void,
    fnSetAllAddresses: (string[]) => void,
    fnSetSinglePrivateKey: (string, string) => void
  ) {
    this.fnSetTotalBalance = fnSetTotalBalance;
    this.fnSetAddressesWithBalance = fnSetAddressesWithBalance;
    this.fnSetTransactionsList = fnSetTransactionsList;
    this.fnSetAllAddresses = fnSetAllAddresses;
    this.fnSetSinglePrivateKey = fnSetSinglePrivateKey;
  }

  async configure(rpcConfig: RPCConfig) {
    this.rpcConfig = rpcConfig;

    if (!this.timerID) {
      this.timerID = setTimeout(() => this.refresh(), 1000);
    }
  }

  setupNextFetch() {
    this.timerID = setTimeout(() => this.refresh(), 20000);
  }

  static async doRPC(method: string, params: [], rpcConfig: RPCConfig) {
    const { url, username, password } = rpcConfig;
    const response = await axios(url, {
      data: {
        jsonrpc: '2.0',
        id: 'curltest',
        method,
        params
      },
      method: 'POST',
      auth: {
        username,
        password
      }
    });

    return response.data;
  }

  async refresh() {
    const balP = this.fetchTotalBalance();
    const abP = this.fetchTandZAddressesWithBalances();
    const txns = this.fetchTandZTransactions();
    const addrs = this.fetchAllAddresses();

    await balP;
    await abP;
    await txns;
    await addrs;

    // All done, set up next fetch
    console.log('All done, setting up next fetch');
    this.setupNextFetch();
  }

  // This method will get the total balances
  async fetchTotalBalance() {
    const response = await RPC.doRPC('z_gettotalbalance', [0], this.rpcConfig);

    const balance = new TotalBalance();
    balance.total = response.result.total;
    balance.private = response.result.private;
    balance.transparent = response.result.transparent;

    this.fnSetTotalBalance(balance);
  }

  // Fetch a private key for either a t or a z address
  async fetchPrivateKey(address: string) {
    let method = '';
    if (Utils.isZaddr(address)) {
      method = 'z_exportkey';
    } else if (Utils.isTransparent(address)) {
      method = 'dumpprivkey';
    }

    const response = await RPC.doRPC(method, [address], this.rpcConfig);

    this.fnSetSinglePrivateKey(address, response.result);
  }

  // Fetch all addresses and their associated balances
  async fetchTandZAddressesWithBalances() {
    const zresponse = RPC.doRPC('z_listunspent', [], this.rpcConfig);
    const tresponse = RPC.doRPC('listunspent', [], this.rpcConfig);

    // Do the Z addresses
    // response.result has all the unspent notes.
    const unspentNotes = (await zresponse).result;
    const zgroups = _.groupBy(unspentNotes, 'address');
    const zaddresses = Object.keys(zgroups).map(address => {
      const balance = zgroups[address].reduce(
        (prev, obj) => prev + obj.amount,
        0
      );
      return new AddressBalance(address, Number(balance.toFixed(8)));
    });

    // Do the T addresses
    const unspentTXOs = (await tresponse).result;
    const tgroups = _.groupBy(unspentTXOs, 'address');
    const taddresses = Object.keys(tgroups).map(address => {
      const balance = tgroups[address].reduce(
        (prev, obj) => prev + obj.amount,
        0
      );
      return new AddressBalance(address, Number(balance.toFixed(8)));
    });

    const addresses = zaddresses.concat(taddresses);

    this.fnSetAddressesWithBalance(addresses);
  }

  // Fetch all T and Z transactions
  async fetchTandZTransactions() {
    const tresponse = await RPC.doRPC('listtransactions', [], this.rpcConfig);

    const ttxlist = tresponse.result.map(tx => {
      const transaction = new Transaction();
      transaction.address = tx.address;
      transaction.type = tx.category;
      transaction.amount = tx.amount;
      transaction.confirmations = tx.confirmations;
      transaction.txid = tx.txid;
      transaction.time = tx.time;
      transaction.detailedTxns = [new TxDetail()];
      transaction.detailedTxns[0].address = tx.address;
      transaction.detailedTxns[0].amount = tx.amount;

      return transaction;
    });

    // Now get Z txns
    const zaddresses = await RPC.doRPC('z_listaddresses', [], this.rpcConfig);

    const alltxnsPromise = zaddresses.result.map(async zaddr => {
      // For each zaddr, get the list of incoming transactions
      const incomingTxns = await RPC.doRPC(
        'z_listreceivedbyaddress',
        [zaddr],
        this.rpcConfig
      );
      const txns = incomingTxns.result
        .filter(itx => !itx.change)
        .map(incomingTx => {
          return {
            address: zaddr,
            txid: incomingTx.txid,
            memo: parseMemo(incomingTx.memo),
            amount: incomingTx.amount
          };
        });

      return txns;
    });

    const alltxns = (await Promise.all(alltxnsPromise)).flat();

    // Now, for each tx in the array, call gettransaction
    const ztxlist = await Promise.all(
      alltxns.map(async tx => {
        const txresponse = await RPC.doRPC(
          'gettransaction',
          [tx.txid],
          this.rpcConfig
        );

        const transaction = new Transaction();
        transaction.address = tx.address;
        transaction.type = 'receive';
        transaction.amount = tx.amount;
        transaction.confirmations = txresponse.result.confirmations;
        transaction.txid = tx.txid;
        transaction.time = txresponse.result.time;
        transaction.detailedTxns = [new TxDetail()];
        transaction.detailedTxns[0].address = tx.address;
        transaction.detailedTxns[0].amount = tx.amount;
        transaction.detailedTxns[0].memo = tx.memo;

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

  // Get all Addresses, including T and Z addresses
  async fetchAllAddresses() {
    const zaddrsPromise = RPC.doRPC('z_listaddresses', [], this.rpcConfig);
    const taddrsPromise = RPC.doRPC(
      'getaddressesbyaccount',
      [''],
      this.rpcConfig
    );

    const allZ = (await zaddrsPromise).result;
    const allT = (await taddrsPromise).result;

    this.fnSetAllAddresses(allZ.concat(allT));
  }
}
