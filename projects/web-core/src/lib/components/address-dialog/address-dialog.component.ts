import { Component, OnInit, OnDestroy } from '@angular/core';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

import { FormManager } from '../../validation/form-manager';
import { AddressDialogService } from './address-dialog.service';

@Component({
  selector: 'app-address-dialog',
  templateUrl: './address-dialog.component.html',
  styleUrls: ['./address-dialog.component.css']
})
export class AddressDialogComponent implements OnInit, OnDestroy {
  unSubscribe$: Subject<void> = new Subject();
  addressForm: FormManager;
  addressDisplay = false;
  dmtProvincesOptions = [];
  dmtCityOptions = [];
  dmtDistrictOptions = [];
  dmtRoadOptions = [];
  dmtRoad2Options = [];

  disableAddrOption;
  addressMsg: any;
  originalAddrInfo: any;
  officeFull = [];
  officeSug = [];
  officeChnFull = [];
  officeChnSug = [];

  disableChn = false;
  disableDmt = false;

  constructor(private addressService: AddressDialogService) {
  }

  ngOnInit() {
    this.addressForm = this.addressService.createAddrForm();
    this.addressSubscriber();
  }

  ngOnDestroy(): void {
    this.unSubscribe$.next();
    this.unSubscribe$.complete();
  }

  addressSubscriber() {
    this.addressService.addressSubject
      .pipe(takeUntil(this.unSubscribe$))
      .subscribe((data: any) => {
        this.disableChn = false;
        this.disableDmt = false;
        this.addressDisplay = true;
        this.addressMsg = data;
        if (data.disableAddrOption === 'chn') { this.disableChn = true; }
        if (data.disableAddrOption === 'dmt') {
          this.disableDmt = true;
        }
        if (!this.disableDmt) {
          this.getProvice();
        }
        this.addressService.addrInit(this.addressForm, this.addressMsg.data);
        this.getChnCountryOptions(true);
        this.getCountryOptions();
      });
  }

  onHide() {
    this.dmtCityOptions = [];
    this.dmtDistrictOptions = [];
    this.dmtRoadOptions = [];
    this.dmtRoad2Options = [];
    this.addressForm.reset();
    this.addressDisplay = false;
  }

  confirm() {
    if (this.addressForm.getValue('addrFormat') !== 'en') { this.addressService.resetEnChnAddr(this.addressForm, 'en'); }
    if (this.addressForm.getValue('addrFormat') !== 'chn') { this.addressService.resetEnChnAddr(this.addressForm, 'chn'); }
    if (this.addressForm.getValue('addrFormat') !== 'dmt') {
      this.addressService.resetDmtAddr(this.addressForm, 'dmt_provience');
      this.addressForm.getControl('dmt_addr3').setValue(null);
    }
    if (this.addressForm.isValid()) {
      if (this.addressForm.getValue('addrFormat') === 'chn') {
        this.chnAndEnCountryConversion(true);
      }
      if (this.addressForm.getValue('addrFormat') === 'dmt') {
        this.converDmtCountry();
      }
      this.addressService.preparedAddressMsg(this.addressForm, this.addressMsg);
      this.addressService.confirmAddressInput(this.addressMsg);
      this.onHide();
    }
  }

  getCountryOptions() {
    if (this.officeFull.length === 0) {
      this.addressService.getCountry()
        .pipe(takeUntil(this.unSubscribe$))
        .subscribe((res: any) => {
          this.officeFull = res.data;
        });
    }
  }

  getChnCountryOptions(isInit: boolean = false) {
    if (this.officeChnFull.length === 0) {
      this.addressService.getChnCountry()
        .pipe(takeUntil(this.unSubscribe$))
        .subscribe((res: any) => {
          this.officeChnFull = res.data;
          if (isInit && this.addressForm.getValue('addrFormat') === 'chn') {
            this.chnAndEnCountryConversion(false);
          }
        });
    } else if (isInit && this.addressForm.getValue('addrFormat') === 'chn') {
      this.chnAndEnCountryConversion(false);
    }
  }

  chnAndEnCountryConversion(toEnCoutry = true) {
    let country = this.addressForm.getControl('chn_country').value;
    let list = this.officeFull;
    if (!toEnCoutry) {
      list = this.officeChnFull;
    }
    if (country && Array.isArray(list)) {
      list.forEach((item) => {
        if (item.countryCode === country.countryCode) {
          if (toEnCoutry) {
            if (item.countryDesc === country.country) {
              country = item;
            }
          } else {
            if (item.country === country.countryDesc) {
              country = item;
            }
          }
        }
      });
    }
    this.addressForm.getControl('chn_country').setValue(country);
  }

  formatCountryDropDown(data) {
    return data.countryCode + ' / ' + data.countryDesc;
  }

  OfficeFilter(event) {
    this.officeSug = this.addressService.filter(this.officeFull, event, ['countryCode', 'countryDesc']);
  }

  OfficeChnFilter(event) {
    this.officeChnSug = this.addressService.filter(this.officeChnFull, event, ['countryCode', 'countryDesc']);
  }

  dmtDropdownDisableOrEnable(field: string) {
    return this.addressService.dmtDropdownDisableOrEnable(this.addressForm, field);
  }

  setDmtAddr1(formControlName: string = null) {
    this.addressService.resetDmtAddr(this.addressForm, formControlName);
    this.addressService.setDmtAddr('dmt_addr1', this.addressForm);
    this.addressForm.setValue('dmt_addr4', '');
  }

  setDmtAddr2(formControlName: string = null, options: any = null) {
    this.addressService.resetDmtAddr(this.addressForm, formControlName);
    this.addressService.setDmtAddr('dmt_addr2', this.addressForm);
    this.addressService.resetPostalCode(this.addressForm, formControlName, this[options]);
  }

  getDisableChn() {
    return (this.disableChn ? this.disableChn : false);
  }

  getProvice() {
    if (this.dmtProvincesOptions.length === 0) {
      const data = { provience: null, city: null, district: null, road: null, road2: null };
      this.addressService.getDmtDropdownList('provience', data).subscribe(res => {
        this.dmtProvincesOptions = res;
      });
    }
  }

  getCity() {
    this.dmtCityOptions = [];
    if (!this.addressForm.getValue('dmt_provience')) { return []; }
    const data = {
      provience: this.addressForm.getValue('dmt_provience'),
      city: null, district: null, road: null, road2: null
    };
    this.addressService.getDmtDropdownList('city', data).subscribe(res => {
      this.dmtCityOptions = res;
    });
  }

  getDistrict() {
    this.dmtDistrictOptions = [];
    if (!this.addressForm.getValue('dmt_provience')) { return []; }
    const data = {
      provience: this.addressForm.getValue('dmt_provience'), city: this.addressForm.getValue('dmt_city') || '',
      district: null, road: null, road2: null
    };
    this.addressService.getDmtDropdownList('district', data).subscribe(res => {
      this.dmtDistrictOptions = res;
    });
  }

  getRoad() {
    this.dmtRoadOptions = [];
    if (!this.addressForm.getValue('dmt_provience')) { return []; }
    const data = {
      provience: this.addressForm.getValue('dmt_provience'), city: this.addressForm.getValue('dmt_city') || '',
      district: this.addressForm.getValue('dmt_district'), road: null, road2: null
    };
    this.addressService.getDmtDropdownList('road', data).subscribe(res => {
      this.dmtRoadOptions = res;
    });
  }

  getRoad2() {
    this.dmtRoad2Options = [];
    if (!this.addressForm.getValue('dmt_provience')) { return []; }
    const data = {
      provience: this.addressForm.getValue('dmt_provience'), city: this.addressForm.getValue('dmt_city') || '',
      district: this.addressForm.getValue('dmt_district') || '', road: this.addressForm.getValue('dmt_road'), road2: null
    };
    this.addressService.getDmtDropdownList('road2', data).subscribe(res => {
      this.dmtRoad2Options = res;
    });
  }

  autoCompleteClear(form: string, field: string) {
    this[form].getControl(field).value = null;
  }

  toUpperCaseFn(e, field) {
    let val = '';
    if (e.target.value !== undefined && e.target.value !== null) {
      val = e.target.value.toUpperCase();
    }
    this.addressForm.getControl(field).setValue(val);
  }

  converDmtCountry() {
    this.officeFull.forEach(item => {
      if (item.countryDesc === 'PRC') {
        this.addressForm.getControl('dmt_country').setValue(item);
      }
    });
  }
}
