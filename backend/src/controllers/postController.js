const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Rating = require('../models/Rating');
const { uploadImage } = require('../config/storage');
const { getCachedJson, setCachedJson, deleteByPattern } = require('../utils/cache');

const POST_LIST_CACHE_TTL = 30;
const POST_DETAILS_CACHE_TTL = 30;

const normaliseSearch = (value = '') => String(value).trim();

const clearPostCaches = async (postId) => {
  await Promise.all([
    deleteByPattern('posts:list:*'),
    postId ? deleteByPattern(`posts:details:${postId}`) : Promise.resolve()
  ]);
};

exports.createPost = async (req, res) => {
  const { title, caption = '', location = '', peoplePresent = '' } = req.body;

  if (!title || !req.file) {
    return res.status(400).json({ message: 'Title and image are required' });
  }

  const peopleList = String(peoplePresent)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const storageResult = await uploadImage(req.file);

  const post = await Post.create({
    creator: req.user._id,
    title,
    caption,
    location,
    peoplePresent: peopleList,
    imageUrl: storageResult.imageUrl,
    imageObjectKey: storageResult.objectName,
    originalFilename: req.file.originalname
  });

  await clearPostCaches(post._id.toString());

  const populated = await Post.findById(post._id).populate('creator', 'name email role');

  res.status(201).json({
    message: 'Post created successfully',
    post: populated
  });
};

exports.getPosts = async (req, res) => {
  const search = normaliseSearch(req.query.search);
  const cacheKey = `posts:list:${search || 'all'}`;
  const cached = await getCachedJson(cacheKey);

  if (cached) {
    return res.json({ ...cached, cache: 'hit' });
  }

  const query = search
    ? {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { caption: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } },
          { peoplePresent: { $regex: search, $options: 'i' } }
        ]
      }
    : {};

  const posts = await Post.find(query)
    .populate('creator', 'name email role')
    .sort({ createdAt: -1 });

  const payload = { posts };
  await setCachedJson(cacheKey, payload, POST_LIST_CACHE_TTL);

  res.json({ ...payload, cache: 'miss' });
};

exports.getPostById = async (req, res) => {
  const cacheKey = `posts:details:${req.params.id}`;
  const cached = await getCachedJson(cacheKey);

  if (cached) {
    return res.json({ ...cached, cache: 'hit' });
  }

  const post = await Post.findById(req.params.id).populate('creator', 'name email role');

  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }

  const comments = await Comment.find({ post: post._id })
    .populate('user', 'name role')
    .sort({ createdAt: -1 });

  const payload = { post, comments };
  await setCachedJson(cacheKey, payload, POST_DETAILS_CACHE_TTL);

  res.json({ ...payload, cache: 'miss' });
};

exports.addComment = async (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ message: 'Comment text is required' });
  }

  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }

  const comment = await Comment.create({
    post: post._id,
    user: req.user._id,
    text
  });

  await clearPostCaches(post._id.toString());

  const populated = await Comment.findById(comment._id).populate('user', 'name role');
  res.status(201).json({ message: 'Comment added', comment: populated });
};

exports.addOrUpdateRating = async (req, res) => {
  const { score } = req.body;
  if (!score || score < 1 || score > 5) {
    return res.status(400).json({ message: 'Score must be between 1 and 5' });
  }

  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({ message: 'Post not found' });
  }

  await Rating.findOneAndUpdate(
    { post: post._id, user: req.user._id },
    { score },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const ratings = await Rating.find({ post: post._id });
  const average = ratings.reduce((sum, item) => sum + item.score, 0) / ratings.length;

  post.ratingsAverage = Number(average.toFixed(2));
  post.ratingsCount = ratings.length;
  await post.save();
  await clearPostCaches(post._id.toString());

  res.json({
    message: 'Rating saved',
    ratingsAverage: post.ratingsAverage,
    ratingsCount: post.ratingsCount
  });
};

exports.getMyPosts = async (req, res) => {
  const posts = await Post.find({ creator: req.user._id })
    .populate('creator', 'name email role')
    .sort({ createdAt: -1 });

  res.json({ posts });
};
