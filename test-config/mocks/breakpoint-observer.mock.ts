import { Subject } from 'rxjs'

export const getObserveValue = (value: boolean) => ({ matches: value })

export const getBreakpointObserverMock = () => jasmine.createSpyObj('BreakpointObserver', {
    observe: new Subject()
})
