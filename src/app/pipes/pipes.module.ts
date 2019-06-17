import { NgModule } from '@angular/core'

import { AliasPipe } from './alias/alias.pipe'
import { AmountConverterPipe } from './amount-converter/amount-converter.pipe'
import { CurrencyConverterPipe } from './currency-converter/currency-converter.pipe'
import { CurrencySymbolPipe } from './currency-symbol/currency-symbol.pipe'
import { ShortenStringPipe } from './shorten-string/shorten-string.pipe'
import { SafeHtmlPipe } from './safe-html/safe-html.pipe';

@NgModule({
  declarations: [ShortenStringPipe, AmountConverterPipe, CurrencyConverterPipe, CurrencySymbolPipe, AliasPipe, SafeHtmlPipe],
  providers: [ShortenStringPipe, AmountConverterPipe, CurrencyConverterPipe, CurrencySymbolPipe, AliasPipe, SafeHtmlPipe],
  imports: [],
  exports: [ShortenStringPipe, AmountConverterPipe, CurrencyConverterPipe, CurrencySymbolPipe, AliasPipe, SafeHtmlPipe]
})
export class PipesModule { }
