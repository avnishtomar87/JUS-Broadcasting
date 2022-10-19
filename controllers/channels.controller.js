const models = require("../models");
const { channels } = models;
const createHttpError = require("http-errors");
const catchAsync = require("../utils/catchAsync");
const { successData } = require("../helpers/response");
const isEmpty = require("lodash/isEmpty");
const multer = require("multer");

const multerStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images/channels');
    },
    filename: (req, file, cb) => {
        const ext = file.mimetype.split('/')[1];
        const file_name = file.originalname.split(".")[0]
        cb(null, `channel-${file_name}-${Date.now()}.${ext}`);
    }
});

const upload = multer({ storage: multerStorage, });
const uploadChannel = upload.single('logo_url');

const addChannel = catchAsync(async (req, res, next) => {
    const { body: { channel_name }, file } = req;
    let payload = { channel_name };
    if (file) {
        const logo_url = file.filename
        payload = {
            ...payload,
            logo_url
        }
    }
    const data = await channels.create({
        ...payload
    })
    res.json(successData("success", data));
});

const getAllChannels = (req, res, next) => {
    channels.findAll({ order: [['id', 'ASC']] })
        .then((data) => {
            res.json(successData("success", data));
        })
        .catch(next);
}

const getChannelById = (req, res, next) => {
    const { params: { id } } = req;
    channels.findOne({
        where: { id },
    }).then((data) => {
        if (isEmpty(data)) {
            throw createHttpError(`channel ${id} not found`);
        }
        res.json(successData("success", data));
    }).catch(next);
}

const updateChannel = catchAsync(async (req, res, next) => {
    const { body: { channel_name }, file, params: { id } } = req;
    let payload = { channel_name };
    if (file) {
        const logo_url = file.filename
        payload = {
            ...payload,
            logo_url
        }
    }
    channels.update(
        {
            ...payload
        },
        { where: { id } }
    ).then((data) => {
        if (data[0] === 0) {
            throw createHttpError(`channel ${id} not found`);
        }
        res.json(successData("updated successfully", data));
    }).catch(next);
});

const deleteChannel = (req, res, next) => {
    const { params: { id } } = req;
    channels.destroy({
        where: { id },
    }).then((data) => {
        if (!data) {
            throw createHttpError(`channel ${id} not found`);
        }
        res.json(successData("deleted successfully", data));
    }).catch(next);
};

module.exports = {
    addChannel,
    uploadChannel,
    getAllChannels,
    getChannelById,
    updateChannel,
    deleteChannel
}
