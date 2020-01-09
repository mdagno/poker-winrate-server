'use strict';

const knex = require('knex');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');


function makeSessionsArray(user) {
  return [
    {
      id: 1,
      game_type_one: 'Live',
      game_type_two: 'Cash',
      date_played: '2019-10-21T10:11:16.285Z',
      small_blind: '1',
      big_blind: '2',
      buy_in: '200',
      cashed_out: '250',
      session_length: '4',
      notes: 'Notes 1',
      user_id: user.id,
    },
    {
      id: 2,
      game_type_one: 'Live',
      game_type_two: 'Cash',
      date_played: '2019-10-22T10:11:16.285Z',
      small_blind: '1',
      big_blind: '2',
      buy_in: '200',
      cashed_out: '300',
      session_length: '2',
      notes: 'Notes 1',
      user_id: user.id,
    },
    {
      id: 3,
      game_type_one: 'Live',
      game_type_two: 'Cash',
      date_played: '2019-10-23T10:11:16.285Z',
      small_blind: '1',
      big_blind: '2',
      buy_in: '200',
      cashed_out: '150',
      session_length: '3',
      notes: 'Notes 1',
      user_id: user.id,
    },
  ];
}

function cleanTables(db) {
  return db.raw(
    `TRUNCATE
      "poker_sessions",
      "user"`
  );
}

function seedSessions(db, sessions) {
  return db
    .insert(sessions)
    .into('poker_sessions');
}

function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }));
  return db.transaction(async trx => {
    await trx.into('user').insert(preppedUsers);
  });
}

function makeTestUsers() {
  return [
    {
      id: 1,
      username: 'tester',
      email: 'test@test.com',
      password: 'password'
    },
    {
      id: 2,
      username: 'tester2',
      email: 'test2@test.com',
      password: 'password'
    },
    {
      id: 3,
      username: 'tester3',
      email: 'test3@test.com',
      password: 'password'
    },
  ];
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, secret, {
    subject: user.username,
    algorithm: 'HS256',
  });
  return `Bearer ${token}`;
}


module.exports = {
  makeSessionsArray,
  cleanTables,
  seedSessions,
  makeTestUsers,
  makeAuthHeader,
  seedUsers,
};