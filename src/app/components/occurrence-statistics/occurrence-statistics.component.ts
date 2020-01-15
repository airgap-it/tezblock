import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-occurrence-statistics',
  templateUrl: './occurrence-statistics.component.html',
  styleUrls: ['./occurrence-statistics.component.scss']
})
export class OccurrenceStatisticsComponent implements OnInit {

  @Input() count: number
  @Input() label: string

  constructor() { }

  ngOnInit() {
  }

}
