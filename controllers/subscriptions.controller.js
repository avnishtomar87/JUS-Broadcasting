const models = require("../models");
const { subscriptions, users } = models;
const createHttpError = require("http-errors");
const { successData } = require("../helpers/response");
const isEmpty = require("lodash/isEmpty");
const catchAsync = require("../utils/catchAsync");
const { Op } = require('sequelize')
const { getRegion } = require("../helpers/countries");

const addSubscription = (req, res, next) => {
    const { body: { title, duration, amount, currency, plan_for, payment_key } } = req;
    subscriptions.create({
        title, duration, amount, currency, plan_for, payment_key
    }).then((data) => {
        res.json(successData("success", data))
    }).catch(next)
}

const getAllSubscriptions = (req, res, next) => {
    subscriptions.findAll().then((data) => {
        res.json(successData("success", data));
    }).catch(next);
}

const getSubscriptionById = (req, res, next) => {
    const { params: { id } } = req;
    subscriptions.findOne({ where: { id } }).then((data) => {
        if (isEmpty(data)) {
            throw createHttpError(`subscription ${id} not found`);
        }
        res.json(successData("success", data));
    }).catch(next);
};

const updateSubscription = (req, res, next) => {
    const {
        body: { title, duration, amount, currency, plan_for, payment_key },
        params: { id }
    } = req;
    subscriptions.update(
        { title, duration, amount, currency, plan_for, payment_key },
        { where: { id } }
    ).then((data) => {
        if (data[0] == 0) {
            throw createHttpError(`subscription ${id} not found`);
        }
        res.json(successData("updated succesfully", data));
    }).catch(next);
};

const deleteSubscription = (req, res, next) => {
    const { params: { id } } = req;
    subscriptions.destroy({
        where: { id },
    }).then((data) => {
        if (!data) {
            throw createHttpError(`subscription ${id} not found`);
        }
        res.json(successData("deleted successfully", data));
    }).catch(next);
};

const userSubscriptions = catchAsync(async (req, res) => {
    const { body: { id } } = req;
    const user = await users.findOne({ where: { id } })
    const region = getRegion(user.country.trim())
    const data = await subscriptions.findAll({ where: { plan_for: region } })
    res.json(successData("success", data));
});

module.exports = {
    addSubscription,
    getAllSubscriptions,
    getSubscriptionById,
    updateSubscription,
    deleteSubscription,
    userSubscriptions
};