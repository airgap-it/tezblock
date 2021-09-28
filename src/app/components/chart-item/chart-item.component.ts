import { AfterViewInit, Component, Input, ViewChild } from '@angular/core';
import { BaseChartDirective, Color } from 'ng2-charts';
import { ChartOptions, ChartSize } from 'chart.js';

export const defaultOptions: ChartOptions = {
  responsive: true,
  layout: {
    padding: {
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    },
  },
  animation: {
    duration: 1250, // general animation time
  },
  hover: {
    animationDuration: 250, // duration of animations when hovering an item
    intersect: false,
    mode: 'x-axis',
  },
  responsiveAnimationDuration: 0, // animation duration after a resize
  legend: {
    display: false,
  },
  scales: {
    yAxes: [
      {
        display: false,
        gridLines: {
          display: false,
        },
      },
    ],
    xAxes: [
      {
        display: false,
        gridLines: {
          display: false,
        },
      },
    ],
  },
  elements: {
    point: {
      radius: 1,
    },
    line: {
      tension: 0, // disables bezier curves
    },
  },

  tooltips: {
    mode: 'x-axis',
    intersect: false,
    displayColors: false, // removes color box and label

    callbacks: {
      title: function (data) {
        if (data[0].label.includes(':')) {
          return data[0].label.slice(0, -3);
        } else {
          return data[0].label;
        }
      },
      label: function (data, labels): string {
        if (Number(data.value) % 1 !== 0) {
          let value = parseFloat(data.value).toFixed(2);
          if (labels.datasets[0].label === 'Balance') {
            return value + ' ꜩ';
          } else {
            return '$' + value;
          }
        } else {
          return data.value;
        }
      },
    },
  },
};

export interface ColorOptions {
  gradientFrom: string;
  borderWidth?: number;
  colors?: any[];
}

@Component({
  selector: 'chart-item',
  templateUrl: './chart-item.component.html',
  styleUrls: ['./chart-item.component.scss'],
})
export class ChartItemComponent implements AfterViewInit {
  @ViewChild(BaseChartDirective, { static: true }) chart: BaseChartDirective;

  @Input() datasets: { data: number[]; label: string }[];

  @Input() labels: string[];

  @Input()
  set options(value: ChartOptions) {
    if (value !== this._options) {
      this._options = value;
    }
  }
  get options(): ChartOptions {
    return this._options || defaultOptions;
  }
  private _options: ChartOptions;

  @Input()
  set chartType(value: string) {
    if (value !== this._chartType) {
      this._chartType = value;
    }
  }
  get chartType(): string {
    return this._chartType || 'line';
  }
  private _chartType: string;

  @Input() colorOptions: ColorOptions = {
    gradientFrom: 'rgba(46,91,255,0.00)',
  };

  @Input() colors: any[] = [];

  @Input() size: ChartSize; // = { width: 700, height: 200 }

  constructor() {}

  ngAfterViewInit() {
    const navyBlue = '#2E5BFF';

    if (this.chart && this.colors.length === 0) {
      const ctx: CanvasRenderingContext2D = this.chart
        .ctx as any as CanvasRenderingContext2D;

      const gradientStroke1: CanvasGradient = ctx.createLinearGradient(
        0,
        10,
        0,
        0
      );
      gradientStroke1.addColorStop(0, navyBlue); // rgb(122, 141, 169)

      const gradientFill1: CanvasGradient = ctx.createLinearGradient(
        0,
        100,
        0,
        0
      );
      gradientFill1.addColorStop(0, this.colorOptions.gradientFrom);
      gradientFill1.addColorStop(1, 'rgba(46,91,255,0.24)');

      // setTimeout prevents ExpressionChangedAfterItHasBeenCheckedError,
      // we are using setTimeout() to defer this code to another Javascript Virtual Machine turn
      // https://blog.angular-university.io/angular-debugging/
      setTimeout(() => {
        this.colors = [
          {
            backgroundColor: gradientFill1,
            borderColor: gradientStroke1,
            pointBackgroundColor: gradientStroke1,
            pointBorderColor: gradientStroke1,
            pointHoverBackgroundColor: gradientStroke1,
            pointHoverBorderColor: gradientStroke1,
            hoverBackgroundColor: navyBlue,
            hoverBorderColor: navyBlue,
            borderWidth: this.colorOptions.borderWidth,
          },
        ].concat(this.colorOptions.colors || []);
      });
    }
  }
}
