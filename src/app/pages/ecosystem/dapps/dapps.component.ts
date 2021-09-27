import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { EcosystemService } from '../../../services/ecosystem/ecosystem';
import { EcosystemItem } from '../../../interfaces/Ecosystem';

@Component({
  selector: 'app-dapps',
  templateUrl: './dapps.component.html',
  styleUrls: ['./dapps.component.scss'],
})
export class DappsComponent implements OnInit {
  categoryFilter = { category: 'dapp' };
  constructor(private ecosystemService: EcosystemService) {}

  get ecosystems$(): Observable<EcosystemItem[]> {
    return this.ecosystemService.get();
  }

  ngOnInit(): void {}
}
