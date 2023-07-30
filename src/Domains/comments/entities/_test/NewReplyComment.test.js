const NewReplyComment = require('../NewReplyComment')

describe('NewReplyComment entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'comment content'
    }

    // Action & Assert
    expect(() => new NewReplyComment(payload)).toThrowError('NEW_REPLY_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY')
  })

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      content: 'comment content',
      owner: 1,
      commentId: 'comment-id'
    }

    // Action & Assert
    expect(() => new NewReplyComment(payload)).toThrowError('NEW_REPLY_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should create NewReplyComment entities correctly', () => {
    // Arrange
    const payload = {
      content: 'commment content',
      owner: 'user-id',
      commentId: 'comment-id'
    }

    // Action
    const newReplyComment = new NewReplyComment(payload)

    // Assert
    expect(newReplyComment).toBeInstanceOf(NewReplyComment)
    expect(newReplyComment.commentId).toEqual(payload.commentId)
    expect(newReplyComment.content).toEqual(payload.content)
    expect(newReplyComment.owner).toEqual(payload.owner)
    expect(newReplyComment.target).toEqual(payload.target)
  })
})
