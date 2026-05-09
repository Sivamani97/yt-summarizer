const express = require('express');
const router = express.Router();
const {
  analyzeVideo, getHistory, getVideo,
  toggleFavorite, updateNotes, deleteVideo, getStats, chatWithVideoHandler,
} = require('../controllers/videoController');
const { protect } = require('../middleware/auth');
const { analyzeValidation } = require('../middleware/validation');

// All routes require authentication
router.use(protect);

router.post('/analyze', analyzeValidation, analyzeVideo);
router.get('/history', getHistory);
router.get('/stats', getStats);
router.get('/:id', getVideo);
router.put('/:id/favorite', toggleFavorite);
router.put('/:id/notes', updateNotes);
router.delete('/:id', deleteVideo);
router.post('/:id/chat', chatWithVideoHandler);

module.exports = router;
