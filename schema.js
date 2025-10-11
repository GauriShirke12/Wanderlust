const Joi = require('joi');

const listingSchema = Joi.object({
    listing: Joi.object({   
        title: Joi.string().required(),
        description: Joi.string().required(),  
        price: Joi.number().required().min(0),
                     
        location: Joi.string().required(),
        country: Joi.string().required(),
        // allow image to be either a string (from the form) or an object { url, filename }
        image: Joi.alternatives().try(
            Joi.string().allow("", null),
            Joi.object({
                url: Joi.string().allow("", null).optional(),
                filename: Joi.string().allow("", null).optional()
            })
        ).optional(),

            }).required()
});

module.exports = {
    listingSchema
};

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        comment: Joi.string().required()
    }).required()
});