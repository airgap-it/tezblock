import { Pipe, PipeTransform } from '@angular/core'
const accounts = require('src/submodules/tezos_assets/accounts.json')
const proposals = require('../../../assets/proposals/json/proposals.json')

@Pipe({
  name: 'alias'
})
export class AliasPipe implements PipeTransform {
  public transform(fullAddress: string = '', kind?: string): string {
    if (kind === 'proposal') {
      return proposals[fullAddress] && !!proposals[fullAddress].alias ? proposals[fullAddress].alias : undefined
    }

    return accounts[fullAddress] && !!accounts[fullAddress].alias ? accounts[fullAddress].alias : undefined
  }
}
