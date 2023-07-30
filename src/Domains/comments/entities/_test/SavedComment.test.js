const SavedComment = require('../SavedComment')

describe('SavedComment entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'comment content'
    }

    // Action & Assert
    expect(() => new SavedComment(payload)).toThrowError('SAVED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY')
  })

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'comment-id',
      content: 'comment content',
      date: '2021-08-08T07:19:09.775Z',
      owner: 1234
    }

    // Action & Assert
    expect(() => new SavedComment(payload)).toThrowError('SAVED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should create SavedComment entities correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-id',
      content: 'comment content',
      date: '2021-08-08T07:19:09.775Z',
      owner: 'user-id'
    }

    // Action
    const savedThreadComment = new SavedComment(payload)

    // Assert
    expect(savedThreadComment).toBeInstanceOf(SavedComment)
    expect(savedThreadComment.id).toEqual(payload.id)
    expect(savedThreadComment.date).toEqual(payload.date)
    expect(savedThreadComment.content).toEqual(payload.content)
    expect(savedThreadComment.owner).toEqual(payload.owner)
  })
})
