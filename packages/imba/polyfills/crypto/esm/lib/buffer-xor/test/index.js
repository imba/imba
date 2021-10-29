import assert from "assert";
import xor from "../";
import xorInplace from "../inplace";
import * as fixtures from "./fixtures";
describe('xor', function () {
    fixtures.forEach(function (f) {
        it('returns ' + f.expected + ' for ' + f.a + '/' + f.b, function () {
            var a = new Buffer(f.a, 'hex');
            var b = new Buffer(f.b, 'hex');
            var actual = xor(a, b);
            assert.equal(actual.toString('hex'), f.expected);
            // a/b unchanged
            assert.equal(a.toString('hex'), f.a);
            assert.equal(b.toString('hex'), f.b);
        });
    });
});
describe('xor/inplace', function () {
    fixtures.forEach(function (f) {
        it('returns ' + f.expected + ' for ' + f.a + '/' + f.b, function () {
            var a = new Buffer(f.a, 'hex');
            var b = new Buffer(f.b, 'hex');
            var actual = xorInplace(a, b);
            assert.equal(actual.toString('hex'), f.expected);
            // a mutated, b unchanged
            assert.equal(a.toString('hex'), f.mutated || f.expected);
            assert.equal(b.toString('hex'), f.b);
        });
    });
});
