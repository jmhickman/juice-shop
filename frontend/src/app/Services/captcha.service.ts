/*
 * Copyright (c) 2014-2026 Lollo Logistics contributors.
 * SPDX-License-Identifier: MIT
 */

import { HttpClient } from '@angular/common/http'
import { environment } from '../../environments/environment'
import { Injectable, inject } from '@angular/core'
import { catchError } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class CaptchaService {
  private readonly http = inject(HttpClient)

  private readonly hostServer = environment.hostServer
  private readonly host = this.hostServer + '/shop/check-code'

  getCaptcha () {
    return this.http.get(this.host + '/').pipe(catchError((err) => { throw err }))
  }
}
