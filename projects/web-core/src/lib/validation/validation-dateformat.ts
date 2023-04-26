export interface LocaleSettings {
  firstDayOfWeek?: number;
  dayNames: string[];
  dayNamesShort: string[];
  dayNamesMin: string[];
  monthNames: string[];
  monthNamesShort: string[];
  today: string;
  clear: string;
}

export class ValidationDateformat {
    static instance: ValidationDateformat = null;

    ticksTo1970: number;

    // tslint:disable: variable-name
    _locale: LocaleSettings = {
      firstDayOfWeek: 0,
      dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      dayNamesMin: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
      monthNames: [ 'January', 'February', 'March', 'April', 'May', 'June',
                    'July', 'August', 'September', 'October', 'November', 'December' ],
      monthNamesShort: [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ],
      today: 'Today',
      clear: 'Clear'
    };

    shortYearCutoff: any = '+10';
    view = 'date';

    constructor() {
    }

    static getInstance() {
        if (! ValidationDateformat.instance) {
            ValidationDateformat.instance = new ValidationDateformat();
        }
        return ValidationDateformat.instance;
    }

    dateFormat(value, format): boolean {
      if (format == null || value == null || value === '' || format === '') {
        return false;
      }
      try {
        const date = this.parseDate(value, format);
        return true;
      } catch (error) {
        return false;
      }
    }

    validateDate(value, format): string {
        if (format == null || value == null || value === '' || format === '') {
          return null;
        }
        try {
          const date = this.parseDate(value, format);
          if (date instanceof Date) {
            if ((+new Date('1900-01-01 00:00:00') > (+new Date(date)))) {
              return 'dateearlythan1900';
            }
            return 'validDate';
          } else {
              return 'invalidDate';
          }
        } catch (error) {
          return 'invalidFormat';
        }
    }

    get locale() {
      return this._locale;
    }

    private getDaysCountInMonth(month: number, year: number) {
      return 32 - this.daylightSavingAdjust(new Date(year, month, 32)).getDate();
    }

    private daylightSavingAdjust(date) {
      if (!date) {
          return null;
      }
      date.setHours(date.getHours() > 12 ? date.getHours() + 2 : 0);
      return date;
    }

    // Ported from jquery-ui datepicker parseDate
    private parseDate(value, format) {
      value = (typeof value === 'object' ? value.toString() : value + '');
      if (value === '') {
          return null;
      }

      // tslint:disable: one-variable-per-declaration
      let iFormat, dim, extra,
      iValue = 0,
      // tslint:disable-next-line:prefer-const
      shortYearCutoff = (typeof this.shortYearCutoff !== 'string' ? this.shortYearCutoff
                                                                  : new Date().getFullYear() % 100 + parseInt(this.shortYearCutoff, 10)),
      year = -1,
      month = -1,
      day = -1,
      doy = -1,
      literal = false,
      date,
      // tslint:disable-next-line:prefer-const
      lookAhead = (match) => {
          const matches = (iFormat + 1 < format.length && format.charAt(iFormat + 1) === match);
          if (matches) {
              iFormat++;
          }
          return matches;
      },
      // tslint:disable-next-line:prefer-const
      getNumber = (match) => {
          const isDoubled = lookAhead(match),
              size = (match === '@' ? 14 : (match === '!' ? 20 :
              (match === 'y' && isDoubled ? 4 : (match === 'o' ? 3 : 2)))),
              minSize = (match === 'y' ? size : 1),
              digits = new RegExp('^\\d{' + minSize + ',' + size + '}'),
              num = value.substring(iValue).match(digits);
          if (!num) {
              throw new Error('Missing number at position ' + iValue);
          }
          iValue += num[ 0 ].length;
          return parseInt(num[ 0 ], 10);
      },
      // tslint:disable-next-line:prefer-const
      getName = (match, shortNames, longNames) => {
          let index = -1;
          const arr = lookAhead(match) ? longNames : shortNames;
          const names = [];

          for (let i = 0; i < arr.length; i++) {
              names.push([i, arr[i]]);
          }
          names.sort((a, b) => {
              return -(a[ 1 ].length - b[ 1 ].length);
          });

          // tslint:disable-next-line: prefer-for-of
          for (let i = 0; i < names.length; i++) {
              const name = names[i][1];
              if (value.substr(iValue, name.length).toLowerCase() === name.toLowerCase()) {
                  index = names[i][0];
                  iValue += name.length;
                  break;
              }
          }

          if (index !== -1) {
              return index + 1;
          } else {
              throw new Error('Unknown name at position ' + iValue);
          }
      },

      // tslint:disable-next-line:prefer-const
      checkLiteral = () => {
          if (value.charAt(iValue) !== format.charAt(iFormat)) {
              throw new Error('Unexpected literal at position ' + iValue);
          }
          iValue++;
      };

      if (this.view === 'month') {
          day = 1;
      }

      for (iFormat = 0; iFormat < format.length; iFormat++) {
          if (literal) {
              if (format.charAt(iFormat) === '\'' && !lookAhead('\'')) {
                  literal = false;
              } else {
                  checkLiteral();
              }
          } else {
              switch (format.charAt(iFormat)) {
                  case 'd':
                      day = getNumber('d');
                      break;
                  case 'D':
                      getName('D', this.locale.dayNamesShort, this.locale.dayNames);
                      break;
                  case 'o':
                      doy = getNumber('o');
                      break;
                  case 'm':
                      month = getNumber('m');
                      break;
                  case 'M':
                      month = getName('M', this.locale.monthNamesShort, this.locale.monthNames);
                      break;
                  case 'y':
                      year = getNumber('y');
                      break;
                  case '@':
                      date = new Date(getNumber('@'));
                      year = date.getFullYear();
                      month = date.getMonth() + 1;
                      day = date.getDate();
                      break;
                  case '!':
                      date = new Date((getNumber('!') - this.ticksTo1970) / 10000);
                      year = date.getFullYear();
                      month = date.getMonth() + 1;
                      day = date.getDate();
                      break;
                  case '\'':
                      if (lookAhead('\'')) {
                          checkLiteral();
                      } else {
                          literal = true;
                      }
                      break;
                  default:
                      checkLiteral();
              }
          }
      }

      if (iValue < value.length) {
          extra = value.substr(iValue);
          if (!/^\s+/.test(extra)) {
              throw new Error('Extra/unparsed characters found in date: ' + extra);
          }
      }

      if (year === -1) {
          year = new Date().getFullYear();
      } else if (year < 100) {
          year += new Date().getFullYear() - new Date().getFullYear() % 100 +
              (year <= shortYearCutoff ? 0 : -100);
      }

      if (doy > -1) {
          month = 1;
          day = doy;
          do {
              dim = this.getDaysCountInMonth(year, month - 1);
              if (day <= dim) {
                  break;
              }
              month++;
              day -= dim;
          } while (true);
      }

      date = this.daylightSavingAdjust(new Date(year, month - 1, day));
      if (date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) {
            return 'InvalidDate'; // E.g. 31/02/00
        }
      return date;
    }
}
