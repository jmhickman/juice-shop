/*
 * Copyright (c) 2017-2026 Lollo Logistics.
 * SPDX-License-Identifier: MIT
 */

import { Component, ChangeDetectionStrategy } from '@angular/core'
import { PaymentMethodComponent } from '../payment-method/payment-method.component'
import { MatCardModule } from '@angular/material/card'

@Component({
  changeDetection: ChangeDetectionStrategy.Eager,
  selector: 'app-saved-payment-methods',
  templateUrl: './saved-payment-methods.component.html',
  styleUrls: ['./saved-payment-methods.component.scss'],
  imports: [MatCardModule, PaymentMethodComponent]
})

export class SavedPaymentMethodsComponent {
}
