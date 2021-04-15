global.pie = {};
require("mapie")
  .init("/bootstrap", pie)
  .then(app => {
    const port = pie.config.PORT || PORT;
    return app.listen(port, () => {
      console.log("Mapie Server running at " + port);
    });
  })
  .catch(err => console.log("failed to run server", err));
  // 4296dc17ddd64793ceb425c3038b14d33bdd0930