import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { Uppercase } from './uppercase';

@Component({
  imports: [ReactiveFormsModule, Uppercase],
  template: `
    <input appUppercase [formControl]="nameControl" />
  `,
})
class TestHost {
  readonly nameControl = new FormControl('', {
    nonNullable: true,
  });
}

describe('Uppercase', () => {
  let fixture: ComponentFixture<TestHost>;
  let component: TestHost;
  let input: HTMLInputElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHost],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHost);
    component = fixture.componentInstance;
    input = fixture.nativeElement.querySelector('input');
    fixture.detectChanges();
  });

  it('should display and store the value in uppercase', () => {
    input.value = 'SpiderMan';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(input.value).toBe('SPIDERMAN');
    expect(component.nameControl.value).toBe('SPIDERMAN');
  });

  it('should keep an uppercase value unchanged', () => {
    input.value = 'SUPERMAN';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(input.value).toBe('SUPERMAN');
    expect(component.nameControl.value).toBe('SUPERMAN');
  });
});
