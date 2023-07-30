const NewThreadComment = require('../NewThreadComment')

describe('NewThreadComment entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'comment content'
    }

    // Action & Assert
    expect(() => new NewThreadComment(payload)).toThrowError('NEW_THREAD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY')
  })

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      content: 'comment content',
      owner: 1,
      threadId: 'thread-1'
    }

    // Action & Assert
    expect(() => new NewThreadComment(payload)).toThrowError('NEW_THREAD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should create NewThreadComment entities correctly', () => {
    // Arrange
    const payload = {
      content: 'commment content',
      owner: 'user-id',
      threadId: 'thread-1'
    }

    // Action
    const newThreadComment = new NewThreadComment(payload)

    // Assert
    expect(newThreadComment).toBeInstanceOf(NewThreadComment)
    expect(newThreadComment.content).toEqual(payload.content)
    expect(newThreadComment.threadId).toEqual(payload.threadId)
    expect(newThreadComment.owner).toEqual(payload.owner)
    expect(newThreadComment.target).toEqual(payload.target)
  })
})
