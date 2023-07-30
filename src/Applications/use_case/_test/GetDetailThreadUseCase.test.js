const GetDetailThreadUseCase = require('../GetDetailThreadUseCase')
const ThreadRepository = require('../../../Domains/threads/ThreadRepository')
const ThreadCommentRepository = require('../../../Domains/comments/ThreadCommentRepository')
const ReplyCommentRepository = require('../../../Domains/comments/ReplyCommentRepository')
const UserRepository = require('../../../Domains/users/UserRepository')
const SavedThread = require('../../../Domains/threads/entities/SavedThread')
const RegisteredUser = require('../../../Domains/users/entities/RegisteredUser')

describe('GetDetailThreadUseCase', () => {
  it('should throw error if use case payload not contain threadId', async () => {
    // Arrange
    const useCasePayload = {}
    const getDetailThreadUseCase = new GetDetailThreadUseCase({})

    // Action & Assert
    await expect(getDetailThreadUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('GET_DETAIL_THREAD_USE_CASE.NOT_CONTAIN_THREAD_ID')
  })

  it('should throw error if threadId not string', async () => {
    // Arrange
    const useCasePayload = {
      id: 1
    }
    const getDetailThreadUseCase = new GetDetailThreadUseCase({})

    // Action & Assert
    await expect(getDetailThreadUseCase.execute(useCasePayload))
      .rejects
      .toThrowError('GET_DETAIL_THREAD_USE_CASE.PAYLOAD_NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should return thread with empty array comment is there is no comment', async () => {
    // Arrange
    const useCasePayload = {
      id: 'thread-123'
    }
    const savedThread = new SavedThread({
      id: 'thread-123',
      title: 'thread-123 title',
      body: 'thread-123 body',
      date: 'thread-123-date',
      owner: 'user-123'
    })
    const registeredUser = new RegisteredUser({
      id: 'user-123',
      username: 'username',
      fullname: 'FullName'
    })

    const mockThreadRepository = new ThreadRepository()
    const mockThreadCommentRepository = new ThreadCommentRepository()
    const mockReplyCommentRepository = new ReplyCommentRepository()
    const mockUserRepository = new UserRepository()

    // Mocking
    mockThreadRepository.findOneById = jest.fn()
      .mockImplementation(() => Promise.resolve(savedThread))
    mockThreadCommentRepository.findAllFromThread = async () => []
    mockReplyCommentRepository.findAllFromComment = async () => []
    mockUserRepository.findOneById = jest.fn()
      .mockImplementation(() => Promise.resolve(registeredUser))

    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      threadCommentRepository: mockThreadCommentRepository,
      replyCommentRepository: mockReplyCommentRepository,
      userRepository: mockUserRepository
    })

    // Action
    const thread = await getDetailThreadUseCase.execute(useCasePayload)
    // Assert
    expect(thread.comments).toHaveLength(0)
    expect(thread).toEqual({
      id: savedThread.id,
      title: savedThread.title,
      body: savedThread.body,
      date: savedThread.date,
      username: registeredUser.username,
      comments: []
    })

    expect(mockThreadRepository.findOneById)
      .toBeCalledWith(useCasePayload.id)
    expect(mockUserRepository.findOneById)
      .toBeCalledWith(registeredUser.id)
  })

  it('should return **komentar telah dihapus** when the comment was deleted', async () => {
    // Arrange
    const useCasePayload = {
      id: 'thread-123'
    }
    const savedThread =  new SavedThread({
      id: 'thread-123',
      title: 'thread-123 title',
      body: 'thread-123 body',
      date: 'thread-123-date',
      owner: 'user-123'
    })
    const registeredUser = new RegisteredUser({
      id: 'user-123',
      username: 'username',
      fullname: 'FullName'
    })
    const savedComment = [
      {
        id: 'comment-123',
        content: 'comment content',
        date: 'comment-date',
        owner: 'user-123',
        is_deleted: true
      }
    ]

    const replyComment = [
      {
        id: 'comment-1231',
        content: 'comment reply content',
        date: 'comment-date',
        owner: 'user-123',
        is_deleted: true
      },
      {
        id: 'comment-1232',
        content: 'comment reply content',
        date: 'comment-date',
        owner: 'user-123',
        is_deleted: false
      }
    ]

    const mockThreadRepository = new ThreadRepository()
    const mockThreadCommentRepository = new ThreadCommentRepository()
    const mockReplyCommentRepository = new ReplyCommentRepository()
    const mockUserRepository = new UserRepository()

    // Mocking
    mockThreadRepository.findOneById = jest.fn()
      .mockImplementation(() => Promise.resolve(savedThread))
    mockThreadCommentRepository.findAllFromThread = jest.fn()
      .mockImplementation((threadId) => {
        if (threadId === savedThread.id) return Promise.resolve(savedComment)
        return Promise.resolve([])
      })
    mockReplyCommentRepository.findAllFromComment = jest.fn()
      .mockImplementation((commentId) => {
        if (commentId === savedComment[0].id) return Promise.resolve(replyComment)
        return Promise.resolve([])
      })
    mockUserRepository.findOneById = jest.fn()
      .mockImplementation(() => Promise.resolve(registeredUser))

    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      threadCommentRepository: mockThreadCommentRepository,
      replyCommentRepository: mockReplyCommentRepository,
      userRepository: mockUserRepository
    })

    // Action
    const thread = await getDetailThreadUseCase.execute(useCasePayload)
    // Assert
    expect(thread.comments).toHaveLength(1)
    expect(thread.comments[0].replies).toHaveLength(2)
    expect(thread.comments[0].replies[0].content).toStrictEqual('**balasan telah dihapus**')
    expect(thread.comments[0].replies[1].content).toStrictEqual(replyComment[1].content)
    expect(thread).toEqual({
      id: savedThread.id,
      title: savedThread.title,
      body: savedThread.body,
      date: savedThread.date,
      username: registeredUser.username,
      comments: savedComment.map((comment) => {
        return {
          id: comment.id,
          content: '**komentar telah dihapus**',
          date: comment.date,
          username: registeredUser.username,
          replies: [
            {
              id: replyComment[0].id,
              content: '**balasan telah dihapus**',
              date: replyComment[0].date,
              username: registeredUser.username,
              replies: []
            },
            {
              id: replyComment[1].id,
              content: replyComment[1].content,
              date: replyComment[1].date,
              username: registeredUser.username,
              replies: []
            }
          ]
        }
      })
    })

    expect(mockThreadRepository.findOneById)
      .toBeCalledWith(useCasePayload.id)
    expect(mockThreadCommentRepository.findAllFromThread)
      .toBeCalledWith(useCasePayload.id)
    expect(mockUserRepository.findOneById)
      .toBeCalledWith(registeredUser.id)
  })

  it('should orchestrating the get detail thread action correctly', async () => {
    // Arrange
    const useCasePayload = {
      id: 'thread-123'
    }
    const savedThread = {
      id: 'thread-123',
      title: 'thread-123 title',
      body: 'thread-123 body',
      date: 'thread-123-date',
      owner: 'user-123'
    }
    const registeredUser = {
      id: 'user-123',
      username: 'username',
      fullname: 'FullName'
    }
    const savedComment = [
      {
        id: 'comment-123',
        content: 'comment content',
        date: 'comment-date',
        owner: 'user-123',
        is_deleted: false
      }
    ]

    const replyComment = [
      {
        id: 'comment-1231',
        content: 'comment reply content',
        date: 'comment-date',
        owner: 'user-123',
        is_deleted: false
      },
      {
        id: 'comment-1232',
        content: 'comment reply content',
        date: 'comment-date',
        owner: 'user-123',
        is_deleted: false
      }
    ]

    const mockThreadRepository = new ThreadRepository()
    const mockThreadCommentRepository = new ThreadCommentRepository()
    const mockReplyCommentRepository = new ReplyCommentRepository()
    const mockUserRepository = new UserRepository()

    // Mocking
    mockThreadRepository.findOneById = jest.fn()
      .mockImplementation(() => Promise.resolve(savedThread))
    mockThreadCommentRepository.findAllFromThread = jest.fn()
      .mockImplementation((threadId) => {
        if (threadId === savedThread.id) return Promise.resolve(savedComment)
        return Promise.resolve([])
      })
    mockReplyCommentRepository.findAllFromComment = jest.fn()
      .mockImplementation((commentId) => {
        if (commentId === savedComment[0].id) return Promise.resolve(replyComment)
        return Promise.resolve([])
      })
    mockUserRepository.findOneById = jest.fn()
      .mockImplementation(() => Promise.resolve(registeredUser))

    const getDetailThreadUseCase = new GetDetailThreadUseCase({
      threadRepository: mockThreadRepository,
      threadCommentRepository: mockThreadCommentRepository,
      replyCommentRepository: mockReplyCommentRepository,
      userRepository: mockUserRepository
    })

    // Action
    const thread = await getDetailThreadUseCase.execute(useCasePayload)
    // Assert
    expect(thread.comments).toHaveLength(1)
    expect(thread.comments[0].replies).toHaveLength(2)
    expect(thread).toEqual({
      id: savedThread.id,
      title: savedThread.title,
      body: savedThread.body,
      date: savedThread.date,
      username: registeredUser.username,
      comments: savedComment.map((comment) => {
        return {
          id: comment.id,
          content: comment.content,
          date: comment.date,
          username: registeredUser.username,
          replies: replyComment.map((comment) => {
            return {
              id: comment.id,
              content: comment.content,
              date: comment.date,
              username: registeredUser.username,
              replies: []
            }
          })
        }
      })
    })

    expect(mockThreadRepository.findOneById)
      .toBeCalledWith(useCasePayload.id)
    expect(mockThreadCommentRepository.findAllFromThread)
      .toBeCalledWith(useCasePayload.id)
    expect(mockUserRepository.findOneById)
      .toBeCalledWith(registeredUser.id)
  })
})
