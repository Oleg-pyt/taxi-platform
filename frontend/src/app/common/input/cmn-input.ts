import { Component, EventEmitter, Input, Output, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'cmn-input',
  templateUrl: './cmn-input.html',
  styleUrls: ['./cmn-input.scss'],
  standalone: false,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CmnInputComponent),
      multi: true
    }
  ]
})
export class CmnInputComponent implements ControlValueAccessor {
  @Input() id = '';
  @Input() label = '';
  @Input() type = 'text';
  @Input() placeholder = '';
  @Input() hasError = false;
  @Output() inputChange = new EventEmitter<string>();

  value = '';
  isDisabled = false;

  private onChange: (val: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(val: string): void {
    this.value = val ?? '';
  }

  registerOnChange(fn: (val: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  handleInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.value = value;
    this.onChange(value);
    this.inputChange.emit(value);
  }

  handleBlur(): void {
    this.onTouched();
  }
}
