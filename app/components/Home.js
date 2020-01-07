// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import styles from './Home.css';
import type State from './AppState';

type Props = State;

export default class Home extends Component<Props> {
  props: Props;

  render() {
    const { balance, addresses } = this.props;

    return (
      <div className={styles.container} data-tid="container">
        <h2>Hello Home {balance.total} </h2>
        <Link to={routes.SEND}>Send</Link>
        <ul>
          {addresses.map(address => {
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
