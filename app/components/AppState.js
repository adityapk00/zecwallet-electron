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
  totalBalance: TotalBalance;

  addressesWithBalance: [AddressBalance];
}
