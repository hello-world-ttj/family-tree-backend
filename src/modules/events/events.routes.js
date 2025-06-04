const express = require("express");
const events_controller = require("./events.controller");
const check_access = require("../../middlewares/check_access");
const log_activity = require("../../middlewares/log_activity");
const router = express.Router();

router
  .route("/")
  .get(
    check_access("events_management_view"),
    log_activity("view_events"),
    events_controller.get_events
  )
  .post(
    check_access("events_management_modify"),
    log_activity("create_event"),
    events_controller.create_events
  );

router.get("/registered-events", events_controller.get_registered_events);

router
  .route("/attend/:id")
  .post(events_controller.mark_attendance)
  .get(events_controller.get_attendees);

router
  .route("/:id")
  .get(
    check_access("events_management_view"),
    log_activity("view_event"),
    events_controller.get_events_by_id
  )
  .put(
    check_access("events_management_modify"),
    log_activity("update_event"),
    events_controller.update_events
  )
  .patch(events_controller.add_rsvp)
  .delete(
    check_access("events_management_modify"),
    log_activity("delete_event"),
    events_controller.delete_events
  );

module.exports = router;
