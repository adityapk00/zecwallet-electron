import React from 'react';
import { Switch, Route } from 'react-router';
import routes from './constants/routes.json';
import App from './containers/App';
import Home from './components/Home';
import Send from './components/Send';
import Receive from './components/Receive';

import AppState, {
  AddressBalance,
  TotalBalance,
  Transaction,
  SendPageState,
  ToAddr
} from './components/AppState';
import RPC from './rpc';
import Utils from './utils/utils';

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

    // Create the initial ToAddr box
    // eslint-disable-next-line react/destructuring-assignment
    this.state.sendPageState.toaddrs = [new ToAddr(Utils.getNextToAddrID())];
  }

  componentDidMount() {
    if (!this.rpc) {
      this.rpc = new RPC(
        this.setTotalBalance,
        this.setAddressesWithBalances,
        this.setTransactionList,
        this.setAllAddresses
      );
      this.rpc.configure();
    }
  }

  componentWillUnmount() {}

  setTotalBalance = (totalBalance: TotalBalance) => {
    this.setState({ totalBalance });
    console.log('updated balances');
  };

  setAddressesWithBalances = (addressesWithBalance: AddressBalance[]) => {
    this.setState({ addressesWithBalance });
    console.log('updated addressbalances');
  };

  setTransactionList = (transactions: Transaction[]) => {
    this.setState({ transactions });
    console.log('updated transactions');
  };

  setAllAddresses = (addresses: string[]) => {
    this.setState({ addresses });
    console.log('updated all addresses');
  };

  setSendPageState = (sendPageState: SendPageState) => {
    this.setState({ sendPageState });
  };

  render() {
    const { addressesWithBalance, addresses, sendPageState } = this.state;
    return (
      <App>
        <Switch>
          <Route
            path={routes.SEND}
            render={() => (
              <Send
                key="send"
                addressesWithBalance={addressesWithBalance}
                sendPageState={sendPageState}
                setSendPageState={this.setSendPageState}
              />
            )}
          />
          <Route
            path={routes.RECEIVE}
            render={() => <Receive key="receive" addresses={addresses} />}
          />
          <Route
            path={routes.HOME}
            // eslint-disable-next-line react/jsx-props-no-spreading
            render={() => <Home key="home" {...this.state} />}
          />
        </Switch>
      </App>
    );
  }
}
