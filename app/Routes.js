import React from 'react';
import { Switch, Route } from 'react-router';
import routes from './constants/routes.json';
import App from './containers/App';
import Home from './components/Home';
import Send from './components/Send';

import type State from './components/AppState';

type Props = {};

export default class RouteApp extends React.Component<Props, State> {
  timerID: IntervalID;

  constructor(props) {
    super(props);

    this.state = { balance: 0 };
  }

  componentDidMount() {
    if (this.timerID) {
      clearInterval(this.timerID);
    }

    this.timerID = setInterval(() => this.tick(), 1000);
  }

  componentWillUnmount() {}

  tick() {
    const { balance } = this.state;
    this.setState({ balance: balance + 1 });
  }

  render() {
    return (
      <App>
        <Switch>
          <Route
            path={routes.SEND}
            // eslint-disable-next-line
            component={props => <Send {...this.state} />}
          />
          <Route
            path={routes.HOME}
            // eslint-disable-next-line
            component={props => <Home {...this.state} />}
          />
        </Switch>
      </App>
    );
  }
}
