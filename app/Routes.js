import React from 'react';
import { Switch, Route } from 'react-router';
import routes from './constants/routes.json';
import App from './containers/App';
import Home from './components/Home';
import Send from './components/Send';

import State, { Balance } from './components/AppState';
import RPC from './rpc';

type Props = {};

export default class RouteApp extends React.Component<Props, State> {
  timerID: IntervalID;

  constructor(props) {
    super(props);

    this.state = { balance: new Balance(12) };
  }

  componentDidMount() {
    if (this.timerID) {
      clearInterval(this.timerID);
    }

    this.timerID = setInterval(() => this.tick(), 1000);
  }

  componentWillUnmount() {}

  async tick() {
    // Fetch updated balance
    const result = await RPC.fetchBalance();
    this.setState({ balance: new Balance(result.total) });
  }

  render() {
    return (
      <App>
        <Switch>
          <Route
            path={routes.SEND}
            // eslint-disable-next-line
            component={props => <Send {...this.state} />}
          />
          <Route
            path={routes.HOME}
            // eslint-disable-next-line
            component={props => <Home {...this.state} />}
          />
        </Switch>
      </App>
    );
  }
}
