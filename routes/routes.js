const router = require("express").Router();
const { verifyToken } = require("../middlewares/userAuth");

const usersController = require("../controllers/users.controller");
const channelController = require("../controllers/channels.controller")
const mediaController = require("../controllers/media.controller")
const subscriptionsController = require("../controllers/subscriptions.controller")
const userSubscriptionsController = require("../controllers/user_subscriptions.controller")

// users APIs
router.post("/user/signup", usersController.signUp);
router.post("/user/login", usersController.logIn);
router.post("/user/adminLogin", usersController.adminLogin);
router.post("/user/googleSignup", usersController.googleSignUp);
router.post("/user/googleLogin", usersController.googleLogin);
router.post("/user/fbSignup", usersController.fbSignUp);
router.post("/user/fbLogin", usersController.fbLogin);
router.post("/user/appleLogin", usersController.appleLogin);
router.get("/user/emailVerify", usersController.emailVerify)
router.get("/user/all", usersController.getAllUsers);
router.get("/user/:id", usersController.getUserById);
router.put("/user/update/:id", usersController.updateUser);
router.delete("/user/delete/:id", usersController.deleteUserById);
router.put("/user/resetPassword", usersController.resetPassword);
router.post("/user/deviceToken", usersController.deviceToken);
router.get("/user/profile/:id", usersController.profile);
router.put("/user/location/:id", usersController.updateLocation);
router.get("/user/accountStatus/:id", usersController.isActiveAccount);
router.put("/user/updateAdmin/:id", usersController.updateAdmin);

// media APIs
router
  .route("/media")
  .post(mediaController.addMedia)
  .get(mediaController.getAllMedia);
router
  .route("/media/:id")
  .get(mediaController.getOneMediaById)
  .put(mediaController.updateMedia)
  .delete(mediaController.deleteMedia)
router.get("/media/all/:channel_id", mediaController.getAllMediaById);

// channels APIs
router
  .route("/channels")
  .post(channelController.uploadChannel, channelController.addChannel)
  .get(channelController.getAllChannels);
router
  .route("/channel/:id")
  .get(channelController.getChannelById)
  .put(channelController.uploadChannel, channelController.updateChannel)
  .delete(channelController.deleteChannel)

// subscriptions APIs
router
  .route("/subscriptions")
  .post(subscriptionsController.addSubscription)
  .get(subscriptionsController.getAllSubscriptions);

router
  .route("/subscription/:id")
  .get(subscriptionsController.getSubscriptionById)
  .put(subscriptionsController.updateSubscription)
  .delete(subscriptionsController.deleteSubscription)
router.post("/user/subscriptions", subscriptionsController.userSubscriptions);

//user_subscriptions APIs
router
  .route("/userSubscription")
  .get(userSubscriptionsController.getAllUserSubscriptions);

router
  .route("/userSubscription/:user_id")
  .get(userSubscriptionsController.getUserSubscriptionById)
  .delete(userSubscriptionsController.deleteUserSubscription)
router.get("/subscribedUsers/:subscription_id",
  userSubscriptionsController.getSubscribedUsers);
router.get("/invoice/:user_id", userSubscriptionsController.getInvoice);
router.post("/session/create", userSubscriptionsController.createSession);
router.post("/session/retrieve", userSubscriptionsController.retrieveSession);
router.post("/isExpired/:user_id", userSubscriptionsController.isExpired);

module.exports = router;
