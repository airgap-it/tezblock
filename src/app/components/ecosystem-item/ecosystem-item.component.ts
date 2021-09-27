import { Component, Input, OnInit } from '@angular/core';

import { EcosystemItem } from '../../interfaces/Ecosystem';

@Component({
  selector: 'app-ecosystem-item',
  templateUrl: './ecosystem-item.component.html',
  styleUrls: ['./ecosystem-item.component.scss'],
})
export class EcosystemItemComponent implements OnInit {
  @Input() ecosystem: EcosystemItem;

  constructor() {}

  ngOnInit() {}

  getLogo(ecosystem: EcosystemItem): string {
    return `assets/img/ecosystem/${ecosystem.category}/${ecosystem.logo}`;
  }
}
