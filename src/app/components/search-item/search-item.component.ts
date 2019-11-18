import { Component, EventEmitter, OnInit, Output } from '@angular/core'
import { FormControl } from '@angular/forms'
import { debounceTime } from 'rxjs/operators'

import { BaseComponent } from '../base.component'

@Component({
  selector: 'app-search-item',
  templateUrl: './search-item.component.html',
  styleUrls: ['./search-item.component.scss']
})
export class SearchItemComponent extends BaseComponent implements OnInit {
  control = new FormControl(null)

  @Output() onSearch = new EventEmitter<string>()

  constructor() {
    super()
  }

  ngOnInit() {
    this.subscriptions.push(this.control.valueChanges.pipe(debounceTime(750)).subscribe(value => this.onSearch.emit(value)))
  }

  search() {
    this.onSearch.emit(this.control.value);
  }
}

// in parent on noSearch (#)dp.hide() must be handled ...