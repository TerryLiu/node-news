var db = global.nodenews.db;
var cache = global.nodenews.cache;
var config = global.nodenews.config;
var utils = require('../utils');
var xss = utils.xss;


exports.path = '/reply';

exports.post = function (req, res, next) {
  var post_id = parseInt(req.body.post_id || 0);
  var comment_id = parseInt(req.body.comment_id || 0);
  var text = xss(String(req.body.text || '').trim());
  if (!(post_id > 0)) return res.sendError('Incorrect post id.');
  if (!text) return res.sendError('Comment cannot be empty!');
  if (!(comment_id > 0)) comment_id = 0;
  var user_id = req.session.user.id;
  db.insert('comments', {
    post_id:    post_id,
    parent_id:  comment_id,
    user_id:    user_id,
    content:    text,
    timestamp:  Date.now() / 1000  
  }, function (err, results) {
    if (err) return res.sendError(err);
    if (results.affectedRows < 1) return res.sendError('Add comment fail!');
    // update cache
    cache.incr('posts:comment:' + post_id);
    // return to the origin url
    res.redirect(req.header('referer') || '/');
  });
};