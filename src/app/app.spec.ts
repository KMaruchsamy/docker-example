import {
    it,
    inject,
    describe,
    expect,
    beforeEach,
    beforeEachProviders
} from '@angular/core/testing';

describe('AppComponent', () => {
    beforeEachProviders(() => []);
    beforeEach(() => {
    });

    it('test',  () => {
        expect(2).toEqual(2);
    });

    it('test-not equal',  () => {
        expect(3).toEqual(3);
    });
});
