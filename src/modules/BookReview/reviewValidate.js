import Joi from "joi";

export const reviewValidate = Joi.object ({
    book_id: Joi.string().required(),
    user_id: Joi.string(),
    rating: Joi.number().min(1).max(5).required(),
    comment: Joi.string().allow("").optional(),
});