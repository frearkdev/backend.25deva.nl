const express = require('express');
const router = express.Router();

const authRequired = require('../middleware/authMiddleware');
const {
  createPost,
  getAllPosts,
  getPostById,
  deletePost
} = require('../controllers/postController');

// journal endpoints
router.get('/', getAllPosts);              // iedereen mag lezen
router.get('/:id', getPostById);           // iedereen mag lezen
router.post('/', authRequired, createPost); // alleen ingelogd
router.delete('/:id', authRequired, deletePost); // author/admin

module.exports = router;