const express = require("express");
const folder_controller = require("./folder.controller");
const router = express.Router();

router.post("/", folder_controller.create_folder);

router.get("/event/:id", folder_controller.get_folder_by_event_id);

router.post("/add-file/:id", folder_controller.add_files_to_folder);
router.post("/remove-file/:id", folder_controller.remove_files_from_folder);
router.post("/add-to-public-folder", folder_controller.add_to_public_folder);
router.post(
  "/remove-from-public-folder",
  folder_controller.remove_from_public_folder
);

router
  .route("/:id")
  .get(folder_controller.get_folder_by_id)
  .put(folder_controller.update_folder)
  .delete(folder_controller.delete_folder);

module.exports = router;
