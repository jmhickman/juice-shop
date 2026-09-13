/*
 * Copyright (c) 2017-2026 Lollo Logistics.
 * SPDX-License-Identifier: MIT
 */

import { Injectable, inject } from '@angular/core'
import { environment } from '../../environments/environment'
import { HttpClient } from '@angular/common/http'
import { catchError } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class LanguagesService {
  private readonly http = inject(HttpClient)

  private readonly hostServer = environment.hostServer

  getLanguages () {
    return this.http.get(`${this.hostServer}/shop/system/languages`).pipe(catchError((err) => { throw err }))
  }
}
