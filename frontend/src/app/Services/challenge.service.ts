/*
 * Copyright (c) 2014-2026 Lollo Logistics contributors.
 * SPDX-License-Identifier: MIT
 */

import { environment } from '../../environments/environment'
import { HttpClient } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import { type Observable } from 'rxjs'
import { catchError, map } from 'rxjs/operators'
import { type Challenge } from '../Models/challenge.model'

@Injectable({
  providedIn: 'root'
})
export class ChallengeService {
  private readonly http = inject(HttpClient)

  private readonly hostServer = environment.hostServer
  private readonly host = this.hostServer + '/api/objectives'

  find (params?: any): Observable<Challenge[]> {
    return this.http.get(this.host + '/', { params }).pipe(map((response: any) => response.data), catchError((err) => { throw err }))
  }

  repeatNotification (challengeName: string) {
    return this.http.get(this.hostServer + '/shop/system/notification', { params: { challenge: challengeName }, responseType: 'text' as const }).pipe(catchError((err) => { throw err }))
  }

  continueCode () {
    return this.http.get(this.hostServer + '/shop/progress/token').pipe(map((response: any) => response.continueCode), catchError((err) => { throw err }))
  }

  continueCodeFindIt () {
    return this.http.get(this.hostServer + '/shop/progress/find-it').pipe(map((response: any) => response.continueCode), catchError((err) => { throw err }))
  }

  continueCodeFixIt () {
    return this.http.get(this.hostServer + '/shop/progress/fix-it').pipe(map((response: any) => response.continueCode), catchError((err) => { throw err }))
  }

  restoreProgress (continueCode: string) {
    return this.http.put(this.hostServer + '/shop/progress/token/apply/' + continueCode, {}).pipe(map((response: any) => response.data), catchError((err) => { throw err }))
  }

  restoreProgressFindIt (continueCode: string) {
    return this.http.put(this.hostServer + '/shop/progress/find-it/apply/' + continueCode, {}).pipe(map((response: any) => response.data), catchError((err) => { throw err }))
  }

  restoreProgressFixIt (continueCode: string) {
    return this.http.put(this.hostServer + '/shop/progress/fix-it/apply/' + continueCode, {}).pipe(map((response: any) => response.data), catchError((err) => { throw err }))
  }
}
