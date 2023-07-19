const SavedComment = require('../SavedComment');

describe('SavedComment entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'comment content',
    };

    // Action & Assert
    expect(() => new SavedComment(payload)).toThrowError('SAVED_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'comment-id',
      content: 'comment content',
      owner: 1234,
    };

    // Action & Assert
    expect(() => new SavedComment(payload)).toThrowError('SAVED_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create SavedComment entities correctly', () => {
    // Arrange
    const payload = {
      id: 'comment-id',
      content: 'comment content',
      owner: 'user-id',
    };

    // Action
    const savedComment = new SavedComment(payload);

    // Assert
    expect(savedComment).toBeInstanceOf(SavedComment);
    expect(savedComment.id).toEqual(payload.id);
    expect(savedComment.content).toEqual(payload.content);
    expect(savedComment.owner).toEqual(payload.owner);

  });
});
