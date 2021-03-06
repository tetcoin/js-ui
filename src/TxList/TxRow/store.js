// Copyright 2015-2017 Parity Technologies (UK) Ltd.
// This file is part of Parity.

// Parity is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// Parity is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with Parity.  If not, see <http://www.gnu.org/licenses/>.

import { action, observable } from 'mobx';

let instance;

export default class Store {
  @observable accounts = [];
  @observable contracts = [];

  constructor (api) {
    this._api = api;

    this._api.on('connected', this.setupSubscriptions, this);

    if (this._api.isConnected) {
      this.setupSubscriptions();
    }
  }

  isAccount = (address) => {
    return this.accounts.includes(address.toLowerCase());
  }

  isContract = (address) => {
    return this.contracts.includes(address.toLowerCase());
  }

  @action setAccounts = (accounts) => {
    this.accounts = accounts;
  }

  @action setContracts = (contracts) => {
    this.contracts = contracts;
  }

  setupSubscriptions = () => {
    this._api.subscribe('parity_allAccountsInfo', (error, allAccounts) => {
      if (error) {
        return;
      }

      const accounts = [];
      const contracts = [];

      allAccounts.forEach(({ address, meta, uuid }) => {
        const lAddress = address.toLowerCase();

        if (uuid) {
          accounts.push(lAddress);
        } else if (meta) {
          if (meta.contract) {
            contracts.push(lAddress);
          } else if (meta.hardware || meta.external) {
            accounts.push(lAddress);
          }
        }
      });

      this.setAccounts(accounts);
      this.setContracts(contracts);
    });
  }

  static get (api) {
    if (!instance) {
      instance = new Store(api);
    }

    return instance;
  }
}
