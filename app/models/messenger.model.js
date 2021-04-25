module.exports = (connection) => {
  return {
    schema: {
      application: {
        type: pie.Types.ObjectId,
        ref: "application",
        required: true,
      },
      employer: {
        type: pie.Types.ObjectId,
        ref: "user",
        required: true,
      },
      candidate: {
        type: pie.Types.ObjectId,
        ref: "user",
        required: true,
      },
      conversations: {
        type: [
          {
            message: {
              type: String,
              default: "",
            },
            sentBy: {
              type: pie.Types.ObjectId,
              ref: "user",
              required: true,
            },
            attachment: {
              type: String,
              default: null,
            },
            readBy: {
              type: [{ type: pie.Types.ObjectId, ref: "user" }],
            },
            time: {
              type: Date,
              default: new Date(),
            },
          },
        ],
      },
      trashedBy: {
        type: [{ type: pie.Types.ObjectId, ref: "user" }],
      },
      deletedBy: {
        type: [{ type: pie.Types.ObjectId, ref: "user" }],
      },
    },
    options: {
      timestamps: true,
    },
  };
};
