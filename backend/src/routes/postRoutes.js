const express = require('express');
const {
  createPost,
  getPosts,
  getPostById,
  addComment,
  addOrUpdateRating,
  getMyPosts
} = require('../controllers/postController');
const { protect, allowRoles } = require('../middleware/auth');
const upload = require('../utils/upload');

const router = express.Router();

router.get('/', getPosts);
router.get('/my-posts', protect, allowRoles('creator'), getMyPosts);
router.get('/:id', getPostById);
router.post('/', protect, allowRoles('creator'), upload.single('image'), createPost);
router.post('/:id/comments', protect, addComment);
router.post('/:id/rate', protect, addOrUpdateRating);

module.exports = router;
