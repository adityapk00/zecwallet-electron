/* eslint-disable max-classes-per-file */
import React, { Component } from 'react';
import { Redirect } from 'react-router';
import ini from 'ini';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { remote } from 'electron';
import routes from '../constants/routes.json';
import { RPCConfig, Info } from './AppState';
import RPC from '../rpc';
import cstyles from './Common.css';
import Logo from '../assets/img/logobig.gif';

const locateZcashConf = () => {
  if (os.platform() === 'darwin') {
    return path.join(remote.app.getPath('appData'), 'Zcash', 'zcash.conf');
  }

  if (os.platform() === 'linux') {
    return path.join(remote.app.getPath('home'), '.zcash', 'zcash.conf');
  }

  return path.join(remote.app.getPath('appData'), 'Zcash', 'zcash.conf');
};

type Props = {
  setRPCConfig: (rpcConfig: RPCConfig) => void,
  setInfo: (info: Info) => void
};

class LoadingScreenState {
  currentStatus: string;

  loadingDone: boolean;

  rpcConfig: RPCConfig | null;

  constructor() {
    this.currentStatus = 'Loading';
    this.loadingDone = false;
    this.rpcConfig = null;
  }
}

export default class LoadingScreen extends Component<Props> {
  constructor(props: Props) {
    super(props);

    this.state = new LoadingScreenState();
  }

  componentDidMount() {
    (async () => {
      // Load the RPC config from zcash.conf file
      const zcashLocation = locateZcashConf();
      const confValues = ini.parse(
        await fs.promises.readFile(zcashLocation, { encoding: 'utf-8' })
      );

      // Get the username and password
      const rpcConfig = new RPCConfig();
      rpcConfig.username = confValues.rpcuser;
      rpcConfig.password = confValues.rpcpassword;

      const isTestnet =
        (confValues.testnet && confValues.testnet === 1) || false;
      const server = confValues.rpcbind || '127.0.0.1';
      const port = confValues.rpcport || (isTestnet ? '18232' : '8232');
      rpcConfig.url = `http://${server}:${port}`;

      this.setState({ rpcConfig });

      // And setup the next getinfo
      this.setupNextGetInfo();
    })();
  }

  setupNextGetInfo() {
    setTimeout(() => this.getInfo(), 1000);
  }

  async getInfo() {
    const { rpcConfig } = this.state;

    // Try getting the info.
    try {
      const infoResult = await RPC.doRPC('getinfo', [], rpcConfig);
      const info = new Info();
      info.testnet = infoResult.result.testnet;
      info.latestBlock = infoResult.result.blocks;
      info.connections = infoResult.result.connections;
      info.version = infoResult.result.version;
      info.currencyName = info.testnet ? 'TAZ' : 'ZEC';
      info.verificationProgress = 1; // TODO

      console.log(info);

      const { setRPCConfig, setInfo } = this.props;

      setRPCConfig(rpcConfig);
      setInfo(info);

      // This will cause a redirect to the dashboard
      this.setState({ loadingDone: true });
    } catch (err) {
      // Not yet finished loading. So update the state, and setup the next refresh
      this.setState({ currentStatus: err });
      this.setupNextGetInfo();
    }
  }

  render() {
    const { loadingDone, currentStatus } = this.state;

    // If still loading, show the status
    if (!loadingDone) {
      return (
        <div className={[cstyles.verticalflex, cstyles.center].join(' ')}>
          <div style={{ marginTop: '100px' }}>
            <img src={Logo} width="200px;" alt="Logo" />
          </div>
          <div>{currentStatus}</div>
        </div>
      );
    }

    return <Redirect to={routes.DASHBOARD} />;
  }
}
