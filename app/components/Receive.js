/* eslint-disable react/prop-types */
import React, { Component } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel
} from 'react-accessible-accordion';
import QRCode from 'qrcode.react';
import Sidebar from './Sidebar';
import styles from './Receive.css';
import cstyles from './Common.css';
import Utils from '../utils/utils';
import { AddressBalance } from './AppState';

type Props = {
  addresses: string[]
};

const AddressBlock = ({ addressBalance }) => {
  const { address } = addressBalance;
  return (
    <AccordionItem
      className={[cstyles.well, styles.receiveblock].join(' ')}
      uuid={address}
    >
      <AccordionItemHeading>
        <AccordionItemButton>{address}</AccordionItemButton>
      </AccordionItemHeading>
      <AccordionItemPanel className={[styles.receiveDetail].join(' ')}>
        {address}
        <QRCode value={address} className={[styles.receiveQrcode].join(' ')} />
        ZEC {addressBalance.balance || 0}
      </AccordionItemPanel>
    </AccordionItem>
  );
};

export default class Receive extends Component<Props> {
  render() {
    const { addresses, addressesWithBalance } = this.props;

    // Convert the addressBalances into a map.
    const addressMap = addressesWithBalance.reduce((map, a) => {
      // eslint-disable-next-line no-param-reassign
      map[a.address] = a.balance;
      return map;
    }, {});

    const zaddrs = addresses
      .filter(a => Utils.isSapling(a))
      .slice(0, 100)
      .map(a => new AddressBalance(a, addressMap[a]));

    const taddrs = addresses
      .filter(a => Utils.isTransparent(a))
      .slice(0, 100)
      .map(a => new AddressBalance(a, addressMap[a]));

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
                <Accordion preExpanded={zaddrs.slice(0, 1)}>
                  {zaddrs.map(a => (
                    <AddressBlock key={a.address} addressBalance={a} />
                  ))}
                </Accordion>
              </TabPanel>

              <TabPanel>
                <Accordion preExpanded={taddrs.slice(0, 1)}>
                  {taddrs.map(a => (
                    <AddressBlock key={a.address} addressBalance={a} />
                  ))}
                </Accordion>
              </TabPanel>
            </Tabs>
          </div>
        </div>
      </div>
    );
  }
}
