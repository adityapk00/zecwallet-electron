// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes.json';
import styles from './Home.css';
import type State from './AppState';

type Props = {};

export default class Home extends Component<Props, State> {
  timerID: IntervalID;

  constructor(props: Props) {
    super(props);
    this.state = { balance: 0 };
  }

  componentDidMount() {
    this.timerID = setInterval(() => this.tick(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  tick() {
    const { balance } = this.state;
    this.setState({ balance: balance + 1 });
  }

  render() {
    const { balance } = this.state;
    return (
      <div className={styles.container} data-tid="container">
        <h2>Hello Home {balance} </h2>
        <Link
          to={{
            pathname: routes.SEND,
            state: {
              balance
            }
          }}
        >
          Send
        </Link>
      </div>
    );
  }
}
