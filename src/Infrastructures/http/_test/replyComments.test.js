const pool = require('../../database/postgres/pool')
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper')
const container = require('../../container')
const createServer = require('../createServer')
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper')
const UserApiTestHelper = require('../../../../tests/UsersApiTestHelper')
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper')

describe('/threads/{threadId}/comments/{commentId}/replies endpoint', () => {
  beforeEach(async () => {
    await UserApiTestHelper.registerUser({
      username: 'username',
      password: 'secret'
    })
    await ThreadsTableTestHelper.create({
      id: 'thread-123',
      owner: await UsersTableTestHelper.getIdByUsername('username')
    })
  })

  afterEach(async () => {
    await CommentsTableTestHelper.cleanTable()
    await ThreadsTableTestHelper.cleanTable()
    await UsersTableTestHelper.cleanTable()
  })

  afterAll(async () => {
    await pool.end()
  })

  describe('POST /threads/{threadId}/comments/{commentId}/replies', () => {
    beforeEach(async () => {
      await CommentsTableTestHelper.createThreadComment({
        id: 'comment-123',
        owner: await UsersTableTestHelper.getIdByUsername('username')
      })
    })

    it('should response 201 when comment created', async () => {
      // Arrange
      const requestPayload = {
        content: 'comment content'
      }
      const server = await createServer(container)

      const accessToken = await UserApiTestHelper.getAccessTokenFromUser({})

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-123/replies',
        headers: {
          authorization: `Bearer ${accessToken}`
        },
        payload: requestPayload
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(201)
      expect(responseJson.status).toEqual('success')
    })

    it('should response 404 when thread not found', async () => {
      // Arrange
      const requestPayload = {
        content: 'comment content'
      }
      const server = await createServer(container)
      const accessToken = await UserApiTestHelper.getAccessTokenFromUser({})

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-xxx/comments/comment-123/replies',
        headers: {
          authorization: `Bearer ${accessToken}`
        },
        payload: requestPayload
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(404)
      expect(responseJson.status).toEqual('fail')
    })

    it('should response 404 when target comment not found', async () => {
      // Arrange
      const requestPayload = {
        content: 'comment content'
      }
      const server = await createServer(container)
      const accessToken = await UserApiTestHelper.getAccessTokenFromUser({})

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-xxx/replies',
        headers: {
          authorization: `Bearer ${accessToken}`
        },
        payload: requestPayload
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(404)
      expect(responseJson.status).toEqual('fail')
    })

    it('should response 400 when request has bad payload', async () => {
      // Arrange
      const server = await createServer(container)
      const accessToken = await UserApiTestHelper.getAccessTokenFromUser({})

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments/comment-xxx/replies',
        headers: {
          authorization: `Bearer ${accessToken}`
        },
        payload: {}
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(400)
      expect(responseJson.status).toEqual('fail')
    })
  })
})
