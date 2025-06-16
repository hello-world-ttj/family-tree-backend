const express = require("express");
const router = express.Router();
const news_route = require("../modules/news/news.routes");
const promotions_route = require("../modules/promotions/promotions.routes");
const events_route = require("../modules/events/events.routes");
const notifications_route = require("../modules/notifications/notifications.routes");
const roles_route = require("../modules/roles/roles.routes");
const logs_route = require("../modules/logs/logs.routes");
const folder_route = require("../modules/folder/folder.routes");
const family_route = require("../modules/family/family.routes");
const user_route = require("../modules/user/user.routes");
const person_route = require("../modules/person/person.routes");
const relationship_route = require("../modules/relationship/relationship.routes");
const request_route = require("../modules/request/request.routes"); 


router.use("/news", news_route);
router.use("/promotions", promotions_route);
router.use("/events", events_route);
router.use("/notifications", notifications_route);
router.use("/roles", roles_route);
router.use("/logs", logs_route);
router.use("/folders", folder_route);
router.use("/families", family_route);
router.use("/users", user_route);
router.use("/persons", person_route);
router.use("/relationships", relationship_route);
router.use("/requests", request_route);

//!TODO
//!financials , campaigns , auth (otp, admin login, user login  , user register)


module.exports = router;
