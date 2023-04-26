import {FormGroup, FormControl, FormArray, FormBuilder, ValidatorFn} from '@angular/forms';
import {Validators} from './validators';
import { ValidationConfService } from './validation-conf.service';

 // keys must be with lowercase
export class ValidationManager {

  formGroup: FormGroup;
  errors = {};
  submitted = false;
  children = {};
  args = {};

  protected controls = {};
  // tslint:disable: variable-name
  protected _fb: FormBuilder;

  protected subRules = {
    date: ['date', 'dateformat', 'dateearlythan1900']
  };

  // tslint:disable-next-line: ban-types
  constructor(formValidations: String | Object | Array<ValidationManager> | ValidationManager,
              private displayError: Array<string> = ['invalid', 'dirty', 'submitted']) {
    this.formGroup = new FormGroup({});
    this._fb = new FormBuilder();
    // tslint:disable-next-line:forin
    for (const key in formValidations) {

      if (typeof formValidations[key] === 'string') {
        this.controls[key] = this.buildControl(key, formValidations[key]);
      } else if (formValidations[key] instanceof ValidationManager) {
        this.children[key] = formValidations[key];
        this.controls[key] = {control: formValidations[key].getForm(), messages: {}};
      } else if (formValidations[key] instanceof Array) {
        this.children[key] = [];
        const formArray = this._fb.array([]) as FormArray;

        for (const group of formValidations[key]) {
          if (group instanceof ValidationManager) {
            formArray.push(group.getForm());
            this.children[key].push(group);
          } else {
            formArray.push(new FormControl(group));
          }

        }
        this.controls[key] = {control: formArray, messages: {}};
      } else if (typeof formValidations[key] === 'object') {
        this.controls[key] = this.buildControl(
          key, formValidations[key].rules, formValidations[key].value, formValidations[key].updateOnBlur);
      }

      this.formGroup.addControl(key, this.controls[key].control);

      this.errors[key] = '';
    }

    this.formGroup.valueChanges.subscribe(data => this.onValueChanged());
  }

  getForm() {
    return this.formGroup;
  }

  getChildGroup(field, index: number = null) {
    if (index !== null) {
      return this.children[field][index];
    }
    return this.children[field];
  }

  getChildren(field) {
    return this.children[field];
  }

  addChildGroup(field, mgr: ValidationManager|any) {
    if (this.formGroup.controls[field] && this.formGroup.controls[field] instanceof FormArray) {
      const control = this.formGroup.controls[field] as FormArray;
      if (mgr instanceof ValidationManager) {
        control.push(mgr.getForm());
        this.children[field].push(mgr);
      } else {
        control.push(new FormControl(mgr));
      }
      return control.length - 1;
    } else {
      this.children[field] = mgr;
      this.formGroup.addControl(field, mgr.getForm());
      return -1;
    }
  }

  removeChildGroup(field, index: number = null) {
    if (!this.formGroup.controls[field]) {
      return;
    }

    if (index !== null) {
      const control = this.formGroup.controls[field] as FormArray;
      control.removeAt(index);
      this.children[field].splice(index, 1);
    } else {
      this.formGroup.removeControl(field);
      delete this.children[field];
    }
  }

  isValid() {
    this.submitted = true;
    this.__setOnChild('submitted', true);
    this.onValueChanged();
    return !this.formGroup.invalid;
  }

  hasError(field) {
    if (this.errors[field]) { return true; }
    if (this.getControl(field).touched && this.getControl(field).invalid) {
      const form = this.formGroup;
      const control = form.get(field);
      this.errors[field] = '';

      // tslint:disable-next-line:forin
      for (const rule in control.errors) {
        this.errors[field] = this.getErrorMessage(field, rule);
      }
    }

    return this.errors[field] ? true : false;
  }

  getError(field) {
    return this.errors[field];
  }

  getErrors() {
    for (const child in this.children) {
      if (this.children[child] instanceof Array) {
        this.errors[child] = {};
        // tslint:disable-next-line:forin
        for (const subChild in this.children[child]) {
          this.errors[child][subChild] = this.children[child][subChild].errors;
        }
      } else {
        this.errors[child] = this.children[child].errors;
      }
    }
    return this.errors;
  }

  getParams(field) {
    const params = {};
    const errorCode = this.errors[field];
    let rule: string;
    if (typeof errorCode === 'string' && errorCode.length) {
      const messages = this.controls[field].messages;
      if (typeof messages === 'object') {
        for (const key in messages) {
          if (messages[key] === errorCode) {
            rule = key;
          }
        }
      }
    }
    const fieldArg = this.args[field][rule];
    if (fieldArg.length) {
      fieldArg.forEach((arg, index) => {
        params[index.toString()] = arg;
      });
    }
    return params;
  }

  getParamAsString(field) {
    let params = this.getParams(field);
    if (typeof params === 'object') {
      let temp = '';
      for (const key in params) {
        if (params.hasOwnProperty(key)) {
          if (temp) {
            temp = temp + ', ' + params[key];
          } else {
            temp = temp + params[key];
          }
        }
      }
      params = {0: temp};
    }
    return params;
  }

  reset() {
    this.submitted = false;
    this.formGroup.reset();
    this.__setOnChild('submitted', false);
    // tslint:disable-next-line:forin
    for (const fld in this.children) {
      for (const child of this.children[fld]) {
        child.formGroup.reset();
      }
    }
  }

  onValueChanged(displayError = null) {
    if (!this.formGroup) {
      return;
    }
    const form = this.formGroup;
    // tslint:disable-next-line:forin
    for (const field in this.errors) {
      const control = form.get(field);
      this.errors[field] = '';

      if (displayError == null) {
        displayError = this.displayError;
      }

      if (control && displayError.length && (displayError.every(element => {
          return (element === 'submitted') ? true : control[element];
        }) || this.submitted)) {
        // tslint:disable-next-line:forin
        for (const rule in control.errors) {
          this.errors[field] = this.getErrorMessage(field, rule);
        }
      }
    }

    this.__callOnChild('onValueChanged');
  }

  setValue(values: object|string, value = null) {
    if (typeof values === 'string') {
      const control = this.formGroup.get(values);
      if (!control || control instanceof FormArray) {
        return;
      }

      if (value !== null) {
        this.formGroup.get(values).setValue(value.toString());
        // this.formGroup.get(values).markAsTouched();
        // this.formGroup.get(values).markAsDirty();
      }
    }

    if (typeof values === 'object') {
      for (const key in values) {
        if (this.formGroup.get(key)) {
          this.setValue(key, values[key]);
        }
      }
    }
  }

  getValue(controlKey: string) {
    return this.formGroup.value[controlKey];
  }

  getData() {
    return this.formGroup.value;
  }

  getControl(controlName: string): any {
    if (!this.formGroup.controls[controlName]) {
      return;
    }
    return this.formGroup.controls[controlName];
  }

  buildControl(name: string, rules: string, value: string|object = null, updateOnBlur?: boolean) {

    const controlRules: ValidatorFn[] = [];
    const messages = {};

    rules = rules.replace(/pattern:(\/.+\/)(\|?)/, (a, b, c) => {
      return 'pattern:' + btoa(b) + c;
    });

    rules.split('|').forEach(rule => {
      if (rule) {
        const rule_spilted = rule.split(':');
        const rule_name = rule_spilted[0];

        let rule_vars = [];
        if (rule_spilted[1]) {
          rule_vars = rule_spilted[1].split(',');
        }

        if (!Validators[rule_name]) {
          throw new TypeError('Validation rule [' + rule_name + '] does not exists.');
        }

        if (rule_vars.length > 1) {
          controlRules.push(Validators[rule_name](rule_vars));
        } else if (rule_vars.length === 1) {
          if (rule_name === 'pattern' && isBase64(rule_vars[0])) {
            rule_vars[0] = atob(rule_vars[0]).slice(1, -1);
          }

          controlRules.push(Validators[rule_name](rule_vars[0]));
        } else {
          controlRules.push(Validators[rule_name]);
        }

        const ruleMessages = this.buildMessage(name, rule_name, rule_vars);
        for (const ruleName in ruleMessages) {
          if (ruleMessages.hasOwnProperty(ruleName)) {
            messages[ruleName] = ruleMessages[ruleName];
          }
        }
      }

    });

    let formControl;
    if (updateOnBlur) {
      formControl = new FormControl(value, { validators: controlRules, updateOn: 'blur' } );
    } else {
      formControl = new FormControl(value, controlRules);
    }

    return {control: formControl, messages};
  }

  private getErrorMessage(field, rule) {
    if (!this.controls[field].messages[rule.toLowerCase()]) {
      throw Error('Message not found inside the control:' + field + ' message:' + rule.toLowerCase());
    }
    return this.controls[field].messages[rule.toLowerCase()];
  }

  setErrorMessage(field, rule, message) {
    if (this.controls[field].messages[rule.toLowerCase()]) {
      this.controls[field].messages[rule.toLowerCase()] = message;
    }
  }

  public buildMessage(name, rule, arg = []) {
    const messages = {};
    let subRules: string[] = [];
    if (this.subRules[rule]) {
      subRules = this.subRules[rule];
    } else {
      subRules.push(rule);
    }
    for (const subRule of subRules) {
      messages[subRule.toLowerCase()] = this.buildSingleMessage(name, subRule, arg);
    }
    return messages;
  }

  private buildSingleMessage(name, rule, arg = []) {
    const message = this.getMessage(rule);
    if (! message) {
      throw Error('Validation message code is missing for: ' + rule);
    }
    if (this.args[name] === undefined) {
      this.args[name] = {};
    }
    rule = rule.toLowerCase();
    this.args[name][rule] = arg;

    return message;
  }

  public getMessage(rule) {
    return ValidationConfService.getInstance().getMessageCodeByRuleName(rule.toLowerCase());
  }

  private __callOnChild(funct) {
    for (const fld in this.children) {
      if (this.children[fld] instanceof Array) {
        for (const child of this.children[fld]) {
          child[funct].apply(child, Array.prototype.slice.call(arguments, 1));
        }
      } else {
        this.children[fld][funct].apply(this.children[fld], Array.prototype.slice.call(arguments, 1));
      }

    }
  }

  private __setOnChild(field, value) {
    for (const fld in this.children) {
      if (this.children[fld] instanceof Array) {
        for (const child of this.children[fld]) {
          child[field] = value;
        }
      } else {
        this.children[fld][field] = value;
      }


    }
  }

}

function ucFirst(str) {
  const firstLetter = str.substr(0, 1);
  return firstLetter.toUpperCase() + str.substr(1);
}

function isBase64(str) {
  try {
    return btoa(atob(str)) === str;
  } catch (err) {
    return false;
  }
}
