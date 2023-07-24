const pool = require('../../database/postgres/pool');
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper');
const container = require('../../container');
const createServer = require('../createServer');
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper');
const UserApiTestHelper = require('../../../../tests/UsersApiTestHelper');
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper');

describe('/threads endpoint', () => {
  afterAll(async () => {
    await pool.end();
  });

  describe('POST /threads endpoint', () => {
    afterEach(async () => {
      await ThreadsTableTestHelper.cleanTable();
      await UsersTableTestHelper.cleanTable();
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
  })

  describe('GET /threads/{threadId}', () => {
    afterEach(async () => {
      await ThreadsTableTestHelper.cleanTable();
      await UsersTableTestHelper.cleanTable();
      await CommentsTableTestHelper.cleanTable();
    });

    it('should response 200 when thread found', async () => {
      // Arrange
      const requestPayload = {
        title: 'thread-title',
        body: 'thread-body',
      };
      const server = await createServer(container);
      await UsersTableTestHelper.addUser({id: 'user-123'})
      await ThreadsTableTestHelper.create({
        id: 'thread-123',
        owner: 'user-123'
      })
      await CommentsTableTestHelper.createThreadComment({
        id: 'comment-1',
        target: 'thread-123',
        owner: 'user-123'
      })
      await CommentsTableTestHelper.createThreadComment({
        id: 'comment-2',
        target: 'thread-123',
        owner: 'user-123'
      })
  
      // Action
      const response = await server.inject({
        method: 'GET',
        url: '/threads/thread-123',
        payload: requestPayload,
      });
  
      // Assert
      const responseJson = JSON.parse(response.payload);
      expect(response.statusCode).toEqual(200);
      expect(responseJson.status).toEqual('success');
      expect(responseJson.data.thread).toBeDefined();
      expect(responseJson.data.thread.comments).toBeDefined();
      expect(responseJson.data.thread.username).toBeDefined();
    });
  })
});
