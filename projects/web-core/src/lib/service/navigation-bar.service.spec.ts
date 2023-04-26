import { NavigationBarService } from './navigation-bar.service';
import { async, TestBed } from '@angular/core/testing';

describe('NavigationBarService', () => {
    let navigationBarService: NavigationBarService;
    beforeAll(() => { navigationBarService = new NavigationBarService(); });
    should_be_getHerf_return_person_route();
    should_be_getItem_not_return_null();

    it('should create', () => {
    expect(navigationBarService).toBeTruthy();
    });

    function should_be_getHerf_return_person_route() {
        it('should_be_getHerf_return_person_route', () => {
        expect(navigationBarService.getHerf()).toEqual(location.href.toString());
        });
    }
    function should_be_getItem_not_return_null() {
        it('should_be_getItem_not_return_null', () => {
            expect(navigationBarService.getItem()).toBeDefined();
        });
    }

});
