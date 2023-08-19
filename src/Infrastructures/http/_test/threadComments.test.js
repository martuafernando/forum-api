const pool = require('../../database/postgres/pool')
const ThreadsTableTestHelper = require('../../../../tests/ThreadsTableTestHelper')
const container = require('../../container')
const createServer = require('../createServer')
const UsersTableTestHelper = require('../../../../tests/UsersTableTestHelper')
const UserApiTestHelper = require('../../../../tests/UsersApiTestHelper')
const CommentsTableTestHelper = require('../../../../tests/CommentsTableTestHelper')

describe('/threads/{threadId}/comments endpoint', () => {
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

  describe('POST /threads/{threadId}/comments', () => {
    it('should response 401 when there is no authorization header', async () => {
      // Arrange
      const requestPayload = {
        content: 'comment content'
      }
      const server = await createServer(container)

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        payload: requestPayload
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(401)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('Missing authentication')
    })

    it('should response 400 when request payload not contain needed property', async () => {
      // Arrange
      const server = await createServer(container)

      const accessToken = await UserApiTestHelper.getAccessTokenFromUser({})

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-123/comments',
        headers: {
          authorization: `Bearer ${accessToken}`
        },
        payload: {}
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(400)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('tidak dapat membuat comment baru karena properti yang dibutuhkan tidak ada')
    })

    it('should response 400 when thread not found', async () => {
      // Arrange
      const requestPayload = {
        content: 'comment content'
      }
      const server = await createServer(container)

      const accessToken = await UserApiTestHelper.getAccessTokenFromUser({})

      // Action
      const response = await server.inject({
        method: 'POST',
        url: '/threads/thread-xxx/comments',
        headers: {
          authorization: `Bearer ${accessToken}`
        },
        payload: requestPayload
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(404)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('thread tidak ditemukan')
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
        url: '/threads/thread-123/comments',
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
  })

  describe('PUT /threads/{threadId}/comments/{commentId}/likes', () => {
    beforeEach(async () => {
      await CommentsTableTestHelper.createThreadComment({
        id: 'comment-123',
        owner: await UsersTableTestHelper.getIdByUsername('username')
      })
    })

    it('should response 401 when there is no authorization header', async () => {
      // Arrange
      const requestPayload = {
        content: 'comment content'
      }
      const server = await createServer(container)

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: '/threads/{threadId}/comments/{commentId}/likes',
        payload: requestPayload
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(401)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('Missing authentication')
    })

    it('should response 404 when thread not found', async () => {
      // Arrange
      const server = await createServer(container)

      const accessToken = await UserApiTestHelper.getAccessTokenFromUser({})

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: '/threads/thread-xxx/comments/comment-123/likes',
        headers: {
          authorization: `Bearer ${accessToken}`
        }
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(404)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('thread tidak ditemukan')
    })

    it('should response 404 when comment not found', async () => {
      // Arrange
      const server = await createServer(container)

      const accessToken = await UserApiTestHelper.getAccessTokenFromUser({})

      // Action
      const response = await server.inject({
        method: 'PUT',
        url: '/threads/thread-123/comments/comment-xxx/likes',
        headers: {
          authorization: `Bearer ${accessToken}`
        }
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(404)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('comment tidak ditemukan')
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
        method: 'PUT',
        url: '/threads/thread-123/comments/comment-123/likes',
        headers: {
          authorization: `Bearer ${accessToken}`
        },
        payload: requestPayload
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(200)
      expect(responseJson.status).toEqual('success')
    })
  })

  describe('DELETE /threads/{threadId}/comments/{commentId}', () => {
    beforeEach(async () => {
      await CommentsTableTestHelper.createThreadComment({
        id: 'comment-123',
        owner: await UsersTableTestHelper.getIdByUsername('username')
      })
    })

    it('should response 200 when comment deleted', async () => {
      // Arrange
      const server = await createServer(container)

      const accessToken = await UserApiTestHelper.getAccessTokenFromUser({})

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123',
        headers: {
          authorization: `Bearer ${accessToken}`
        }
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(200)
      expect(responseJson.status).toEqual('success')
    })

    it('should response 404 when comment not found', async () => {
      // Arrange
      const server = await createServer(container)

      const accessToken = await UserApiTestHelper.getAccessTokenFromUser({})

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-xxx',
        headers: {
          authorization: `Bearer ${accessToken}`
        }
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(404)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('comment tidak ditemukan')
    })

    it('should response 401 when there is no access token', async () => {
      // Arrange
      const server = await createServer(container)

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-xxx'
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(401)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('Missing authentication')
    })

    it('should response 403 when not the owner delete the comment', async () => {
      // Arrange
      const server = await createServer(container)
      const accessToken = await UserApiTestHelper.getAccessTokenFromUser({ username: 'johndoe' })

      // Action
      const response = await server.inject({
        method: 'DELETE',
        url: '/threads/thread-123/comments/comment-123',
        headers: {
          authorization: `Bearer ${accessToken}`
        }
      })

      // Assert
      const responseJson = JSON.parse(response.payload)
      expect(response.statusCode).toEqual(403)
      expect(responseJson.status).toEqual('fail')
      expect(responseJson.message).toEqual('Forbidden')
    })
  })
})
