import { createAction, props } from '@ngrx/store'
import { NavigationEnd } from '@angular/router'

const featureName = 'App'

export const saveLatestRoute = createAction(`[${featureName}] Save Latest Route`, props<{ navigation: NavigationEnd }>())
