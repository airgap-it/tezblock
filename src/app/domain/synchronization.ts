import { merge, Observable, of, timer } from 'rxjs'
import { switchMap } from 'rxjs/operators'

export const refreshRate = 30000

export const getRefresh = (streams: Observable<any>[]): Observable<number> =>
  merge(of(-1), merge(streams).pipe(switchMap(() => timer(refreshRate, refreshRate))))
