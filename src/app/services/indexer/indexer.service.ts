import { Injectable, Injector } from '@angular/core';
import { ConseilService } from './conseil/conseil.service';
import { TzktService } from './tzkt/tzkt.service';

@Injectable({
  providedIn: 'root'
})
export class IndexerService {
  private selectedIndexerService: ConseilService | TzktService;
  constructor(
    private injector: Injector
  ) {
    this.selectedIndexerService = this.injector.get(TzktService)
  }
  async getContractAddresses(address: string): Promise<any> {
    return this.selectedIndexerService.getContractAddresses(address);
  }
  async accountInfo(address: string): Promise<any> {
    return this.selectedIndexerService.accountInfo(address);
  }
  async getOperations(address: string): Promise<any> {
    return this.selectedIndexerService.getOperations(address);
  }
}
