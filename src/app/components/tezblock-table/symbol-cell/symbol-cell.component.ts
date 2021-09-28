import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-symbol-cell',
  templateUrl: './symbol-cell.component.html',
  styleUrls: ['./symbol-cell.component.scss'],
})
export class SymbolCellComponent {
  @Input()
  set data(value: boolean) {
    if (value !== this.isOutgoing) {
      this.isOutgoing = value;
    }
  }
  get data(): boolean {
    return this.isOutgoing;
  }

  isOutgoing: boolean;
}
