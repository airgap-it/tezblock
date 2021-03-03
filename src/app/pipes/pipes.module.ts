import { PercentagePipe } from './percentage/percentage.pipe'
import { NgModule } from '@angular/core'

import { AliasPipe } from './alias/alias.pipe'
import { AmountConverterPipe } from './amount-converter/amount-converter.pipe'
import { CurrencyConverterPipe } from './currency-converter/currency-converter.pipe'
import { CurrencySymbolPipe } from './currency-symbol/currency-symbol.pipe'
import { IconPipe } from './icon/icon.pipe'
import { SafeHtmlPipe } from './safe-html/safe-html.pipe'
import { ShortenStringPipe } from './shorten-string/shorten-string.pipe'
import { WithoutBracesPipe } from './without-braces.pipe'
import { FilterPipe } from './filter/filter.pipe'
import { DecimalsFormatterPipe } from './decimals-formatter/decimals-formatter.pipe'
import { EcosystemFilterPipe } from './ecosystem-filter/ecosystem-filter.pipe'

@NgModule({
  declarations: [
    ShortenStringPipe,
    AmountConverterPipe,
    CurrencyConverterPipe,
    CurrencySymbolPipe,
    AliasPipe,
    SafeHtmlPipe,
    IconPipe,
    PercentagePipe,
    WithoutBracesPipe,
    FilterPipe,
    DecimalsFormatterPipe,
    EcosystemFilterPipe
  ],
  providers: [
    ShortenStringPipe,
    AmountConverterPipe,
    CurrencyConverterPipe,
    CurrencySymbolPipe,
    AliasPipe,
    SafeHtmlPipe,
    IconPipe,
    PercentagePipe,
    WithoutBracesPipe,
    FilterPipe,
    DecimalsFormatterPipe,
    EcosystemFilterPipe
  ],
  imports: [],
  exports: [
    ShortenStringPipe,
    AmountConverterPipe,
    CurrencyConverterPipe,
    CurrencySymbolPipe,
    AliasPipe,
    SafeHtmlPipe,
    IconPipe,
    PercentagePipe,
    WithoutBracesPipe,
    FilterPipe,
    DecimalsFormatterPipe,
    EcosystemFilterPipe
  ]
})
export class PipesModule {}
