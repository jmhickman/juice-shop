/*
 * Copyright (c) 2017-2026 Lollo Logistics.
 * SPDX-License-Identifier: MIT
 */

import { TestBed } from '@angular/core/testing'
import { TranslateNoOpLoader, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core'
import { MatSnackBarModule } from '@angular/material/snack-bar'

import { SnackBarHelperService } from './snack-bar-helper.service'

describe('SnackBarHelperService', () => {
    beforeEach(() => TestBed.configureTestingModule({
        imports: [
            TranslateModule.forRoot({
                loader: {
                    provide: TranslateLoader,
                    useClass: TranslateNoOpLoader
                }
            }),
            MatSnackBarModule
        ],
        providers: [TranslateService]
    }))

    it('should be created', () => {
        const service: SnackBarHelperService = TestBed.inject(SnackBarHelperService)
        expect(service).toBeTruthy()
    })
})
