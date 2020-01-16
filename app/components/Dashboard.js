/* eslint-disable no-plusplus */
/* eslint-disable react/prop-types */
// @flow
import React, { PureComponent } from 'react';
import dateformat from 'dateformat';
import styles from './Dashboard.css';
import cstyles from './Common.css';
import { TotalBalance, Transaction, Info } from './AppState';
import Sidebar from './Sidebar';
import ScrollPane from './ScrollPane';
import Utils from '../utils/utils';

// eslint-disable-next-line react/prop-types
const BalanceBlockHighlight = ({ zecValue, usdValue, currencyName }) => {
  const { bigPart, smallPart } = Utils.splitZecAmountIntoBigSmall(zecValue);

  return (
    <div style={{ float: 'left', padding: '1em' }}>
      <div className={[cstyles.highlight, cstyles.xlarge].join(' ')}>
        <span>
          {currencyName} {bigPart}
        </span>
        <span className={[cstyles.small, styles.zecsmallpart].join(' ')}>
          {smallPart}
        </span>
      </div>
      <div className={[cstyles.sublight, cstyles.small].join(' ')}>
        USD {usdValue}
      </div>
    </div>
  );
};

// eslint-disable-next-line react/prop-types
const BalanceBlock = ({ zecValue, usdValue, topLabel, currencyName }) => {
  const { bigPart, smallPart } = Utils.splitZecAmountIntoBigSmall(zecValue);

  return (
    <div className={cstyles.padall}>
      <div className={[styles.sublight, styles.small].join(' ')}>
        {topLabel}
      </div>
      <div className={[cstyles.highlight, cstyles.large].join(' ')}>
        <span>
          {currencyName} {bigPart}
        </span>
        <span className={[cstyles.small, styles.zecsmallpart].join(' ')}>
          {smallPart}
        </span>
      </div>
      <div className={[cstyles.sublight, cstyles.small].join(' ')}>
        USD {usdValue}
      </div>
    </div>
  );
};

const TxItemBlock = ({ transaction, currencyName }) => {
  const txDate = new Date(transaction.time * 1000);
  const datePart = dateformat(txDate, 'mmm dd, yyyy');
  const timePart = dateformat(txDate, 'hh:MM tt');

  return (
    <div>
      <div
        className={[cstyles.small, cstyles.sublight, styles.txdate].join(' ')}
      >
        {datePart}
      </div>
      <div className={[cstyles.well, styles.txbox].join(' ')}>
        <div className={styles.txtype}>
          <div>{transaction.type}</div>
          <div className={[cstyles.padtopsmall, cstyles.sublight].join(' ')}>
            {timePart}
          </div>
        </div>
        {transaction.detailedTxns.map(txdetail => {
          const { bigPart, smallPart } = Utils.splitZecAmountIntoBigSmall(
            Math.abs(txdetail.amount)
          );

          let { address } = txdetail;
          const { memo } = txdetail;

          if (!address) {
            address = '(Shielded)';
          }

          return (
            <div key={address} className={styles.txaddressamount}>
              <div className={styles.txaddress}>
                <div className={cstyles.highlight}>&quot;Label&quot;</div>
                <div className={cstyles.fixedfont}>
                  {Utils.splitStringIntoChunks(address, 6).join(' ')}
                </div>
                <div
                  className={[
                    cstyles.small,
                    cstyles.sublight,
                    cstyles.padtopsmall,
                    styles.txmemo
                  ].join(' ')}
                >
                  {memo}
                </div>
              </div>
              <div className={[styles.txamount].join(' ')}>
                <div>
                  <span>
                    {currencyName} {bigPart}
                  </span>
                  <span
                    className={[cstyles.small, styles.zecsmallpart].join(' ')}
                  >
                    {smallPart}
                  </span>
                </div>
                <div
                  className={[
                    cstyles.sublight,
                    cstyles.small,
                    cstyles.padtopsmall
                  ].join(' ')}
                >
                  USD 12.12
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

type Props = {
  totalBalance: TotalBalance,
  transactions: Transaction[],
  info: Info
};

export default class Home extends PureComponent<Props> {
  render() {
    const { totalBalance, transactions, info } = this.props;

    return (
      <div style={{ overflow: 'hidden' }}>
        <div style={{ width: '30%', float: 'left' }}>
          <Sidebar />
        </div>
        <div style={{ width: '70%', float: 'right' }}>
          <div className={[cstyles.well, styles.balancebox].join(' ')}>
            <BalanceBlockHighlight
              zecValue={totalBalance.total}
              usdValue="12.12"
              currencyName={info.currencyName}
            />
            <BalanceBlock
              topLabel="Shileded"
              zecValue={totalBalance.private}
              usdValue="12.12"
              currencyName={info.currencyName}
            />
            <BalanceBlock
              topLabel="Transparent"
              zecValue={totalBalance.transparent}
              usdValue="12.12"
              currencyName={info.currencyName}
            />
          </div>
          {/* Change the hardcoded height */}
          <ScrollPane offsetHeight={200}>
            {transactions.map(tx => {
              const key = tx.type + tx.txid + tx.address;
              return (
                <TxItemBlock
                  key={key}
                  transaction={tx}
                  currencyName={info.currencyName}
                />
              );
            })}
          </ScrollPane>
        </div>
      </div>
    );
  }
}
