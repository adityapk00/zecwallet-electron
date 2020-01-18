/* eslint-disable react/no-unused-state */
import React from 'react';
import { Switch, Route } from 'react-router';
import routes from './constants/routes.json';
import App from './containers/App';
import Dashboard from './components/Dashboard';
import Send from './components/Send';
import Receive from './components/Receive';
import LoadingScreen from './components/LoadingScreen';

import AppState, {
  AddressBalance,
  TotalBalance,
  Transaction,
  SendPageState,
  ToAddr,
  RPCConfig,
  Info
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
      addressPrivateKeys: {},
      addresses: [],
      transactions: [],
      sendPageState: new SendPageState(),
      rpcConfig: new RPCConfig(),
      info: new Info()
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
        this.setAllAddresses,
        this.setSinglePrivateKey
      );
    }
  }

  componentWillUnmount() {}

  setTotalBalance = (totalBalance: TotalBalance) => {
    this.setState({ totalBalance });
    console.log('updated balances');
  };

  setAddressesWithBalances = (addressesWithBalance: AddressBalance[]) => {
    this.setState({ addressesWithBalance });

    const { sendPageState } = this.state;

    // If there is no 'from' address, we'll set a default one
    if (!sendPageState.fromaddr) {
      // Find a z-address with the highest balance
      const defaultAB = addressesWithBalance
        .filter(ab => Utils.isSapling(ab.address))
        .reduce((prev, ab) => {
          // We'll start with a sapling address
          if (prev == null) {
            return ab;
          }
          // Find the sapling address with the highest balance
          if (prev.balance < ab.balance) {
            return ab;
          }

          return prev;
        }, null);

      if (defaultAB) {
        const newSendPageState = new SendPageState();
        newSendPageState.fromaddr = defaultAB.address;
        newSendPageState.toaddrs = sendPageState.toaddrs;

        this.setState({ sendPageState: newSendPageState });
      }
    }
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

  setRPCConfig = (rpcConfig: RPCConfig) => {
    this.setState({ rpcConfig });
    console.log(rpcConfig);
    this.rpc.configure(rpcConfig);
  };

  setInfo = (info: Info) => {
    this.setState({ info });
    console.log('updated info');
  };

  setSinglePrivateKey = (address: string, key: string) => {
    const addressPrivateKeys = {};
    addressPrivateKeys[address] = key;
    this.setState({ addressPrivateKeys });
    console.log(`Added private key for ${address}`);
  };

  // Getter methods, which are called by the components to update the state
  getSinglePrivateKey = (address: string) => {
    this.rpc.fetchPrivateKey(address);
  };

  render() {
    const {
      totalBalance,
      transactions,
      addressesWithBalance,
      addressPrivateKeys,
      addresses,
      sendPageState,
      info
    } = this.state;
    return (
      <App>
        <Switch>
          <Route
            path={routes.SEND}
            render={() => (
              <Send
                addressesWithBalance={addressesWithBalance}
                sendPageState={sendPageState}
                setSendPageState={this.setSendPageState}
                info={info}
              />
            )}
          />
          <Route
            path={routes.RECEIVE}
            render={() => (
              <Receive
                addresses={addresses}
                addressesWithBalance={addressesWithBalance}
                addressPrivateKeys={addressPrivateKeys}
                info={info}
                getSinglePrivateKey={this.getSinglePrivateKey}
              />
            )}
          />
          <Route
            path={routes.DASHBOARD}
            // eslint-disable-next-line react/jsx-props-no-spreading
            render={() => (
              <Dashboard
                totalBalance={totalBalance}
                transactions={transactions}
                info={info}
              />
            )}
          />
          <Route
            path={routes.LOADING}
            render={() => (
              <LoadingScreen
                setRPCConfig={this.setRPCConfig}
                setInfo={this.setInfo}
              />
            )}
          />
        </Switch>
      </App>
    );
  }
}
