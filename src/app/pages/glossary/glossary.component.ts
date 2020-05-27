import { Component, OnInit } from '@angular/core'

export interface Column {
  key: string
  description: string
}

@Component({
  selector: 'app-glossary',
  templateUrl: './glossary.component.html',
  styleUrls: ['./glossary.component.scss']
})
export class GlossaryComponent implements OnInit {
  searchText: string
  constructor() {}

  ngOnInit() {}

  definitions = [
    ['Account', 'an account description'],
    ['Block', 'a block is a block is a block']
  ]
}
