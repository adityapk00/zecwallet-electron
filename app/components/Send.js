/* eslint-disable max-classes-per-file */
// @flow
import React, { Component } from 'react';
import Select from 'react-select';
import styles from './Send.css';
import cstyles from './Common.css';
import type State from './AppState';
import Sidebar from './Sidebar';

type Props = State;

class ToAddr {
  to: string;

  amount: number;

  memo: string;
}

class SendState {
  toaddrs: ToAddr[];

  height: number;

  constructor() {
    this.toaddrs = [new ToAddr()];
    this.height = 0;
  }
}

const Spacer = () => {
  return <div style={{ marginTop: '24px' }} />;
};

const ToAddrBox = () => {
  return (
    <div>
      <div className={cstyles.well}>
        <div className={[cstyles.sublight].join(' ')}>To</div>
        <input type="text" className={styles.inputbox} />
        <Spacer />
        <div className={[cstyles.sublight].join(' ')}>Amount</div>
        <input type="text" className={styles.inputbox} />
      </div>
      <Spacer />
    </div>
  );
};

export default class Send extends Component<Props, SendState> {
  constructor(props: Props) {
    super(props);

    this.state = new SendState();
  }

  componentDidMount() {
    this.updateDimensions();
    window.addEventListener('resize', this.updateDimensions.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDimensions.bind(this));
  }

  addToAddr = () => {
    const { state } = this;
    const newToAddrs = state.toaddrs.concat(new ToAddr());

    this.setState({ toaddrs: newToAddrs });
  };

  clearToAddrs = () => {
    this.setState({ toaddrs: [new ToAddr()] });
  };

  updateDimensions() {
    const updateHeight = window.innerHeight - 200; // TODO: This should be the height of the balance box.
    this.setState({ height: updateHeight });
  }

  render() {
    const { height } = this.state;

    const options = [
      { value: 'chocolate', label: 'Chocolate' },
      { value: 'strawberry', label: 'Strawberry' },
      { value: 'vanilla', label: 'Vanilla' }
    ];

    return (
      <div style={{ overflow: 'hidden' }}>
        <div style={{ width: '30%', float: 'left' }}>
          <Sidebar />
        </div>
        <div style={{ width: '70%', float: 'right' }}>
          <div className={styles.sendcontainer}>
            <div className={cstyles.wellnooverflow}>
              <div className={[cstyles.sublight].join(' ')}>Send From</div>
              <Select options={options} classNamePrefix="from-address" />
            </div>

            <Spacer />

            <div className={styles.toaddrcontainer} style={{ height }}>
              {// eslint-disable-next-line react/destructuring-assignment
              this.state.toaddrs.map((toaddr, index) => {
                // eslint-disable-next-line react/no-array-index-key
                return <ToAddrBox key={index} />;
              })}
              <div style={{ textAlign: 'right' }}>
                <button type="button" onClick={this.addToAddr}>+</button>
              </div>
            </div>

            <div className={styles.buttoncontainer}>
              <button type="button" className={cstyles.primarybutton}>
                Send
              </button>
              <button
                type="button"
                className={cstyles.primarybutton}
                onClick={this.clearToAddrs}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
