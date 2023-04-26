import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { EnvironmentService } from '../../service/environment.service';
import { FormManager } from '../../validation/form-manager';


@Injectable({
  providedIn: 'root'
})
export class AddressDialogService {
  addressSubject = new Subject<any>();
  confirmAddressSubject = new Subject<any>();
  nbBasicUrl = `${this.environmentService.getApiBaseUrl('nb')}`;
  enUnit = ['FLAT ', '/F', 'BLK '];
  chnUnit = ['室', '樓', '座'];
  dmtUnit = ['', '', ''];

  constructor(private http: HttpClient, private environmentService: EnvironmentService) { }
  addressDialogInit(data: any) {
    this.addressSubject.next(data);
  }

  confirmAddressInput(addressMsg: any) {
    this.confirmAddressSubject.next(addressMsg);
  }

  createAddrForm() {
    return new FormManager({
      formValidations: {
        addrFormat: {value: 'en', rules: ''},
        en_addr1_01: {value: {value: null, disabled: false}, rules: 'notContain:~'},
        en_addr1_02: {value: {value: null, disabled: false}, rules: 'notContain:~'},
        en_addr1_03: {value: {value: null, disabled: false}, rules: 'notContain:~'},
        en_addr2: {value: {value: null, disabled: false}, rules: 'notContain:~'},
        en_addr3: {value: {value: null, disabled: false}, rules: 'notContain:~'},
        en_addr4: {value: {value: null, disabled: false}, rules: 'notContain:~'},
        en_addr5: {value: {value: null, disabled: false}, rules: 'notContain:~'},
        en_country: {value: '', rules: ''},
        chn_addr1: {value: {value: null, disabled: false}, rules: 'notContain:~'},
        chn_addr2: {value: {value: null, disabled: false}, rules: 'notContain:~'},
        chn_addr3: {value: {value: null, disabled: false}, rules: 'notContain:~'},
        chn_addr4: {value: {value: null, disabled: false}, rules: 'notContain:~'},
        chn_addr1_01: {value: {value: null, disabled: false}, rules: 'notContain:~'},
        chn_addr1_02: {value: {value: null, disabled: false}, rules: 'notContain:~'},
        chn_addr1_03: {value: {value: null, disabled: false}, rules: 'notContain:~'},
        chn_country: {value: '', rules: ''},
        dmt_addr1: {value: '', rules: ''},
        dmt_addr2: {value: '', rules: ''},
        dmt_addr3: {value: {value: null, disabled: false}, rules: 'notContain:~'},
        dmt_addr4: {value: '', rules: ''},
        dmt_addr5: {value: '', rules: ''},
        dmt_provience: {value: '', rules: ''},
        dmt_city: {value: '', rules: ''},
        dmt_district: {value: '', rules: ''},
        dmt_road: {value: '', rules: ''},
        dmt_road2: {value: '', rules: ''},
        dmt_country: {value: '中國', rules: ''}
      }
    });
  }

  addrInit(form, addrData) {
    form.reset();
    const tag = addrData.addrFormat;
    form.setValue('addrFormat', tag);
    if (tag === 'en') {
      const addr1 = addrData.addr1 ? addrData.addr1.trim() : '';
      if (addr1) {
        let temp = '';
        if (addr1.indexOf(this.enUnit[0]) === 0) {// exist 'Flat '
          temp = addr1.split(this.enUnit[0])[1].split(' ');
          form.setValue(tag + '_addr1_01', temp[0]);
        }
        if (addr1.indexOf(this.enUnit[1]) > 0) { // exist '/F '
          temp = addr1.split(this.enUnit[1])[0].split(' ');
          form.setValue(tag + '_addr1_02', temp[temp.length - 1]);
        }
        if (addr1.indexOf(this.enUnit[2]) > 0) {// exist 'BLK '
          temp = addr1.split(this.enUnit[2])[1];
          form.setValue(tag + '_addr1_03', temp);
        }
      }
    }
    if (tag === 'chn') {
      form.setValue(tag + '_addr1', addrData.addr1);
      const addr5 = addrData.addr5 ? addrData.addr5.trim() : '';
      if (addr5) {
        let temp = '';
        if (addr5.indexOf(this.chnUnit[0]) > 0) { // exist '座'
          temp = addr5.split(this.chnUnit[0])[0].split(' ');
          form.setValue(tag + '_addr1_03', temp[temp.length - 1]);
        }
        if (addr5.indexOf(this.chnUnit[1]) > 0) { // exist '樓'
          temp = addr5.split(this.chnUnit[1])[0].split(' ');
          form.setValue(tag + '_addr1_02', temp[temp.length - 1]);
        }
        if (addr5.indexOf(this.chnUnit[2]) > 0) { // exist '室'
          temp = addr5.split(this.chnUnit[2])[0].split(' ');
          form.setValue(tag + '_addr1_01', temp[temp.length - 1]);
        }
      }
    }
    if (tag === 'dmt') {
      const addr1 = addrData.addr1 ? addrData.addr1.trim() : '';
      form.setValue(tag + '_addr1', addr1.split(' ')[0]);
    }
    form.setValue(tag + '_addr2', addrData.addr2);
    form.setValue(tag + '_addr3', addrData.addr3);
    form.setValue(tag + '_addr4', addrData.addr4);
    form.setValue(tag + '_addr5', addrData.addr5);
    form.getControl(tag + '_country').setValue(addrData.country);
    form.setValue('dmt_country', '中國');
  }

  preparedAddressMsg(addressForm: FormManager, addressMsg: any) {
    const formData = addressForm.getForm().getRawValue();
    const tag = formData.addrFormat;
    let unitArr = this.enUnit;
    if (tag === 'chn') {
      unitArr = this.chnUnit;
    } else if (tag === 'dmt') {
      unitArr = this.dmtUnit;
    }
    const addrData: any = {};
    let addrTemp = '';
    if (formData.addrFormat === 'en') { // format addr1 & add unit for 'en'
      formData[tag + '_addr1_01'] = formData[tag + '_addr1_01'] ? (unitArr[0] + formData[tag + '_addr1_01'].trim()) : '';
      addrTemp = formData[tag + '_addr1_01'];
      formData[tag + '_addr1_02'] = formData[tag + '_addr1_02'] ? (formData[tag + '_addr1_02'].trim() + unitArr[1]) : '';
      formData[tag + '_addr1_03'] = formData[tag + '_addr1_03'] ? (unitArr[2] + formData[tag + '_addr1_03'].trim()) : '';
    } else if (formData.addrFormat === 'chn') { // format addr1 & add unit for 'chn'
      formData[tag + '_addr1_01'] = formData[tag + '_addr1_01'] ? (formData[tag + '_addr1_01'].trim() + unitArr[2]) : '';
      addrTemp = formData[tag + '_addr1_01'];
      formData[tag + '_addr1_02'] = formData[tag + '_addr1_02'] ? (formData[tag + '_addr1_02'].trim() + unitArr[1]) : '';
      formData[tag + '_addr1_03'] = formData[tag + '_addr1_03'] ? (formData[tag + '_addr1_03'].trim() + unitArr[0]) : '';
    }
    if (formData.addrFormat === 'en') {
      if (!formData[tag + '_addr1_02'] && !formData[tag + '_addr1_03']) {
        addrTemp = formData[tag + '_addr1_01'];
      } else {
        addrTemp = addrTemp + ' ' + formData[tag + '_addr1_02'] + ' ' + formData[tag + '_addr1_03'];
      }
    } else if (formData.addrFormat === 'chn') {
      if (formData[tag + '_addr1_02'] && formData[tag + '_addr1_02'].trim()) {
        addrTemp = ' ' + formData[tag + '_addr1_02'].trim() + ' ';
      } else {
        addrTemp = ' ';
      }
      if (formData[tag + '_addr1_01'] && formData[tag + '_addr1_01'].trim()) {
        addrTemp = formData[tag + '_addr1_01'].trim() + addrTemp;
      }
      if (formData[tag + '_addr1_03'] && formData[tag + '_addr1_03'].trim()) {
        addrTemp = addrTemp + formData[tag + '_addr1_03'].trim();
      }
      if (addrTemp && addrTemp.trim()) {
        addrTemp = addrTemp.trim();
      } else {
        addrTemp = '';
      }
    } else if (formData.addrFormat === 'dmt') {
      addrTemp = formData[tag + '_addr1'];
    }
    addrData.addrFormat = tag;
    if (formData.addrFormat === 'en') {
      addrData.addr1 = addrTemp;
      addrData.addr5 = formData[tag + '_addr5'] ? formData[tag + '_addr5'].trim() : '';
    } else if (formData.addrFormat === 'chn') {
      addrData.addr5 = addrTemp;
      addrData.addr1 = formData[tag + '_addr1'] ? formData[tag + '_addr1'].trim() : '';
    } else if (formData.addrFormat === 'dmt') {
      addrData.addr1 = addrTemp;
      addrData.addr1 = formData[tag + '_addr1'] ? formData[tag + '_addr1'].trim() : '';
    }
    addrData.addr2 = formData[tag + '_addr2'] ? formData[tag + '_addr2'].trim() : '';
    addrData.addr3 = formData[tag + '_addr3'] ? formData[tag + '_addr3'].trim() : '';
    addrData.addr4 = formData[tag + '_addr4'] ? formData[tag + '_addr4'].trim() : '';
    addrData.country = formData[tag + '_country'] ? formData[tag + '_country'] : null;
    return addressMsg.data = addrData;
  }

  getCountry() {
    return this.http.get(`${this.nbBasicUrl}/dropdown/tcountry/get`);
  }

  getChnCountry() {
    return this.http.get(`${this.nbBasicUrl}/dropdown/tcountry_chinese/get`);
  }

  formatCountryDropDown(data) {
    return data.countryCode + ' / ' + data.countryDesc;
  }

  dmtDropdownDisableOrEnable(form: FormManager, fieldName: string) {
    if (fieldName === 'dmt_city') {
      if (form.getControl('dmt_provience').value) {
        return false;
      } else {
        form.getControl('dmt_city').value = null;
        return true;
      }
    }
    if (fieldName === 'dmt_district') {
      if (form.getControl('dmt_city').value) {
        return false;
      } else {
        form.getControl('dmt_district').value = null;
        return true;
      }
    }
    if (fieldName === 'dmt_road') {
      if (form.getControl('dmt_district').value) {
        return false;
      } else {
        form.getControl('dmt_road').value = null;
        return true;
      }
    }
    if (fieldName === 'dmt_road2') {
      if (form.getControl('dmt_road').value) {
        return false;
      } else {
        form.getControl('dmt_road2').value = null;
        return true;
      }
    }
  }

  setDmtAddr(targetAddr: string, form: FormManager) {
    const dmtAddr1 = ['dmt_country', 'dmt_provience', 'dmt_city'];
    const dmtAddr2 = ['dmt_district', 'dmt_road', 'dmt_road2'];
    let addrArr;
    if (targetAddr === 'dmt_addr1') {
      addrArr = dmtAddr1;
    } else if (targetAddr === 'dmt_addr2') {
      addrArr = dmtAddr2;
    }
    form.getControl(targetAddr).value = (form.getControl(addrArr[0]).value ? form.getControl(addrArr[0]).value : '')
      + (form.getControl(addrArr[1]).value ? form.getControl(addrArr[1]).value : '')
      + (form.getControl(addrArr[2]).value ? form.getControl(addrArr[2]).value : '');
    form.getControl(targetAddr).setValue(form.getControl(targetAddr).value);
  }

  resetDmtAddr(addressForm: FormManager, formControlName: string) {
    switch (formControlName) {
      case 'dmt_provience':
        addressForm.getControl('dmt_city').setValue(null);
        addressForm.getControl('dmt_addr1').setValue(null);
        addressForm.getControl('dmt_addr2').setValue(null);
      /* falls through */
      case 'dmt_city':
        addressForm.getControl('dmt_district').setValue(null);
        addressForm.getControl('dmt_addr2').setValue(null);
      /* falls through */
      case 'dmt_district':
        addressForm.getControl('dmt_road').setValue(null);
      /* falls through */
      case 'dmt_road':
        addressForm.getControl('dmt_road2').setValue(null);
    }
  }

  resetEnChnAddr(addressForm: FormManager, format: string) {
    addressForm.getControl(format + '_addr1_01').setValue(null);
    addressForm.getControl(format + '_addr1_02').setValue(null);
    addressForm.getControl(format + '_addr1_03').setValue(null);
    addressForm.getControl(format + '_addr2').setValue(null);
    addressForm.getControl(format + '_addr3').setValue(null);
    addressForm.getControl(format + '_addr4').setValue(null);
    if (format === 'en') {
      addressForm.getControl(format + '_addr5').setValue(null);
    } else { // chn
      addressForm.getControl(format + '_addr1').setValue(null);
    }
    addressForm.getControl(format + '_country').setValue(null);
  }

  resetPostalCode(addressForm: FormManager, formControlName: string, options: any) {
    addressForm.setValue('dmt_addr4', '');
    if (Array.isArray(options)) {
      options.forEach((item) => {
        if (addressForm.getControl(formControlName).value === item.value) {
          addressForm.setValue('dmt_addr4', item.postalCode);
        }
      });
    }
  }

  getDmtDropdownList(target: string, data) {
    return this.http.post(`${this.nbBasicUrl}/address/domestic/get`, data).pipe(map((res: any) => {
      const targetArr = [];
      if (res.data) {
        res.data.forEach(item => {
          if (item[target]) {
            targetArr.push({ label: item[target], value: item[target], postalCode: item.postalCode });
          }
        });
      }
      return targetArr;
    }));
  }

  filter(list: any[], event, attributeName: any[]): any[] {
    let key: string;
    let queryStatement = '';
    if (event.query === undefined) {
      key = '';
    } else {
      key = event.query.toLowerCase();
    }
    return list.filter(item => {
      queryStatement = '';
      for (let index = 0; index < attributeName.length; index++) {
        if (index === 0) {
          queryStatement = queryStatement + item[attributeName[index]];
        } else {
          queryStatement = queryStatement + ' / ' + item[attributeName[index]];
        }
      }
      return queryStatement.toLowerCase().indexOf(key) !== -1;
    });
  }

  conversionAddrStr(data) {
    let addrDisplayStr = '';
    if (JSON.stringify(data) !== '{}') {
      if ((!data.addr1 || !data.addr1.trim()) && !data.addr2 && !data.addr3 && !data.addr4 && !data.addr5) {
        addrDisplayStr = '';
      } else {
        for (let i = 1; i < 6; i++) {
          if (data['addr' + i] && data['addr' + i].trim()) {
            addrDisplayStr = addrDisplayStr + data['addr' + i] + '/';
          }
        }
        addrDisplayStr = addrDisplayStr.slice(0, addrDisplayStr.lastIndexOf('/'));
      }
    }
    return addrDisplayStr;
  }
}
