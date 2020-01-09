'use strict';

const knex = require('knex');
const app = require('../src/app');
const SessionsService = require('../src/sessions/sessions-service')
const helpers = require('./test-helpers');

describe('Sessions endpoints', () => {
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

  after('Disconnect from db', () => db.destroy());

  before('Cleanup', () => helpers.cleanTables(db));

  afterEach('Cleanup', () => helpers.cleanTables(db));
  beforeEach('insert users', () => {
    helpers.seedUsers(
      db,
      testUsers
    )
  })
  beforeEach(function (done) {
    setTimeout(function(){
      done();
    }, 250);
  });

  describe('GET /api/sessions', () => {


    context('Given no sessions', () => {
      it('Reponds with 200 and empty list', () => {
        return supertest(app)
          .get('/api/sessions')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200, []);
      });
    });

    context('Given there are sessions in the db', () => {
      beforeEach('insert sessions', () => 
        helpers.seedSessions(
          db,
          helpers.makeSessionsArray(testUser)
        )
      );
      it('responds with 200 and all of the sessions in the db', () => {
        const expectedSessions = helpers.makeSessionsArray(testUser);
        return supertest(app)
          .get('/api/sessions')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200, expectedSessions);
      });
    });
  });

  describe('GET /api/sessions/:session_id', () => {
    context('Given no sessions in the db', () => {
      it('responds with a 404', () => {
        const testId = 1;
        return supertest(app)
          .get(`/api/sessions/${testId}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(404);
      });
    });
    
    context('Given there are sessions in the db', () => {
      beforeEach('insert sessions', () => 
        helpers.seedSessions(
          db,
          helpers.makeSessionsArray(testUser)
        )
      );
      
      it('Responds with the session with the correct id', () => {
        const testId = 1;
        const testSession = helpers.makeSessionsArray(testUser)[0];

        return supertest(app)
          .get(`/api/sessions/${testId}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200, testSession);
      });
    });
  });

  describe('DELETE /api/sessions/:session_id', () => {
    context('Given there are no sessions', () => {
      it('responds with a 404', () => {
        const sessionId = 1;
        return supertest(app)
          .delete(`/api/sessions/${sessionId}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(404);
      });
    });

    context('Given there are sessions in the db', () => {
      const testSessions = helpers.makeSessionsArray(testUser);
      const testSession = testSessions[0];
      beforeEach('insert sessions', () => 
        helpers.seedSessions(
          db,
          helpers.makeSessionsArray(testUser)
        )
      );

      it('Responds with a 204 and deletes the session', () => {
        const testIdDelete = 1;
        const expectedSessions = testSessions.filter(session => session.id !== testIdDelete);
        return supertest(app)
          .delete(`/api/sessions/${testIdDelete}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(204)
          .then(res => 
            supertest(app)
              .get('/api/sessions')
              .set('Authorization', helpers.makeAuthHeader(testUser))
              .expect(expectedSessions)
          );
      }); 
    });
  });

  describe('PATCH /api/sessions/:session_id', () => {
    const newSessionValues = {};
    
    context('Given no sessions are in db', () => {
      it('Responds with a 404', () => {
        const testId = 1;
        return supertest(app)
          .patch(`/api/sessions/${testId}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(404)
      });
    });

    context('Given there are sessions in the db', () => {
      const testSessions = helpers.makeSessionsArray(testUser);

      beforeEach('Insert sessions', () => 
        helpers.seedSessions(
          db,
          helpers.makeSessionsArray(testUser)
        )
      );

      it('Responds with a 200 and updates the corresponding session', () => {
        const testId = 1;
        const updatedSession = {
          cashed_out: '10000',
          notes: 'Updated session notes'
        };

        const expectedSession = {
          ...testSessions[testId - 1],
          ...updatedSession
        }

        return supertest(app)
          .patch(`/api/sessions/${testId}`)
          .send(updatedSession)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200)
          .then(res => 
             supertest(app)
             .get(`/api/sessions/${testId}`)
             .set('Authorization', helpers.makeAuthHeader(testUser))
             .expect(expectedSession) 
            );
      });    
    });

  });

  describe('POST /api/sessions', () => {

    it('Creates a new session and responds with a 201 and the new session', () => {
      const newSession = {
        game_type_one: 'Live',
        game_type_two: 'Cash',
        small_blind: '1',
        big_blind: '2',
        buy_in: '200',
        cashed_out: '250',
        session_length: '4',
        notes: 'Notes 4',
        user_id: testUser.id
      };

      return supertest(app)
        .post('/api/sessions')
        .send(newSession)
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .expect(201)
        .expect(res => {
          expect(res.body.game_type_one).to.eql(newSession.game_type_one)
          expect(res.body.game_type_two).to.eql(newSession.game_type_two)
          expect(res.body.small_blind).to.eql(newSession.small_blind)
          expect(res.body.big_blind).to.eql(newSession.big_blind)
          expect(res.body.buy_in).to.eql(newSession.buy_in)
          expect(res.body.cashed_out).to.eql(newSession.cashed_out)
          expect(res.body.session_length).to.eql(newSession.session_length)
          expect(res.body.notes).to.eql(newSession.notes)
          expect(res.body).to.have.property('id');
          expect(res.body).to.have.property('date_played');
        })
        .then(res => 
          supertest(app)
            .get(`/api/sessions/${res.body.id}`)
            .set('Authorization', helpers.makeAuthHeader(testUser))
            .expect(res.body)
        );
    });
  });

});