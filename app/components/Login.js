/* eslint-disable react/button-has-type */
/* eslint-disable class-methods-use-this */
// @flow
import { remote, ipcRenderer } from 'electron';
import fs from 'fs';
import React, { Component } from 'react';
import ReactLoading from 'react-loading';
import { Redirect, Link } from 'react-router-dom';
import log from 'electron-log';
import { config, session, directories, eventEmitter } from '../index';
import navBar from './NavBar';
import routes from '../constants/routes';

// import styles from './Send.css';

type Props = {
  syncStatus: number,
  unlockedBalance: number,
  lockedBalance: number,
  transactions: Array<string>,
  handleSubmit: () => void,
  transactionInProgress: boolean
};

export default class Login extends Component<Props> {
  props: Props;

  constructor(props?: Props) {
    super(props);
    this.state = {
      importkey: false,
      importseed: false,
      importCompleted: false
    };
  }

  componentDidMount() {
    this.interval = setInterval(() => this.refresh(), 1000);
    ipcRenderer.on('importSeed', (evt, route) =>
      this.handleImportFromSeed(evt, route)
    );
    ipcRenderer.on('importKey', (evt, route) =>
      this.handleImportFromKey(evt, route)
    );
    eventEmitter.on('initializeNewSession', this.handleInitialize.bind(this));
  }

  componentWillUnmount() {
    clearInterval(this.interval);
    ipcRenderer.off('importSeed', this.handleImportFromSeed);
    ipcRenderer.off('importKey', this.handleImportFromKey);
    eventEmitter.off('initializeNewSession', this.handleInitialize);
  }

  handleInitialize() {
    this.setState({
      importCompleted: true
    });
  }

  handleImportFromSeed(evt, route) {
    clearInterval(this.interval);
    ipcRenderer.off('importSeed', this.handleImportFromSeed);
    this.setState({
      importseed: true
    });
  }

  handleImportFromKey(evt, route) {
    clearInterval(this.interval);
    ipcRenderer.off('importKey', this.handleImportFromKey);
    this.setState({
      importkey: true
    });
  }

  handleSubmit(event) {
    // We're preventing the default refresh of the page that occurs on form submit
    event.preventDefault();

    let password = event.target[0].value;

    if (password === undefined) {
      return;
    }
    eventEmitter.emit('initializeNewSession', password);
  }

  refresh() {
    this.setState(prevState => ({
      syncStatus: session.getSyncStatus(),
      unlockedBalance: session.getUnlockedBalance(),
      lockedBalance: session.getLockedBalance(),
      transactions: session.getTransactions()
    }));
  }

  render() {
    if (this.state.importseed === true) {
      return <Redirect to="/import" />;
    }
    if (this.state.importCompleted === true) {
      return <Redirect to="/" />;
    }
    return (
      <div>
        {navBar('login')}
        <div className="box has-background-light maincontent">
          <div className="box loginbox has-background-grey-light">
            <form onSubmit={this.handleSubmit}>
              <div className="field">
                <label className="label" htmlFor="scanheight">
                  Password
                  <div className="control">
                    <input
                      className="input is-large"
                      type="password"
                      placeholder="Enter your password..."
                      id="scanheight"
                    />
                  </div>
                </label>
              </div>
              <div className="buttons is-right">
                <button type="submit" className="button is-success is-large">
                  Login
                </button>
              </div>
            </form>
          </div>
        </div>
        <div className="box has-background-grey-light footerbar" />
      </div>
    );
  }
}