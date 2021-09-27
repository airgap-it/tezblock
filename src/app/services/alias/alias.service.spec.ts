import { TestBed } from '@angular/core/testing';

import { AliasService } from './alias.service';
import { UnitHelper } from 'test-config/unit-test-helper';
import { ShortenStringPipe } from '@tezblock/pipes/shorten-string/shorten-string.pipe';
import { AliasPipe } from '@tezblock/pipes/alias/alias.pipe';
import { Options } from '@tezblock/components/address-item/options';
describe('AliasService', () => {
  let unitHelper: UnitHelper;

  let service: AliasService;
  const mockedOptions1: Options = { showAlliasOrFullAddress: true };
  const mockedOptions2: Options = { showFullAddress: true };
  const mockedAddressWithAlias = 'tz1MJx9vhaNRSimcuXPK2rW4fLccQnDAnVKJ';
  const mockedAddressAlias = 'AirGap';
  const mockedAddressWithoutAlias = 'tz1d75oB6T4zUMexzkr5WscGktZ1Nss1JrT7';
  const mockedAddressShortened = 'tz1d7...1JrT7';

  beforeEach(() => {
    unitHelper = new UnitHelper();

    TestBed.configureTestingModule(
      unitHelper.testBed({
        providers: [ShortenStringPipe],
        imports: [],
        declarations: [],
      })
    )
      .compileComponents()
      .catch(console.error);
    service = TestBed.inject(AliasService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getFormattedAddress without options', () => {
    it('when getFormattedAddress is given address that has an alias without options', () => {
      expect(service.getFormattedAddress(mockedAddressWithAlias)).toEqual(
        mockedAddressAlias
      );
    });
    it('when getFormattedAddress is given address that has no alias without options', () => {
      expect(service.getFormattedAddress(mockedAddressWithoutAlias)).toEqual(
        mockedAddressShortened
      );
    });
  });

  describe('getFormattedAddress with options', () => {
    it('when getFormattedAddress is given address that has an alias with showAlliasOrFullAddress', () => {
      expect(
        service.getFormattedAddress(mockedAddressWithAlias, mockedOptions1)
      ).toEqual(mockedAddressAlias);
    });
    it('when getFormattedAddress is given address that has no alias with showAlliasOrFullAddress', () => {
      expect(
        service.getFormattedAddress(mockedAddressWithoutAlias, mockedOptions1)
      ).toEqual(mockedAddressWithoutAlias);
    });

    it('when getFormattedAddress is given address that has an alias with showFullAddress', () => {
      expect(
        service.getFormattedAddress(mockedAddressWithAlias, mockedOptions2)
      ).toEqual(mockedAddressWithAlias);
    });
    it('when getFormattedAddress is given address that has no alias with showFullAddress', () => {
      expect(
        service.getFormattedAddress(mockedAddressWithoutAlias, mockedOptions2)
      ).toEqual(mockedAddressWithoutAlias);
    });
  });
});
