// pages/UploadPage.jsx
import React, { useState, useRef } from 'react';
import { 
  Box, Container, VStack, Button, Text, Progress,
  useToast, Input, Textarea, Heading,
  Center, Image
} from '@chakra-ui/react';
import { 
  ref as storageRef, 
  uploadBytesResumable, 
  getDownloadURL 
} from 'firebase/storage';
import {
  collection,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { storage, db } from '../../firebase/config';
import { Upload } from 'lucide-react';

const UploadPage = () => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [caption, setCaption] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const toast = useToast();
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Create preview
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleUpload = async () => {
    const file = fileInputRef.current.files[0];
    if (!file) {
      toast({
        title: 'Error',
        description: 'Please select a video file',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    if (!file.type.startsWith('video/')) {
      toast({
        title: 'Error',
        description: 'Please upload a video file',
        status: 'error',
        duration: 3000,
      });
      return;
    }

    try {
      setUploading(true);
      const videoRef = storageRef(storage, `reels/${Date.now()}-${file.name}`);
      const uploadTask = uploadBytesResumable(videoRef, file);

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(progress);
        },
        (error) => {
          console.error('Upload error:', error);
          setUploading(false);
          toast({
            title: 'Error',
            description: 'Failed to upload video',
            status: 'error',
            duration: 3000,
          });
        },
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          
          await addDoc(collection(db, 'reels'), {
            videoUrl: downloadURL,
            caption,
            likes: 0,
            shares: 0,
            createdAt: serverTimestamp(),
          });

          setUploading(false);
          setProgress(0);
          setCaption('');
          setPreviewUrl('');
          fileInputRef.current.value = '';
          
          toast({
            title: 'Success',
            description: 'Video uploaded successfully',
            status: 'success',
            duration: 3000,
          });
        }
      );
    } catch (error) {
      console.error('Error:', error);
      setUploading(false);
      toast({
        title: 'Error',
        description: 'Failed to upload video',
        status: 'error',
        duration: 3000,
      });
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8}>
        <Heading>Upload New Reel</Heading>
        
        <Box 
          w="full" 
          h="400px" 
          border="2px dashed" 
          borderColor="gray.300" 
          borderRadius="md"
          position="relative"
          overflow="hidden"
        >
          {previewUrl ? (
            <video
              src={previewUrl}
              controls
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <Center h="full" flexDirection="column">
              <Upload size={48} />
              <Text mt={4}>Click or drag video to upload</Text>
            </Center>
          )}
          <Input
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            ref={fileInputRef}
            position="absolute"
            top={0}
            left={0}
            w="full"
            h="full"
            opacity={0}
            cursor="pointer"
            disabled={uploading}
          />
        </Box>

        <Textarea
          placeholder="Add a caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          disabled={uploading}
        />

        {uploading && (
          <Box w="full">
            <Text mb={2}>{Math.round(progress)}% uploaded</Text>
            <Progress value={progress} size="sm" colorScheme="blue" />
          </Box>
        )}

        <Button
          colorScheme="blue"
          onClick={handleUpload}
          isLoading={uploading}
          loadingText="Uploading..."
          w="full"
        >
          Upload Reel
        </Button>
      </VStack>
    </Container>
  );
};

export default UploadPage;