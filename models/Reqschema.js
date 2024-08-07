const Joi = require('joi');

module.exports.listingSchema=Joi.object({
    listing:Joi.object({
    user:Joi.string().allow(),
    description:Joi.string().required(),
    img:Joi.string().allow("",null),
    }).required()
});