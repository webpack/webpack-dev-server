// For whatever reason, this test is now causing hangs. It's not really needed,
// as the middleware it uses for the feature already has tests, so we're
// throwing it into a fire.
//
// 'use strict';
//
// const request = require('supertest');
// const helper = require('./helper');
// const config = require('./fixtures/simple-config/webpack.config');
//
// describe('Compress', () => {
//   let server;
//   let req;
//
//   before((done) => {
//     server = helper.start(config, {
//       compress: true
//     }, done);
//     req = request(server.app);
//   });
//
//   after(helper.close);
//
//   it('request to bundle file', (done) => {
//     req.get('/bundle.js')
//       .expect('Content-Encoding', 'gzip')
//       .expect(200, done);
//   });
// });
