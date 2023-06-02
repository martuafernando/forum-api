const SavedThread = require('../SavedThread');

describe('SavedThread entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      title: 'title',
    };

    // Action & Assert
    expect(() => new SavedThread(payload)).toThrowError('SAVED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY');
  });

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'threadId',
      title: 'title',
      body: 'body',
      owner: 1234,
    };

    // Action & Assert
    expect(() => new SavedThread(payload)).toThrowError('SAVED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION');
  });

  it('should create SavedThread entities correctly', () => {
    // Arrange
    const payload = {
      id: 'threadId',
      title: 'title',
      body: 'body',
      owner: 'userId',
    };

    // Action
    const savedThread = new SavedThread(payload);

    // Assert
    expect(savedThread).toBeInstanceOf(SavedThread);
    expect(savedThread.accessToken).toEqual(payload.accessToken);
    expect(savedThread.refreshToken).toEqual(payload.refreshToken);
  });
});
