import assert from 'node:assert/strict';
// The module's public-page initializer has no host in this Node check.
globalThis.document={querySelectorAll:()=>[]};
const {validDate,addDays,validateAvailability,statusFor,datesBetween}=await import('../assets/availability.js');
assert.equal(validDate('2028-02-29'),true);
assert.equal(validDate('2026-02-29'),false);
assert.equal(addDays('2026-10-24',2),'2026-10-26'); // UK daylight-saving transition.
assert.deepEqual(datesBetween('2026-12-31','2027-01-02'),['2026-12-31','2027-01-01','2027-01-02']);
const data=validateAvailability({timezone:'Europe/London',updated_at:'2026-11-01T12:00:00Z',ranges:[{start:'2026-11-01',end:'2026-11-10',status:'available'},{start:'2026-11-05',end:'2026-11-07',status:'pencilled'},{start:'2026-11-06',end:'2026-11-06',status:'booked'}]});
assert.equal(statusFor(data,'2026-11-02'),'available');
assert.equal(statusFor(data,'2026-11-05'),'pencilled');
assert.equal(statusFor(data,'2026-11-06'),'booked');
assert.equal(statusFor(data,'2026-11-11'),'enquire');
assert.throws(()=>validateAvailability({...data,ranges:[{start:'2026-11-10',end:'2026-11-01',status:'available'}]}));
assert.throws(()=>validateAvailability({...data,ranges:[{start:'2026-11-01',end:'2026-11-02',status:'client name'}]}));
assert.throws(()=>validateAvailability({...data,timezone:'UTC'}));
assert.throws(()=>validateAvailability({...data,updated_at:null}));
assert.throws(()=>validateAvailability({...data,updated_at:'2026'}));
console.log('Passed: date validity, DST/year boundaries, overrides and safe unknown defaults.');
