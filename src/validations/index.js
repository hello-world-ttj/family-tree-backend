const Joi = require("joi");

exports.create_news = Joi.object({
  category: Joi.string().required(),
  title: Joi.string().required(),
  content: Joi.string().required(),
  media: Joi.string().required(),
  status: Joi.string(),
  pdf: Joi.string(),
});

exports.update_news = Joi.object({
  category: Joi.string(),
  title: Joi.string(),
  content: Joi.string(),
  media: Joi.string(),
  status: Joi.string(),
  pdf: Joi.string(),
});

exports.create_promotions = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().required(),
  type: Joi.string().required(),
  start_date: Joi.date().required(),
  end_date: Joi.date().required(),
  media: Joi.string().required(),
  link: Joi.string().required(),
  priority: Joi.number().required(),
  status: Joi.string(),
});

exports.update_promotions = Joi.object({
  title: Joi.string(),
  description: Joi.string(),
  type: Joi.string(),
  start_date: Joi.date(),
  end_date: Joi.date(),
  media: Joi.string(),
  link: Joi.string(),
  priority: Joi.number(),
  status: Joi.string(),
});
