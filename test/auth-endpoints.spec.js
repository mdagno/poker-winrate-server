'use strict';

const knex = require('knex');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const helpers = require('./test-helpers');
const config = require('../src/config')

describe('Authorization endpoints', () => {
  let db;

  const testUsers = helpers.makeTestUsers();
  const testUser = testUsers[0];

  before('Create knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => helpers.cleanTables(db));

  afterEach('cleanup', () => helpers.cleanTables(db));
 
  beforeEach('insert users', () => 
    helpers.seedUsers(
      db,
      testUsers,
    )
  )
  describe(`POST /api/auth/token`, () => {
    const requiredFields = ['username', 'password'];

    requiredFields.forEach(field => {
      const loginAttemptBody = {
        username: testUser.username,
        password: testUser.password,
      }

      it(`responds with 400 required error when '${field}' is missing`, () => {
        delete loginAttemptBody[field];

        return supertest(app)
          .post('/api/auth/token')
          .send(loginAttemptBody)
          .expect(400, {
            error: `Missing '${field}' in request body`,
          });
      });
    });

  });

  it(`responds with 400 'invalid username or password when invalid username`, () => {
    const invalidUser = { username: 'doesNot', password: 'exist'};
    return supertest(app)
      .post('/api/auth/token')
      .send(invalidUser)
      .expect(400, { error: 'Incorrect username or password' });
  });

  it(`responds with 400 'invalid username or password when invalid username`, () => {
    const invalidUserPass = { username: testUser.username, password: 'invalidPass'};
    return supertest(app)
      .post('/api/auth/token')
      .send(invalidUserPass)
      .expect(400, { error: 'Incorrect username or password' });
  });

  it(`responds with a 200 and auth token when using valid auth credentials`, () => {
    const userValidCreds = {
      username: testUser.username,
      password: testUser.password,
    };

    const expectedToken = jwt.sign(
      { user_id: 1 },
      process.env.JWT_SECRET,
      {
        subject: testUser.username,
        algorithm: 'HS256',
      }
    );

    return supertest(app)
      .post('/api/auth/token')
      .send(userValidCreds)
      .expect(200, {
        authToken: expectedToken,
      });
  });
});