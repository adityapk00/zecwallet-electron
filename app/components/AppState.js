// eslint-disable-next-line max-classes-per-file
export class Balance {
  transparent: number;

  private: number;

  total: number;

  constructor(total: number) {
    this.total = total;
  }
}

// eslint-disable-next-line max-classes-per-file
export default class AppState {
  balance: Balance;
}
