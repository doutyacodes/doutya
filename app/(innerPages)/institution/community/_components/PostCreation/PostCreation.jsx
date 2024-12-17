import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
// import { 
//   AlertDialog, 
//   AlertDialogAction, 
//   AlertDialogCancel, 
//   AlertDialogContent, 
//   AlertDialogDescription, 
//   AlertDialogFooter, 
//   AlertDialogHeader, 
//   AlertDialogTitle, 
//   AlertDialogTrigger 
// } from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Loader2, Image, Video, Type, X, AlertTriangle } from "lucide-react";
import toast from 'react-hot-toast';
import CustomAlertDialog from '../AlertDialogue/CustomAlertDialog';

const AddPostModal = ({ onClose }) => {
  const [postType, setPostType] = useState(null);
  const [caption, setCaption] = useState('');
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isPosting, setIsPosting] = useState(false);
  const [textContent, setTextContent] = useState('');
  const [switchingType, setSwitchingType] = useState(false);
  const [pendingPostType, setPendingPostType] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleTypeSwitch = (newType) => {
    // If there's already a file or content, show confirmation
    if ((file || previewUrl) || (postType === 'text' && textContent.trim())) {
      setPendingPostType(newType);
      setSwitchingType(true);
    } else {
      // If no content, switch directly
      setPostType(newType);
    }
  };

  const confirmTypeSwitch = () => {
    // Clear existing data
    setFile(null);
    setPreviewUrl(null);
    setTextContent('');
    
    // Switch to new type
    setPostType(pendingPostType);
    
    // Reset switching state
    setSwitchingType(false);
    setPendingPostType(null);

    // Clear file input if it exists
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!postType) return;

    setIsPosting(true);
    
  // Create FormData for file uploads
  const formData = new FormData();
  
  // Add common fields
  formData.append('type', postType);
  formData.append('caption', caption);
  // formData.append('communityId', selectedCommunityId.toString()); // Assuming you have this

  // Add type-specific content
  if (postType === 'text') {
    formData.append('text', textContent);
  } else if (file) {
    formData.append('file', file);
  }

  try {      
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const response = await fetch("/api/createInstitutePost", {
      method: "POST",
      headers: {
        'Authorization': `Bearer ${token}`,  // Add the token to the Authorization header
      },
      body: formData,
    });
  
    if (!response.ok) {
      try {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to add post. Please try again.');
      } catch (parseError) {
        toast.error(`Failed to add post. Status: ${response.status}`);
      }
      setIsPosting(false);
      return;
    }
  
    const responseData = await response.json();
    resetForm();
    toast.success('Post created successfully!');
  } catch (error) {
    console.error('Post submission error', error);
    setIsPosting(false);
    toast.error('Network error occurred. Please try again.');
  }
};

  const resetForm = () => {
    setPostType(null);
    setCaption('');
    setFile(null);
    setPreviewUrl(null);
    setTextContent('');
    setIsPosting(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-8 relative">
          <button 
            onClick={onClose} 
            className="absolute top-6 right-6 text-gray-500 hover:text-gray-800"
          >
            <X size={24} />
          </button>
          
          <h2 className="text-3xl font-bold mb-8 text-center">Create a Post</h2>
          
          {/* Post Type Selection */}
          <div className="flex justify-center space-x-6 mb-8">
            {['text', 'image', 'video'].map((type) => (
              <button
                key={type}
                onClick={() => handleTypeSwitch(type)}
                className={`flex items-center space-x-3 px-5 py-3 rounded-lg text-base ${
                  postType === type 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type === 'text' && <Type size={22} />}
                {type === 'image' && <Image size={22} />}
                {type === 'video' && <Video size={22} />}
                <span className="capitalize font-medium">{type}</span>
              </button>
            ))}
          </div>

          {/* Content Input */}
          <div className="space-y-4">
            {postType === 'text' && (
              <Textarea
                placeholder="What's on your mind?"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
                className="min-h-[150px]"
              />
            )}

            {(postType === 'image' || postType === 'video') && (
              <div>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  accept={postType === 'image' ? 'image/*' : 'video/*'}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <Button 
                  variant="outline" 
                  className="w-full mb-4"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload {postType}
                </Button>

                {previewUrl && (
                  <div className="mb-4 relative">
                    {postType === 'image' ? (
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="max-h-96 w-full object-cover rounded-lg"
                      />
                    ) : (
                      <video 
                        src={previewUrl} 
                        controls 
                        className="max-h-96 w-full rounded-lg"
                      />
                    )}
                    <button 
                      onClick={() => {
                        setFile(null);
                        setPreviewUrl(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = '';
                        }
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Caption Input */}
            <Input 
              placeholder="Add a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />

            {/* Action Buttons */}
            <div className="flex space-x-4 mt-6">
              <Button 
                variant="outline" 
                className="w-full"
                onClick={resetForm}
                disabled={isPosting}
              >
                Cancel
              </Button>
              <Button 
                className="w-full" 
                onClick={handleSubmit}
                disabled={
                  isPosting || 
                  !postType || 
                  (postType === 'text' && !textContent.trim()) || 
                  (postType !== 'text' && !file)
                }
              >
                {isPosting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  'Post'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div>
      {/* Your other component content */}
      <CustomAlertDialog 
        open={switchingType}
        onClose={() => setSwitchingType(false)}
        onConfirm={confirmTypeSwitch}
        title="Change Post Type"
        description="Changing the post type will clear your current content. Are you sure you want to switch?"
      />
    </div>
    </>
  );
};

export default AddPostModal;