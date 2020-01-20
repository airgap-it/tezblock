import { Pipe, PipeTransform } from '@angular/core'

import { withoutBraces } from '@tezblock/services/fp'

@Pipe({
  name: 'withoutBraces'
})
export class WithoutBracesPipe implements PipeTransform {
  public transform(value: string): string {
    return withoutBraces(value)
  }
}
