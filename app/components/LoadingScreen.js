/* eslint-disable max-classes-per-file */
import React, { Component } from 'react';
import { Redirect } from 'react-router';
import ini from 'ini';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { remote } from 'electron';
import routes from '../constants/routes.json';
import { RPCConfig } from './AppState';

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
  setRPCConfig: (rpcConfig: RPCConfig) => void
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
      rpcConfig.url = 'http://127.0.0.1:8232';

      const { setRPCConfig } = this.props;
      setRPCConfig(rpcConfig);
    })();
  }

  render() {
    return <Redirect to={routes.DASHBOARD} />;
  }
}
