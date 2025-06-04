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
  title: Joi.string(),
  description: Joi.string(),
  type: Joi.string().required(),
  start_date: Joi.date().required(),
  end_date: Joi.date().required(),
  media: Joi.string(),
  link: Joi.string(),
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

exports.create_events = Joi.object({
  event_name: Joi.string().required(),
  description: Joi.string().required(),
  type: Joi.string().required(),
  image: Joi.string().required(),
  event_start_date: Joi.date().required(),
  event_end_date: Joi.date().required(),
  poster_visibility_start_date: Joi.date().required(),
  poster_visibility_end_date: Joi.date().required(),
  platform: Joi.string().required(),
  link: Joi.string().required(),
  venue: Joi.string().required(),
  organiser_name: Joi.string().required(),
  coordinators: Joi.array().required(),
  limit: Joi.number().required(),
  speakers: Joi.array().required(),
  status: Joi.string(),
  rsvp: Joi.string(),
  attendence: Joi.string(),
});

exports.update_events = Joi.object({
  event_name: Joi.string(),
  description: Joi.string(),
  type: Joi.string(),
  image: Joi.string(),
  event_start_date: Joi.date(),
  event_end_date: Joi.date(),
  poster_visibility_start_date: Joi.date(),
  poster_visibility_end_date: Joi.date(),
  platform: Joi.string(),
  link: Joi.string(),
  venue: Joi.string(),
  organiser_name: Joi.string(),
  coordinators: Joi.array(),
  limit: Joi.number(),
  speakers: Joi.array(),
  status: Joi.string(),
  rsvp: Joi.string(),
  attendence: Joi.string(),
});
