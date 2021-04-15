module.exports = connection => {
  return {
    schema: {
      user: {
        type: pie.Types.ObjectId,
        ref: "user",
        required: true
      },
      title: {
        type: String,
        required: true
      },
      description: {
        type: String,
        required: true
      },
      skills: {
        type: [{ type: String }],
        default: []
      },
      location: {
        type: String,
        required: true
      },
      minimumExperience: {
        type: Number,
        required: true
      },
      aptitudeQuestions: {
        type: [],
        default: []
      },
      personalityQuestions: {
        type: [],
        default: []
      }
    },
    options: {
      timestamps: true
    }
  };
};
