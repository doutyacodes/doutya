// import GlobalApi from '@/app/_services/GlobalApi';
// import React, { useState } from 'react'

// const PostCreation = ({ onClose }) => {
//     const [postType, setPostType] = useState('text');
//     const [content, setContent] = useState('');
//     const [file, setFile] = useState(null);
//     const [isSubmitting, setIsSubmitting] = useState(false);
  
//     console.log('type', postType, 'content', content);
    

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setIsSubmitting(true);

//         console.log('HandleSubmit');
//         const communityId = 1 /* hardcocded */

    
//         try {
//           const formData = new FormData();
//           formData.append('type', postType);
//           formData.append('content', content);
//           formData.append('communityId', communityId);
          
//           if (file) {
//             console.log(' FIle Exists');
//             formData.append('file', file);
//           }

//           console.log(formData);
          
//           const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
          
//           const response = await GlobalApi.AddPostToCommunity(token, formData);
//           console.log('Post submitted successfully:', response.data);
//           onClose();
//         } catch (error) {
//           console.error('Error submitting post:', error);
//           // Handle error (e.g., show error message to user)
//         } finally {
//           setIsSubmitting(false);
//         }
//       };
    
//     const handleFileChange = (e) => {
//         if (e.target.files[0]) {
//             setFile(e.target.files[0]);
//         }
//     };

//   return (
//     <div className="bg-[#2f2f2f] p-6 rounded-lg shadow-lg">
//         <h3 className="text-xl font-bold mb-4">Create a Post</h3>
//         <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//             <label className="block mb-2">Post Type:</label>
//             <select
//             value={postType}
//             onChange={(e) => setPostType(e.target.value)}
//             className="w-full p-2 border rounded bg-[#2f2f2f]"
//             >
//             <option value="text">Text</option>
//             <option value="image">Image</option>
//             <option value="video">Video</option>
//             </select>
//         </div>
//         {postType === 'text' ? (
//             <textarea
//             value={content}
//             onChange={(e) => setContent(e.target.value)}
//             placeholder="Write your post..."
//             className="w-full p-2 border rounded"
//             rows={4}
//             />
//         ) : (
//             <input
//             type="file"
//             accept={postType === 'image' ? 'image/*' : 'video/*'}
//             onChange={handleFileChange}
//             className="w-full p-2 border rounded"
//             />
//         )}
//         {(postType === 'image' || postType === 'video') && (
//             <input
//             type="text"
//             value={content}
//             onChange={(e) => setContent(e.target.value)}
//             placeholder="Add a caption..."
//             className="w-full p-2 border rounded"
//             />
//         )}
//         <div className="flex justify-end space-x-2">
//             <button
//             type="button"
//             onClick={onClose}
//             className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
//             disabled={isSubmitting}
//             >
//             Cancel
//             </button>
//             <button
//             type="submit"
//             onClick={(e)=>handleSubmit(e)}
//             className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
//             disabled={isSubmitting}
//             >
//             {isSubmitting ? 'Posting...' : 'Post'}
//             </button>
//         </div>
//         </form>
//     </div>
//   )
// }

// export default PostCreation

import GlobalApi from '@/app/_services/GlobalApi';
import React, { useState } from 'react';
import axios from 'axios';
import { Camera, Video, Type, X, Upload } from 'lucide-react';

const PostCreation = ({ onClose }) => {
  const [postType, setPostType] = useState('text');
  const [content, setContent] = useState('');
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);

  // Upload image to CPanel
  const uploadImageToCPanel = async (file) => {
    if (!file) return null;

    const formData = new FormData();
    formData.append('coverImage', file);
    formData.append('type', postType === 'image' ? 'photo' : 'video');

    try {
      const response = await axios.post(
        'https://wowfy.in/doutya-api/upload.php',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      if (response.data.success) {
        return response.data.filePath;
      }
      throw new Error(response.data.error);
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload media');
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      let filePath = null;

      // Upload file to CPanel if it exists
      if (file) {
        filePath = await uploadImageToCPanel(file);
        if (!filePath) {
          throw new Error('Media upload failed');
        }
      }

      // Prepare post data
      const communityId = 1; // Hardcoded for now
      const postData = {
        type: postType,
        content: content,
        communityId: communityId,
        mediaPath: filePath || null, // Send file path if available
      };

      // Get token from localStorage
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

      // Send post data to backend
      const response = await GlobalApi.AddPostToCommunity(token, postData);
      console.log('Post submitted successfully:', response.data);

      // Close the modal
      onClose();
    } catch (error) {
      console.error('Error submitting post:', error);
      setError(error.message || 'An error occurred while submitting the post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setFileName(selectedFile.name);
      
      // Create preview for images
      if (postType === 'image' && selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => setPreview(e.target.result);
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview(null);
      }
    }
  };

  // Function to clear selected file
  const clearFile = () => {
    setFile(null);
    setFileName('');
    setPreview(null);
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-xl shadow-2xl w-full border border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold text-white">Create Post</h3>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
      </div>
      
      {error && (
        <div className="bg-red-900/30 border border-red-500 text-red-200 px-4 py-2 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}
      
      {/* Post Type Selector */}
      <div className="flex gap-2 mb-6 bg-gray-800/50 p-1 rounded-lg">
        <button
          type="button"
          onClick={() => setPostType('text')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all ${
            postType === 'text' 
              ? 'bg-blue-600 text-white shadow-lg' 
              : 'text-gray-300 hover:bg-gray-700'
          }`}
        >
          <Type size={18} />
          <span>Text</span>
        </button>
        <button
          type="button"
          onClick={() => setPostType('image')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all ${
            postType === 'image' 
              ? 'bg-blue-600 text-white shadow-lg' 
              : 'text-gray-300 hover:bg-gray-700'
          }`}
        >
          <Camera size={18} />
          <span>Image</span>
        </button>
        <button
          type="button"
          onClick={() => setPostType('video')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-all ${
            postType === 'video' 
              ? 'bg-blue-600 text-white shadow-lg' 
              : 'text-gray-300 hover:bg-gray-700'
          }`}
        >
          <Video size={18} />
          <span>Video</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Content area */}
        {postType === 'text' ? (
          <div className="relative">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full p-4 bg-gray-800/70 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
              rows={6}
              required
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* File upload area */}
            {!file ? (
              <div className="bg-gray-800/70 border-2 border-dashed border-gray-600 rounded-lg p-8 text-center cursor-pointer hover:border-gray-500 transition-all">
                <input
                  type="file"
                  id="file-upload"
                  accept={postType === 'image' ? 'image/*' : 'video/*'}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                  <Upload size={40} className="text-gray-400 mb-2" />
                  <p className="text-gray-300 font-medium">
                    {postType === 'image' ? 'Upload an image' : 'Upload a video'}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Click to browse files
                  </p>
                </label>
              </div>
            ) : (
              <div className="bg-gray-800/70 border border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-gray-300 text-sm truncate max-w-xs">{fileName}</p>
                  <button 
                    type="button" 
                    onClick={clearFile}
                    className="text-gray-400 hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>
                
                {/* Image preview */}
                {preview && postType === 'image' && (
                  <div className="mt-2 flex justify-center">
                    <img 
                      src={preview} 
                      alt="Preview" 
                      className="max-h-64 rounded-lg object-contain" 
                    />
                  </div>
                )}
                
                {/* Video file name display only */}
                {postType === 'video' && !preview && (
                  <div className="flex items-center gap-2 mt-2 text-blue-400">
                    <Video size={18} />
                    <span className="text-sm">Video selected</span>
                  </div>
                )}
              </div>
            )}
            
            {/* Caption input for media posts */}
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Add a caption..."
                className="w-full p-4 bg-gray-800/70 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
                rows={3}
              />
            </div>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition duration-200 font-medium disabled:opacity-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 font-medium disabled:opacity-50 shadow-lg flex items-center gap-1"
            disabled={isSubmitting || (postType !== 'text' && !file)}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-gray-300 border-t-white rounded-full animate-spin mr-2"></div>
                <span>Posting...</span>
              </>
            ) : (
              <span>Post</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostCreation;