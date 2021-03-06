/* eslint-disable no-undef */
const request = require('supertest');
const app = require('../server');
const { prisma } = require('../../generated/prisma-client');

const sampleOk = {
  firstName: 'firstName',
  lastName: 'lastName',
  email: 'email',
  password: 'password',
};

const requestBody = {
  firstName: 'firstName!',
  lastName: 'lastName!',
  email: 'email!',
  password: 'password!',
};

const notPresentId = '000000';
let presentId;

beforeEach(async (done) => {
  await prisma.deleteManyUsers();
  const data = await prisma.createUser(sampleOk);
  presentId = data.id;
  done();
});

describe('Update a user by id', () => {
  it('Nominal case', async (done) => {
    const res = await request(app)
      .put(`/users/${presentId}`)
      .send(requestBody);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body.id).toEqual(presentId);
    expect(res.body).toHaveProperty('firstName');
    expect(res.body.firstName).toEqual(requestBody.firstName);
    expect(res.body).toHaveProperty('lastName');
    expect(res.body.lastName).toEqual(requestBody.lastName);
    expect(res.body).toHaveProperty('email');
    expect(res.body.email).toEqual(requestBody.email);
    expect(res.body).toHaveProperty('createdAt');
    expect(res.body).toHaveProperty('updatedAt');
    done();
  });
  it('422 error because the user already exist', async (done) => {
    const user = { ...sampleOk };
    user.email = requestBody.email;
    await prisma.createUser(user);
    const res = await request(app)
      .put(`/users/${presentId}`)
      .send(requestBody);
    expect(res.statusCode).toEqual(422);
    done();
  });
  it.each(
    [{ lastName: 'lastName', email: 'email' }, { firstName: 'firstName', email: 'email' }, { firstName: 'firstName', lastName: 'lastName' }],
  )('Should return a 400 because a required field is missing', async (data, done) => {
    const res = await request(app)
      .put(`/users/${presentId}`)
      .send(data);
    expect(res.statusCode).toEqual(400);
    done();
  });

  it('404 error case', async (done) => {
    const res = await request(app)
      .put(`/users/${notPresentId}`)
      .send(requestBody);
    expect(res.statusCode).toEqual(404);
    done();
  });
});
