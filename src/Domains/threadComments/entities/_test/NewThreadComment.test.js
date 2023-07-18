const NewThreadComments = require('../NewThreadComment');

describe('NewThreadComments entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      content: 'comment content',
    };

    // Action & Assert
    expect(() => new NewThreadComments(payload)).toThrowError('NEW_THREAD_COMMENT.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      content: 'comment content',
      owner: 1,
    };

    // Action & Assert
    expect(() => new NewThreadComments(payload)).toThrowError('NEW_THREAD_COMMENT.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create NewThreadComments entities correctly', () => {
    // Arrange
    const payload = {
      content: 'commment content',
      owner: 'userId',
    };

    // Action
    const newThread = new NewThreadComments(payload);

    // Assert
    expect(newThread).toBeInstanceOf(NewThreadComments);
  });
});
