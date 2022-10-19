const models = require("../models");
const { media, channels } = models;
const createHttpError = require("http-errors");
const catchAsync = require("../utils/catchAsync");
const { successData } = require("../helpers/response");
const isEmpty = require("lodash/isEmpty");

const addMedia = catchAsync(async (req, res,) => {
  const { body: { title,channel_id, media_url, type } } = req;
  const data = await media.create({
   title, channel_id, media_url, type
  })
  res.json(successData("success", data));
});

const getAllMedia = (req, res, next) => {
  const include = [
    { model: channels, attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] } },
  ];
  media.findAll({ include,order:[["updatedAt","DESC"]] })
    .then((data) => {
      res.json(successData("success", data));
    })
    .catch(next);
}

const getAllMediaById = (req, res, next) => {
  const { params: { channel_id } } = req;
  media.findAll({
    where: { channel_id },
  }).then((data) => {
    if (isEmpty(data)) {
      throw createHttpError(`media ${channel_id} not found`);
    }
    res.json(successData("success", data));
  }).catch(next);
}

const getOneMediaById = (req, res, next) => {
  const { params: { id } } = req;
  media.findOne({
    where: { id },
  }).then((data) => {
    if (isEmpty(data)) {
      throw createHttpError(`media ${id} not found`);
    }
    res.json(successData("success", data));
  }).catch(next);
}

const updateMedia = catchAsync(async (req, res, next) => {
  const { body: { title,channel_id, media_url, type }, params: { id } } = req;
  media.update(
    { title,channel_id, media_url, type },
    { where: { id } }
  ).then((data) => {
    if (data[0] === 0) {
      throw createHttpError(`media ${id} not found`);
    }
    res.json(successData("updated successfully", data));
  }).catch(next);
});

const deleteMedia = (req, res, next) => {
  const { params: { id } } = req;
  media.destroy({
    where: { id },
  }).then((data) => {
    if (!data) {
      throw createHttpError(`media ${id} not found`);
    }
    res.json(successData("deleted successfully", data));
  }).catch(next);
};

module.exports = {
  addMedia,
  getAllMedia,
  getAllMediaById,
  updateMedia,
  deleteMedia,
  getOneMediaById
}
