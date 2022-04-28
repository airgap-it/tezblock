import { Component, Input, OnInit } from '@angular/core';
import BigNumber from 'bignumber.js';
import { Observable } from 'rxjs/internal/Observable';
import { of } from 'rxjs/internal/observable/of';
import { isObservable, OperatorFunction, pipe, UnaryFunction } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export function filterNullish<T>(): UnaryFunction<
  Observable<T | null | undefined>,
  Observable<T>
> {
  return pipe(
    filter((x) => x != null) as OperatorFunction<T | null | undefined, T>
  );
}
@Component({
  selector: 'amount-item',
  templateUrl: './amount-item.component.html',
  styleUrls: ['./amount-item.component.scss'],
})
export class AmountItemComponent implements OnInit {
  @Input() amount$:
    | Observable<BigNumber | undefined>
    | Promise<BigNumber | undefined>
    | BigNumber
    | number
    | undefined;
  @Input() decimals = 12;
  @Input() symbol: string = '';
  @Input() maxDecimals = 2;
  @Input() loading$: Observable<boolean> | Promise<boolean> | boolean = false;
  @Input() isBlock = true;
  @Input() roundDown = false;

  public amountAsObservable$:
    | Observable<BigNumber | undefined>
    | Promise<BigNumber | undefined>
    | undefined;
  public isLoadingObservable$:
    | Observable<boolean>
    | Promise<boolean>
    | undefined;

  constructor() {}

  ngOnInit(): void {
    if (isObservable(this.amount$)) {
      this.amountAsObservable$ = this.amount$.pipe(
        filterNullish(),
        map((amount) => {
          return new BigNumber(amount).shiftedBy(-1 * this.decimals);
        })
      );
    } else if (this.isPromise(this.amount$)) {
      this.amountAsObservable$ = this.amount$.then((number) =>
        new BigNumber(number!).shiftedBy(-1 * this.decimals)
      );
    } else {
      if (typeof this.amount$ === 'number') {
        this.amountAsObservable$ = of(
          new BigNumber(this.amount$).shiftedBy(-1 * this.decimals)
        );
      } else {
        this.amountAsObservable$ = of(
          new BigNumber(this.amount$).shiftedBy(-1 * this.decimals)
        );
      }
    }

    if (isObservable(this.loading$)) {
      this.isLoadingObservable$ = this.loading$;
    } else if (this.isPromise(this.loading$)) {
      this.isLoadingObservable$ = this.loading$;
    } else {
      //todo: pipe for loading depending on amount
      this.isLoadingObservable$ = of(this.loading$);
    }
  }

  isPromise<T>(obj: any): obj is Promise<T> {
    return obj && typeof obj.then === 'function';
  }

  isNaN(value: unknown) {
    return Number.isNaN(value);
  }
}
