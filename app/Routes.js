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
  rpc: RPC;

  constructor(props) {
    super(props);

    this.state = { balance: new Balance(12), addresses: [] };
  }

  componentDidMount() {
    if (!this.rpc) {
      this.rpc = new RPC(this.setBalance, this.setAddresses);
      this.rpc.configure();
    }
  }

  componentWillUnmount() {}

  setBalance = (balance: Balance) => {
    this.setState({ balance });
  };

  setAddresses = (addresses: [Addres]) => {
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
