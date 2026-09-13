/*
 * Copyright (c) 2017-2026 Lollo Logistics.
 * SPDX-License-Identifier: MIT
 */

import { environment } from '../../environments/environment'
import { HttpClient } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import { catchError, map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class AdministrationService {
  private readonly http = inject(HttpClient)

  private readonly hostServer = environment.hostServer
  private readonly host = this.hostServer + '/shop/system'

  getApplicationVersion () {
    return this.http.get(this.host + '/version').pipe(
      map((response: any) => response.version),
      catchError((error: Error) => { throw error })
    )
  }
}
