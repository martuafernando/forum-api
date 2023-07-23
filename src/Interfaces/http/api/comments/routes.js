const routes = (handler) => ([
  {
    method: 'POST',
    path: '/threads/{threadId}/comments',
    handler: handler.postThreadCommentsHandler,
  },
]);

module.exports = routes;
