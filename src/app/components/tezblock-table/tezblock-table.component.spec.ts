import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { TezblockTableComponent } from './tezblock-table.component';

describe('TezblockTableComponent', () => {
  let component: TezblockTableComponent;
  let fixture: ComponentFixture<TezblockTableComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [],
      declarations: [TezblockTableComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    });

    fixture = TestBed.createComponent(TezblockTableComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('isExpanded', () => {
    it('when expandedRow is not truthy then returns false', () => {
      expect(component.isExpanded({ foo: 'foo' })).toBe(false);
    });

    it('when expandedRow is truthy and expandedRows contains rows id then returns true', () => {
      const row = { foo: 'foo' };
      component.expandedRow = {
        primaryKey: 'foo',
        template: null,
        getContext: () => null,
      };
      (<any>component).expandedRows = ['foo'];

      expect(component.isExpanded({ foo: 'foo' })).toBe(true);
    });

    it('when expandedRow is truthy and expandedRows does not contain rows id then returns false', () => {
      const row = { foo: 'foo' };
      component.expandedRow = {
        primaryKey: 'foo',
        template: null,
        getContext: () => null,
      };
      (<any>component).expandedRows = ['fooX'];

      expect(component.isExpanded({ foo: 'foo' })).toBe(false);
    });
  });

  describe('expand', () => {
    beforeEach(() => {
      spyOn(component.rowExpanded, 'emit');
    });

    it('when no expandedRow then does not emit rowExpanded', () => {
      component.expand({ foo: 'foo ' });

      expect(component.rowExpanded.emit).not.toHaveBeenCalled();
    });

    it('when expandedRow is set and its not collapse then emit rowExpanded', () => {
      component.expandedRow = {
        primaryKey: 'foo',
        template: null,
        getContext: () => null,
      };
      component.expand({ foo: 'foo ' });

      expect(component.rowExpanded.emit).toHaveBeenCalled();
    });

    it('when its collapse then does not emit rowExpanded and remove collapsing row id from expandedRows', () => {
      component.expandedRow = {
        primaryKey: 'foo',
        template: null,
        getContext: () => null,
      };
      (<any>component).expandedRows = ['foo'];
      component.expand({ foo: 'foo' });

      expect(component.rowExpanded.emit).not.toHaveBeenCalled();
      expect((<any>component).expandedRows).toEqual([]);
    });

    it('when its expand then adds row id to expandedRows', () => {
      component.expandedRow = {
        primaryKey: 'foo',
        template: null,
        getContext: () => null,
      };
      component.expand({ foo: 'foo' });

      expect(component.rowExpanded.emit).toHaveBeenCalled();
      expect((<any>component).expandedRows).toEqual(['foo']);
    });
  });
});
