/* eslint-disable max-classes-per-file */

export class TotalBalance {
  // Total t address, confirmed
  transparent: number;

  // Total t address, unconfirmed
  unconfirmedTransparent: number;

  // Total private, confirmed + spendable
  private: number;

  // Total private, unconfirmed or not spendable
  unconfirmedPrivate: number;

  // Total confirmed + spendable
  total: number;
}

export class AddressBalance {
  address: string;

  balance: number;

  constructor(address: string, balance: number) {
    this.address = address;
    this.balance = balance;
  }
}

// List of transactions. TODO: Handle memos, multiple addresses etc...
export class Transaction {
  address: string;

  type: string;

  amount: number;

  confirmations: number;

  txid: string;

  time: number;
}

export class ToAddr {
  id: number;

  to: string;

  amount: number;

  memo: string;

  constructor(id: number) {
    // eslint-disable-next-line no-plusplus
    this.id = id;
  }
}

export class SendPageState {
  fromaddr: string;

  toaddrs: ToAddr[];

  constructor() {
    this.fromaddr = '';
    this.toaddrs = [];
  }
}

export class RPCConfig {
  url: string;

  username: string;

  password: string;

  constructor() {
    this.username = '';
    this.password = '';
    this.url = '';
  }
}

// eslint-disable-next-line max-classes-per-file
export default class AppState {
  // The total confirmed and unconfirmed balance in this wallet
  totalBalance: TotalBalance;

  // The list of all t and z addresses that have a current balance. That is, the list of
  // addresses that have a (confirmed or unconfirmed) UTXO or note pending.
  addressesWithBalance: AddressBalance[];

  // List of all addresses in the wallet, including change addresses and addresses
  // that don't have any balance or are unused
  addresses: string[];

  // List of all T and Z transactions
  transactions: Transaction[];

  // The state of the send page, as the user constructs a transaction
  sendPageState: SendPageState;

  // The Current configuration of the RPC params
  rpcConfig: RPCConfig;
}
