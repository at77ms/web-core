import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ValidationConfService {
  private static instance: ValidationConfService = null;

  private ruleMsgCodeMap: Map<string, string>;

  constructor(private http: HttpClient) {
    ValidationConfService.instance = this;
  }

  static getInstance(): ValidationConfService {
    return ValidationConfService.instance;
  }

  public  loadConf(validationConfUrl: string) {
    if (! validationConfUrl) {
      return ;
    }

    this.http.get<Map<string, string>>(validationConfUrl).subscribe(
      data => {
        this.ruleMsgCodeMap = data;
      }
    );
  }

  getMessageCodeByRuleName(ruleName: string): string {
    if (!this.ruleMsgCodeMap) {
      return '';
    }
    return this.ruleMsgCodeMap[ruleName];
  }

}
