import { OnDestroy } from '@angular/core'
import { Subscription } from 'rxjs';

export class BaseComponent implements OnDestroy {
    protected readonly subscriptions: Subscription[] = [];

    ngOnDestroy() {
        this.subscriptions.forEach(subscription => subscription.unsubscribe());
    }
}
