import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';

import { EcosystemService } from '../../../services/ecosystem/ecosystem';
import { EcosystemItem } from '../../../interfaces/Ecosystem';

@Component({
  selector: 'app-libraries',
  templateUrl: './libraries.component.html',
  styleUrls: ['./libraries.component.scss'],
})
export class LibrariesComponent implements OnInit {
  categoryFilter = { category: 'library' };

  constructor(private ecosystemService: EcosystemService) {}

  get ecosystems$(): Observable<EcosystemItem[]> {
    return this.ecosystemService.get();
  }

  ngOnInit(): void {}
}
