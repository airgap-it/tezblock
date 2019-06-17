import { Pipe, PipeTransform } from '@angular/core'
import { getProtocolByIdentifier } from 'airgap-coin-lib'
import { BigNumber } from 'bignumber.js'

@Pipe({
  name: 'amountConverter'
})
export class AmountConverterPipe implements PipeTransform {
  public transform(
    value: BigNumber | string | number,
    args: { protocolIdentifier: string; maxDigits?: number; fontColor?: boolean; fontSmall?: boolean }
  ): string {
    if (BigNumber.isBigNumber(value)) {
      value = value.toNumber()
    }
    if (!args.protocolIdentifier || (!value && value !== 0) || isNaN(Number(value)) || (args.maxDigits && isNaN(Number(args.maxDigits)))) {
      /* console.warn(
        `AmountConverterPipe: necessary properties missing!\n` +
          `Protocol: ${args.protocolIdentifier}\n` +
          `Value: ${value}\n` +
          `maxDigits: ${args.maxDigits}`
      ) */
      return ''
    }

    let protocol

    try {
      protocol = getProtocolByIdentifier(args.protocolIdentifier)
    } catch (e) {
      return ''
    }

    const BN = BigNumber.clone({
      FORMAT: {
        decimalSeparator: `.`,
        groupSeparator: `,`,
        groupSize: 3
      }
    })
    const amount = new BN(value).shiftedBy(protocol.decimals * -1)

    const formattedNumber = `${this.formatBigNumber(amount, args.maxDigits)}`

    const split = formattedNumber.split('.')
    const leadingChars = split[0]
    const trailingChars = split[1]
    if (trailingChars) {
      if (args.fontColor && args.fontSmall) {
        return `<span class="d-flex align-items-baseline">${leadingChars}.<span class="text-muted" style="font-size:90%">${trailingChars}</span></span>`
      } else if (args.fontColor) {
        return `<span class="d-flex align-items-baseline">${leadingChars}.<span class="text-muted">${trailingChars}</span></span>`
      } else if (args.fontSmall) {
        return `<span class="d-flex align-items-baseline">${leadingChars}.<span style="font-size:90%">${trailingChars}/span></span>`
      }
      return formattedNumber
    }
    return formattedNumber
  }

  public formatBigNumber(value: BigNumber, maxDigits?: number): string {
    if (!maxDigits) {
      return value.toFormat()
    }

    if (value.toFixed().length <= maxDigits) {
      return value.toFormat()
    }

    const integerValueLength = value.integerValue().toString().length
    if (integerValueLength >= maxDigits) {
      // We can omit floating point
      return this.makeFullNumberSmaller(value, maxDigits)
    }

    // Need regex to remove all unneccesary trailing zeros
    return value.toFormat(maxDigits - integerValueLength).replace(/\.?0+$/, '')
  }

  public makeFullNumberSmaller(value: BigNumber, maxDigits: number): string {
    if (value.toFixed().length <= maxDigits) {
      return value.toFormat()
    }

    let result = value.integerValue()

    if (result.toString().length <= maxDigits) {
      return result.toFormat()
    }

    if (result.toString().length <= 3) {
      return result.toFormat()
    }

    // number is too long, take 3 digits away and try again
    result = result.dividedToIntegerBy(1000)

    if (result.toFixed().length <= maxDigits) {
      return [result.toFormat(), 'K'].join('')
    }

    if (result.toFixed().length <= 3) {
      return [result.toFormat(), 'K'].join('')
    }

    // number is too long, take 3 digits away and try again
    result = result.dividedToIntegerBy(1000)

    return [result.toFormat(), 'M'].join('')
  }
}
