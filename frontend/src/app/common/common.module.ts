import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { CmnInputComponent } from './input/cmn-input';
import { BaseWebSocketService } from './services/base-websocket.service';

@NgModule({
  declarations: [CmnInputComponent],
  imports: [CommonModule, ReactiveFormsModule],
  exports: [CmnInputComponent]
})
export class AppCommonModule {}
