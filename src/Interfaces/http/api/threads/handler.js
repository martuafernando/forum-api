const AuthenticationTokenManager = require('../../../../Applications/security/AuthenticationTokenManager')
const AddThreadUseCase = require('../../../../Applications/use_case/AddThreadUseCase')
const GetDetailThreadUseCase = require('../../../../Applications/use_case/GetDetailThreadUseCase')

class ThreadsHandler {
  constructor (container) {
    this._container = container

    this.postThreadHandler = this.postThreadHandler.bind(this)
    this.getDetailThreadHandler = this.getDetailThreadHandler.bind(this)
  }

  async postThreadHandler (request, h) {
    const owner = await this._getCurrentUserFromAuthorizationToken(request)
    const addThreadUseCase = this._container.getInstance(AddThreadUseCase.name)
    const addedThread = await addThreadUseCase.execute({ owner, ...request.payload })
    const response = h.response({
      status: 'success',
      data: {
        addedThread: {
          id: addedThread.id,
          title: addedThread.title,
          owner: addedThread.owner
        }
      }
    })
    response.code(201)
    return response
  }

  async getDetailThreadHandler (request, h) {
    const getDetailThreadUseCase = this._container.getInstance(GetDetailThreadUseCase.name)
    const { threadId: id } = request.params
    const thread = await getDetailThreadUseCase.execute({ id })

    const response = h.response({
      status: 'success',
      data: {
        thread
      }
    })
    response.code(200)
    return response
  }

  async _getCurrentUserFromAuthorizationToken (request) {
    const accessToken = request.headers.authorization?.match(/(?<=Bearer ).+/)?.[0]
    if (!accessToken) throw Error('REQUEST.NOT_CONTAIN_ACCESS_TOKEN')
    const authenticationTokenManager = this._container.getInstance(AuthenticationTokenManager.name)
    const { id } = await authenticationTokenManager.decodePayload(accessToken)
    return id
  }
}

module.exports = ThreadsHandler
