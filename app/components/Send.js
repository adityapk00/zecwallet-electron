// @flow
import React, { Component } from 'react';
import styles from './Home.css';
import type State from './AppState';
import Sidebar from './Sidebar';

type Props = State;

export default class Send extends Component<Props> {
  props: Props;

  render() {
    return (
      <div style={{ overflow: 'hidden' }}>
        <div style={{ width: '30%', float: 'left' }}>
          <Sidebar />
        </div>
        <div style={{ width: '70%', float: 'right' }}>Send Content</div>
      </div>
    );
  }
}
