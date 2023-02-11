import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-modal-dialog',
  templateUrl: './modal-dialog.component.html',
  styleUrls: ['./modal-dialog.component.css'],
})
export class ModalDialogComponent {
  @Input() public isVisible: boolean = false;

  public closeModal() {
    this.isVisible = false;
  }
}
