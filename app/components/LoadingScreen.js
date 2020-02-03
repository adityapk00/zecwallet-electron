/* eslint-disable max-classes-per-file */
import React, { Component } from 'react';
import { Redirect } from 'react-router';
import ini from 'ini';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { remote } from 'electron';
import { spawn } from 'child_process';
import routes from '../constants/routes.json';
import { RPCConfig, Info } from './AppState';
import RPC from '../rpc';
import cstyles from './Common.css';
import styles from './LoadingScreen.css';
import { NO_CONNECTION } from '../utils/utils';
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

  zcashdSpawned: number;

  getinfoRetryCount: number;

  constructor() {
    this.currentStatus = 'Loading...';
    this.loadingDone = false;
    this.zcashdSpawned = 0;
    this.getinfoRetryCount = 0;
    this.rpcConfig = null;
  }
}

export default class LoadingScreen extends Component<Props, LoadingScreenState> {
  constructor(props: Props) {
    super(props);

    this.state = new LoadingScreenState();
  }

  componentDidMount() {
    (async () => {
      // Load the RPC config from zcash.conf file
      const zcashLocation = locateZcashConf();
      const confValues = ini.parse(await fs.promises.readFile(zcashLocation, { encoding: 'utf-8' }));

      // Get the username and password
      const rpcConfig = new RPCConfig();
      rpcConfig.username = confValues.rpcuser;
      rpcConfig.password = confValues.rpcpassword;

      const isTestnet = (confValues.testnet && confValues.testnet === 1) || false;
      const server = confValues.rpcbind || '127.0.0.1';
      const port = confValues.rpcport || (isTestnet ? '18232' : '8232');
      rpcConfig.url = `http://${server}:${port}`;

      this.setState({ rpcConfig });

      // And setup the next getinfo
      this.setupNextGetInfo();
    })();
  }

  async startZcashd() {
    const { zcashdSpawned } = this.state;

    if (zcashdSpawned) {
      this.setState({ currentStatus: 'zcashd start failed' });
      return;
    }

    const program = path.join(remote.app.getAppPath(), 'zcashd');
    console.log(program);

    const zcashd = spawn(program);

    this.setState({ zcashdSpawned: 1 });
    this.setState({ currentStatus: 'zcashd starting...' });

    zcashd.on('close', (code: number) => {
      console.log(`child process exited with code ${code}`);
    });

    zcashd.on('error', err => {
      console.log(`zcashd start error, giving up. Error: ${err}`);
      // Set that we tried to start zcashd, and failed
      this.setState({ zcashdSpawned: 1 });
      // No point retrying.
      this.setState({ getinfoRetryCount: 10 });
    });

    // Set up to kill zcashd when we exit.
    remote.getCurrentWindow().on('close', () => {
      zcashd.kill();
    });
  }

  setupNextGetInfo() {
    setTimeout(() => this.getInfo(), 1000);
  }

  async getInfo() {
    const { rpcConfig, zcashdSpawned, getinfoRetryCount } = this.state;

    // Try getting the info.
    try {
      const info = await RPC.getInfoObject(rpcConfig);
      console.log(info);

      const { setRPCConfig, setInfo } = this.props;

      setRPCConfig(rpcConfig);
      setInfo(info);

      // This will cause a redirect to the dashboard
      this.setState({ loadingDone: true });
    } catch (err) {
      // Not yet finished loading. So update the state, and setup the next refresh
      this.setState({ currentStatus: err });

      if (err === NO_CONNECTION && !zcashdSpawned) {
        // Try to start zcashd
        this.startZcashd();
        this.setupNextGetInfo();
      }

      if (err === NO_CONNECTION && zcashdSpawned && getinfoRetryCount < 10) {
        this.setState({ currentStatus: 'Waiting for zcashd to start...' });
        const inc = getinfoRetryCount + 1;
        this.setState({ getinfoRetryCount: inc });
        this.setupNextGetInfo();
      }

      if (err === NO_CONNECTION && zcashdSpawned && getinfoRetryCount >= 10) {
        // Give up
        this.setState({ currentStatus: 'Failed to start zcashd. Giving up!' });
      }

      if (err !== NO_CONNECTION) {
        this.setupNextGetInfo();
      }
    }
  }

  render() {
    const { loadingDone, currentStatus } = this.state;

    // If still loading, show the status
    if (!loadingDone) {
      return (
        <div className={[cstyles.verticalflex, cstyles.center, styles.loadingcontainer].join(' ')}>
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
