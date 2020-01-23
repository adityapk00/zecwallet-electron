/* eslint-disable react/prop-types */
import React, { PureComponent } from 'react';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import styles from './Sidebar.css';
import cstyles from './Common.css';
import routes from '../constants/routes.json';
import Logo from '../assets/img/logobig.gif';

const SidebarMenuItem = ({ name, routeName, currentRoute }) => {
  let isActive = false;

  if (
    (currentRoute.endsWith('app.html') && routeName === routes.HOME) ||
    currentRoute === routeName
  ) {
    isActive = true;
  }

  let activeColorClass = '';
  if (isActive) {
    activeColorClass = styles.sidebarmenuitemactive;
  }

  return (
    <div className={[styles.sidebarmenuitem, activeColorClass].join(' ')}>
      <Link to={routeName}>
        <span className={activeColorClass}>{name}</span>
      </Link>
    </div>
  );
};

class Sidebar extends PureComponent {
  render() {
    const { location, statusMessage } = this.props;

    return (
      <div>
        <div className={[cstyles.center, styles.sidebarlogobg].join(' ')}>
          <img src={Logo} width="70" alt="logo" />
        </div>

        <div className={styles.sidebar}>
          <SidebarMenuItem
            name="Dashboard"
            routeName={routes.DASHBOARD}
            currentRoute={location.pathname}
          />
          <SidebarMenuItem
            name="Send"
            routeName={routes.SEND}
            currentRoute={location.pathname}
          />
          <SidebarMenuItem
            name="Receive"
            routeName={routes.RECEIVE}
            currentRoute={location.pathname}
          />
          <SidebarMenuItem
            name="Address Book"
            routeName={routes.ADDRESSBOOK}
            currentRoute={location.pathname}
          />
          <SidebarMenuItem
            name="Settings"
            routeName={routes.SETTINGS}
            currentRoute={location.pathname}
          />
          <SidebarMenuItem
            name="zcashd"
            routeName={routes.ZCASHD}
            currentRoute={location.pathname}
          />
          {statusMessage && (
            <div>
              <span>{statusMessage}</span>
            </div>
          )}
        </div>
      </div>
    );
  }
}

export default withRouter(Sidebar);
