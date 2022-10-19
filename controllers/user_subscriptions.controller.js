const models = require("../models");
const { user_subscriptions, users, subscriptions } = models;
const createHttpError = require("http-errors");
const { successData } = require("../helpers/response");
const isEmpty = require("lodash/isEmpty");
const { STRIPE_SECRET_KEY, PAID_PAYMENT_STATUS, MONTHLY_PLAN } = require("../helpers/constant");
const catchAsync = require("../utils/catchAsync");
const stripe = require('stripe')(STRIPE_SECRET_KEY);
const { getPlanExpiry } = require("../helpers/service");

const getAllUserSubscriptions = (req, res, next) => {
    const include = [
        { model: users, attributes: ["id", "first_name", "last_name", "email", "login_type", "is_active", "user_name", "dob", "mobile_number"] },
        { model: subscriptions, attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] } }
    ];
    user_subscriptions.findAll({ include }).then((data) => {
        res.json(successData("success", data));
    }).catch(next);
}

const getUserSubscriptionById = (req, res, next) => {
    const { params: { user_id } } = req;
    const include = [
        { model: users, attributes: ["id", "first_name", "last_name", "email", "login_type", "is_active", "user_name", "dob", "mobile_number"] },
        { model: subscriptions, attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] } }
    ];
    user_subscriptions.findOne({
        where: { user_id },
        attributes: { exclude: ["updatedAt", "deletedAt"] },
        include
    })
        .then((data) => {
            if (isEmpty(data)) {
                throw createHttpError(`user_subscription ${user_id} not found`);
            }
            res.json(successData("success", data));
        }).catch(next);
};

const deleteUserSubscription = (req, res, next) => {
    const { params: { user_id } } = req;
    user_subscriptions.destroy({
        where: { user_id },
    }).then((data) => {
        if (!data) {
            throw createHttpError(`user_subscription ${user_id} not found`);
        }
        res.json(successData("deleted successfully", data));
    }).catch(next);
};

const getSubscribedUsers = (req, res, next) => {
    const { params: { subscription_id } } = req
    const include = [
        { model: users, attributes: ["id", "first_name", "last_name"] },
        { model: subscriptions, attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] }, required: true }
    ];
    user_subscriptions.findAll({
        attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
        where: { subscription_id },
        include
    }).then((data) => {
        res.json(successData("success", data));
    }).catch(next);
}

const getInvoice = (req, res, next) => {
    const { params: { user_id } } = req;
    const include = [
        { model: users, attributes: ["email", "user_name", "first_name", "last_name"] },
        { model: subscriptions, attributes: { exclude: ["id", "createdAt", "updatedAt", "deletedAt"] }, required: true }
    ];
    user_subscriptions.findAll({
        attributes: ["expires_on", "createdAt"],
        where: { user_id },
        include
    }).then((data) => {
        res.json(successData("success", data));
    }).catch(next);
}

const createSession = async (req, res) => {
    const { body: { success_url, cancel_url, price, quantity, mode } } = req;
    try {
        const session = await stripe.checkout.sessions.create({
            success_url,
            cancel_url,
            line_items: [{ price, quantity }],
            mode,
        });
        res.json(session);
    } catch (err) {
        res.json(err)
    }
};

const retrieveSession = catchAsync(async (req, res,) => {
    const { body: { user_id, subscription_id, session_id } } = req;
    const session = await stripe.checkout.sessions.retrieve(session_id);
    const { id, payment_status, subscription } = session;

    const days = JSON.parse(MONTHLY_PLAN)
    const expires_at = getPlanExpiry(days)

    let payload = {
        user_id,
        subscription_id,
        session_id: id,
        payment_status,
        subscription_key: subscription,
        expires_at
    }
    if (payment_status == PAID_PAYMENT_STATUS) {
        await user_subscriptions.destroy({ where: { user_id } })
        const data = await user_subscriptions.create(payload)
        res.json(successData("success", data));
    }
    else {
        const data = await user_subscriptions.findOne({ where: { user_id } })
        res.json(successData("success", data));
    }
});

const isExpired = async (req, res) => {
    const { params: { user_id } } = req
    const data = await user_subscriptions.findOne({ where: { user_id } })
    const expiry = data.expires_at.toISOString().split("T")[0]
    const date = new Date().toISOString().split("T")[0]
    if (expiry === date) {
        data.is_expired = true;
        data.save()
    }
    res.json(successData("success", data));
};

module.exports = {
    getAllUserSubscriptions,
    getUserSubscriptionById,
    deleteUserSubscription,
    getSubscribedUsers,
    getInvoice,
    createSession,
    retrieveSession,
    isExpired
};