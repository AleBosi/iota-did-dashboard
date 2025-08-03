import { issueVC } from './vcHelpers';

describe('issueVC', () => {
  it('crea una VerifiableCredential corretta', () => {
    const type = ['VerifiableCredential', 'ProductCredential'];
    const issuer = 'did:iota:issuer';
    const subject = { id: 'prod1', name: 'Prodotto 1' };

    const vc = issueVC(type, issuer, subject);

    expect(vc).toHaveProperty('@context');
    expect(Array.isArray(vc['@context'])).toBe(true);
    expect(vc['@context']).toContain('https://www.w3.org/2018/credentials/v1');

    expect(vc).toHaveProperty('id');
    expect(typeof vc.id).toBe('string');
    expect(vc.id.startsWith('urn:uuid:')).toBe(true);

    expect(vc).toHaveProperty('type', type);
    expect(vc).toHaveProperty('issuer', issuer);
    expect(vc).toHaveProperty('issuanceDate');
    expect(typeof vc.issuanceDate).toBe('string');
    expect(new Date(vc.issuanceDate).toString()).not.toBe('Invalid Date');

    expect(vc).toHaveProperty('credentialSubject', subject);

    expect(vc).toHaveProperty('proof');
    expect(vc.proof).toMatchObject({
      type: 'Ed25519Signature2018',
      created: vc.issuanceDate,
      proofPurpose: 'assertionMethod',
      verificationMethod: issuer,
    });
    expect(typeof vc.proof.jws).toBe('string');
    expect(() => JSON.parse(atob(vc.proof.jws))).not.toThrow();
    expect(JSON.parse(atob(vc.proof.jws))).toEqual(subject);
  });

  it('produce credenziali diverse a ogni chiamata', () => {
    const type = ['VerifiableCredential'];
    const issuer = 'did:iota:issuer';
    const subject = { id: 'p1' };
    const vc1 = issueVC(type, issuer, subject);
    const vc2 = issueVC(type, issuer, subject);
    expect(vc1.id).not.toBe(vc2.id);
    expect(vc1.proof.jws).toBe(vc2.proof.jws); // stesso subject, stessa jws
  });

    it('crea una VerifiableCredential corretta', () => {
    const type = ['VerifiableCredential', 'ProductCredential'];
    const issuer = 'did:iota:issuer';
    const subject = { id: 'prod1', name: 'Prodotto 1' };

    const vc = issueVC(type, issuer, subject);

    // ...gli altri expect...

    expect(vc.proof).toHaveProperty('hash');
    expect(typeof vc.proof.hash).toBe('string');
    expect(vc.proof.hash.startsWith('mockhash-')).toBe(true);
  });

});
