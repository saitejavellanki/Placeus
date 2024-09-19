import React, { useState } from 'react';
import {
  Box,
  Button,
  Input,
  Textarea,
  VStack,
  useToast,
  Heading,
} from '@chakra-ui/react';
import axios from 'axios';

const VideoUpload = () => {
  const [file, setFile] = useState(null);
  const [thumbnail, setThumbnail] = useState(null);
  const [title, setTitle] = useState('');
  const [tags, setTags] = useState('');
  const toast = useToast();

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleThumbnailChange = (e) => {
    setThumbnail(e.target.files[0]);
  };

  const handleTagsChange = (e) => {
    setTags(e.target.value);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file || !thumbnail || !title) {
      toast({
        title: "Error",
        description: "Please fill in all fields and select files.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('thumbnail', thumbnail);
    formData.append('title', title);
    formData.append('tags', JSON.stringify(tags.split(',')));

    try {
      const response = await axios.post('https://placeus-backend1.onrender.com/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      toast({
        title: "Success",
        description: "Video uploaded successfully!",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      console.log(response.data);
    } catch (error) {
      console.error("Error uploading video:", error);
      toast({
        title: "Error",
        description: "Video upload failed.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box maxW="md" mx="auto" mt={10}>
      <Heading as="h2" size="lg" mb={4}>Upload Video</Heading>
      <VStack spacing={4} as="form" onSubmit={handleUpload}>
        <Input type="file" accept="video/*" onChange={handleFileChange} required />
        <Input type="file" accept="image/*" onChange={handleThumbnailChange} required />
        <Input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <Textarea
          placeholder="Tags (comma separated)"
          value={tags}
          onChange={handleTagsChange}
        />
        <Button type="submit" colorScheme="blue">Upload</Button>
      </VStack>
    </Box>
  );
};

export default VideoUpload;
