import React, { useState } from 'react';
import axios from 'axios';
import {
  Box, Button, Input, Progress, Text, VStack, useToast, Tag, TagLabel, TagCloseButton
} from '@chakra-ui/react';

const VideoUpload = () => {
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState([]);
  const [currentTag, setCurrentTag] = useState('');
  const toast = useToast();

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('video/')) {
      setVideoFile(file);
    } else {
      toast({
        title: 'Invalid file type',
        description: 'Please select a valid video file.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setThumbnailFile(file);
    } else {
      toast({
        title: 'Invalid file type',
        description: 'Please select a valid image file.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('file', videoFile);
    formData.append('thumbnail', thumbnailFile);
    formData.append('title', title);
    formData.append('tags', JSON.stringify(tags));

    try {
      const response = await axios.post('https://placeus-backend1.onrender.com/upload', formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        },
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast({
        title: 'Upload successful!',
        description: `Video URL: ${response.data.videoUrl}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Upload failed.',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleAddTag = () => {
    if (currentTag) {
      setTags([...tags, currentTag]);
      setCurrentTag('');
    }
  };

  return (
    <Box maxW="600px" mx="auto" mt={8} p={4} borderWidth={1} borderRadius="md" boxShadow="md">
      <VStack spacing={4}>
        <Text fontSize="2xl" fontWeight="bold">Upload Video</Text>
        <Input
          placeholder="Enter title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          mb={4}
        />

        {/* Video File Upload */}
        <Box>
          <Text>Select Video File:</Text>
          <Input type="file" accept="video/*" onChange={handleVideoChange} />
          {videoFile && <Text>Selected Video: {videoFile.name}</Text>}
        </Box>

        {/* Thumbnail File Upload */}
        <Box>
          <Text>Select Thumbnail File:</Text>
          <Input type="file" accept="image/*" onChange={handleThumbnailChange} />
          {thumbnailFile && <Text>Selected Thumbnail: {thumbnailFile.name}</Text>}
        </Box>

        {/* Tags Input */}
        <Box>
          <Input
            placeholder="Add tag"
            value={currentTag}
            onChange={(e) => setCurrentTag(e.target.value)}
          />
          <Button onClick={handleAddTag} mt={2}>Add Tag</Button>

          <Box mt={2}>
            {tags.map((tag, index) => (
              <Tag size="lg" key={index} m={1}>
                <TagLabel>{tag}</TagLabel>
                <TagCloseButton onClick={() => setTags(tags.filter((t, i) => i !== index))} />
              </Tag>
            ))}
          </Box>
        </Box>

        <Button
          colorScheme="blue"
          onClick={handleUpload}
          isDisabled={!videoFile || !thumbnailFile || !title}  // Ensure both files and title are selected
        >
          Upload
        </Button>

        {uploadProgress > 0 && (
          <Progress value={uploadProgress} size="sm" width="100%" />
        )}
      </VStack>
    </Box>
  );
};

export default VideoUpload;
