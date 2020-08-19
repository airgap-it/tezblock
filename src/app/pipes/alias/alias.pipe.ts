import { Pipe, PipeTransform } from '@angular/core'

import { jsonAccounts } from '@tezblock/domain/account'
import { proposals } from '@tezblock/interfaces/proposal'

@Pipe({
  name: 'alias'
})
export class AliasPipe implements PipeTransform {
  public transform(fullAddress: string = '', kind?: string): string {
    if (kind === 'proposal') {
      return proposals[fullAddress] && !!proposals[fullAddress].alias ? proposals[fullAddress].alias : undefined
    }

    return jsonAccounts[fullAddress] && !!jsonAccounts[fullAddress].alias ? jsonAccounts[fullAddress].alias : undefined
  }
}
