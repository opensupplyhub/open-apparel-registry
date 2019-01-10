/* eslint-env jest */
import identity from 'lodash/identity';

it('returns identity', () => {
    expect(identity(1)).toEqual(1);
    expect(identity(true)).toEqual(true);
    expect(identity(null)).toEqual(null);
});
