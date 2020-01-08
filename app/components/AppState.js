// eslint-disable-next-line max-classes-per-file
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

  constructor(total: number) {
    this.total = total;
  }
}

export class AddressBalance {
  address: string;

  balance: number;

  constructor(address: string, balance: number) {
    this.address = address;
    this.balance = balance;
  }
}

// eslint-disable-next-line max-classes-per-file
export default class AppState {
  // The total confirmed and unconfirmed balance in this wallet
  totalBalance: TotalBalance;

  // The list of all t and z addresses that have a current balance. That is, the list of
  // addresses that have a (confirmed or unconfirmed) UTXO or note pending.
  addressesWithBalance: [AddressBalance];

  // List of all addresses in the wallet, including change addresses and addresses
  // that don't have any balance or are unused
  addresses: [string];
}
