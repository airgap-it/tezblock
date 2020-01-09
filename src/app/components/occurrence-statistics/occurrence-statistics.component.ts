import { Component, Input, OnInit } from '@angular/core'
import { ChartOptions } from 'chart.js'

import { defaultOptions } from '@tezblock/components/chart-item/chart-item.component'

@Component({
  selector: 'app-occurrence-statistics',
  templateUrl: './occurrence-statistics.component.html',
  styleUrls: ['./occurrence-statistics.component.scss']
})
export class OccurrenceStatisticsComponent implements OnInit {
  @Input() count: number
  @Input() label: string
  @Input() chartDatasets: { data: number[]; label: string }[]
  @Input() chartLabels: string[]

  chartOptions: ChartOptions = {
    ...defaultOptions,
    scales: {
      ...defaultOptions.scales,
      yAxes: [
        {
          display: false,
          gridLines: {
            display: false
          },
          ticks: {
            beginAtZero: true
          }
        }
      ]
    }
  }

  constructor() {}

  ngOnInit() {}
}
