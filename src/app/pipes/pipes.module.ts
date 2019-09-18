import { NgModule } from '@angular/core'

import { AliasPipe } from './alias/alias.pipe'
import { AmountConverterPipe } from './amount-converter/amount-converter.pipe'
import { CurrencyConverterPipe } from './currency-converter/currency-converter.pipe'
import { CurrencySymbolPipe } from './currency-symbol/currency-symbol.pipe'
import { IconPipe } from './icon/icon.pipe'
import { SafeHtmlPipe } from './safe-html/safe-html.pipe'
import { ShortenStringPipe } from './shorten-string/shorten-string.pipe'

@NgModule({
  declarations: [ShortenStringPipe, AmountConverterPipe, CurrencyConverterPipe, CurrencySymbolPipe, AliasPipe, SafeHtmlPipe, IconPipe],
  providers: [ShortenStringPipe, AmountConverterPipe, CurrencyConverterPipe, CurrencySymbolPipe, AliasPipe, SafeHtmlPipe, IconPipe],
  imports: [],
  exports: [ShortenStringPipe, AmountConverterPipe, CurrencyConverterPipe, CurrencySymbolPipe, AliasPipe, SafeHtmlPipe, IconPipe]
})
export class PipesModule {}
