import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { ConfirmDialog, ConfirmDialogData } from './confirm-dialog';

const dialogData: ConfirmDialogData = {
  title: 'Eliminar héroe',
  message: '¿Estás segura de que querés eliminar a SUPERMAN?',
  confirmText: 'Eliminar',
  cancelText: 'Cancelar',
};

describe('ConfirmDialog', () => {
  let component: ConfirmDialog;
  let fixture: ComponentFixture<ConfirmDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDialog],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: dialogData },
        {
          provide: MatDialogRef,
          useValue: {
            close: vi.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ConfirmDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create with the received data', () => {
    expect(component).toBeTruthy();
    expect(component.data).toEqual(dialogData);
  });

  it('should display the confirmation information', () => {
    const element: HTMLElement = fixture.nativeElement;
    const content: string = element.textContent ?? '';

    expect(content).toContain('Eliminar héroe');
    expect(content).toContain('SUPERMAN');
    expect(content).toContain('Cancelar');
    expect(content).toContain('Eliminar');
  });
});
