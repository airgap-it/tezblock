import { Component, OnDestroy } from '@angular/core'
import { Subscription } from 'rxjs'

@Component({ template: '' })
export class BaseComponent implements OnDestroy {
  protected readonly subscriptions: Subscription[] = []

  // TODO: check if it works..
  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe())
  }
}
