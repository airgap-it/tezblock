import { Pipe, PipeTransform } from '@angular/core'
import { ICoinProtocol } from 'airgap-coin-lib'
import { BigNumber } from 'bignumber.js'
import { isNil } from 'lodash'

import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'
import { getDecimalsForSymbol } from '@tezblock/domain/contract'

export const toXTZ = (value: number, protocol: ICoinProtocol): number => {
  const BN = BigNumber.clone({
    FORMAT: {
      decimalSeparator: `.`,
      groupSeparator: `,`,
      groupSize: 3
    }
  })

  return protocol ? new BN(value).shiftedBy(protocol.decimals * -1).toNumber() : undefined
}

const formatBigNumber = (value: BigNumber, maxDigits?: number): string => {
  if (!maxDigits) {
    return value.toFormat()
  }

  if (value.toFixed().length <= maxDigits) {
    return value.toFormat()
  }

  const integerValueLength = value.integerValue().toString().length
  if (integerValueLength >= maxDigits) {
    // We can omit floating point
    return makeFullNumberSmaller(value, maxDigits)
  }

  // Need regex to remove all unneccesary trailing zeros
  return value.toFormat(maxDigits - integerValueLength).replace(/\.?0+$/, '')
}

const makeFullNumberSmaller = (value: BigNumber, maxDigits: number): string => {
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

  return [result.toFormat(), 'M'].join('')
}

@Pipe({
  name: 'amountConverter'
})
export class AmountConverterPipe implements PipeTransform {

  constructor(private chainService: ChainNetworkService) {}

  public transform(
    value: BigNumber | string | number,
    args: { protocolIdentifier: string; maxDigits?: number }
  ): string {
    const _value = BigNumber.isBigNumber(value) ? value.toNumber() : value

    if (!args.protocolIdentifier || (isNil(_value)) || isNaN(Number(_value)) || (args.maxDigits && isNaN(Number(args.maxDigits)))) {
      return ''
    }

    const decimals: number = getDecimalsForSymbol(args.protocolIdentifier, this.chainService.getNetwork())

    const BN = BigNumber.clone({
      FORMAT: {
        decimalSeparator: `.`,
        groupSeparator: `,`,
        groupSize: 3
      }
    })
    const amount = new BN(_value).shiftedBy(decimals * -1)

    return formatBigNumber(amount, amount.isLessThan(0.01) ? undefined : args.maxDigits)
  }
}
