/* eslint-disable react/prop-types */
import React, { Component } from 'react';
import { Info } from './AppState';
import Sidebar from './Sidebar';
import cstyles from './Common.css';
import styles from './Zcashd.css';
import Heart from '../assets/img/zcashdlogo.gif';

const DetailLine = ({ label, value }) => {
  return (
    <div className={styles.detailline}>
      <div className={cstyles.sublight}>{label} :</div>
      <div>{value}</div>
    </div>
  );
};

type Props = {
  info: Info
};

export default class Zcashd extends Component<Props> {
  render() {
    const { info } = this.props;

    if (!info || !info.version) {
      return (
        <div style={{ overflow: 'hidden' }}>
          <div className={cstyles.sidebarcontainer}>
            <Sidebar info={info} />
          </div>
          <div className={cstyles.contentcontainer}>
            <div className={[cstyles.verticalflex, cstyles.center].join(' ')}>
              <div style={{ marginTop: '100px' }}>
                <i
                  className={['fas', 'fa-times-circle'].join(' ')}
                  style={{ fontSize: '96px', color: 'red' }}
                />
              </div>
              <div className={cstyles.margintoplarge}>Not Connected</div>
            </div>
          </div>
        </div>
      );
      // eslint-disable-next-line no-else-return
    } else {
      return (
        <div style={{ overflow: 'hidden' }}>
          <div className={cstyles.sidebarcontainer}>
            <Sidebar info={info} />
          </div>
          <div className={cstyles.contentcontainer}>
            <div className={styles.container}>
              <div className={styles.imgcontainer}>
                <img src={Heart} width="80%" alt="heart" />
              </div>

              <div className={styles.detailcontainer}>
                <div className={styles.detaillines}>
                  <DetailLine
                    label="Network"
                    value={info.testnet ? 'Testnet' : 'Mainnet'}
                  />
                  <DetailLine label="Block Height" value={info.latestBlock} />
                  <DetailLine label="Connections" value={info.connections} />
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }
}
