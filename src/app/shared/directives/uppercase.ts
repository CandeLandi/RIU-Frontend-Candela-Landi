import { Directive, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: 'input[appUppercase]',
  host: {
    '(input)': 'onInput($event)',
  },
})
export class Uppercase {
  private readonly ngControl = inject(NgControl, {
    self: true,
    optional: true,
  });

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const uppercaseValue: string = input.value.toUpperCase();

    if (input.value === uppercaseValue) {
      return;
    }

    input.value = uppercaseValue;
    this.ngControl?.control?.setValue(uppercaseValue);
  }
}
