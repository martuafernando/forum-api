const ReplyCommentRepository = require('../../../Domains/comments/ReplyCommentRepository')
const ThreadCommentRepository = require('../../../Domains/comments/ThreadCommentRepository')
const SavedComment = require('../../../Domains/comments/entities/SavedComment')
const ThreadRepository = require('../../../Domains/threads/ThreadRepository')
const SavedThread = require('../../../Domains/threads/entities/SavedThread')
const UserRepository = require('../../../Domains/users/UserRepository')
const RegisteredUser = require('../../../Domains/users/entities/RegisteredUser')
const DeleteReplyCommentUseCase = require('../DeleteReplyCommentUseCase')

describe('DeleteReplyCommentUseCase', () => {
  it('should orchestrating the delete comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      commentId: 'comment-123',
      content: 'comment-content',
      id: 'comment-id',
      userId: 'user-123',
      threadId: 'thread-123'
    }
    const mockRegisteredUser = new RegisteredUser({
      id: useCasePayload.userId,
      username: 'username',
      fullname: 'Full Name'
    })

    const mockSavedComment = new SavedComment({
      id: 'comment-123',
      content: useCasePayload.content,
      date: '2021-08-08T07:19:09.775Z',
      owner: useCasePayload.userId,
      is_deleted: false
    })
    const mockSavedReply = new SavedComment({
      id: 'comment-234',
      content: useCasePayload.content,
      date: '2021-08-08T07:19:09.775Z',
      owner: useCasePayload.userId,
      is_deleted: false
    })
    const mockSavedThread = new SavedThread({
      id: 'thread-123',
      title: 'thread-123 title',
      body: 'thread-123 body',
      date: 'thread-123-date',
      owner: 'user-123',
      is_deleted: false
    })
    const mockReplyCommentRepository = new ReplyCommentRepository()
    const mockUserRepository = new UserRepository()
    const mockThreadCommentRepository = new ThreadCommentRepository()
    const mockThreadRepository = new ThreadRepository()

    // mocking
    mockUserRepository.findOneById = jest.fn()
      .mockResolvedValue(mockRegisteredUser)
    mockThreadCommentRepository.findOneById = jest.fn()
      .mockResolvedValue(mockSavedComment)
    mockThreadRepository.findOneById = jest.fn()
      .mockResolvedValue(mockSavedThread)
    mockReplyCommentRepository.findOneById = jest.fn()
      .mockResolvedValue(mockSavedReply)
    mockReplyCommentRepository.verifyOwner = jest.fn()
      .mockImplementation(() => true)
    mockReplyCommentRepository.remove = jest.fn()
      .mockImplementation(() => Promise.resolve())

    const deleteCommentUseCase = new DeleteReplyCommentUseCase({
      threadRepository: mockThreadRepository,
      replyCommentRepository: mockReplyCommentRepository,
      threadCommentRepository: mockThreadCommentRepository,
      userRepository: mockUserRepository
    })

    // Act
    await deleteCommentUseCase.execute(useCasePayload)

    // Assert
    expect(mockUserRepository.findOneById)
      .toHaveBeenCalledWith('user-123')
    expect(mockThreadRepository.findOneById)
      .toHaveBeenCalledWith('thread-123')
    expect(mockThreadCommentRepository.findOneById)
      .toHaveBeenCalledWith('comment-123')
    expect(mockReplyCommentRepository.findOneById)
      .toHaveBeenCalledWith('comment-id')
    expect(mockReplyCommentRepository.remove)
      .toHaveBeenCalledWith(useCasePayload.id)
  })
})
