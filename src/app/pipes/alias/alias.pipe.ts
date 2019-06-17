import { Pipe, PipeTransform } from '@angular/core'
const accounts = require('../../../assets/bakers/json/accounts.json')

@Pipe({
  name: 'alias'
})
export class AliasPipe implements PipeTransform {
  public transform(fullAddress: string = ''): string {
    return accounts[fullAddress] && !!accounts[fullAddress].alias ? accounts[fullAddress].alias : undefined
  }
}
