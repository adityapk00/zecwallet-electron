/* eslint-disable react/prop-types */
import React, { Component, useState } from 'react';
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
import { AddressBalance, Info, ReceivePageState } from './AppState';
import ScrollPane from './ScrollPane';

const AddressBlock = ({ addressBalance, currencyName, privateKey, getSinglePrivateKey }) => {
  const { address } = addressBalance;

  const [copied, setCopied] = useState(false);

  return (
    <AccordionItem key={copied} className={[cstyles.well, styles.receiveblock].join(' ')} uuid={address}>
      <AccordionItemHeading>
        <AccordionItemButton className={styles.accordionHeader}>{address}</AccordionItemButton>
      </AccordionItemHeading>
      <AccordionItemPanel className={[styles.receiveDetail].join(' ')}>
        <div className={[cstyles.flex].join(' ')}>
          <div>
            <QRCode value={address} className={[styles.receiveQrcode].join(' ')} />
          </div>
          <div className={[cstyles.verticalflex, cstyles.marginleft].join(' ')}>
            <div className={[cstyles.sublight].join(' ')}>Address</div>
            <div className={[cstyles.padtopsmall, cstyles.fixedfont].join(' ')}>
              {Utils.splitStringIntoChunks(address, 6).join(' ')}
            </div>
            <div>
              <button
                className={[cstyles.primarybutton, cstyles.margintoplarge].join(' ')}
                type="button"
                onClick={() => {
                  clipboard.writeText(address);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 5000);
                }}
              >
                {copied ? <span>Copied!</span> : <span>Copy Address</span>}
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
            <div className={[cstyles.sublight, cstyles.margintoplarge].join(' ')}>Funds</div>
            <div className={[cstyles.padtopsmall].join(' ')}>
              {currencyName} {addressBalance.balance || 0}
            </div>
            <div className={[cstyles.margintoplarge, cstyles.breakword].join(' ')}>
              {privateKey && (
                <div>
                  <div className={[cstyles.sublight].join(' ')}>Private Key</div>
                  <div
                    className={[cstyles.breakword, cstyles.padtopsmall, cstyles.fixedfont].join(' ')}
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

type Props = {
  addresses: string[],
  addressesWithBalance: AddressBalance[],
  info: Info,
  receivePageState: ReceivePageState,
  getSinglePrivateKey: string => void,
  createNewAddress: boolean => void,
  rerenderKey: number
};

export default class Receive extends Component<Props> {
  render() {
    const {
      addresses,
      addressesWithBalance,
      addressPrivateKeys,
      info,
      receivePageState,
      getSinglePrivateKey,
      createNewAddress,
      rerenderKey
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

    let defaultZaddr = zaddrs.length ? zaddrs[0].address : '';
    if (receivePageState && Utils.isSapling(receivePageState.newAddress)) {
      defaultZaddr = receivePageState.newAddress;

      // move this address to the front, since the scrollbar will reset when we re-render
      zaddrs.sort((x, y) => {
        // eslint-disable-next-line prettier/prettier, no-nested-ternary
        return x.address === defaultZaddr ? -1 : y.address === defaultZaddr ? 1 : 0
      });
    }

    const taddrs = addresses
      .filter(a => Utils.isTransparent(a))
      .slice(0, 100)
      .map(a => new AddressBalance(a, addressMap[a]));

    let defaultTaddr = taddrs.length ? taddrs[0].address : '';
    if (receivePageState && Utils.isTransparent(receivePageState.newAddress)) {
      defaultTaddr = receivePageState.newAddress;

      // move this address to the front, since the scrollbar will reset when we re-render
      taddrs.sort((x, y) => {
        // eslint-disable-next-line prettier/prettier, no-nested-ternary
        return x.address === defaultTaddr ? -1 : y.address === defaultTaddr ? 1 : 0
      });
    }

    return (
      <div style={{ overflow: 'hidden' }}>
        <div className={cstyles.sidebarcontainer}>
          <Sidebar info={info} />
        </div>
        <div className={cstyles.contentcontainer}>
          <div className={[cstyles.xlarge, cstyles.padall, cstyles.center].join(' ')}>Receive</div>

          <div className={styles.receivecontainer}>
            <Tabs>
              <TabList>
                <Tab>Shielded</Tab>
                <Tab>Transparent</Tab>
              </TabList>

              <TabPanel key={`z${rerenderKey}`}>
                {/* Change the hardcoded height */}
                <ScrollPane offsetHeight={150}>
                  <Accordion preExpanded={[defaultZaddr]}>
                    {zaddrs.map(a => (
                      <AddressBlock
                        key={a.address}
                        addressBalance={a}
                        currencyName={info.currencyName}
                        privateKey={addressPrivateKeys[a.address]}
                        getSinglePrivateKey={getSinglePrivateKey}
                        rerender={this.rerender}
                      />
                    ))}
                  </Accordion>

                  <button
                    className={[cstyles.primarybutton, cstyles.margintoplarge, cstyles.marginbottomlarge].join(' ')}
                    onClick={() => createNewAddress(true)}
                    type="button"
                  >
                    New Shielded Address
                  </button>
                </ScrollPane>
              </TabPanel>

              <TabPanel key={`t${rerenderKey}`}>
                {/* Change the hardcoded height */}
                <ScrollPane offsetHeight={150}>
                  <Accordion preExpanded={[defaultTaddr]}>
                    {taddrs.map(a => (
                      <AddressBlock
                        key={a.address}
                        addressBalance={a}
                        currencyName={info.currencyName}
                        privateKey={addressPrivateKeys[a.address]}
                        getSinglePrivateKey={getSinglePrivateKey}
                        rerender={this.rerender}
                      />
                    ))}
                  </Accordion>

                  <button
                    className={[cstyles.primarybutton, cstyles.margintoplarge, cstyles.marginbottomlarge].join(' ')}
                    type="button"
                    onClick={() => createNewAddress(false)}
                  >
                    New Transparent Address
                  </button>
                </ScrollPane>
              </TabPanel>
            </Tabs>
          </div>
        </div>
      </div>
    );
  }
}
