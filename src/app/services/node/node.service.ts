import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TypedAction } from '@ngrx/store/src/models';
import { Heatmap, Node } from '@tezblock/pages/nodes-on-map/model';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { OrderBy } from '../base.service';

@Injectable({
  providedIn: 'root',
})
export class NodeService {
  private nodes: Node[];
  private baseUrl = '';

  constructor(private readonly httpClient: HttpClient) {}

  loadConnectedNodes(
    orderBy?: [TypedAction<string>, OrderBy]
  ): Observable<Node[]> {
    if (this.nodes && orderBy[1]) {
      return of(this.sortedNodes(orderBy[1]));
    }
    return this.httpClient
      .get<Node[]>(`${this.baseUrl}/public`)
      .pipe(map((nodes) => (this.nodes = nodes)));
  }

  loadConnectedNodesPerCountry(): Observable<Heatmap[]> {
    return this.httpClient
      .get<Heatmap[]>(`${this.baseUrl}/stats`)
      .pipe(map((stats: any) => stats.heatmap as Heatmap[]));
  }

  sortedNodes(orderBy: OrderBy) {
    if (!orderBy) {
      return this.nodes;
    }
    return orderBy.direction === 'asc'
      ? Array.from(this.nodes).sort((a, b) =>
          a[orderBy.field] > b[orderBy.field] ? 1 : -1
        )
      : Array.from(this.nodes).sort((a, b) =>
          a[orderBy.field] < b[orderBy.field] ? 1 : -1
        );
  }
}
