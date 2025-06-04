const express = require("express");
const events_controller = require("./events.controller");
const router = express.Router();

router
  .route("/")
  .get(events_controller.get_events)
  .post(events_controller.create_events);

router.get("/registered-events", events_controller.get_registered_events);

router
  .route("/attend/:id")
  .post(events_controller.mark_attendance)
  .get(events_controller.get_attendees);

router
  .route("/:id")
  .get(events_controller.get_events_by_id)
  .put(events_controller.update_events)
  .patch(events_controller.add_rsvp)
  .delete(events_controller.delete_events);

module.exports = router;
