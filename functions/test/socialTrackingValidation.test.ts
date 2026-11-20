import assert from 'node:assert/strict';
import test from 'node:test';
import {
  parseSocialObservation as backendParser,
} from '../src/socialTrackingValidation';
import {
  parseSocialObservation as existingParser,
} from '../../server/socialTrackingValidation';

test('backend validation exports the existing server parser without duplicating it', () => {
  assert.equal(backendParser, existingParser);
});
