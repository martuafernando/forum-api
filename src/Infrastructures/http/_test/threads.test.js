const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');

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

    // Add user
    await server.inject({
      method: 'POST',
      url: '/users',
      payload: {
        username: 'dicoding',
        password: 'secret',
        fullname: 'Dicoding Indonesia',
      },
    });
    // Login user
    const loginResponse = await server.inject({
      method: 'POST',
      url: '/authentications',
      payload: {
        username: 'dicoding',
        password: 'secret',
      },
    });
    const { data: { accessToken } } = JSON.parse(loginResponse.payload);

    console.log('testing::babi', await loginResponse.payload)
    console.log('testing::babi', await UsersTableTestHelper.findAll())

    // Action
    const response = await server.inject({
      method: 'POST',
      url: '/threads',
      headers: {
        authorization: `Bearer ${accessToken}`
      },
      payload: requestPayload,
    });
    console.log('testing::', response.payload)

    // Assert
    const responseJson = JSON.parse(response.payload);
    expect(response.statusCode).toEqual(400);
    expect(responseJson.status).toEqual('fail');
    expect(responseJson.message).toEqual('tidak dapat membuat thread baru karena properti yang dibutuhkan tidak ada');
  });
});
