import {
  ChangeDetectorRef,
  Component,
  OnInit,
  AfterViewInit,
  ElementRef,
  Renderer2,
  ViewChild,
} from '@angular/core';
import * as tinycolor2 from 'tinycolor2';
import { Store } from '@ngrx/store';
import { combineLatest, Subject, Observable } from 'rxjs';

import * as fromRoot from '@tezblock/reducers';
import * as actions from './actions';
import { getCountryColors } from './country-colors';
import { Heatmap, Node } from './model';
import { BaseComponent } from '@tezblock/components/base.component';
import { Column } from '@tezblock/components/tezblock-table/tezblock-table.component';
import { columns } from './table-definitions';
import { OrderBy } from '@tezblock/services/base.service';

// https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/fill-rule
const fillRule = 'evenodd'; // evenodd | nonzero

@Component({
  selector: 'app-nodes-on-map',
  templateUrl: './nodes-on-map.component.html',
  styleUrls: ['./nodes-on-map.component.scss'],
})
export class NodesOnMapComponent
  extends BaseComponent
  implements OnInit, AfterViewInit
{
  @ViewChild('world', { static: true }) worldSVG: ElementRef;
  @ViewChild('tooltip') tooltip: ElementRef;

  orderBy$: Observable<OrderBy>;
  data$: Observable<Node[]>;
  loading$: Observable<boolean>;
  showLoadMore$: Observable<boolean>;
  columns: Column[];
  selectedCountry: Heatmap;
  connectedNodesPerCountry$: Observable<Heatmap[]>;
  isMapReady$ = new Subject<NodeListOf<SVGPathElement>>();

  constructor(
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly renderer: Renderer2,
    private readonly store$: Store<fromRoot.State>
  ) {
    super();
  }

  ngOnInit() {
    this.store$.dispatch(actions.loadConnectedNodes());
    this.store$.dispatch(actions.loadConnectedNodesPerCountry());

    this.columns = columns();
    this.data$ = this.store$.select(fromRoot.connectedNodes.data);
    this.loading$ = this.store$.select(
      (state) => state.connectedNodes.connectedNodes.loading
    );
    this.showLoadMore$ = this.store$.select(
      fromRoot.connectedNodes.showLoadMore
    );
    this.connectedNodesPerCountry$ = this.store$.select(
      (state) => state.connectedNodes.connectedNodesPerCountry
    );
    this.subscriptions.push(
      combineLatest([
        this.isMapReady$,
        this.connectedNodesPerCountry$,
      ]).subscribe(this.onMapDataReady.bind(this))
    );
    this.orderBy$ = this.store$.select(
      (state) => state.connectedNodes.connectedNodes.orderBy
    );
  }

  ngAfterViewInit() {
    const objElm = this.worldSVG.nativeElement as HTMLObjectElement;

    objElm.onload = () => {
      const paths: NodeListOf<SVGPathElement> =
        objElm.contentDocument.querySelectorAll('path');

      this.isMapReady$.next(paths);
    };
  }

  loadMore() {
    this.store$.dispatch(actions.loadMoreConnectedNodes());
  }

  private onMapDataReady([pathList, connectedNodesPerCountry]: [
    NodeListOf<SVGPathElement>,
    Heatmap[]
  ]) {
    if (!connectedNodesPerCountry) {
      // the initial state of connectedNodesPerCountry is undefined
      return;
    }
    const countryColors = getCountryColors();
    const areNodesForCountry = (path: SVGPathElement): boolean => {
      return connectedNodesPerCountry.some(
        (node) => node.countryCode === path.id
      );
    };
    const attachPopup = (svgPathElement: SVGPathElement) => {
      svgPathElement.onmouseenter = (e: MouseEvent) => {
        const path = e.target as HTMLElement;
        const coordinates = path.getBoundingClientRect();

        const x = `${coordinates.left + coordinates.width / 2}px`;
        const y = `${coordinates.top + coordinates.height / 2}px`;

        this.selectedCountry = connectedNodesPerCountry.find(
          (node) => node.countryCode === path.id
        );
        this.changeDetectorRef.detectChanges();
        path.setAttribute(
          'style',
          `fill: ${tinycolor2(countryColors[path.id]).darken(
            15
          )};fill-rule:${fillRule}`
        );
        this.renderer.setStyle(this.tooltip.nativeElement, 'left', x);
        this.renderer.setStyle(this.tooltip.nativeElement, 'top', y);
        this.renderer.setStyle(this.tooltip.nativeElement, 'display', 'block');
      };
      svgPathElement.onmouseleave = (e: MouseEvent) => {
        svgPathElement.setAttribute(
          'style',
          `fill: ${countryColors[svgPathElement.id]};fill-rule:${fillRule}`
        );
        this.renderer.setStyle(this.tooltip.nativeElement, 'display', 'none');
      };
    };

    pathList.forEach((path) => {
      if (areNodesForCountry(path)) {
        path.setAttribute('style', `fill: ${countryColors[path.id]}`);
        attachPopup(path);
      }
    });
  }

  sortBy(orderBy: OrderBy) {
    this.store$.dispatch(actions.sortNodes({ orderBy }));
  }
}
