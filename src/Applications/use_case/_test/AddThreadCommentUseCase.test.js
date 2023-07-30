const NewThreadComment = require('../../../Domains/comments/entities/NewThreadComment')
const SavedComment = require('../../../Domains/comments/entities/SavedComment')

const AddThreadCommentUseCase = require('../AddThreadCommentUseCase')
const ThreadCommentRepository = require('../../../Domains/comments/ReplyCommentRepository')
const ThreadRepository = require('../../../Domains/threads/ThreadRepository')
const UserRepository = require('../../../Domains/users/UserRepository')

describe('AddThreadCommentUseCase', () => {
  /**
   * Menguji apakah use case mampu mengoskestrasikan langkah demi langkah dengan benar.
   */
  it('should orchestrating the add comment action correctly', async () => {
    // Arrange
    const useCasePayload = {
      content: 'comment content',
      threadId: 'thread-123',
      owner: 'user-123'
    }

    const mockSavedComment = new SavedComment({
      id: 'thread-123',
      content: useCasePayload.content,
      date: '2021-08-08T07:19:09.775Z',
      owner: useCasePayload.owner
    })

    /** creating dependency of use case */
    const mockThreadCommentRepository = new ThreadCommentRepository()
    const mockThreadRepository = new ThreadRepository()
    const mockUserRepository = new UserRepository()
    /** mocking needed function */
    mockThreadRepository.findOneById = jest.fn()
      .mockImplementation(() => Promise.resolve())
    mockThreadCommentRepository.create = jest.fn()
      .mockImplementation(() => Promise.resolve(mockSavedComment))
    mockUserRepository.findOneById = jest.fn()
      .mockImplementation(() => Promise.resolve())

    /** creating use case instance */
    const addThreadCommentUseCase = new AddThreadCommentUseCase({
      threadRepository: mockThreadRepository,
      threadCommentRepository: mockThreadCommentRepository,
      userRepository: mockUserRepository
    })

    // Action
    const savedComment = await addThreadCommentUseCase.execute(useCasePayload)

    // Assert
    expect(savedComment).toStrictEqual(new SavedComment({
      id: 'thread-123',
      content: useCasePayload.content,
      date: '2021-08-08T07:19:09.775Z',
      threadId: useCasePayload.target,
      owner: useCasePayload.owner
    }))

    expect(mockThreadCommentRepository.create)
      .toBeCalledWith(new NewThreadComment(useCasePayload))
  })
})
