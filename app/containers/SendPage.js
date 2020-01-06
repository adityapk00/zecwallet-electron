// @flow
import React, { Component } from 'react';
import Send from '../components/Send';
import type State from '../components/AppState';

type Props = {
  location: {
    state: State
  }
};

export default class SendPage extends Component<Props> {
  props: Props;

  render() {
    // eslint-disable-next-line
    const { balance } = this.props.location.state;
    return <Send balance={balance} />;
  }
}
