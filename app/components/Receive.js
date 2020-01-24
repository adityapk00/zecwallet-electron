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
import { clipboard } from 'electron';
import Sidebar from './Sidebar';
import styles from './Receive.css';
import cstyles from './Common.css';
import Utils from '../utils/utils';
import { AddressBalance, Info } from './AppState';
import ScrollPane from './ScrollPane';

type Props = {
  addresses: string[],
  addressesWithBalance: AddressBalance[],
  info: Info,
  getSinglePrivateKey: string => void
};

const AddressBlock = ({
  addressBalance,
  currencyName,
  privateKey,
  getSinglePrivateKey
}) => {
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
        <div className={[cstyles.flex].join(' ')}>
          <div>
            <QRCode
              value={address}
              className={[styles.receiveQrcode].join(' ')}
            />
          </div>
          <div className={[cstyles.verticalflex, cstyles.marginleft].join(' ')}>
            <div className={[cstyles.sublight].join(' ')}>Address</div>
            <div className={[cstyles.padtopsmall, cstyles.fixedfont].join(' ')}>
              {Utils.splitStringIntoChunks(address, 6).join(' ')}
            </div>
            <div>
              <button
                className={[cstyles.primarybutton, cstyles.margintoplarge].join(
                  ' '
                )}
                type="button"
                onClick={() => {
                  clipboard.writeText(address);
                }}
              >
                Copy Address
              </button>
              {!privateKey && (
                <button
                  className={[cstyles.primarybutton].join(' ')}
                  type="button"
                  onClick={() => getSinglePrivateKey(address)}
                >
                  Export Private Key
                </button>
              )}
            </div>
            <div
              className={[cstyles.sublight, cstyles.margintoplarge].join(' ')}
            >
              Funds
            </div>
            <div className={[cstyles.padtopsmall].join(' ')}>
              {currencyName} {addressBalance.balance || 0}
            </div>
            <div
              className={[cstyles.margintoplarge, cstyles.breakword].join(' ')}
            >
              {privateKey && (
                <div>
                  <div className={[cstyles.sublight].join(' ')}>
                    Private Key
                  </div>
                  <div
                    className={[
                      cstyles.breakword,
                      cstyles.padtopsmall,
                      cstyles.fixedfont
                    ].join(' ')}
                    style={{ maxWidth: '600px' }}
                  >
                    {privateKey}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </AccordionItemPanel>
    </AccordionItem>
  );
};

export default class Receive extends Component<Props> {
  render() {
    const {
      addresses,
      addressesWithBalance,
      addressPrivateKeys,
      info,
      getSinglePrivateKey
    } = this.props;

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
          <div
            className={[cstyles.xlarge, cstyles.padall, cstyles.center].join(
              ' '
            )}
          >
            Receive
          </div>

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
                        privateKey={addressPrivateKeys[a.address]}
                        getSinglePrivateKey={getSinglePrivateKey}
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
                        privateKey={addressPrivateKeys[a.address]}
                        getSinglePrivateKey={getSinglePrivateKey}
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
