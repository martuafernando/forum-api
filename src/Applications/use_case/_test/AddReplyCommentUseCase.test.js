const NewComment = require('../../../Domains/comments/entities/NewComment')
const SavedComment = require('../../../Domains/comments/entities/SavedComment')
const CommentRepository = require('../../../Domains/comments/CommentRepository')
const AddReplyCommentUseCase = require('../AddReplyCommentUseCase')
const AuthenticationTokenManager = require('../../security/AuthenticationTokenManager')
const ThreadRepository = require('../../../Domains/threads/ThreadRepository')

describe('AddReplyCommentUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'comment content',
      date: '2021-08-08T07:19:09.775Z',
      target: 'target-123',
      owner: 'user-123'
    }

    const mockSavedComment = new SavedComment({
      id: 'comment-id',
      content: 'comment content',
      date: '2021-08-08T07:19:09.775Z',
      target: 'comment-123',
      owner: useCasePayload.owner
    })

    /** creating dependency of use case */
    const mockCommentRepository = new CommentRepository()
    const mockauthenticationTokenManager = new AuthenticationTokenManager()
    const mockThreadRepository = new ThreadRepository()

    /** mocking needed function */
    mockCommentRepository.createReplyComment = jest.fn()
      .mockImplementation(() => Promise.resolve(mockSavedComment))
    mockThreadRepository.findOneById = jest.fn()
      .mockImplementation(() => Promise.resolve({}))
    mockauthenticationTokenManager.decodePayload = jest.fn()
      .mockImplementation(() => Promise.resolve({ username: 'dicoding', id: 'user-123' }))

    /** creating use case instance */
    const addReplyCommentUseCase = new AddReplyCommentUseCase({
      commentRepository: mockCommentRepository,
      authenticationTokenManager: mockauthenticationTokenManager,
      threadRepository: mockThreadRepository
    })

    // Action
    const savedComment = await addReplyCommentUseCase.execute('access-token', useCasePayload)

    // Assert
    expect(savedComment).toStrictEqual(new SavedComment({
      id: 'comment-id',
      content: useCasePayload.content,
      date: useCasePayload.date,
      target: useCasePayload.target,
      owner: useCasePayload.owner
    }))

    expect(mockCommentRepository.createReplyComment)
      .toBeCalledWith(new NewComment({
        content: useCasePayload.content,
        target: useCasePayload.target,
        owner: useCasePayload.owner
      }))
  })
})
