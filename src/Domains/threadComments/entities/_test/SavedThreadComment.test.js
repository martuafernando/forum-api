const SavedThread = require('../SavedThreadComment');

describe('SavedThreadComments entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'comment content',
    };

    // Action & Assert
    expect(() => new SavedThread(payload)).toThrowError('SAVED_THREAD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'threadCommentId',
      content: 'comment content',
      owner: 1234,
    };

    // Action & Assert
    expect(() => new SavedThread(payload)).toThrowError('SAVED_THREAD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create SavedThreadComments entities correctly', () => {
    // Arrange
    const payload = {
      id: 'threadCommentId',
      content: 'comment content',
      owner: 'userId',
    };

    // Action
    const savedThread = new SavedThread(payload);

    // Assert
    expect(savedThread).toBeInstanceOf(SavedThread);
    expect(savedThread.id).toEqual(payload.id);
    expect(savedThread.content).toEqual(payload.content);
    expect(savedThread.owner).toEqual(payload.owner);

  });
});
