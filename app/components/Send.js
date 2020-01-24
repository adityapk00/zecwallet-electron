/* eslint-disable radix */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/prop-types */
/* eslint-disable max-classes-per-file */
// @flow
import React, { PureComponent } from 'react';
import Modal from 'react-modal';
import Select from 'react-select';
import escape from 'escape-html';
import styles from './Send.css';
import cstyles from './Common.css';
import { ToAddr, AddressBalance, SendPageState, Info } from './AppState';
import Sidebar from './Sidebar';
import Utils from '../utils/utils';
import ScrollPane from './ScrollPane';
import ArrowUpLight from '../assets/img/arrow_up_dark.png';

type OptionType = {
  value: string,
  label: string
};

class SendState {
  modalIsOpen: boolean;

  errorModalIsOpen: boolean;

  errorModalTitle: string;

  errorModalBody: string;

  constructor() {
    this.modalIsOpen = false;
    this.errorModalIsOpen = false;
    this.errorModalBody = '';
    this.errorModalTitle = '';
  }
}

const Spacer = () => {
  return <div style={{ marginTop: '24px' }} />;
};

// $FlowFixMe
const ToAddrBox = ({
  toaddr,
  updateToField,
  setMaxAmount,
  totalAmountAvailable
}) => {
  const isMemoDisabled = !Utils.isZaddr(toaddr.to);

  return (
    <div>
      <div className={[cstyles.well, cstyles.verticalflex].join(' ')}>
        <div className={[cstyles.flexspacebetween].join(' ')}>
          <div className={cstyles.sublight}>To</div>
          <div className={cstyles.validationerror}>Address Validation</div>
        </div>
        <input
          type="text"
          className={styles.inputbox}
          value={toaddr.to}
          onChange={e => updateToField(toaddr.id, e, null, null)}
        />
        <Spacer />
        <div className={[cstyles.flexspacebetween].join(' ')}>
          <div className={cstyles.sublight}>Amount</div>
          <div className={cstyles.validationerror}>Amount Validation</div>
        </div>
        <div className={[cstyles.flexspacebetween].join(' ')}>
          <input
            type="text"
            className={styles.inputbox}
            value={toaddr.amount}
            onChange={e => updateToField(toaddr.id, null, e, null)}
          />
          <img
            className={styles.toaddrbutton}
            src={ArrowUpLight}
            alt="Max"
            onClick={() => setMaxAmount(toaddr.id, totalAmountAvailable)}
          />
        </div>
        <Spacer />
        <div className={[cstyles.flexspacebetween].join(' ')}>
          <div className={cstyles.sublight}>Memo</div>
          <div className={cstyles.validationerror}>
            {toaddr.memo.length} / 512
          </div>
        </div>
        <input
          type="text"
          className={styles.inputbox}
          value={isMemoDisabled ? '<Memos only for z-addresses>' : toaddr.memo}
          disabled={isMemoDisabled}
          onChange={e => updateToField(toaddr.id, null, null, e)}
        />
        <Spacer />
      </div>
      <Spacer />
    </div>
  );
};

function getSendManyJSON(sendPageState: SendPageState): [] {
  const json = [];
  json.push(sendPageState.fromaddr);
  json.push(
    sendPageState.toaddrs.map(to => {
      return { address: to.to, amount: to.amount };
    })
  );

  return json;
}

const ErrorModal = ({ title, body, modalIsOpen, closeModal }) => {
  return (
    <Modal
      isOpen={modalIsOpen}
      onRequestClose={closeModal}
      className={styles.confirmModal}
      overlayClassName={styles.confirmOverlay}
    >
      <div className={[cstyles.verticalflex].join(' ')}>
        <div
          className={cstyles.marginbottomlarge}
          style={{ textAlign: 'center' }}
        >
          {title}
        </div>

        <div className={cstyles.well} style={{ textAlign: 'center' }}>
          {body}
        </div>
      </div>

      <div className={styles.buttoncontainer}>
        <button
          type="button"
          className={cstyles.primarybutton}
          onClick={closeModal}
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

const ConfirmModalToAddr = ({ toaddr, info }) => {
  const { bigPart, smallPart } = Utils.splitZecAmountIntoBigSmall(
    toaddr.amount
  );

  const memo: string = toaddr.memo ? escape(toaddr.memo) : '';

  return (
    <div className={cstyles.well}>
      <div
        className={[cstyles.flexspacebetween, cstyles.margintoplarge].join(' ')}
      >
        <div
          className={[
            cstyles.small,
            cstyles.fixedfont,
            styles.confirmModalAddress
          ].join(' ')}
        >
          {Utils.splitStringIntoChunks(toaddr.to, 6).join(' ')}
        </div>
        <div className={cstyles.large}>
          <div>
            <span>
              {info.currencyName} {bigPart}
            </span>
            <span className={[cstyles.small, styles.zecsmallpart].join(' ')}>
              {smallPart}
            </span>
          </div>
        </div>
      </div>
      <div className={cstyles.sublight}>{memo}</div>
    </div>
  );
};

const ConfirmModal = ({
  sendPageState,
  info,
  sendTransaction,
  clearToAddrs,
  closeModal,
  modalIsOpen,
  openErrorModal
}) => {
  const sendingTotal =
    sendPageState.toaddrs.reduce(
      (s, t) => parseFloat(s) + parseFloat(t.amount),
      0.0
    ) + 0.0001;
  const { bigPart, smallPart } = Utils.splitZecAmountIntoBigSmall(sendingTotal);

  const sendButton = () => {
    (async () => {
      const sendJson = getSendManyJSON(sendPageState);
      let success = false;

      try {
        success = await sendTransaction(sendJson, openErrorModal);
      } catch (err) {
        // If there was an error, show the error modal
        openErrorModal('Error Sending Transaction', err);
      }

      if (success) {
        clearToAddrs();
      }

      closeModal();
    })();
  };

  return (
    <Modal
      isOpen={modalIsOpen}
      onRequestClose={closeModal}
      className={styles.confirmModal}
      overlayClassName={styles.confirmOverlay}
    >
      <div className={[cstyles.verticalflex].join(' ')}>
        <div
          className={cstyles.marginbottomlarge}
          style={{ textAlign: 'center' }}
        >
          Confirm Transaction
        </div>
        <div className={cstyles.flex}>
          <div
            className={[
              cstyles.highlight,
              cstyles.xlarge,
              cstyles.flexspacebetween,
              cstyles.well,
              cstyles.maxwidth
            ].join(' ')}
          >
            <div>Total</div>
            <div>
              <span>
                {info.currencyName} {bigPart}
              </span>
              <span className={[cstyles.small, styles.zecsmallpart].join(' ')}>
                {smallPart}
              </span>
            </div>
          </div>
        </div>

        <div
          className={[cstyles.verticalflex, cstyles.margintoplarge].join(' ')}
        >
          {sendPageState.toaddrs.map(t => (
            <ConfirmModalToAddr key={t.to} toaddr={t} info={info} />
          ))}
        </div>

        <ConfirmModalToAddr
          toaddr={{ to: 'Fee', amount: 0.0001, memo: null }}
          info={info}
        />

        <div className={styles.buttoncontainer}>
          <button
            type="button"
            className={cstyles.primarybutton}
            onClick={() => sendButton()}
          >
            Send
          </button>
          <button
            type="button"
            className={cstyles.primarybutton}
            onClick={closeModal}
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};

type Props = {
  addressesWithBalance: AddressBalance[],

  sendPageState: SendPageState,

  sendTransaction: (sendJson: [], (string, string) => void) => void,

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

  setMaxAmount = (id: number, total: number) => {
    const { sendPageState, setSendPageState } = this.props;

    const newToAddrs = sendPageState.toaddrs.slice(0);

    let totalOtherAmount: number = newToAddrs
      .filter(a => a.id !== id)
      .reduce((s, a) => parseFloat(s) + parseFloat(a.amount), 0);

    // Add Fee
    totalOtherAmount += 0.0001;

    // Find the correct toAddr
    const toAddr = newToAddrs.find(a => a.id === id);
    toAddr.amount = total - totalOtherAmount;
    if (toAddr.amount < 0) toAddr.amount = 0;
    toAddr.amount = Utils.maxPrecision(toAddr.amount);

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

  openErrorModal = (title: string, body: string) => {
    this.setState({ errorModalIsOpen: true });
    this.setState({ errorModalTitle: title });
    this.setState({ errorModalBody: body });
  };

  closeErrorModal = () => {
    this.setState({ errorModalIsOpen: false });
  };

  getBalanceForAddress = (
    addr: string,
    addressesWithBalance: AddressBalance[]
  ): number => {
    // Find the addr in addressesWithBalance
    const addressBalance: AddressBalance = addressesWithBalance.find(
      ab => ab.address === addr
    );

    if (!addressBalance) {
      return 0;
    }

    return addressBalance.balance;
  };

  getLabelForFromAddress = (
    addr: string,
    addressesWithBalance: AddressBalance[],
    currencyName: string
  ) => {
    // Find the addr in addressesWithBalance
    const balance = this.getBalanceForAddress(addr, addressesWithBalance);

    return `[ ${currencyName} ${balance.toString()} ] ${addr}`;
  };

  render() {
    const {
      modalIsOpen,
      errorModalIsOpen,
      errorModalTitle,
      errorModalBody
    } = this.state;
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

    const { addressesWithBalance, sendTransaction } = this.props;
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

    const totalAmountAvailable = this.getBalanceForAddress(
      fromaddr.value,
      addressesWithBalance
    );

    return (
      <div style={{ overflow: 'hidden' }}>
        <div className={cstyles.sidebarcontainer}>
          <Sidebar info={info} />
        </div>
        <div className={cstyles.contentcontainer}>
          <div
            className={[cstyles.xlarge, cstyles.padall, cstyles.center].join(
              ' '
            )}
          >
            Send
          </div>

          <div className={styles.sendcontainer}>
            <div className={[cstyles.well, cstyles.verticalflex].join(' ')}>
              <div
                className={[cstyles.sublight, cstyles.padbottomsmall].join(' ')}
              >
                Send From
              </div>
              <Select
                value={fromaddr}
                options={sendFromList}
                styles={customStyles}
                // $FlowFixMe
                onChange={this.changeFrom}
              />
            </div>

            <Spacer />

            <ScrollPane offsetHeight={300}>
              {sendPageState.toaddrs.map(toaddr => {
                return (
                  <ToAddrBox
                    key={toaddr.id}
                    toaddr={toaddr}
                    updateToField={this.updateToField}
                    setMaxAmount={this.setMaxAmount}
                    totalAmountAvailable={totalAmountAvailable}
                  />
                );
              })}
              <div style={{ textAlign: 'right' }}>
                <button type="button" onClick={this.addToAddr}>
                  <i className={['fas', 'fa-plus'].join(' ')} />
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

            <ConfirmModal
              sendPageState={sendPageState}
              info={info}
              sendTransaction={sendTransaction}
              openErrorModal={this.openErrorModal}
              closeModal={this.closeModal}
              modalIsOpen={modalIsOpen}
              clearToAddrs={this.clearToAddrs}
            />

            <ErrorModal
              title={errorModalTitle}
              body={errorModalBody}
              modalIsOpen={errorModalIsOpen}
              closeModal={this.closeErrorModal}
            />
          </div>
        </div>
      </div>
    );
  }
}
