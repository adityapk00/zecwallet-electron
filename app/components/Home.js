// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import styles from './Home.css';
import AppState from './AppState';

function splitZecAmountIntoBigSmall(zecValue: number) {
  let bigPart = zecValue.toString();
  let smallPart = '';

  if (bigPart.indexOf('.') >= 0) {
    const decimalPart = bigPart.substr(bigPart.indexOf('.') + 1);
    if (decimalPart.length > 4) {
      smallPart = decimalPart.substr(decimalPart.length - 4);
      bigPart = bigPart.substr(0, bigPart.length - smallPart.length);
    }
  }

  return { bigPart, smallPart };
}

// eslint-disable-next-line react/prop-types
const BalanceBlockHighlight = ({ zecValue, usdValue }) => {
  const { bigPart, smallPart } = splitZecAmountIntoBigSmall(zecValue);

  return (
    <div style={{ float: 'left', padding: '1em' }}>
      <div className={[styles.highlight, styles.xlarge].join(' ')}>
        ZEC {bigPart}
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
        ZEC {bigPart}{' '}
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

export default class Home extends Component<AppState> {
  props: AppState;

  render() {
    const { totalBalance, addressesWithBalance } = this.props;

    return (
      <div className={styles.well}>
        <BalanceBlockHighlight zecValue={totalBalance.total} usdValue="12.12" />
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

        <Link to={routes.SEND}>Send</Link>
        <ul>
          {addressesWithBalance.map(address => {
            return (
              <li key={address.address}>
                {address.balance} / {address.address}
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
}
