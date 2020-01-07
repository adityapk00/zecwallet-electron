// eslint-disable-next-line max-classes-per-file
export class Balance {
  transparent: number;

  private: number;

  total: number;

  constructor(total: number) {
    this.total = total;
  }
}

export class Address {
  address: string;

  balance: number;

  constructor(address: string, balance: number) {
    this.address = address;
    this.balance = balance;
  }
}

// eslint-disable-next-line max-classes-per-file
export default class AppState {
  balance: Balance;

  addresses: [Address];
}
