/* eslint-disable camelcase */
class SavedThread {
  constructor (payload) {
    this._verifyPayload(payload)

    this.id = payload.id
    this.title = payload.title
    this.body = payload.body
    this.date = payload.date
    this.owner = payload.owner
    this.is_deleted = payload.is_deleted
  }

  _verifyPayload ({ id, title, body, date, owner, is_deleted }) {
    if (!id || !title || !body || !date || !owner || (is_deleted === undefined)) {
      throw new Error('SAVED_THREAD.NOT_CONTAIN_NEEDED_PROPERTY')
    }

    if (
      typeof id !== 'string' ||
      typeof title !== 'string' ||
      typeof date !== 'string' ||
      typeof body !== 'string' ||
      typeof owner !== 'string' ||
      typeof is_deleted !== 'boolean'
    ) {
      throw new Error('SAVED_THREAD.NOT_MEET_DATA_TYPE_SPECIFICATION')
    }
  }
}

module.exports = SavedThread
