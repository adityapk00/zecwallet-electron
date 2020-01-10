/* eslint-disable max-classes-per-file */
// @flow
import React, { Component } from 'react';
import Select from 'react-select';
import styles from './Send.css';
import cstyles from './Common.css';
import { ToAddr, AddressBalance, SendPageState } from './AppState';
import Sidebar from './Sidebar';
import Utils from '../utils/utils';

type OptionType = {
  value: string,
  label: string
};

class SendState {
  height: number;

  constructor() {
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

type Props = {
  addressesWithBalance: AddressBalance[],

  sendPageState: SendPageState,

  setSendPageState: (sendPageState: SendPageState) => void
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
    const { sendPageState, setSendPageState } = this.props;
    const newToAddrs = sendPageState.toaddrs.concat(new ToAddr());

    // Create the new state object
    const newState = new SendPageState();
    newState.fromaddr = sendPageState.fromaddr;
    newState.toaddrs = newToAddrs;

    setSendPageState(newState);
  };

  clearToAddrs = () => {
    const { sendPageState, setSendPageState } = this.props;
    const newToAddrs = [new ToAddr()];

    // Create the new state object
    const newState = new SendPageState();
    newState.fromaddr = sendPageState.fromaddr;
    newState.toaddrs = newToAddrs;

    setSendPageState(newState);
  };

  changeFrom = (selectedOption: OptionType) => {
    const { sendPageState, setSendPageState } = this.props;

    // Create the new state object
    const newState = new SendPageState();
    newState.fromaddr = selectedOption.value;
    newState.toaddrs = sendPageState.toaddrs;

    setSendPageState(newState);
  };

  updateDimensions() {
    const updateHeight = window.innerHeight - 200; // TODO: This should be the height of the balance box.
    this.setState({ height: updateHeight });
  }

  getLabelForFromAddress = (
    addr: string,
    addressesWithBalance: AddressBalance[]
  ) => {
    // Find the addr in addressesWithBalance
    const addressBalance: AddressBalance = addressesWithBalance.find(
      ab => ab.address === addr
    );

    return `[ ${Utils.CurrencyName()} ${addressBalance.balance.toString()} ]
                  ${addr}`;
  };

  render() {
    const { height } = this.state;
    const { sendPageState } = this.props;

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

    const { addressesWithBalance } = this.props;
    const sendFromList = addressesWithBalance.map(ab => {
      return {
        value: ab.address,
        label: this.getLabelForFromAddress(ab.address, addressesWithBalance)
      };
    });

    // Find the fromaddress
    let fromaddr = {};
    if (sendPageState.fromaddr) {
      fromaddr = {
        value: sendPageState.fromaddr,
        label: this.getLabelForFromAddress(
          sendPageState.fromaddr,
          addressesWithBalance
        )
      };
    }

    return (
      <div style={{ overflow: 'hidden' }}>
        <div style={{ width: '30%', float: 'left' }}>
          <Sidebar />
        </div>
        <div style={{ width: '70%', float: 'right' }}>
          <div className={styles.sendcontainer}>
            <div className={[cstyles.well, cstyles.verticalflex].join(' ')}>
              <div className={[cstyles.sublight].join(' ')}>Send From</div>
              <Select
                value={fromaddr}
                options={sendFromList}
                styles={customStyles}
                // $FlowFixMe
                onChange={this.changeFrom}
              />
            </div>

            <Spacer />

            <div className={styles.toaddrcontainer} style={{ height }}>
              {sendPageState.toaddrs.map(toaddr => {
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
