import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortenString',
})
export class ShortenStringPipe implements PipeTransform {
  public transform(value: string) {
    if (!value || typeof value !== 'string') {
      return '';
    }

    return value.length >= 12
      ? `${value.substr(0, 5)}...${value.substr(-5)}`
      : value;
  }
}
