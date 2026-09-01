import { describe, expect, it } from 'vitest';
import { isEligibleMetPainting, type MetObject } from './met-museum';

function museumObject(overrides: Partial<MetObject> = {}): MetObject {
  return {
    objectID: 123,
    title: 'The Triumph of Bacchus',
    isPublicDomain: true,
    primaryImageSmall:
      'https://images.metmuseum.org/CRDImages/ep/web-large/example.jpg',
    objectName: 'Painting',
    classification: 'Paintings',
    medium: 'Oil on canvas',
    ...overrides,
  };
}

describe('isEligibleMetPainting', () => {
  it('accepts a public-domain catalogued painting with a direct image', () => {
    expect(isEligibleMetPainting(museumObject())).toBe(true);
  });

  it.each([
    museumObject({
      title: 'Hexagonal Tile',
      objectName: 'Tile',
      classification: 'Ceramics',
      medium: 'Earthenware',
    }),
    museumObject({
      title: 'Fragment of a Bowl',
      objectName: 'Fragment',
      classification: 'Ceramics',
      medium: 'Glazed earthenware',
    }),
    museumObject({
      title: 'Marble Hero',
      objectName: 'Sculpture',
      classification: 'Sculpture',
      medium: 'Marble',
    }),
  ])(
    'rejects physical museum objects even when they appear in the broad search',
    (object) => {
      expect(isEligibleMetPainting(object)).toBe(false);
    }
  );

  it('rejects non-paintings, non-public works, and entries without a usable image', () => {
    expect(
      isEligibleMetPainting(
        museumObject({ classification: 'Drawings', objectName: 'Drawing' })
      )
    ).toBe(false);
    expect(isEligibleMetPainting(museumObject({ isPublicDomain: false }))).toBe(
      false
    );
    expect(
      isEligibleMetPainting(
        museumObject({ primaryImageSmall: undefined, primaryImage: undefined })
      )
    ).toBe(false);
  });
});
