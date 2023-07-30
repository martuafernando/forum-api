const NewReplyComment = require('../../../Domains/comments/entities/NewReplyComment')
const SavedComment = require('../../../Domains/comments/entities/SavedComment')

const AddReplyCommentUseCase = require('../AddReplyCommentUseCase')
const ReplyCommentRepository = require('../../../Domains/comments/ReplyCommentRepository')
const ThreadCommentRepository = require('../../../Domains/comments/ThreadCommentRepository')
const UserRepository = require('../../../Domains/users/UserRepository')
const ThreadRepository = require('../../../Domains/threads/ThreadRepository')

describe('AddReplyCommentUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'comment content',
      commentId: 'comment-123',
      owner: 'user-123'
    }

    const mockSavedComment = new SavedComment({
      id: 'comment-123',
      content: useCasePayload.content,
      date: '2021-08-08T07:19:09.775Z',
      owner: useCasePayload.owner
    })

    /** creating dependency of use case */
    const mockReplyCommentRepository = new ReplyCommentRepository()
    const mockThreadCommentRepository = new ThreadCommentRepository()
    const mockUserRepository = new UserRepository()
    const mockThreadRepository = new ThreadRepository()

    /** mocking needed function */
    mockReplyCommentRepository.create = jest.fn()
      .mockImplementation(() => Promise.resolve(mockSavedComment))
    mockThreadCommentRepository.findOneById = jest.fn()
      .mockImplementation(() => Promise.resolve())
    mockUserRepository.findOneById = jest.fn()
      .mockImplementation(() => Promise.resolve())
    mockThreadRepository.findOneById = jest.fn()
      .mockImplementation(() => Promise.resolve())

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
      owner: useCasePayload.owner
    }))

    expect(mockReplyCommentRepository.create)
      .toBeCalledWith(new NewReplyComment(useCasePayload))
  })
})
