import { ComponentFixture, TestBed } from '@angular/core/testing'
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core'

import { AddressItemComponent } from './address-item.component'
import { AliasPipe } from '@tezblock/pipes/alias/alias.pipe'
import { getPipeMock } from 'test-config/mocks/pipe.mock'
import { ChainNetworkService } from '@tezblock/services/chain-network/chain-network.service'
import { getChainNetworkServiceMock } from '@tezblock/services/chain-network/chain-network.service.mock'
import { ShortenStringPipe } from '@tezblock/pipes/shorten-string/shorten-string.pipe'

describe('AddressItemComponent', () => {
  let component: AddressItemComponent
  let fixture: ComponentFixture<AddressItemComponent>
  const aliasPipeMock = getPipeMock()
  const chainNetworkServiceMock = getChainNetworkServiceMock()
  const shortenStringPipeMock = getPipeMock()

  beforeEach(() => {
    TestBed.configureTestingModule({
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
      providers: [
        { provide: AliasPipe, useValue: aliasPipeMock },
        { provide: ChainNetworkService, useValue: chainNetworkServiceMock },
        { provide: ShortenStringPipe, useValue: shortenStringPipeMock }
      ],
      declarations: [AddressItemComponent]
    })

    fixture = TestBed.createComponent(AddressItemComponent)
    component = fixture.componentInstance
  })

  it('should create', () => {
    expect(component).toBeTruthy()
  })

  describe('address', () => {
    it('when new value is not different then does not make any operations', () => {
      ;(<any>component)._address = 'old_address'

      spyOn(<any>component, 'getFormattedAddress')
      component.address = 'old_address'

      expect((<any>component).getFormattedAddress).not.toHaveBeenCalled()
    })
  })

  describe('options', () => {
    it('when new value is not different then does not make any operations', () => {
      const oldOptions: any = { showFiatValue: true }
      ;(<any>component)._options = oldOptions

      spyOn(<any>component, 'getFormattedAddress')
      component.options = oldOptions

      expect((<any>component).getFormattedAddress).not.toHaveBeenCalled()
    })

    it('when address in not set then does not set formattedAddress', () => {
      ;(<any>component)._options = { showFiatValue: true }

      spyOn(<any>component, 'getFormattedAddress')
      component.options = { showFiatValue: false }

      expect((<any>component).getFormattedAddress).not.toHaveBeenCalled()
    })

    it('when address in set then does set formattedAddress', () => {
      ;(<any>component)._options = { showFiatValue: true }

      spyOn(<any>component, 'getFormattedAddress')
      component.address = 'fakeAddress'
      component.options = { showFiatValue: false }

      expect((<any>component).getFormattedAddress).toHaveBeenCalled()
    })
  })

  describe('getFormattedAddress', () => {
    it('when no options then try return aliasPipe result', () => {
      aliasPipeMock.transform.and.returnValue('foo')

      const result = (<any>component).getFormattedAddress()

      expect(result).toBe('foo')
    })

    it('when no options and aliasPipe does not return truthy value then return shortenStringPipe result', () => {
      aliasPipeMock.transform.and.returnValue(null)
      shortenStringPipeMock.transform.and.returnValue('foo2')

      const result = (<any>component).getFormattedAddress()

      expect(result).toBe('foo2')
    })

    it('when options.showAlliasOrFullAddress is truthy then try return aliasPipe result', () => {
      component.options = { showAlliasOrFullAddress: true }
      aliasPipeMock.transform.and.returnValue('foo')

      const result = (<any>component).getFormattedAddress()

      expect(result).toBe('foo')
    })

    it('when options.showAlliasOrFullAddress is truthy and aliasPipe does not return truthy value then return address', () => {
      component.options = { showAlliasOrFullAddress: true }
      component.address = 'fakeAddress'
      aliasPipeMock.transform.and.returnValue(null)

      const result = (<any>component).getFormattedAddress()

      expect(result).toBe('fakeAddress')
    })

    it('when options.showFullAddress is truthy then return address', () => {
      component.options = { showFullAddress: true }
      component.address = 'fakeAddress'

      const result = (<any>component).getFormattedAddress()

      expect(result).toBe('fakeAddress')
    })
  })
})
