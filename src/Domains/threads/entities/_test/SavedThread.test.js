const SavedThread = require('../SavedThread')

describe('SavedThread entities', () => {
  it('should throw error when payload not contain needed property', () => {
    // Arrange
    const payload = {
      title: 'title'
    }

    // Action & Assert
    expect(() => new SavedThread(payload)).toThrowError('SAVED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY')
  })

  it('should throw error when payload not meet data type specification', () => {
    // Arrange
    const payload = {
      id: 'threadId',
      title: 'title',
      body: 'body',
      date: 'date',
      owner: 1234,
      is_deleted: false
    }

    // Action & Assert
    expect(() => new SavedThread(payload)).toThrowError('SAVED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION')
  })

  it('should create SavedThread entities correctly', () => {
    // Arrange
    const payload = {
      id: 'threadId',
      title: 'title',
      body: 'body',
      date: 'date',
      owner: 'owner',
      is_deleted: false
    }

    // Action
    const savedThread = new SavedThread(payload)

    // Assert
    expect(savedThread).toBeInstanceOf(SavedThread)
    expect(savedThread.id).toStrictEqual(payload.id)
    expect(savedThread.body).toStrictEqual(payload.body)
    expect(savedThread.title).toStrictEqual(payload.title)
    expect(savedThread.date).toStrictEqual(payload.date)
    expect(savedThread.owner).toStrictEqual(payload.owner)
    expect(savedThread.is_deleted).toStrictEqual(payload.is_deleted)
  })
})
