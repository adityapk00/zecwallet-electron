/* eslint-disable react/prop-types */
import React, { Component } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import Sidebar from './Sidebar';
import styles from './Receive.css';
import cstyles from './Common.css';
import Utils from '../utils/utils';

type Props = {
  addresses: string[]
};

const AddressBlock = ({ address }) => {
  return (
    <div className={[cstyles.well, styles.receiveblock].join(' ')}>
      {address}
    </div>
  );
};

export default class Receive extends Component<Props> {
  render() {
    const { addresses } = this.props;
    console.log(`Rendering ${addresses.length} addresses`);
    return (
      <div style={{ overflow: 'hidden' }}>
        <div style={{ width: '30%', float: 'left' }}>
          <Sidebar />
        </div>
        <div style={{ width: '70%', float: 'right' }}>
          <div className={styles.receivecontainer}>
            <Tabs>
              <TabList>
                <Tab>Shielded</Tab>
                <Tab>Transparent</Tab>
              </TabList>

              <TabPanel>
                {addresses
                  .filter(a => Utils.isSapling(a))
                  .map(a => (
                    <AddressBlock key={a} address={a} />
                  ))}
              </TabPanel>

              <TabPanel>
                {addresses
                  .filter(a => Utils.isTransparent(a))
                  .map(a => (
                    <AddressBlock key={a} address={a} />
                  ))}
              </TabPanel>
            </Tabs>
          </div>
        </div>
      </div>
    );
  }
}
