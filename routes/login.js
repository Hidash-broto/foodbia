const userVerify = require('../middleware/auth');

const {
  // eslint-disable-next-line max-len
  registerView, loginView, homePage, registerUser, loginUser, logoutUser, adminLoginView, adminLogin, shopnowView,
  // eslint-disable-next-line max-len
  wishlistViewer, cartView, addWishlist, wishDrop, addtoCart, changeQty, checkoutView,
  placeOrder, viewOrder, verifyPayment, orderViewProducts, productList, cancelOrder, userProfile,
  changePassword, postChangePassword, addAddress, postAddAddress, codeApply, invoice, productDt,
  postOtp, resendOtp, searching, allProducts, forgotPass, forgotPassOtp, postUpdatePass,
} = require('../controllers/logincontroller');
// eslint-disable-next-line import/order
const router = require('express').Router();

router.get('/signup', registerView);
router.get('/', homePage);
router.get('/login', loginView);
router.get('/shopnow', shopnowView);
router.get('/admin', adminLoginView);
router.get('/logout', logoutUser);
router.get('/wishlist', userVerify.verifyUser, wishlistViewer);
router.get('/cart', userVerify.verifyUser, cartView);
router.post('/addWishlist', userVerify.verifyUser, addWishlist);
router.get('/addcart/:id', userVerify.verifyUser, addtoCart);
router.get('/checkout', userVerify.verifyUser, checkoutView);
router.get('/viewOrder', userVerify.verifyUser, viewOrder);
router.get('/productList/:id', productList);
router.get('/userProfile', userVerify.verifyUser, userProfile);
router.get('/changePassword', userVerify.verifyUser, changePassword);
router.get('/addAddress', userVerify.verifyUser, addAddress);
router.get('/invoice/:id', userVerify.verifyUser, invoice);
router.get('/productDt', productDt);
router.get('/resendOtp', resendOtp);
router.get('/searching', searching);
router.get('/allProducts', allProducts);
router.get('/forgotPass', forgotPass);
router.post('/postChangePassword', userVerify.verifyUser, postChangePassword);
router.post('/prdModal', userVerify.verifyUser, orderViewProducts);
router.post('/addcart/:id', userVerify.verifyUser, addtoCart);
router.post('/qtyChange', userVerify.verifyUser, changeQty);
router.post('/signup', registerUser);
router.post('/login', loginUser);
router.post('/admin', adminLogin);
router.post('/place-order', userVerify.verifyUser, placeOrder);
router.post('/wishDrop', userVerify.verifyUser, wishDrop);
router.post('/verifyPayment', userVerify.verifyUser, verifyPayment);
router.post('/cancelOrder', userVerify.verifyUser, cancelOrder);
router.post('/postAddAddress', userVerify.verifyUser, postAddAddress);
router.post('/codeApply', userVerify.verifyUser, codeApply);
router.post('/postOtp', postOtp);
router.post('/forgotOtp', forgotPassOtp);
router.post('/postUpdatePass', postUpdatePass);

module.exports = router;
