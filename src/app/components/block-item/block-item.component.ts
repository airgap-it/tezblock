import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { Block } from './../../interfaces/Block';

@Component({
  selector: 'block-item',
  templateUrl: './block-item.component.html',
  styleUrls: ['./block-item.component.scss'],
})
export class BlockItemComponent {
  @Input()
  public blocks$: Observable<Block[]> | undefined;

  constructor(private readonly router: Router) {}

  set data(input: Observable<Block[]>) {
    this.blocks$ = input;
  }

  public inspectDetail(level: string) {
    this.router.navigate([`/block/${level}`]);
  }
}
