/* eslint-disable react/prop-types */
/* eslint-disable max-classes-per-file */
// @flow
import React, { PureComponent } from 'react';
import Modal from 'react-modal';
import Select from 'react-select';
import styles from './Send.css';
import cstyles from './Common.css';
import { ToAddr, AddressBalance, SendPageState, Info } from './AppState';
import Sidebar from './Sidebar';
import Utils from '../utils/utils';
import ScrollPane from './ScrollPane';

type OptionType = {
  value: string,
  label: string
};

class SendState {
  modalIsOpen: boolean;

  constructor() {
    this.modalIsOpen = false;
  }
}

const Spacer = () => {
  return <div style={{ marginTop: '24px' }} />;
};

// $FlowFixMe
const ToAddrBox = ({ toaddr, updateToField }) => {
  return (
    <div>
      <div className={[cstyles.well, cstyles.verticalflex].join(' ')}>
        <div className={[cstyles.sublight].join(' ')}>To</div>
        <input
          type="text"
          className={styles.inputbox}
          value={toaddr.to}
          onChange={e => updateToField(toaddr.id, e, null, null)}
        />
        <Spacer />
        <div className={[cstyles.sublight].join(' ')}>Amount</div>
        <input
          type="text"
          className={styles.inputbox}
          value={toaddr.amount}
          onChange={e => updateToField(toaddr.id, null, e, null)}
        />
        <Spacer />
      </div>
      <Spacer />
    </div>
  );
};

type Props = {
  addressesWithBalance: AddressBalance[],

  sendPageState: SendPageState,

  setSendPageState: (sendPageState: SendPageState) => void,

  info: Info
};

export default class Send extends PureComponent<Props, SendState> {
  constructor(props: Props) {
    super(props);

    this.state = new SendState();
  }

  addToAddr = () => {
    const { sendPageState, setSendPageState } = this.props;
    const newToAddrs = sendPageState.toaddrs.concat(
      new ToAddr(Utils.getNextToAddrID())
    );

    // Create the new state object
    const newState = new SendPageState();
    newState.fromaddr = sendPageState.fromaddr;
    newState.toaddrs = newToAddrs;

    setSendPageState(newState);
  };

  clearToAddrs = () => {
    const { sendPageState, setSendPageState } = this.props;
    const newToAddrs = [new ToAddr(Utils.getNextToAddrID())];

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

  updateToField = (
    id: number,
    address: Event | null,
    amount: Event | null,
    memo: Event | null
  ) => {
    const { sendPageState, setSendPageState } = this.props;

    const newToAddrs = sendPageState.toaddrs.slice(0);
    // Find the correct toAddr
    const toAddr = newToAddrs.find(a => a.id === id);
    if (address) {
      // $FlowFixMe
      toAddr.to = address.target.value;
    }

    if (amount) {
      // $FlowFixMe
      toAddr.amount = amount.target.value;
    }

    if (memo) {
      // $FlowFixMe
      toAddr.memo = memo.target.value;
    }

    // Create the new state object
    const newState = new SendPageState();
    newState.fromaddr = sendPageState.fromaddr;
    newState.toaddrs = newToAddrs;

    setSendPageState(newState);
  };

  openModal = () => {
    this.setState({ modalIsOpen: true });
  };

  closeModal = () => {
    this.setState({ modalIsOpen: false });
  };

  // Create the z_sendmany structure
  getSendManyJSON = () => {
    const { sendPageState } = this.props;

    const json = [];
    json.push(sendPageState.fromaddr);
    json.push(
      sendPageState.toaddrs.map(to => {
        return { address: to.to, amount: to.amount };
      })
    );

    console.log(json);
  };

  getLabelForFromAddress = (
    addr: string,
    addressesWithBalance: AddressBalance[],
    currencyName: string
  ) => {
    // Find the addr in addressesWithBalance
    const addressBalance: AddressBalance = addressesWithBalance.find(
      ab => ab.address === addr
    );

    return `[ ${currencyName} ${addressBalance.balance.toString()} ]
                  ${addr}`;
  };

  render() {
    const { modalIsOpen } = this.state;
    const { sendPageState, info } = this.props;

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
        label: this.getLabelForFromAddress(
          ab.address,
          addressesWithBalance,
          info.currencyName
        )
      };
    });

    // Find the fromaddress
    let fromaddr = {};
    if (sendPageState.fromaddr) {
      fromaddr = {
        value: sendPageState.fromaddr,
        label: this.getLabelForFromAddress(
          sendPageState.fromaddr,
          addressesWithBalance,
          info.currencyName
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

            <ScrollPane offsetHeight={200}>
              {sendPageState.toaddrs.map(toaddr => {
                return (
                  <ToAddrBox
                    key={toaddr.id}
                    toaddr={toaddr}
                    updateToField={this.updateToField}
                  />
                );
              })}
              <div style={{ textAlign: 'right' }}>
                <button type="button" onClick={this.addToAddr}>
                  +
                </button>
              </div>
            </ScrollPane>

            <div className={styles.buttoncontainer}>
              <button
                type="button"
                className={cstyles.primarybutton}
                onClick={this.openModal}
              >
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

            <Modal
              isOpen={modalIsOpen}
              onRequestClose={this.closeModal}
              className={styles.confirmModal}
              overlayClassName={styles.confirmOverlay}
            >
              <span style={{ color: 'pink' }}>
                {sendPageState.fromaddr}
                <br />
                {sendPageState.toaddrs.map(t => (
                  <div key={t.to}>
                    {t.to} : {t.amount}
                  </div>
                ))}
                <button type="button" onClick={this.getSendManyJSON}>
                  Confirm
                </button>
                <button type="button" onClick={this.closeModal}>
                  Cancel
                </button>
              </span>
            </Modal>
          </div>
        </div>
      </div>
    );
  }
}
