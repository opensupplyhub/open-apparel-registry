const request = require('supertest');
const app = require('./app');

describe('Test the root path', () => {
  test('It should response 200 status code', (done) => {
    request(app)
      .get('/')
      .set('Accept', 'application/json')
      .expect(200, done);
  });
});

describe('Test getting factories', () => {
  test('It should return factory Details as a not empty array', (done) => {
    request(app)
      .get('/getFactory')
      .set('Accept', 'application/json')
      .expect(200)
      .then(response => {
        const detail = response.body.factoryDetails;
        expect(Array.isArray(detail)).toBe(true);
        expect(detail.length).toBeGreaterThan(0)
        done();
    });
  });
});

// describe('Test search factories by keywords', () => {
//   test('It should return factories that includes Sourcemap', (done) => {
//     request(app)
//       .get('/searchFactoryName?name=sourcemap')
//       .set('Accept', 'application/json')
//       .expect(200)
//       .then(response => {
//         const hits = response.body.hits.hits;
//         const hasTarget = hits.find(h => ['_source.name', 'Sourcemap']);
//         expect(hasTarget).toBeDefined();
//         done();
//     });
//   });
// });

// describe('Test searching/matching factories by name, address and geolocation', () => {
//   test('It should return Sourcemap as the first hit', (done) => {
//     request(app).post('/searchFactoryFuzzyClose')
//       .send({ name: 'Sourcemap', address: '85 Broad St, New York City, New York, NY' })
//       .set('Accept', 'application/json')
//       .expect(200)
//       .then(response => {
//         const firstHit = response.body.hits.hits[0];
//         expect(firstHit._source.name).toBe("Sourcemap");
//         done();
//     });
//   });
// });
