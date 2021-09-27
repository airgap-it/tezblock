import { Component, Input, OnInit } from '@angular/core';
import { ChartOptions } from 'chart.js';

import { defaultOptions } from '@tezblock/components/chart-item/chart-item.component';

const defaultChartOptions: ChartOptions = {
  ...defaultOptions,
  scales: {
    ...defaultOptions.scales,
    yAxes: [
      {
        display: false,
        gridLines: {
          display: false,
        },
        ticks: {
          beginAtZero: true,
        },
      },
    ],
  },
};

@Component({
  selector: 'app-occurrence-statistics',
  templateUrl: './occurrence-statistics.component.html',
  styleUrls: ['./occurrence-statistics.component.scss'],
})
export class OccurrenceStatisticsComponent implements OnInit {
  @Input() count: number;
  @Input() kind: string;
  @Input() chartDatasets: { data: number[]; label: string }[];
  @Input() chartLabels: string[];

  @Input()
  set chartOptions(value: ChartOptions) {
    if (value !== this._chartOptions) {
      this._chartOptions = value;
    }
  }
  get chartOptions(): ChartOptions {
    return this._chartOptions || defaultChartOptions;
  }

  private _chartOptions: ChartOptions;

  constructor() {}

  ngOnInit() {}
}
