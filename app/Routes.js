import React from 'react';
import { Switch, Route } from 'react-router';
import routes from './constants/routes.json';
import App from './containers/App';
import Home from './components/Home';
import Send from './components/Send';

import AppState, {
  AddressBalance,
  TotalBalance,
  Transaction,
  SendPageState
} from './components/AppState';
import RPC from './rpc';

type Props = {};

export default class RouteApp extends React.Component<Props, AppState> {
  rpc: RPC;

  constructor(props) {
    super(props);

    this.state = {
      totalBalance: new TotalBalance(),
      addressesWithBalance: [],
      addresses: [],
      transactions: [],
      sendPageState: new SendPageState()
    };
  }

  componentDidMount() {
    if (!this.rpc) {
      this.rpc = new RPC(
        this.setTotalBalance,
        this.setAddressesWithBalances,
        this.setTransactionList
      );
      this.rpc.configure();
    }
  }

  componentWillUnmount() {}

  setTotalBalance = (totalBalance: TotalBalance) => {
    this.setState({ totalBalance });
  };

  setAddressesWithBalances = (addressesWithBalance: [AddressBalance]) => {
    console.log('addresses with balance updated');
    this.setState({ addressesWithBalance });
  };

  setTransactionList = (transactions: [Transaction]) => {
    this.setState({ transactions });
  };

  setSendPageState = (sendPageState: SendPageState) => {
    this.setState({ sendPageState });
  };

  render() {
    const { addressesWithBalance, sendPageState } = this.state;

    return (
      <App>
        <Switch>
          <Route
            path={routes.SEND}
            component={() => (
              <Send
                addressesWithBalance={addressesWithBalance}
                sendPageState={sendPageState}
                setSendPageState={this.setSendPageState}
              />
            )}
          />
          <Route
            path={routes.HOME}
            // eslint-disable-next-line react/jsx-props-no-spreading
            component={() => <Home {...this.state} />}
          />
        </Switch>
      </App>
    );
  }
}
