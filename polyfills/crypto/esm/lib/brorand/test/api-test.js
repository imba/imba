import brorand from "../";
import assert from "assert";
describe('Brorand', function () {
    it('should generate random numbers', function () {
        assert.equal(brorand(100).length, 100);
    });
});
