import { Injectable } from '@angular/core';
import { MessageService } from './message.service';

import * as lib from '../../assets/js/main.js';
import * as bip39 from 'bip39';
import * as CryptoJS from 'crypto-js';
import * as rnd2 from 'randomatic';

export interface KeyPair {
  sk: string|null;
  pk: string|null;
  pkh: string;
}
export interface Account {
  keyPair: KeyPair|null;
  balance: number;
  pending: number;
  balanceFiat: number;
  pendingFiat: number;
}
export interface Wallet {
  mnemonic: string|null;
  salt: string|null;
  balance: number;
  pending: number;
  balanceFiat: number;
  pendingFiat: number;
  account: Account|null;
}
@Injectable()
export class WalletService {
  wallet: Wallet = {
    mnemonic: null,
    salt: null,
    balance: 0,
    pending: 0,
    balanceFiat: 0,
    pendingFiat: 0,
    account: null
  };
  constructor(private messageService: MessageService) { }
  createNewWallet(): string {
    this.wallet.mnemonic = bip39.generateMnemonic();
    this.messageService.add('seed: ' + this.wallet.mnemonic);
    this.wallet.salt =  rnd2('aA0', 16);  // utf8Encode(rnd(32));
    this.messageService.add('salt: ' + this.wallet.salt);
    this.createNewAccount();
    return this.wallet.mnemonic;
  }
  createNewAccount() {
    this.wallet.account = {
      keyPair: null,
      balance: 0,
      pending: 0,
      balanceFiat: 0,
      pendingFiat: 0
    };
    this.createNewKeyPair();
  }
  createNewKeyPair() {
      const keyPair = this.keyPairFromMnemonic(this.wallet.mnemonic, 1);
      this.wallet.account.keyPair = {
        sk: null,
        pk: null,
        pkh: keyPair.pkh
      };
  }
  keyPairFromMnemonic(mnemonic: string, n: number) {
      return lib.eztz.crypto.generateKeysFromSeedMulti(mnemonic, '', n);
  }
  encrypt(plaintext: string, password: string): any {
    const chiphertext = CryptoJS.AES.encrypt(plaintext, password + this.wallet.salt).toString();
    this.messageService.add('Encrypted: ' + chiphertext);
    return {seed: chiphertext, salt: this.wallet.salt};
  }
  decrypt(chiphertext: string, password: string): string {
    try {
      const plainbytes = CryptoJS.AES.decrypt(chiphertext, password + this.wallet.salt);
      const plaintext = plainbytes.toString(CryptoJS.enc.Utf8);
      this.messageService.add('Decrypted: ' + plaintext);
      return plaintext;
    } catch (err) {
      return '';
    }
  }
  encryptWallet(password: string): any {
    this.wallet.mnemonic = this.encrypt(this.wallet.mnemonic, password);
    return this.wallet.mnemonic;
  }
  decryptWallet(password: string) {
    const mnemonic = this.wallet.mnemonic = this.decrypt(this.wallet.mnemonic, password);
    if (mnemonic === '') {
      this.messageService.add('Decryption failed');
    } else {
      this.wallet.mnemonic = mnemonic;
    }
  }
}