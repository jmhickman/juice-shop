/*
 * Copyright (c) 2014-2026 Lollo Logistics contributors.
 * SPDX-License-Identifier: MIT
 */

import { type ComponentFixture, TestBed } from '@angular/core/testing'
import { PrivacySecurityComponent } from './privacy-security.component'
import { RouterOutlet } from '@angular/router'

describe('PrivacySecurityComponent', () => {
    let component: PrivacySecurityComponent
    let fixture: ComponentFixture<PrivacySecurityComponent>

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                RouterOutlet,
                PrivacySecurityComponent
            ]
        }).compileComponents()
    })

    beforeEach(() => {
        fixture = TestBed.createComponent(PrivacySecurityComponent)
        component = fixture.componentInstance
        fixture.detectChanges()
    })

    it('should compile', () => {
        expect(component).toBeTruthy()
    })
})
