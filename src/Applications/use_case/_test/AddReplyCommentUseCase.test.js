const NewReplyComment = require('../../../Domains/comments/entities/NewReplyComment')
const SavedComment = require('../../../Domains/comments/entities/SavedComment')

const AddReplyCommentUseCase = require('../AddReplyCommentUseCase')
const ReplyCommentRepository = require('../../../Domains/comments/ReplyCommentRepository')
const ThreadCommentRepository = require('../../../Domains/comments/ThreadCommentRepository')
const UserRepository = require('../../../Domains/users/UserRepository')
const ThreadRepository = require('../../../Domains/threads/ThreadRepository')
const SavedThread = require('../../../Domains/threads/entities/SavedThread')
const RegisteredUser = require('../../../Domains/users/entities/RegisteredUser')

describe('AddReplyCommentUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'comment content',
      commentId: 'comment-123',
      owner: 'user-123',
      threadId: 'thread-123'
    }

    const mockSavedComment = new SavedComment({
      id: 'comment-123',
      content: useCasePayload.content,
      date: '2021-08-08T07:19:09.775Z',
      owner: useCasePayload.owner,
      likeCount: 0,
      is_deleted: false
    })

    const mockReplyComment = new SavedComment({
      id: 'comment-124',
      content: useCasePayload.content,
      date: '2021-08-08T07:19:09.775Z',
      owner: useCasePayload.owner,
      likeCount: 0,
      is_deleted: false
    })

    const mockSavedThread = new SavedThread({
      id: 'thread-123',
      title: 'thread-title',
      body: 'thread-body',
      date: 'thread-date',
      owner: 'thread-owner',
      is_deleted: false
    })

    const mockRegisteredUser = new RegisteredUser({
      id: 'user-123',
      username: 'username',
      fullname: 'Full Name'
    })

    /** creating dependency of use case */
    const mockReplyCommentRepository = new ReplyCommentRepository()
    const mockThreadCommentRepository = new ThreadCommentRepository()
    const mockUserRepository = new UserRepository()
    const mockThreadRepository = new ThreadRepository()

    /** mocking needed function */
    mockReplyCommentRepository.create = jest.fn()
      .mockResolvedValue(mockSavedComment)
    mockThreadCommentRepository.findOneById = jest.fn()
      .mockResolvedValue(mockReplyComment)
    mockUserRepository.findOneById = jest.fn()
      .mockResolvedValue(mockRegisteredUser)
    mockThreadRepository.findOneById = jest.fn()
      .mockResolvedValue(mockSavedThread)

    /** creating use case instance */
    const addReplyCommentUseCase = new AddReplyCommentUseCase({
      replyCommentRepository: mockReplyCommentRepository,
      userRepository: mockUserRepository,
      threadRepository: mockThreadRepository,
      threadCommentRepository: mockThreadCommentRepository
    })

    // Action
    const savedComment = await addReplyCommentUseCase.execute(useCasePayload)

    // Assert
    expect(savedComment).toStrictEqual(new SavedComment({
      id: 'comment-123',
      content: useCasePayload.content,
      date: '2021-08-08T07:19:09.775Z',
      commentId: useCasePayload.target,
      owner: useCasePayload.owner,
      likeCount: 0,
      is_deleted: false
    }))

    expect(mockReplyCommentRepository.create)
      .toBeCalledWith(new NewReplyComment(useCasePayload))
    expect(mockThreadCommentRepository.findOneById)
      .toBeCalledWith('comment-123')
    expect(mockUserRepository.findOneById)
      .toBeCalledWith('user-123')
    expect(mockThreadRepository.findOneById)
      .toBeCalledWith('thread-123')
  })
})
