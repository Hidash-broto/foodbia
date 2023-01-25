const router = require('express').Router();

const {
  userList, blockUser, logoutAdmin, catogaryForm, addCatogary, viewCategory, doUnlist, catogaryEdit,
  postCatEdit, adminProductView, addProductForm, addProduct, dropProduct, editProductView,
  orderManagementView, updateProduct, changeStatus, dayReport, monthReport, yearReport, AdminDash,
  CouponView, addCoupon, postCouponAdd, editCoupon, postEditCoupon, changeCouponStatus,
} = require('../controllers/adminController');
const { verifyAdmin } = require('../middleWare/auth');

router.get('/userList', verifyAdmin, userList);
router.get('/admin/logout', logoutAdmin);
router.get('/categoryForm', verifyAdmin, catogaryForm);
router.get('/categoryEdit/:id', verifyAdmin, catogaryEdit);
router.get('/addcategory', verifyAdmin, viewCategory);
router.get('/products', verifyAdmin, adminProductView);
router.get('/addProductView', verifyAdmin, addProductForm);
router.get('/editProduct/:id', verifyAdmin, editProductView);
router.get('/orderManagementView', verifyAdmin, orderManagementView);
router.get('/changeStatus', verifyAdmin, changeStatus);
router.get('/dayReport', verifyAdmin, dayReport);
router.get('/monthReport', verifyAdmin, monthReport);
router.get('/yearReport', verifyAdmin, yearReport);
router.get('/dashboard', verifyAdmin, AdminDash);
router.get('/CouponView', verifyAdmin, CouponView);
router.get('/addCoupon', verifyAdmin, addCoupon);
router.get('/editCoupon/:id', verifyAdmin, editCoupon);
router.post('/dropProduct', verifyAdmin, dropProduct);
router.post('/updateProduct/:id', verifyAdmin, updateProduct);
router.post('/addProduct', verifyAdmin, addProduct);
router.post('/blockUser', verifyAdmin, blockUser);
router.post('/addCatogary', verifyAdmin, addCatogary);
router.post('/unlist', verifyAdmin, doUnlist);
router.post('/catEdit', verifyAdmin, postCatEdit);
router.post('/postCouponAdd', verifyAdmin, postCouponAdd);
router.post('/editCoupon', verifyAdmin, postEditCoupon);
router.post('/changeCouponStatus', verifyAdmin, changeCouponStatus);

module.exports = router;
