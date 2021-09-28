import { Pipe, PipeTransform } from '@angular/core';
import { Column } from '@tezblock/components/tezblock-table/tezblock-table.component';

@Pipe({
  name: 'filter',
})
export class FilterPipe implements PipeTransform {
  transform(items: Column[], searchText?: string): Column[] {
    return searchText
      ? items.filter((item) => {
          return (
            item.name.toLowerCase().includes(searchText.toLowerCase()) ||
            item.field.toLowerCase().includes(searchText.toLowerCase())
          );
        })
      : items;
  }
}
