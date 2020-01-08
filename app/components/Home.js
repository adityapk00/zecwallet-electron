/* eslint-disable no-plusplus */
/* eslint-disable react/prop-types */
// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import dateformat from 'dateformat';
import routes from '../constants/routes.json';
import styles from './Home.css';
import AppState from './AppState';

function splitZecAmountIntoBigSmall(zecValue: number) {
  if (!zecValue) {
    return { bigPart: zecValue, smallPart: '' };
  }
  let bigPart = zecValue.toString();
  let smallPart = '';

  if (bigPart.indexOf('.') >= 0) {
    const decimalPart = bigPart.substr(bigPart.indexOf('.') + 1);
    if (decimalPart.length > 4) {
      smallPart = decimalPart.substr(4);
      bigPart = bigPart.substr(0, bigPart.length - smallPart.length);

      // Pad the small part with trailing 0s
      while (smallPart.length < 4) {
        smallPart += '0';
      }
    }
  }

  return { bigPart, smallPart };
}

function splitStringIntoChunks(s: string, numChunks: number) {
  if (numChunks > s.length) return [s];
  if (s.length < 16) return [s];

  const chunkSize = Math.round(s.length / numChunks);
  const chunks = [];
  for (let i = 0; i < numChunks - 1; i++) {
    chunks.push(s.substr(i * chunkSize, chunkSize));
  }
  // Last chunk might contain un-even length
  chunks.push(s.substr((numChunks - 1) * chunkSize));

  return chunks;
}

// eslint-disable-next-line react/prop-types
const BalanceBlockHighlight = ({ zecValue, usdValue }) => {
  const { bigPart, smallPart } = splitZecAmountIntoBigSmall(zecValue);

  return (
    <div style={{ float: 'left', padding: '1em' }}>
      <div className={[styles.highlight, styles.xlarge].join(' ')}>
        <span>ZEC {bigPart}</span>
        <span className={[styles.small, styles.zecsmallpart].join(' ')}>
          {smallPart}
        </span>
      </div>
      <div className={[styles.sublight, styles.small].join(' ')}>
        USD {usdValue}
      </div>
    </div>
  );
};

// eslint-disable-next-line react/prop-types
const BalanceBlock = ({ zecValue, usdValue, topLabel }) => {
  const { bigPart, smallPart } = splitZecAmountIntoBigSmall(zecValue);

  return (
    <div style={{ float: 'left', padding: '1em' }}>
      <div className={[styles.sublight, styles.small].join(' ')}>
        {topLabel}
      </div>
      <div className={[styles.highlight, styles.large].join(' ')}>
        <span>ZEC {bigPart}</span>
        <span className={[styles.small, styles.zecsmallpart].join(' ')}>
          {smallPart}
        </span>
      </div>
      <div className={[styles.sublight, styles.small].join(' ')}>
        USD {usdValue}
      </div>
    </div>
  );
};

const TxItemBlock = ({ transaction }) => {
  const { bigPart, smallPart } = splitZecAmountIntoBigSmall(transaction.amount);

  const txDate = new Date(transaction.time * 1000);
  const datePart = dateformat(txDate, 'mmm dd, yyyy');
  const timePart = dateformat(txDate, 'hh:MM tt');

  let { address } = transaction;
  if (!address) {
    address = '(Shielded)';
  }

  return (
    <div>
      <div className={[styles.small, styles.sublight, styles.txdate].join(' ')}>
        {datePart}
      </div>
      <div className={[styles.well, styles.txbox].join(' ')}>
        <div className={styles.txtype}>
          <div>{transaction.type}</div>
          <div className={styles.sublight}>{timePart}</div>
        </div>
        <div className={styles.txaddress}>
          <div className={styles.highlight}>&quot;Label&quot;</div>
          <div className={styles.fixedfont}>
            {splitStringIntoChunks(address, 6).join(' ')}
          </div>
        </div>
        <div className={[styles.txamount].join(' ')}>
          <div>
            <span>ZEC {bigPart}</span>
            <span className={[styles.small, styles.zecsmallpart].join(' ')}>
              {smallPart}
            </span>
          </div>
          <div className={[styles.sublight, styles.small].join(' ')}>
            USD 12.12
          </div>
        </div>
      </div>
    </div>
  );
};

type HomeState = {
  height: number
};

export default class Home extends Component<AppState, HomeState> {
  props: AppState;

  constructor(props: AppState) {
    super(props);

    this.state = { height: 0 };
  }

  componentDidMount() {
    this.updateDimensions();
    window.addEventListener('resize', this.updateDimensions.bind(this));
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateDimensions.bind(this));
  }

  /**
   * Calculate & Update state of height, needed for the scrolling
   */
  updateDimensions() {
    const updateHeight = window.innerHeight - 200; // TODO: This should be the height of the balance box.
    this.setState({ height: updateHeight });
  }

  render() {
    const { totalBalance, transactions } = this.props;
    const { height } = this.state;

    return (
      <>
        <div className={[styles.well, styles.balancebox].join(' ')}>
          <BalanceBlockHighlight
            zecValue={totalBalance.total}
            usdValue="12.12"
          />
          <BalanceBlock
            topLabel="Shileded"
            zecValue={totalBalance.private}
            usdValue="12.12"
          />
          <BalanceBlock
            topLabel="Transparent"
            zecValue={totalBalance.transparent}
            usdValue="12.12"
          />
        </div>
        <Link to={routes.SEND}>Send</Link>
        <div className={styles.txlistcontainer} style={{ height }}>
          {transactions.map(tx => {
            return <TxItemBlock key={tx.txid} transaction={tx} />;
          })}
        </div>
      </>
    );
  }
}
