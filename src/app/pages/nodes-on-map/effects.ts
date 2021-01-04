import { Injectable } from '@angular/core'
import { Actions, createEffect, ofType } from '@ngrx/effects'
import { of } from 'rxjs'
import { map, catchError, switchMap, withLatestFrom } from 'rxjs/operators'
import { Store } from '@ngrx/store'
import * as actions from './actions'
import * as fromRoot from '@tezblock/reducers'
import { Node, Heatmap } from './model'
import { HttpClient } from '@angular/common/http'
import { NodeService } from '@tezblock/services/node/node.service'

@Injectable()
export class NodesOnMapEffects {
  private baseUrl = 'https://services.tzkt.io/v1/nodes'

  loadConnectedNodes$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadConnectedNodes),
      withLatestFrom(
        this.store$.select(state => state.connectedNodes.connectedNodes.orderBy),
      ),
      switchMap((orderBy) =>
        this.nodeService.loadConnectedNodes(orderBy).pipe(map((nodes: any) => nodes as Node[])).pipe(
          map(data => actions.loadConnectedNodesSucceeded({ data })),
          catchError(error => of(actions.loadConnectedNodesFailed({ error })))
        )
      )
    )
  )

  loadConnectedNodesPerCountry$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.loadConnectedNodesPerCountry),
      switchMap(() =>
        this.nodeService.loadConnectedNodesPerCountry().pipe(
          map(connectedNodesPerCountry =>
            actions.loadConnectedNodesPerCountrySucceeded({ connectedNodesPerCountry })
          ),
          catchError(error => of(actions.loadConnectedNodesPerCountryFailed({ error })))
        )
      )
    )
  )

  onSorting$ = createEffect(() =>
    this.actions$.pipe(
      ofType(actions.sortNodes),
      map(() => actions.loadConnectedNodes())
    )
  )

  constructor(private readonly actions$: Actions, private readonly store$: Store<fromRoot.State>, private readonly httpClient: HttpClient, private readonly nodeService: NodeService) {
  }

}
