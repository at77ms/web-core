import { ValidationManager } from './validation-manager';
import { DropdownService, DropdownOption } from '../service/dropdown.service';

export interface FormInfo {
  moduleCode: string;
  formName: string;
}

export interface FormManagerObject {
  formValidations: object | Array<ValidationManager> | ValidationManager;
  formInfo?: FormInfo;
}

export class FormManager extends ValidationManager {
  formInfo: FormInfo;
  constructor(formManagerObject: FormManagerObject) {
    super(formManagerObject.formValidations);
    this.formInfo = formManagerObject.formInfo;
  }

  buildControl(name: string, rules: string, value: string | object = null, updateOnBlur: boolean = false) {
    return super.buildControl(name, rules, value, updateOnBlur);
  }

  /**
   * @param fieldName the field name
   * @param getAllOptions is get all the options(some of the options has been abandoned)
   * @param formInfo the form's info
   * the getAllOptions param is a bloolean, whether the get the all the options(include the history data).
   * The formInfo is optional by default it will use the param input in the new FormManager function.
   * You can overWrite it with the new FormInfo
   * FormInfo {
   *   moduleCode: string;
   *   formName: string;
   * }
   */
  getOptions(fieldName: string, getAllOptions: boolean = false, formInfo: FormInfo = this.formInfo): DropdownOption[] {
    return DropdownService.getInstance().getOptions(formInfo, fieldName, getAllOptions);
  }

  /**
   * @param fieldName the field name
   * @param getAllOptions is get all the options(some of the options has been abandoned)
   * This function is special to get the common module commenForm dropdown field data.
   * the getAllOptions param is a bloolean, whether the get the all the options(include the history data).
   */
  getCommonOptions(fieldName: string, getAllOptions: boolean = false): DropdownOption[] {
    const formInfo = { moduleCode: 'common', formName: 'commonForm' };
    return DropdownService.getInstance().getOptions(formInfo, fieldName, getAllOptions);
  }

  /**
   * @param fieldName the field name
   * @param getAllOptions is get all the options(some of the options has been abandoned)
   * @param formInfo the form's info
   * This function is use to get the additionalInfo base on the value seleted.
   * @see getOptions
   */
  getAdditionalInfo(fieldName: string, seletedValue, formInfo: FormInfo = this.formInfo): string {
    const str = DropdownService.getInstance().getAdditionalInfo(formInfo, fieldName, seletedValue);
    return this.handlingReturnSymbol(str);
  }

  getCommonAdditionalInfo(fieldName: string, seletedValue): string {
    const formInfo = { moduleCode: 'common', formName: 'commonForm' };
    const str = DropdownService.getInstance().getAdditionalInfo(formInfo, fieldName, seletedValue);
    return this.handlingReturnSymbol(str);
  }

  private handlingReturnSymbol(str: string): string {
    return str.replace(/\\n|\\r\\n/g, '\n');
  }
}
