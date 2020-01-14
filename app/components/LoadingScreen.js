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

      // Try getting the info. TODO: Handle failure
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
    })();
  }

  render() {
    return <Redirect to={routes.DASHBOARD} />;
  }
}
