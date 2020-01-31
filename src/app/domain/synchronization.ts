import { merge, Observable, of, timer } from 'rxjs'
import { filter, map, switchMap } from 'rxjs/operators'

import { refreshRate } from '@tezblock/services/facade/facade'

export const getRefresh = (streams: Observable<any>[]): Observable<number> =>
  merge(of(-1), merge(streams).pipe(switchMap(() => timer(refreshRate, refreshRate))))
