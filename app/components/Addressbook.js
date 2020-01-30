/* eslint-disable react/prop-types */
import React, { Component } from 'react';
import Sidebar from './Sidebar';
import styles from './Addressbook.css';
import cstyles from './Common.css';
import { AddressBookEntry, Info } from './AppState';
import ScrollPane from './ScrollPane';
import Utils from '../utils/utils';

const AddressBookItem = ({ item }) => {
  return (
    <div className={[cstyles.flexspacebetween, cstyles.marginbottomsmall, styles.addressbookentry].join(' ')}>
      <div>{item.label}</div>
      <div>{item.address}</div>
    </div>
  );
};

type Props = {
  info: Info,
  addressBook: AddressBookEntry[],
  addAddressBookEntry: (label: string, address: string) => void
};

type State = {
  currentLabel: string,
  currentAddress: string,
  addButtonEnabled: boolean
};

export default class AddressBook extends Component<Props, State> {
  constructor(props) {
    super(props);

    this.state = { currentLabel: '', currentAddress: '', addButtonEnabled: false };
  }

  updateLabel = (currentLabel: string) => {
    const { currentAddress } = this.state;
    this.setState({ currentLabel });

    const { labelIsValid, addressIsValid } = this.validate(currentLabel, currentAddress);
    this.setAddButtonEnabled(labelIsValid && addressIsValid);
  };

  updateAddress = (currentAddress: string) => {
    const { currentLabel } = this.state;
    this.setState({ currentAddress });

    const { labelIsValid, addressIsValid } = this.validate(currentLabel, currentAddress);

    this.setAddButtonEnabled(labelIsValid && addressIsValid);
  };

  addButtonClicked = () => {
    const { addAddressBookEntry } = this.props;
    const { currentLabel, currentAddress } = this.state;

    addAddressBookEntry(currentLabel, currentAddress);
    this.setState({ currentLabel: '', currentAddress: '' });
  };

  setAddButtonEnabled = (addButtonEnabled: boolean) => {
    this.setState({ addButtonEnabled });
  };

  validate = (currentLabel, currentAddress) => {
    const { addressBook } = this.props;

    const labelIsValid = !addressBook.find(i => i.label === currentLabel);
    const addressIsValid = Utils.isZaddr(currentAddress) || Utils.isTransparent(currentAddress);

    return { labelIsValid, addressIsValid };
  };

  render() {
    const { addressBook, info } = this.props;
    const { currentLabel, currentAddress, addButtonEnabled } = this.state;

    const { labelIsValid, addressIsValid } = this.validate(currentLabel, currentAddress);

    return (
      <div style={{ overflow: 'hidden' }}>
        <div className={cstyles.sidebarcontainer}>
          <Sidebar info={info} />
        </div>
        <div className={cstyles.contentcontainer}>
          <div className={[cstyles.xlarge, cstyles.padall, cstyles.center].join(' ')}>Address Book</div>

          <div className={styles.addressbookcontainer}>
            <div className={[cstyles.well].join(' ')}>
              <div className={[cstyles.flexspacebetween].join(' ')}>
                <div className={cstyles.sublight}>Label</div>
                <div className={cstyles.validationerror}>
                  {labelIsValid ? (
                    <i className={[cstyles.green, 'fas', 'fa-check'].join(' ')} />
                  ) : (
                    <span className={cstyles.red}>Duplicate Label</span>
                  )}
                </div>
              </div>
              <input
                type="text"
                value={currentLabel}
                className={[cstyles.inputbox, cstyles.margintopsmall].join(' ')}
                onChange={e => this.updateLabel(e.target.value)}
              />

              <div className={cstyles.margintoplarge} />

              <div className={[cstyles.flexspacebetween].join(' ')}>
                <div className={cstyles.sublight}>Address</div>
                <div className={cstyles.validationerror}>
                  {addressIsValid ? (
                    <i className={[cstyles.green, 'fas', 'fa-check'].join(' ')} />
                  ) : (
                    <span className={cstyles.red}>Invalid Address</span>
                  )}
                </div>
              </div>
              <input
                type="text"
                value={currentAddress}
                className={[cstyles.inputbox, cstyles.margintopsmall].join(' ')}
                onChange={e => this.updateAddress(e.target.value)}
              />

              <div className={cstyles.margintoplarge} />

              <button
                type="button"
                className={cstyles.primarybutton}
                disabled={!addButtonEnabled}
                onClick={this.addButtonClicked}
              >
                Add
              </button>
            </div>

            <ScrollPane offsetHeight={300}>
              <div className={styles.addressbooklist}>
                <div className={[cstyles.flexspacebetween, cstyles.marginbottomsmall, cstyles.sublight].join(' ')}>
                  <div>Label</div>
                  <div>Address</div>
                </div>
                {addressBook && addressBook.map(item => <AddressBookItem key={item.label} item={item} />)}
              </div>
            </ScrollPane>
          </div>
        </div>
      </div>
    );
  }
}
