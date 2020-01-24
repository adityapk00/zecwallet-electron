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
  Info,
  ReceivePageState
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
      receivePageState: new ReceivePageState(),
      statusMessage: null,
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
        this.setSinglePrivateKey,
        this.setStatusMessage
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

  setStatusMessage = (statusMessage: string | null) => {
    console.log(`Setting status message: ${statusMessage}`);
    this.setState({ statusMessage });
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

  sendTransaction = async (
    sendJson: [],
    fnOpenSendErrorModal: (string, string) => void
  ) => {
    const success = await this.rpc.sendTransaction(
      sendJson,
      fnOpenSendErrorModal
    );
    return success;
  };

  // Getter methods, which are called by the components to update the state
  getSinglePrivateKey = (address: string) => {
    this.rpc.fetchPrivateKey(address);
  };

  createNewAddress = async (zaddress: boolean) => {
    // Create a new address
    const newaddress = await this.rpc.createNewAddress(zaddress);
    console.log(`Created new Address ${newaddress}`);

    // And then fetch the list of addresses again to refresh
    this.rpc.fetchAllAddresses();

    const { receivePageState } = this.state;
    const newRerenderKey = receivePageState.rerenderKey + 1;

    const newReceivePageState = new ReceivePageState();
    newReceivePageState.newAddress = newaddress;
    newReceivePageState.rerenderKey = newRerenderKey;

    this.setState({ receivePageState: newReceivePageState });
  };

  render() {
    const {
      totalBalance,
      transactions,
      addressesWithBalance,
      addressPrivateKeys,
      addresses,
      statusMessage,
      sendPageState,
      receivePageState,
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
                sendTransaction={this.sendTransaction}
                sendPageState={sendPageState}
                setSendPageState={this.setSendPageState}
                statusMessage={statusMessage}
                info={info}
              />
            )}
          />
          <Route
            path={routes.RECEIVE}
            render={() => (
              <Receive
                rerenderKey={receivePageState.rerenderKey}
                addresses={addresses}
                addressesWithBalance={addressesWithBalance}
                addressPrivateKeys={addressPrivateKeys}
                receivePageState={receivePageState}
                info={info}
                getSinglePrivateKey={this.getSinglePrivateKey}
                createNewAddress={this.createNewAddress}
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
