import { Injectable } from '@angular/core';
import { WalletService } from '../wallet/wallet.service';
import { ConseilService } from '../conseil/conseil.service';
import { of, Observable } from 'rxjs';
import { flatMap } from 'rxjs/operators';
import { Activity, Account } from '../wallet/wallet';
import { MessageService } from '../message/message.service';
import { Constants } from '../../constants';

@Injectable()
export class ActivityService {
  CONSTANTS = new Constants();
  maxTransactions = 10;
  constructor(
    private walletService: WalletService,
    private conseilService: ConseilService,
    private messageService: MessageService
  ) {}
  updateTransactions(pkh): Observable<any> {
    try {
      const account = this.walletService.wallet.getAccount(pkh);
      return this.getTransactonsCounter(account).pipe(
        flatMap((ans: any) => {
          return of(ans);
        })
      );
    } catch (e) {
      console.log(e);
    }
  }
  getTransactonsCounter(account): Observable<any> {
    return this.conseilService.accountInfo(account.address).pipe(
      flatMap((counter) => {
        if (account.activitiesCounter !== counter) {
          return this.getAllTransactions(account, counter);
        } else {
          return of({
            upToDate: true,
          });
        }
      })
    );
  }
  getAllTransactions(account, counter): Observable<any> {
    return this.conseilService.getOperations(account.address).pipe(
      flatMap((ans) => {
        if (Array.isArray(ans)) {
          const oldActivities = account.activities;
          account.activities = ans;
          const oldActivitiesCounter = account.activitiesCounter;
          account.activitiesCounter = counter;
          console.log(oldActivitiesCounter + ' # ' + counter);
          this.walletService.storeWallet();
          if (oldActivitiesCounter !== -1) { // Exclude inital loading
            this.promptNewActivities(account, oldActivities, ans);
          } else {
            console.log('# Excluded ' + counter);
          }
        } else {
          console.log('#');
          console.log(ans);
        }
        return of({
          upToDate: false
        });
      })
    );
  }
  promptNewActivities(account: Account, oldActivities: Activity[], newActivities: Activity[]) {
    for (const activity of newActivities) {
      const index = oldActivities.findIndex((a) => a.hash === activity.hash);
      if (index === -1 || (index !== -1 && oldActivities[index].status === 0)) {
        if (activity.type === 'transaction') {
          if (account.address === activity.source) {
            this.messageService.addSuccess(account.shortAddress() + ': Sent ' + activity.amount / 1000000 + ' tez');
          }
          if (account.address === activity.destination) {
            this.messageService.addSuccess(account.shortAddress() + ': Received ' + activity.amount / 1000000 + ' tez');
          }
        } else if (activity.type === 'delegation') {
          this.messageService.addSuccess(account.shortAddress() + ': Delegate updated');
        } else if (activity.type === 'origination') {
          this.messageService.addSuccess(account.shortAddress() + ': Account originated');
        } else if (activity.type === 'activation') {
          this.messageService.addSuccess(account.shortAddress() + ': Account activated');
        }
      }
    }
  }
  async getAssetsContext() {
    const contractAddresses = Object.keys(this.CONSTANTS.NET.ASSETS);
    console.log(contractAddresses);
    for (const contractAddress of contractAddresses) {
      let asset = this.walletService.wallet.getAsset(contractAddress);
      let update = true;
      if (asset) {
        const head = await this.getAssetContext(contractAddress, 1);
        update = head[0].data.level !== asset.level;
      } else {
        this.walletService.wallet.assetBigMaps.push({contract: contractAddress, level: '', data: null});
      }
      if (update) {
        console.log('updating: ' + this.CONSTANTS.NET.ASSETS[contractAddress].name);
        const context = await this.getAssetContext(contractAddress, 10000);
        console.log(context);
        this.walletService.wallet.updateAsset(contractAddress, context[0].data.level, context);
        this.walletService.storeWallet();
        this.updateAssetBalances(contractAddress, context);
      } else {
        console.log('up-to-date: ' + this.CONSTANTS.NET.ASSETS[contractAddress].name);
      }
    }
  }
  async getAssetContext(key: string, size: number): Promise<any> {
    let net = 'carthagenet'
    if (this.CONSTANTS.NET.NETWORK === 'mainnet') {
      net = 'mainnet';
    }
    if (this.CONSTANTS.NET.ASSETS[key]) {
      const bigMapId = this.CONSTANTS.NET.ASSETS[key].bigMapId;
      const context = await fetch(`https://api.better-call.dev/v1/bigmap/${net}/${bigMapId}/keys?size=${size}`, {}).then(response => {
        return response.json();
      });
      return context;
    }
    else {
      return null;
    }
  }
  async updateAssetBalances(contractAddress: string, context: any) {
    const implicitAccounts = this.walletService.wallet.getImplicitAccounts();
    const tzBTC = (contractAddress === 'KT1TjdF4H8H2qzxichtEbiCwHxCRM1SVx6B7');
    const tzBadger = (contractAddress === 'KT1VAkwDFNSUWrjic97ivkMzauU7cpb99H74');
    if (tzBadger) {
      console.log('-------------------- TzBadger ------------------------');
    }
    let key_strings: string[] = [];
    if (tzBTC) {
      for (let impAcc of implicitAccounts) {
        key_strings.push(`Pair "ledger" "${impAcc.pkh}"`);
      }
    } else {
      for (let impAcc of implicitAccounts) {
        key_strings.push(`${impAcc.pkh}`);
      }
    }
    if (this.CONSTANTS.NET.ASSETS[contractAddress].class === 'FA1.2') { // FA1.2
      // if 
      for (const entry of context) {
        const index = key_strings.indexOf(entry.data.key_string);
        if (index !== -1) {
          let balance = '0';
          if (tzBTC) {
            balance = entry.data.value.value.match(/(?<=(Pair\s){1})\d+(?=\s\{\})/g)[0];
          } else {
            if (entry.data.value) {
              for (const child of entry.data.value.children) {
                if (child.name === 'balance') {
                  balance = child.value;
                  break;
                }
              }
            } else {
              balance = '0';
            }
          }
          implicitAccounts[index].updateAssetBalance(contractAddress, balance);
        }
      }
    } else if (this.CONSTANTS.NET.ASSETS[contractAddress].class === 'FA2') { // FA2
      console.log('???????????');
      console.log(context);
      for (const entry of context) {
        const childIndex = entry.data.key.children.indexOf(child => child.prim === 'address');
        if (childIndex !== -1) {
          const index = key_strings.indexOf(entry.data.key.children[childIndex].value);
          if (index !== -1) {
            console.log('HIT!');
            let balance = '0';
          }
        }
      }
    }
    this.dumpOtherBalances();
  }
  dumpOtherBalances() {
    console.log('# DUMP ASSET BALANCES #');
    const implicitAccounts = this.walletService.wallet.getImplicitAccounts();
    for (const impAcc of implicitAccounts) {
      console.log('* ' + impAcc.pkh + ' *');
      if (impAcc.otherAssets.length > 0) {
        for (const asset of impAcc.otherAssets) {
          console.log(this.CONSTANTS.NET.ASSETS[asset.contractAddress].name + ': ' + asset.balance);
        }
      } else {
        console.log('-');
      }
    }
  }
}
