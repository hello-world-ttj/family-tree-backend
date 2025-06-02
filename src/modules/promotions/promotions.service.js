const response_handler = require("../../helpers/responseHandler");
const Promotions = require("./promotions.model");

const handle_priority_swap = async (
  new_priority,
  promotion_type,
  current_promotion_id
) => {
  try {
    if (
      !promotion_type ||
      new_priority === undefined ||
      new_priority === null
    ) {
      return response_handler(
        res,
        400,
        "Promotion type and priority are required"
      );
    }
    if (!current_promotion_id) {
      const promotions_to_shift = await Promotions.find({
        type: promotion_type,
        priority: { $gte: new_priority },
      }).sort({ priority: 1 });

      for (const promotion of promotions_to_shift) {
        promotion.priority += 1;
        await promotion.save();
      }
      return;
    }

    const current_promotion = await Promotions.findById(current_promotion_id);
    if (!current_promotion) {
      return response_handler(
        res,
        404,
        `Promotion with ID ${current_promotion_id} not found`
      );
    }

    if (current_promotion.priority === new_priority) {
      return;
    }

    const existing_promotion_with_target_priority = await Promotions.findOne({
      type: promotion_type,
      priority: new_priority,
      _id: { $ne: current_promotion_id },
    });

    if (!existing_promotion_with_target_priority) {
      current_promotion.priority = new_priority;
      await current_promotion.save();
      return;
    }

    const old_priority = current_promotion.priority;
    existing_promotion_with_target_priority.priority = old_priority;
    await existing_promotion_with_target_priority.save();

    current_promotion.priority = new_priority;
    await current_promotion.save();
  } catch (error) {
    return response_handler(
      res,
      500,
      `Failed to reassign promotion priorities: ${error.message}`
    );
  }
};

module.exports = { handle_priority_swap };
