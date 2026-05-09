const Video = require('../models/Video');
const User = require('../models/User');
const { extractVideoId, fetchVideoMetadata, fetchTranscript } = require('../utils/youtube');
const { analyzeTranscript, chatWithVideo } = require('../utils/aiAnalysis');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: parseInt(process.env.CACHE_TTL) || 3600 });

// @desc    Analyze a YouTube video
// @route   POST /api/videos/analyze
const analyzeVideo = async (req, res, next) => {
  const startTime = Date.now();
  try {
    const { url, summaryLength = 'medium', forceRefresh = false } = req.body;
    const userId = req.user.id;

    const videoId = extractVideoId(url);
    if (!videoId) {
      return res.status(400).json({ success: false, message: 'Invalid YouTube URL.' });
    }

    // Return cached result if available
    if (!forceRefresh) {
      const existing = await Video.findOne({ userId, videoId, status: 'completed' });
      if (existing) {
        return res.json({ success: true, message: 'Retrieved from your history.', video: existing, cached: true });
      }
    }

    // Fetch metadata
    const metadata = await fetchVideoMetadata(videoId);

    // Create/update DB record as processing
    let video = await Video.findOneAndUpdate(
      { userId, videoId },
      { userId, videoId, url, status: 'processing', ...metadata, error: null },
      { upsert: true, new: true }
    );

    // Fetch transcript (tries all methods + all languages)
    const transcriptResult = await fetchTranscript(videoId);

    if (!transcriptResult.success || !transcriptResult.transcript) {
      // Still save to DB but mark failed
      video.status = 'failed';
      video.error = transcriptResult.error || 'Could not extract transcript from this video.';
      await video.save();
      return res.status(422).json({
        success: false,
        message: video.error,
        tip: 'This video has captions completely disabled by the uploader. Try a different video.',
        videoId,
        metadata,
      });
    }

    video.transcript = transcriptResult.transcript;
    video.transcriptWordCount = transcriptResult.wordCount;

    console.log(`[Analyze] Transcript fetched: ${transcriptResult.wordCount} words, lang=${transcriptResult.lang}, via ${transcriptResult.source}`);

    // AI analysis — always outputs in English regardless of transcript language
    const { success, analysis, error } = await analyzeTranscript(
      transcriptResult.transcript,
      metadata.title,
      summaryLength
    );

    video.analysis = analysis;
    video.status = 'completed';
    video.processingTime = Date.now() - startTime;
    if (!success) video.error = `AI partial: ${error}`;

    await video.save();
    await User.findByIdAndUpdate(userId, { $inc: { totalVideosAnalyzed: 1 } });

    res.json({
      success: true,
      message: 'Video analyzed successfully!',
      video,
      processingTime: video.processingTime,
      transcriptLang: transcriptResult.lang,
      transcriptSource: transcriptResult.source,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's video history
// @route   GET /api/videos/history
const getHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 12, search, favorite, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const query = { userId: req.user.id };
    if (favorite === 'true') query.isFavorite = true;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { channelName: { $regex: search, $options: 'i' } },
        { 'analysis.tags': { $in: [new RegExp(search, 'i')] } },
      ];
    }
    const [videos, total] = await Promise.all([
      Video.find(query).select('-transcript -analysis.mcqs').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Video.countDocuments(query),
    ]);
    res.json({
      success: true, videos,
      pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)), hasMore: skip + videos.length < total },
    });
  } catch (error) { next(error); }
};

// @desc    Get single video
// @route   GET /api/videos/:id
const getVideo = async (req, res, next) => {
  try {
    const video = await Video.findOne({ _id: req.params.id, userId: req.user.id });
    if (!video) return res.status(404).json({ success: false, message: 'Video not found.' });
    res.json({ success: true, video });
  } catch (error) { next(error); }
};

// @desc    Toggle favorite
// @route   PUT /api/videos/:id/favorite
const toggleFavorite = async (req, res, next) => {
  try {
    const video = await Video.findOne({ _id: req.params.id, userId: req.user.id });
    if (!video) return res.status(404).json({ success: false, message: 'Video not found.' });
    video.isFavorite = !video.isFavorite;
    await video.save();
    res.json({ success: true, isFavorite: video.isFavorite });
  } catch (error) { next(error); }
};

// @desc    Update notes
// @route   PUT /api/videos/:id/notes
const updateNotes = async (req, res, next) => {
  try {
    const video = await Video.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { userNotes: req.body.notes },
      { new: true }
    );
    if (!video) return res.status(404).json({ success: false, message: 'Video not found.' });
    res.json({ success: true, message: 'Notes saved!', notes: video.userNotes });
  } catch (error) { next(error); }
};

// @desc    Delete video
// @route   DELETE /api/videos/:id
const deleteVideo = async (req, res, next) => {
  try {
    const video = await Video.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!video) return res.status(404).json({ success: false, message: 'Video not found.' });
    res.json({ success: true, message: 'Video removed from history.' });
  } catch (error) { next(error); }
};

// @desc    Get dashboard stats
// @route   GET /api/videos/stats
const getStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const [total, favorites, byDifficulty, byStatus, recent] = await Promise.all([
      Video.countDocuments({ userId }),
      Video.countDocuments({ userId, isFavorite: true }),
      Video.aggregate([
        { $match: { userId: require('mongoose').Types.ObjectId.createFromHexString(userId) } },
        { $group: { _id: '$analysis.difficulty', count: { $sum: 1 } } },
      ]),
      Video.aggregate([
        { $match: { userId: require('mongoose').Types.ObjectId.createFromHexString(userId) } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Video.find({ userId, status: 'completed' })
        .select('title thumbnailUrl createdAt analysis.tags videoId')
        .sort({ createdAt: -1 })
        .limit(5),
    ]);
    res.json({
      success: true,
      stats: {
        total, favorites,
        completed: byStatus.find(s => s._id === 'completed')?.count || 0,
        byDifficulty, recentVideos: recent,
      },
    });
  } catch (error) { next(error); }
};

// @desc    Chat about a video
// @route   POST /api/videos/:id/chat
const chatWithVideoHandler = async (req, res, next) => {
  try {
    const video = await Video.findOne({ _id: req.params.id, userId: req.user.id });
    if (!video) return res.status(404).json({ success: false, message: 'Video not found.' });
    if (video.status !== 'completed') {
      return res.status(400).json({ success: false, message: 'Video analysis not complete yet.' });
    }

    const { message, history = [] } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ success: false, message: 'Message is required.' });
    }

    const reply = await chatWithVideo(
      video.title,
      video.transcript || '',
      video.analysis || {},
      history,
      message.trim()
    );

    res.json({ success: true, reply });
  } catch (error) {
    next(error);
  }
};

module.exports = { analyzeVideo, getHistory, getVideo, toggleFavorite, updateNotes, deleteVideo, getStats, chatWithVideoHandler };
