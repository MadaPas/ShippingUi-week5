const Joi = require('@hapi/joi');

const itemSchema = Joi.object().keys({
  id: Joi.string().required(),
  item: Joi.string().required(),
  quantity: Joi.number().integer().required(),
  price: Joi.number().required(),
});

function validateItem(obj) {
  return itemSchema.validate(obj);
}

module.exports.validateItem = validateItem;
