import React from 'react';
import { Switch, Route } from 'react-router';
import routes from './constants/routes.json';
import App from './containers/App';
import Home from './components/Home';
import Send from './components/Send';

import AppState, { AddressBalance, TotalBalance } from './components/AppState';
import RPC from './rpc';

type Props = {};

export default class RouteApp extends React.Component<Props, AppState> {
  rpc: RPC;

  constructor(props) {
    super(props);

    this.state = {
      totalBalance: new TotalBalance(12),
      addressesWithBalance: [],
      addresses: []
    };
  }

  componentDidMount() {
    if (!this.rpc) {
      this.rpc = new RPC(this.setTotalBalance, this.setAddressesWithBalances);
      this.rpc.configure();
    }
  }

  componentWillUnmount() {}

  setTotalBalance = (totalBalance: TotalBalance) => {
    this.setState({ totalBalance });
  };

  setAddressesWithBalances = (addressesWithBalance: [AddressBalance]) => {
    this.setState({ addressesWithBalance });
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
