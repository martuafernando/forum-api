const routes = (handler) => ([
  {
    method: 'POST',
    path: '/threads',
    handler: handler.postThreadHandler
  },
  {
    method: 'GET',
    path: '/threads/{threadId}',
    handler: handler.getDetailThreadHandler
  }
])

module.exports = routes
