const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const UserApiTestHelper = require('../../../../tests/UsersApiTestHelper');

describe('/threads endpoint', () => {
  afterEach(async () => {
    await ThreadsTableTestHelper.cleanTable();
    await UsersTableTestHelper.cleanTable();
  });

  afterAll(async () => {
    await pool.end();
  });

  it('should response 400 when request payload not contain needed property', async () => {
    // Arrange
    const requestPayload = {
      title: 'thread-title',
    };
    const server = await createServer(container);

    const accessToken = await UserApiTestHelper.getAccessTokenFromUser({})

    // Action
    const response = await server.inject({
      method: 'POST',
      url: '/threads',
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: requestPayload,
    });

    // Assert
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(400);
    expect(responseJson.status).toEqual('fail');
    expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
  });

  it('should response 401 when request payload not authorization header', async () => {
    // Arrange
    const requestPayload = {
      title: 'thread-title',
      body: 'thread-body',
    };
    const server = await createServer(container);

    // Action
    const response = await server.inject({
      method: 'POST',
      url: '/threads',
      payload: requestPayload,
    });

    // Assert
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(401);
    expect(responseJson.status).toEqual('fail');
    expect(responseJson.message).toEqual('Missing authentication');
  });

  it('should response 201 when thread created', async () => {
    // Arrange
    const requestPayload = {
      title: 'thread-title',
      body: 'thread-body',
    };
    const server = await createServer(container);

    const accessToken = await UserApiTestHelper.getAccessTokenFromUser({})

    // Action
    const response = await server.inject({
      method: 'POST',
      url: '/threads',
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: requestPayload,
    });

    // Assert
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(201);
    expect(responseJson.status).toEqual('success');
  });
});
