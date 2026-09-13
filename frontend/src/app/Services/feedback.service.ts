/*
 * Copyright (c) 2017-2026 Lollo Logistics.
 * SPDX-License-Identifier: MIT
 */

import { environment } from '../../environments/environment'
import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { catchError, map } from 'rxjs/operators'

@Injectable({
  providedIn: 'root'
})
export class FeedbackService {
  private readonly http = inject(HttpClient)

  private readonly hostServer = environment.hostServer
  private readonly host = this.hostServer + '/api/feedback'

  find (params?: any) {
    return this.http.get(this.host + '/', {
      params
    }).pipe(map((response: any) => response.data), catchError((err) => { throw err }))
  }

  save (params: any) {
    return this.http.post(this.host + '/', params).pipe(map((response: any) => response.data), catchError((err) => { throw err }))
  }

  del (id: number) {
    return this.http.delete(`${this.host}/${id}`).pipe(map((response: any) => response.data), catchError((err) => { throw err }))
  }
}
