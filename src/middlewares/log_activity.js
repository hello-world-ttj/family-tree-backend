const Logs = require("../modules/logs/logs.model");

const log_activity = (action = "") => {
  return async (req, res, next) => {
    res.on("finish", async () => {
      try {
        const log = new Logs({
          user: req.user_id || null,
          method: req.method,
          route: req.originalUrl,
          status_code: res.statusCode,
          ip: req.ip,
          user_agent: req.headers["user-agent"],
          action: action,
          request_body: req.body,
        });

        await log.save();
      } catch (err) {
        console.log(`Error logging activity: ${err.message}`);
      }
    });
    next();
  };
};

module.exports = log_activity;
