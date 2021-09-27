import { Pipe, PipeTransform } from '@angular/core';
import { pipe } from 'rxjs';

import { leadingZeros, trailingZeros } from '@tezblock/domain/pattern';
import { get } from '@tezblock/services/fp';

@Pipe({
  name: 'decimalsFormatter',
})
export class DecimalsFormatterPipe implements PipeTransform {
  transform(value: any, ...args: any[]): any {
    if (!value) {
      return value;
    }

    const stringValue: string = value.toString();
    const valueParts: string[] = stringValue.split('.');
    const decimals: string = valueParts[1];
    const isZero = (value: string): boolean =>
      get<string>((_value) => parseInt(_value) === 0)(value);

    if (!decimals || isZero(decimals)) {
      return value;
    }

    const leadingZerosCount = decimals.match(leadingZeros)[0].length;
    const takeFirst3Digits = (value: string): string =>
      value.slice(leadingZerosCount, leadingZerosCount + 3);
    const when3DigitsThenDivideBy10 = (value: number): number =>
      value > 99 ? value / 10 : value;
    const toString = (value: number): string => value.toString();
    const removeTrailingZeros = (value: string): string =>
      value.replace(trailingZeros, '');
    const roundDigits = pipe(
      takeFirst3Digits,
      parseFloat,
      when3DigitsThenDivideBy10,
      Math.round,
      toString,
      removeTrailingZeros
    );

    const zeros = decimals.slice(0, leadingZerosCount);
    const roundedDigits = roundDigits(decimals);

    return `${valueParts[0]}.${zeros}${roundedDigits}`;
  }
}
