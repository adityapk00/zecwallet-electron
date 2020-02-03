/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable no-plusplus */
/* eslint-disable react/prop-types */
// @flow
import React, { Component } from 'react';
import Modal from 'react-modal';
import dateformat from 'dateformat';
import escape from 'escape-html';
import styles from './Dashboard.css';
import cstyles from './Common.css';
import { TotalBalance, Transaction, Info } from './AppState';
import ScrollPane from './ScrollPane';
import Utils from '../utils/utils';

// eslint-disable-next-line react/prop-types
const BalanceBlockHighlight = ({ zecValue, usdValue, currencyName }) => {
  const { bigPart, smallPart } = Utils.splitZecAmountIntoBigSmall(zecValue);

  return (
    <div style={{ padding: '1em' }}>
      <div className={[cstyles.highlight, cstyles.xlarge].join(' ')}>
        <span>
          {currencyName} {bigPart}
        </span>
        <span className={[cstyles.small, styles.zecsmallpart].join(' ')}>{smallPart}</span>
      </div>
      <div className={[cstyles.sublight, cstyles.small].join(' ')}>{usdValue}</div>
    </div>
  );
};

// eslint-disable-next-line react/prop-types
const BalanceBlock = ({ zecValue, usdValue, topLabel, currencyName }) => {
  const { bigPart, smallPart } = Utils.splitZecAmountIntoBigSmall(zecValue);

  return (
    <div className={cstyles.padall}>
      <div className={[styles.sublight, styles.small].join(' ')}>{topLabel}</div>
      <div className={[cstyles.highlight, cstyles.large].join(' ')}>
        <span>
          {currencyName} {bigPart}
        </span>
        <span className={[cstyles.small, styles.zecsmallpart].join(' ')}>{smallPart}</span>
      </div>
      <div className={[cstyles.sublight, cstyles.small].join(' ')}>{usdValue}</div>
    </div>
  );
};

const TxItemBlock = ({ transaction, currencyName, zecPrice, txClicked }) => {
  const txDate = new Date(transaction.time * 1000);
  const datePart = dateformat(txDate, 'mmm dd, yyyy');
  const timePart = dateformat(txDate, 'hh:MM tt');

  return (
    <div>
      <div className={[cstyles.small, cstyles.sublight, styles.txdate].join(' ')}>{datePart}</div>
      <div
        className={[cstyles.well, styles.txbox].join(' ')}
        onClick={() => {
          txClicked(transaction);
        }}
      >
        <div className={styles.txtype}>
          <div>{transaction.type}</div>
          <div className={[cstyles.padtopsmall, cstyles.sublight].join(' ')}>{timePart}</div>
        </div>
        {transaction.detailedTxns.map(txdetail => {
          const { bigPart, smallPart } = Utils.splitZecAmountIntoBigSmall(Math.abs(txdetail.amount));

          let { address } = txdetail;
          let { memo } = txdetail;
          if (memo) {
            memo = escape(memo);
          }

          if (!address) {
            address = '(Shielded)';
          }

          return (
            <div key={address} className={styles.txaddressamount}>
              <div className={styles.txaddress}>
                <div className={cstyles.highlight}>&quot;Label&quot;</div>
                <div className={cstyles.fixedfont}>{Utils.splitStringIntoChunks(address, 6).join(' ')}</div>
                <div className={[cstyles.small, cstyles.sublight, cstyles.padtopsmall, styles.txmemo].join(' ')}>
                  {memo}
                </div>
              </div>
              <div className={[styles.txamount].join(' ')}>
                <div>
                  <span>
                    {currencyName} {bigPart}
                  </span>
                  <span className={[cstyles.small, styles.zecsmallpart].join(' ')}>{smallPart}</span>
                </div>
                <div className={[cstyles.sublight, cstyles.small, cstyles.padtopsmall].join(' ')}>
                  {Utils.getZecToUsdString(zecPrice, Math.abs(txdetail.amount))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TxModal = ({ modalIsOpen, tx, closeModal, currencyName }) => {
  let txid = '';
  let type = '';
  let typeIcon = '';
  let typeColor = '';
  let confirmations = 0;
  let detailedTxns = [];
  let amount = 0;
  let datePart = '';
  let timePart = '';

  if (tx) {
    txid = tx.txid;
    type = tx.type;
    if (tx.type === 'receive') {
      typeIcon = 'fa-arrow-circle-down';
      typeColor = 'green';
    } else {
      typeIcon = 'fa-arrow-circle-up';
      typeColor = 'red';
    }

    datePart = dateformat(tx.time * 1000, 'mmm dd, yyyy');
    timePart = dateformat(tx.time * 1000, 'hh:MM tt');

    confirmations = tx.confirmations;
    detailedTxns = tx.detailedTxns;
    amount = Math.abs(tx.amount);
  }

  return (
    <Modal
      isOpen={modalIsOpen}
      onRequestClose={closeModal}
      className={styles.txmodal}
      overlayClassName={styles.txmodalOverlay}
    >
      <div className={[cstyles.verticalflex].join(' ')}>
        <div className={[cstyles.marginbottomlarge, cstyles.center].join(' ')}>Transaction Status</div>

        <div className={[cstyles.center].join(' ')}>
          <i className={['fas', typeIcon].join(' ')} style={{ fontSize: '96px', color: typeColor }} />
        </div>

        <div className={[cstyles.center].join(' ')}>
          {type}
          <BalanceBlockHighlight zecValue={amount} usdValue={12.12} currencyName={currencyName} />
        </div>

        <div className={[cstyles.flexspacebetween].join(' ')}>
          <div>
            <div className={[cstyles.sublight].join(' ')}>Time</div>
            <div>
              {datePart} {timePart}
            </div>
          </div>
          <div>
            <div className={[cstyles.sublight].join(' ')}>Confirmations</div>
            <div>{confirmations}</div>
          </div>
        </div>

        <div className={cstyles.margintoplarge} />

        <div className={[cstyles.sublight].join(' ')}>TXID</div>
        <div>{txid}</div>

        <div className={cstyles.margintoplarge} />

        {detailedTxns.map(txdetail => {
          const { bigPart, smallPart } = Utils.splitZecAmountIntoBigSmall(Math.abs(txdetail.amount));

          let { address, memo } = txdetail;
          if (memo) {
            memo = escape(memo);
          }

          if (!address) {
            address = '(Shielded)';
          }

          return (
            <div key={address} className={cstyles.verticalflex}>
              <div className={[cstyles.sublight].join(' ')}>Address</div>
              <div className={cstyles.fixedfont}>{Utils.splitStringIntoChunks(address, 6).join(' ')}</div>

              <div className={cstyles.margintoplarge} />

              <div className={[cstyles.sublight].join(' ')}>Amount</div>
              <div>
                <span>
                  {currencyName} {bigPart}
                </span>
                <span className={[cstyles.small, styles.zecsmallpart].join(' ')}>{smallPart}</span>
              </div>

              <div className={cstyles.margintoplarge} />

              {memo && (
                <div>
                  <div className={[cstyles.sublight].join(' ')}>Memo</div>
                  <div>{memo}</div>
                </div>
              )}
            </div>
          );
        })}

        <div className={cstyles.center}>
          <button type="button" className={cstyles.primarybutton} onClick={closeModal}>
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

type Props = {
  totalBalance: TotalBalance,
  transactions: Transaction[],
  info: Info
};

type State = {
  clickedTx: Transaction | null,
  modalIsOpen: boolean
};

export default class Home extends Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = { clickedTx: null, modalIsOpen: false };
  }

  txClicked = (tx: Transaction) => {
    // Show the modal
    if (!tx) return;
    console.log(tx);
    this.setState({ clickedTx: tx, modalIsOpen: true });
  };

  closeModal = () => {
    this.setState({ clickedTx: null, modalIsOpen: false });
  };

  render() {
    const { totalBalance, transactions, info } = this.props;

    const { clickedTx, modalIsOpen } = this.state;

    return (
      <div>
        <div className={[cstyles.xlarge, cstyles.padall, cstyles.center].join(' ')}>Dashboard</div>
        <div className={[cstyles.well, styles.balancebox].join(' ')}>
          <BalanceBlockHighlight
            zecValue={totalBalance.total}
            usdValue={Utils.getZecToUsdString(info.zecPrice, totalBalance.total)}
            currencyName={info.currencyName}
          />
          <BalanceBlock
            topLabel="Shileded"
            zecValue={totalBalance.private}
            usdValue={Utils.getZecToUsdString(info.zecPrice, totalBalance.private)}
            currencyName={info.currencyName}
          />
          <BalanceBlock
            topLabel="Transparent"
            zecValue={totalBalance.transparent}
            usdValue={Utils.getZecToUsdString(info.zecPrice, totalBalance.transparent)}
            currencyName={info.currencyName}
          />
        </div>
        {/* Change the hardcoded height */}
        <ScrollPane offsetHeight={250}>
          {/* If no transactions, show the "loading..." text */
          transactions.length === 0 && (
            <div className={[cstyles.center, cstyles.margintoplarge].join(' ')}>Loading...</div>
          )}
          {transactions.map(t => {
            const key = t.type + t.txid + t.address;
            return (
              <TxItemBlock
                key={key}
                transaction={t}
                currencyName={info.currencyName}
                zecPrice={info.zecPrice}
                txClicked={this.txClicked}
              />
            );
          })}
        </ScrollPane>

        <TxModal
          modalIsOpen={modalIsOpen}
          tx={clickedTx}
          closeModal={this.closeModal}
          currencyName={info.currencyName}
        />
      </div>
    );
  }
}
