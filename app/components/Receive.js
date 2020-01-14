/* eslint-disable react/prop-types */
import React, { PureComponent } from 'react';
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
import { AddressBalance, Info } from './AppState';
import ScrollPane from './ScrollPane';

type Props = {
  addresses: string[],
  addressesWithBalance: AddressBalance[],
  info: Info
};

const AddressBlock = ({ addressBalance, currencyName }) => {
  const { address } = addressBalance;
  return (
    <AccordionItem
      className={[cstyles.well, styles.receiveblock].join(' ')}
      uuid={address}
    >
      <AccordionItemHeading>
        <AccordionItemButton className={styles.accordionHeader}>
          {address}
        </AccordionItemButton>
      </AccordionItemHeading>
      <AccordionItemPanel className={[styles.receiveDetail].join(' ')}>
        {address}
        <QRCode value={address} className={[styles.receiveQrcode].join(' ')} />
        {currencyName} {addressBalance.balance || 0}
      </AccordionItemPanel>
    </AccordionItem>
  );
};

export default class Receive extends PureComponent<Props> {
  render() {
    const { addresses, addressesWithBalance, info } = this.props;

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
    const defaultZaddr = zaddrs.length ? zaddrs[0].address : '';

    const taddrs = addresses
      .filter(a => Utils.isTransparent(a))
      .slice(0, 100)
      .map(a => new AddressBalance(a, addressMap[a]));
    const defaultTaddr = taddrs.length ? taddrs[0].address : '';

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
                {/* Change the hardcoded height */}
                <ScrollPane offsetHeight={100}>
                  <Accordion preExpanded={[defaultZaddr]}>
                    {zaddrs.map(a => (
                      <AddressBlock
                        key={a.address}
                        addressBalance={a}
                        currencyName={info.currencyName}
                      />
                    ))}
                  </Accordion>
                </ScrollPane>
              </TabPanel>

              <TabPanel>
                {/* Change the hardcoded height */}
                <ScrollPane offsetHeight={100}>
                  <Accordion preExpanded={[defaultTaddr]}>
                    {taddrs.map(a => (
                      <AddressBlock
                        key={a.address}
                        addressBalance={a}
                        currencyName={info.currencyName}
                      />
                    ))}
                  </Accordion>
                </ScrollPane>
              </TabPanel>
            </Tabs>
          </div>
        </div>
      </div>
    );
  }
}
