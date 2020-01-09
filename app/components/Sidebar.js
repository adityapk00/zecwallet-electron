/* eslint-disable react/prop-types */
import React, { Component } from 'react';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';
import styles from './Sidebar.css';
import routes from '../constants/routes.json';

const SidebarMenuItem = ({ name, routeName, currentRoute }) => {
  let isActive = false;

  console.log(`'${currentRoute}' : '${routeName}'`);

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

  console.log(activeColorClass);

  return (
    <div className={[styles.sidebarmenuitem, activeColorClass].join(' ')}>
      <Link to={routeName}>
        <span className={activeColorClass}>{name}</span>
      </Link>
    </div>
  );
};

class Sidebar extends Component {
  render() {
    const { location } = this.props;
    console.log(location);

    return (
      <div className={styles.sidebar}>
        <SidebarMenuItem
          name="Dashboard"
          routeName={routes.HOME}
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
      </div>
    );
  }
}

export default withRouter(Sidebar);
