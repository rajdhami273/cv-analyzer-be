module.exports = {
  before: [
    pie.packages.cors({ credentials: true }),
    pie.packages.expressErrorlog,
    pie.packages.bodyParser.urlencoded({ extended: true, limit: "50mb" }),
    pie.packages.bodyParser.json(),
  ],
  apiGroups: [
    {
      path: "/api/v1",
      apiGroupModule: "apiV1",
      before: [],
      after: [],
    },
  ],

  routeOptions: {
    onResult: ({ res }, handle) => {
      handle
        .then((data) => res.send(data))
        .catch((err) => {
          const { message, status } = err;
          res.status(status || 500).send({ message });
        });
    },
  },

  after: [],

  db: {
    type: "mongoose",
    ...require("./settings/db.setting"),
  },
  // logger: false,

  appIntercept: (app) => {
    app.use("/public", pie.packages.express.static("app/public"));
    app.use("/", (req, res) => res.send("MXP server works"));
    //pie.packages.express.static("/app/public")
    return app;
  }, //resumes/Raj_Cover_Letter.pdf
};
