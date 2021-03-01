import { Pipe, PipeTransform } from '@angular/core'
import { EcosystemItem } from '../../interfaces/Ecosystem'

@Pipe({
  name: 'ecosystemFilter',
  pure: false
})
export class EcosystemFilterPipe implements PipeTransform {
  transform(ecosystem: EcosystemItem[], filter: { category: string }): any {
    console.log('ecosystem: ', ecosystem)
    if (!ecosystem || !filter) {
      return ecosystem
    }
    // filter items array, items which match and return true will be
    // kept, false will be filtered out
    const filteredEcosystems = ecosystem.filter((ecosystem) => ecosystem.category.indexOf(filter.category) !== -1)
    const sortedEcosystems = filteredEcosystems.sort((a, b) => a.title.localeCompare(b.title))
    return sortedEcosystems
  }
}
