const { auth } = pie.middlewares;
module.exports = (messenger) => {
  return {
    routes: [
      {
        action: "GET",
        path: "",
        before: [auth()],
        resolve: messenger.get,
      },
      {
        action: "GET",
        path: "/all-messages-in-messenger/:type/:userTypeId",
        before: [auth()],
        resolve: messenger.getAllMessagesInMessenger,
      },
      {
        action: "GET",
        path: "/for-an-application",
        before: [auth()],
        resolve: messenger.getMessages,
      },
      {
        action: "POST",
        path: "/",
        before: [auth()],
        resolve: messenger.addMessage,
      },
      {
        action: "PUT",
        path: "/:messageId/to-trash",
        before: [auth()],
        resolve: messenger.toTrash,
      },
      {
        action: "DELETE",
        path: "/:messageId/delete-message",
        before: [auth()],
        resolve: messenger.deleteMessage,
      },
      {
        action: "Get",
        path: "/get-current-and-mark-all-read/:id",
        before: [auth()],
        resolve: messenger.getCurrentAndMarkAsRead,
      },
    ],
  };
};
