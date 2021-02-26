import { Pipe, PipeTransform } from '@angular/core'
import { EcosystemItem } from '../../interfaces/Ecosystem'

@Pipe({
  name: 'ecosystemFilter',
  pure: false
})
export class EcosystemFilterPipe implements PipeTransform {
  transform(ecosystem: any[], filter: EcosystemItem): any {
    if (!ecosystem || !filter) {
      return ecosystem
    }
    // filter items array, items which match and return true will be
    // kept, false will be filtered out
    return ecosystem.filter((ecosystem) => ecosystem.category.indexOf(filter.category) !== -1)
  }
}
