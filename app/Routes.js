import React from 'react';
import { Switch, Route } from 'react-router';
import routes from './constants/routes.json';
import App from './containers/App';
import Home from './components/Home';
import Send from './components/Send';

import State, { AddressBalance, TotalBalance } from './components/AppState';
import RPC from './rpc';

type Props = {};

export default class RouteApp extends React.Component<Props, State> {
  rpc: RPC;

  constructor(props) {
    super(props);

    this.state = { balance: new TotalBalance(12), addresses: [] };
  }

  componentDidMount() {
    if (!this.rpc) {
      this.rpc = new RPC(this.setTotalBalance, this.setAddressesWithBalances);
      this.rpc.configure();
    }
  }

  componentWillUnmount() {}

  setTotalBalance = (balance: TotalBalance) => {
    this.setState({ balance });
  };

  setAddressesWithBalances = (addresses: [AddressBalance]) => {
    this.setState({ addresses });
  };

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
