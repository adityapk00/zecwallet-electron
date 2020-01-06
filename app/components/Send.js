// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import styles from './Home.css';
import type State from './AppState';

type Props = State;

export default class Send extends Component<Props> {
  props: Props;

  render() {
    const { balance } = this.props;
    return (
      <div className={styles.container} data-tid="container">
        <h2>Welcome to send {balance}</h2>
        <Link to={routes.HOME}>Back Home</Link>
      </div>
    );
  }
}
