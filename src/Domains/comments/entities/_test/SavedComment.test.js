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
      owner: 1234,
      is_deleted: false,
      likeCount: 0
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
      owner: 'user-id',
      is_deleted: false,
      likeCount: 0
    }

    // Action
    const savedThreadComment = new SavedComment(payload)

    // Assert
    expect(savedThreadComment).toBeInstanceOf(SavedComment)
    expect(savedThreadComment.id).toStrictEqual(payload.id)
    expect(savedThreadComment.date).toStrictEqual(payload.date)
    expect(savedThreadComment.content).toStrictEqual(payload.content)
    expect(savedThreadComment.owner).toStrictEqual(payload.owner)
    expect(savedThreadComment.is_deleted).toStrictEqual(payload.is_deleted)
  })
})
