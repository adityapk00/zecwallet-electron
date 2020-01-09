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
  static idCounter: number = 0;

  id: number;

  to: string;

  amount: number;

  memo: string;

  constructor() {
    // eslint-disable-next-line no-plusplus
    this.id = ToAddr.idCounter++;
  }
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
      <div className={[cstyles.well, cstyles.verticalflex].join(' ')}>
        <div className={[cstyles.sublight].join(' ')}>To</div>
        <input type="text" className={styles.inputbox} />
        <Spacer />
        <div className={[cstyles.sublight].join(' ')}>Amount</div>
        <input type="text" className={styles.inputbox} />
        <Spacer />
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

    const customStyles = {
      option: (provided, state) => ({
        ...provided,
        color: state.isSelected ? '#c3921f;' : 'white',
        background: '#212124;',
        padding: 20
      }),
      menu: provided => ({
        ...provided,
        background: '#212124;'
      }),
      control: () => ({
        // none of react-select's styles are passed to <Control />
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'flex',
        background: '#212124;'
      }),
      singleValue: (provided, state) => {
        const opacity = state.isDisabled ? 0.5 : 1;
        const transition = 'opacity 300ms';

        return { ...provided, opacity, transition, color: '#ffffff' };
      }
    };

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
            <div className={[cstyles.well, cstyles.verticalflex].join(' ')}>
              <div className={[cstyles.sublight].join(' ')}>Send From</div>
              <Select options={options} styles={customStyles} />
            </div>

            <Spacer />

            <div className={styles.toaddrcontainer} style={{ height }}>
              {// eslint-disable-next-line react/destructuring-assignment
              this.state.toaddrs.map(toaddr => {
                return <ToAddrBox key={toaddr.id} />;
              })}
              <div style={{ textAlign: 'right' }}>
                <button type="button" onClick={this.addToAddr}>
                  +
                </button>
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
