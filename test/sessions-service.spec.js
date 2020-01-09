'use strict';

const SessionsService = require('../src/sessions/sessions-service');
const knex = require('knex');
const helpers = require('./test-helpers');

describe.only('Sessions service object', () => {
  let db;
  
  const testUsers = helpers.makeTestUsers(); 
  const testUser = testUsers[0];
  const testSessions = helpers.makeSessionsArray(testUser) 

  before(() => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });
  });

  after(() => db.destroy());

  before(() => db('poker_sessions').truncate());

  afterEach(() => db('poker_sessions').truncate());

  beforeEach(function (done) {
    setTimeout(function(){
      done();
    }, 250);
  });

  context('given poker_sessions has data', () => {
    beforeEach(() => {
      return db
        .into('poker_sessions')
        .insert(testSessions);
    });
    describe('getAllSessions()', () => {
      it('gets all sessions from poker_sessions db', () => {
        return SessionsService.getAllSessions(db, testUser.id)
          .then(response => {
            expect(response).to.eql(testSessions);
          });
      });
    });

    it.only('getById() returns a session by id from poker_sessions', () => {
      const firstId = 1;
      const expectedSession = testSessions[firstId - 1];
      return SessionsService.getById(db, firstId)
        .then(response => {
          expect(response).to.eql(expectedSession);
        });
    });

    it('deleteSession() removes a session by id from poker_sessions', () => {
      const sessionId = 1;
      return SessionsService.deleteSession(db, sessionId)
        .then(() => SessionsService.getAllSessions(db, testUser.id))
        .then(sessions => {
          expect(sessions).to.eql([
            { 
              id: 2,
              game_type_one: 'Live',
              game_type_two: 'Cash',
              date_played: new Date('2029-01-22T16:28:32.615Z'),
              small_blind: 5,
              big_blind: 10,
              buy_in: 1000,
              cashed_out: 1500,
              session_length: 6,
              notes: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
            },
            { 
              id: 3,
              game_type_one: 'Live',
              game_type_two: 'Cash',
              date_played: new Date('2029-01-22T16:28:32.615Z'),
              small_blind: 5,
              big_blind: 10,
              buy_in: 1000,
              cashed_out: 1500,
              session_length: 6,
              notes: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
            },
          ]);
        });
    });
  
    it('updateSession() updates session from poker_sessions table', () => {
      const updateSessionId = 1
      const newSessionValues = {
        game_type_one: 'Live',
        game_type_two: 'Cash',
        date_played: new Date('2029-01-22T16:28:32.615Z'),
        small_blind: 5,
        big_blind: 10,
        buy_in: 1000,
        cashed_out: 2000,
        session_length: 10,
        notes: 'TESTING OMEGALUL'
      };
      return SessionsService.updateSession(db, updateSessionId, newSessionValues)
        .then(() => SessionsService.getById(db, updateSessionId))
        .then(session => {
          expect(session).to.eql({
            id: 1,
            ...newSessionValues
          })
        })
    });
  });

  context('given poker_sessions has no data', () => {
    it('getAllSessions() returns an empty array', () => {
      return SessionsService.getAllSessions(db, testUser.id)
        .then(response => {
          expect(response).to.eql([]);
        });
    });
    it('addSession() inserts a new session and returns the session with an id', () => {
      const newSession = {
        game_type_one: 'Live',
        game_type_two: 'Cash',
        date_played: new Date('2029-01-22T16:28:32.615Z'),
        small_blind: 5,
        big_blind: 10,
        buy_in: 1000,
        cashed_out: 1500,
        session_length: 6,
        notes: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
      };

      return SessionsService.addSession(db, newSession)
        .then(response => {
          expect(response).to.eql({
            id: 1,
            game_type_one: 'Live',
            game_type_two: 'Cash',
            date_played: new Date('2029-01-22T16:28:32.615Z'),
            small_blind: 5,
            big_blind: 10,
            buy_in: 1000,
            cashed_out: 1500,
            session_length: 6,
            notes: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'
          });
        });

    });
  });

});
