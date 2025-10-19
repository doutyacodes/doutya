"use client"
import React, { useState, useEffect } from 'react';
import { MessageSquare, Heart, Plus, X, Image as ImageIcon, ArrowLeft, ChevronDown } from 'lucide-react';

const CommunityFeed = () => {
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [communities, setCommunities] = useState([]);
  const [posts, setPosts] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [loading, setLoading] = useState(false);

  const currentUserType = 'user';

    // Get token from localStorage when component mounts
  const [token, setToken] = useState("");

useEffect(() => {
  const storedToken = localStorage.getItem("token") || "";
  setToken(storedToken);
}, []);

    // Add this new useEffect to fetch communities when token is available
    useEffect(() => {
    if (token) {
        fetchUserCommunities();
    }
    }, [token]);

  useEffect(() => {
    if (selectedCommunity) {
      fetchCommunityPosts(selectedCommunity.id);
    }
  }, [selectedCommunity]);

  const fetchUserCommunities = async () => {
    if (!token) return;
    try {
      const response = await fetch(`/api/communities/user`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
      });

      const data = await response.json();
      if (data.success) {
        setCommunities(data.communities);
        if (data.communities.length > 0) {
          setSelectedCommunity(data.communities[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching communities:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommunityPosts = async (communityId) => {
    try {
      const response = await fetch(`/api/communities/${communityId}/posts`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setPosts(data.posts);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handlePostClick = (post) => {
    setScrollPosition(window.scrollY);
    setSelectedPost(post);
  };

  const handleBackToFeed = () => {
    setSelectedPost(null);
    setTimeout(() => {
      window.scrollTo(0, scrollPosition);
    }, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Community Tabs */}
        {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-900/80 to-purple-900/80 border-b border-gray-700">
            <div className="max-w-4xl mx-auto px-4 py-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                {/* Title Section */}
                <div className="flex-1">
                    <h1 className="text-2xl sm:text-3xl font-bold mb-1">Community Hub</h1>
                    <p className="text-gray-300 text-sm sm:text-base">Connect, share and engage with your communities</p>
                </div>

                {/* Create Post Button */}
                {!selectedPost && (
                    <div className="sm:self-start">
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg sm:rounded-xl shadow-lg transition-all hover:scale-105 hover:shadow-blue-500/25 border border-white/20 group flex items-center justify-center gap-2 px-4 py-2 sm:px-5 sm:py-3 text-sm sm:text-base"
                    >
                        <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                        <span className="font-semibold">Create Post</span>
                    </button>
                    </div>
                )}
                </div>
            </div>
            </div>

        {/* Enhanced Community Tabs */}
        <div className="sticky top-0 z-40 bg-gray-900/95 backdrop-blur-sm border-b border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-300">Your Communities</h2>
            <span className="text-sm text-gray-400 bg-gray-800 px-2 py-1 rounded">
                {communities.length} joined
            </span>
            </div>
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
            {communities.map((community) => (
                <button
                key={community.id}
                onClick={() => setSelectedCommunity(community)}
                className={`px-4 py-3 rounded-xl whitespace-nowrap transition-all transform hover:scale-105 border-2 ${
                    selectedCommunity?.id === community.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white border-transparent shadow-lg'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border-gray-600 hover:border-gray-500'
                } font-medium min-w-[120px] text-center`}
                >
                <div className="flex items-center justify-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                    selectedCommunity?.id === community.id ? 'bg-white' : 'bg-blue-500'
                    }`} />
                    {community.name}
                </div>
                </button>
            ))}
            </div>
        </div>
        </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {selectedPost ? (
          <PostDetailView
            post={selectedPost}
            onBack={handleBackToFeed}
            currentUserType={currentUserType}
            token={token}
          />
        ) : (
          <FeedView
            posts={posts}
            onPostClick={handlePostClick}
            currentUserType={currentUserType}
            token={token}
          />
        )}
      </div>

      {/* Create Post Modal */}
      {showCreateModal && (
        <CreatePostModal
          communityId={selectedCommunity?.id}
          onClose={() => setShowCreateModal(false)}
          onPostCreated={(newPost) => {
            setPosts([newPost, ...posts]);
            setShowCreateModal(false);
          }}
          currentUserType={currentUserType}
          token={token}
        />
      )}
    </div>
  );
};

const FeedView = ({ posts, onPostClick, currentUserType, token }) => {
  return (
    <div className="space-y-4">
      {posts.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
          <p>No posts yet. Be the first to post!</p>
        </div>
      ) : (
        posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onClick={() => onPostClick(post)}
            currentUserType={currentUserType}
            showCommentPreview={true}
            token={token}
          />
        ))
      )}
    </div>
  );
};

const PostCard = ({ post, onClick, currentUserType, showCommentPreview = false, token }) => {
  const [isLiked, setIsLiked] = useState(post.isLikedByUser);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);

  const handleLike = async (e) => {
    e.stopPropagation();
    try {
      const response = await fetch('/api/communities/posts/like', {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
             Authorization: `Bearer ${token}`,
         },
        body: JSON.stringify({
          postId: post.id,
          userType: currentUserType,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setIsLiked(!isLiked);
        setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700 hover:border-gray-600 transition-all cursor-pointer"
    >
      {/* Post Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center font-semibold">
          {post.authorName?.[0]?.toUpperCase() || 'U'}
        </div>
        <div>
          <div className="font-medium">{post.authorName || 'Anonymous'}</div>
          <div className="text-xs text-gray-400">{formatDate(post.created_at)}</div>
        </div>
      </div>

      {/* Post Content */}
      {post.title && <h3 className="text-xl font-semibold mb-3">{post.title}</h3>}
      {post.content && <p className="text-gray-300 mb-3 whitespace-pre-wrap">{post.content}</p>}
      {post.image_url && (
        <img
          src={`https://wowfy.in/doutya-api/photos/${post.image_url}`}
          alt="Post"
          className="w-full rounded-lg mb-3 max-h-96 object-cover"
        />
      )}

      {/* Post Actions */}
      <div className="flex items-center gap-6 pt-3 border-t border-gray-700">
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 transition-colors ${
            isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
          }`}
        >
          <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
          <span>{likeCount}</span>
        </button>
        <button className="flex items-center gap-2 text-gray-400 hover:text-blue-500 transition-colors">
          <MessageSquare size={20} />
          <span>{post.commentCount || 0}</span>
        </button>
      </div>
    </div>
  );
};

const PostDetailView = ({ post, onBack, currentUserType, token }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComments();
  }, [post.id]);

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/communities/posts/${post.id}/comments`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setComments(data.comments);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim()) return;

    try {
      const response = await fetch('/api/communities/posts/comment', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          parentPostId: post.id,
          content: newComment,
          communityId: post.community_id,
          createdByType: currentUserType,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setComments([data.comment, ...comments]);
        setNewComment('');
      }
    } catch (error) {
      console.error('Error posting comment:', error);
    }
  };

  return (
    <div>
      {/* Back Button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back to Feed</span>
      </button>

      {/* Original Post */}
      <PostCard post={post} onClick={() => {}} currentUserType={currentUserType} token={token} />

      {/* Comment Input */}
      <div className="mt-6 bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Write a comment..."
          className="w-full bg-gray-900/50 text-white rounded-lg p-3 border border-gray-700 focus:border-blue-500 focus:outline-none resize-none"
          rows="3"
        />
        <button
          onClick={handlePostComment}
          className="mt-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          Comment
        </button>
      </div>

      {/* Comments Section */}
      <div className="mt-6 space-y-4">
        <h3 className="text-xl font-semibold">Comments</h3>
        {loading ? (
          <div className="text-gray-400 text-center py-8">Loading comments...</div>
        ) : comments.length === 0 ? (
          <div className="text-gray-400 text-center py-8">No comments yet. Be the first to comment!</div>
        ) : (
          comments.map((comment) => (
            <CommentThread
              key={comment.id}
              comment={comment}
              currentUserType={currentUserType}
              postId={post.id}
              token={token}
            />
          ))
        )}
      </div>
    </div>
  );
};

const CommentThread = ({ comment, currentUserType, postId, depth = 0, token }) => {
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState([]);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isLiked, setIsLiked] = useState(comment.isLikedByUser);
  const [likeCount, setLikeCount] = useState(comment.likeCount || 0);
  const [loadingReplies, setLoadingReplies] = useState(false);

  const fetchReplies = async () => {
    if (showReplies) {
      setShowReplies(false);
      return;
    }

    setLoadingReplies(true);
    try {
      const response = await fetch(`/api/communities/posts/comment/${comment.id}/replies`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setReplies(data.replies);
        setShowReplies(true);
      }
    } catch (error) {
      console.error('Error fetching replies:', error);
    } finally {
      setLoadingReplies(false);
    }
  };

  const handlePostReply = async () => {
    if (!replyText.trim()) return;

    try {
      const response = await fetch('/api/communities/posts/comment', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },        body: JSON.stringify({
          parentPostId: comment.id,
          content: replyText,
          communityId: comment.community_id,
          createdByType: currentUserType,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setReplies([data.comment, ...replies]);
        setReplyText('');
        setShowReplyInput(false);
        setShowReplies(true);
      }
    } catch (error) {
      console.error('Error posting reply:', error);
    }
  };

  const handleLike = async () => {
    try {
      const response = await fetch('/api/communities/posts/like', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          postId: comment.id,
          userType: currentUserType,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setIsLiked(!isLiked);
        setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
      }
    } catch (error) {
      console.error('Error liking comment:', error);
    }
  };

  return (
    <div className={`${depth > 0 ? 'ml-8 border-l-2 border-gray-700 pl-4' : ''}`}>
      <div className="bg-gray-800/30 rounded-lg p-4">
        {/* Comment Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-teal-600 flex items-center justify-center text-sm font-semibold">
            {comment.authorName?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <div className="font-medium text-sm">{comment.authorName || 'Anonymous'}</div>
            <div className="text-xs text-gray-400">{formatDate(comment.created_at)}</div>
          </div>
        </div>

        {/* Comment Content */}
        <p className="text-gray-300 mb-3 whitespace-pre-wrap">{comment.content}</p>

        {/* Comment Actions */}
        <div className="flex items-center gap-4 text-sm">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1 transition-colors ${
              isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
            }`}
          >
            <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
            <span>{likeCount}</span>
          </button>
          <button
            onClick={() => setShowReplyInput(!showReplyInput)}
            className="text-gray-400 hover:text-blue-500 transition-colors"
          >
            Reply
          </button>
          {comment.replyCount > 0 && (
            <button
              onClick={fetchReplies}
              className="flex items-center gap-1 text-gray-400 hover:text-blue-500 transition-colors"
            >
              <ChevronDown size={16} className={`transition-transform ${showReplies ? 'rotate-180' : ''}`} />
              <span>
                {showReplies ? 'Hide' : 'Show'} {comment.replyCount} {comment.replyCount === 1 ? 'reply' : 'replies'}
              </span>
            </button>
          )}
        </div>

        {/* Reply Input */}
        {showReplyInput && (
          <div className="mt-3">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
              className="w-full bg-gray-900/50 text-white rounded-lg p-2 border border-gray-700 focus:border-blue-500 focus:outline-none resize-none text-sm"
              rows="2"
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={handlePostReply}
                className="px-4 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
              >
                Reply
              </button>
              <button
                onClick={() => setShowReplyInput(false)}
                className="px-4 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Nested Replies */}
      {showReplies && (
        <div className="mt-3 space-y-3">
          {loadingReplies ? (
            <div className="text-gray-400 text-sm text-center py-2">Loading replies...</div>
          ) : (
            replies.map((reply) => (
              <CommentThread
                key={reply.id}
                comment={reply}
                currentUserType={currentUserType}
                postId={postId}
                depth={depth + 1}
                token={token}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

const CreatePostModal = ({ communityId, onClose, onPostCreated, currentUserType, token }) => {
  const [postType, setPostType] = useState('text'); // 'text', 'image', 'both'
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('coverImage', file);
    formData.append('type', 'photo');

    try {
      const response = await fetch('https://wowfy.in/doutya-api/upload.php', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        return data.filePath;
      }
      throw new Error(data.error);
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() && postType !== 'text') return;
    if (postType === 'text' && !title.trim() && !content.trim()) return;
    if ((postType === 'image' || postType === 'both') && !imageFile) return;

    setUploading(true);

    try {
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
        if (!imageUrl) {
          alert('Failed to upload image');
          setUploading(false);
          return;
        }
      }

      const response = await fetch('/api/communities/posts/create', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          communityId,
          title: title.trim() || null,
          content: content.trim() || null,
          imageUrl: imageUrl,
          createdByType: currentUserType,
        }),
      });

      const data = await response.json();
      if (data.success) {
        onPostCreated(data.post);
      }
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-semibold">Create Post</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          {/* Post Type Selection */}
          <div className="flex gap-3">
            <button
              onClick={() => setPostType('text')}
              className={`flex-1 py-2 rounded-lg transition-all ${
                postType === 'text' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Text Only
            </button>
            <button
              onClick={() => setPostType('image')}
              className={`flex-1 py-2 rounded-lg transition-all ${
                postType === 'image' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Image Only
            </button>
            <button
              onClick={() => setPostType('both')}
              className={`flex-1 py-2 rounded-lg transition-all ${
                postType === 'both' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Text & Image
            </button>
          </div>

          {/* Title Input */}
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="w-full bg-gray-900/50 text-white rounded-lg p-3 border border-gray-700 focus:border-blue-500 focus:outline-none"
          />

          {/* Content Input */}
          {(postType === 'text' || postType === 'both') && (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full bg-gray-900/50 text-white rounded-lg p-3 border border-gray-700 focus:border-blue-500 focus:outline-none resize-none"
              rows="6"
            />
          )}

          {/* Image Upload */}
          {(postType === 'image' || postType === 'both') && (
            <div>
              <label className="block mb-2 text-gray-300">Upload Image</label>
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="w-full rounded-lg max-h-64 object-cover" />
                  <button
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                  <ImageIcon size={40} className="text-gray-400 mb-2" />
                  <span className="text-gray-400">Click to upload image</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={uploading}
            className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  );
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now - date;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 7) {
    return date.toLocaleDateString();
  } else if (days > 0) {
    return `${days}d ago`;
  } else if (hours > 0) {
    return `${hours}h ago`;
  } else if (minutes > 0) {
    return `${minutes}m ago`;
  } else {
    return 'Just now';
  }
};

export default CommunityFeed;