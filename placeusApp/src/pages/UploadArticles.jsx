import React, { useState, useEffect } from 'react';
import { Box, Button, Container, FormControl, FormLabel, Heading, Input, Textarea, VStack, useToast, Image, SimpleGrid, IconButton, Select } from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, auth } from '../firebase/config';
import { useNavigate } from 'react-router-dom';

const ArticleUploadPage = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [images, setImages] = useState([]);
  const [codeSnippet, setCodeSnippet] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // User is signed in
        const username = user.email.split('@')[0];
        setAuthor(username);
      } else {
        // User is signed out, redirect to login page
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }));
    setImages(prevImages => [...prevImages, ...newImages]);
  };

  const removeImage = (index) => {
    setImages(prevImages => prevImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auth.currentUser) {
      toast({
        title: 'You must be logged in to upload an article',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    try {
      const imageUrls = await Promise.all(images.map(async (image) => {
        const storageRef = ref(storage, `article-images/${Date.now()}_${image.file.name}`);
        await uploadBytes(storageRef, image.file);
        return await getDownloadURL(storageRef);
      }));

      await addDoc(collection(db, 'articles'), {
        title,
        content,
        author,
        imageUrls,
        codeSnippet,
        codeLanguage,
        createdAt: new Date().toISOString(),
        userId: auth.currentUser.uid,
      });

      toast({
        title: 'Article uploaded successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setTitle('');
      setContent('');
      setImages([]);
      setCodeSnippet('');
      setCodeLanguage('javascript');
    } catch (error) {
      toast({
        title: 'Error uploading article',
        description: error.message,
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={6} align="stretch">
        <Heading as="h1" size="xl" textAlign="center">
          Upload New Article
        </Heading>
        <Box as="form" onSubmit={handleSubmit}>
          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>Title</FormLabel>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter article title" />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Author</FormLabel>
              <Input value={author} readOnly />
            </FormControl>
            <FormControl>
              <FormLabel>Images</FormLabel>
              <Input type="file" accept="image/*" onChange={handleImageChange} multiple />
              <SimpleGrid columns={3} spacing={4} mt={2}>
                {images.map((image, index) => (
                  <Box key={index} position="relative">
                    <Image src={image.preview} alt={`Preview ${index + 1}`} maxH="100px" objectFit="cover" />
                    <IconButton
                      icon={<DeleteIcon />}
                      size="sm"
                      colorScheme="red"
                      position="absolute"
                      top={0}
                      right={0}
                      onClick={() => removeImage(index)}
                    />
                  </Box>
                ))}
              </SimpleGrid>
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Content</FormLabel>
              <Textarea 
                value={content} 
                onChange={(e) => setContent(e.target.value)} 
                placeholder="Write your article content here"
                minHeight="200px"
              />
            </FormControl>
            <FormControl>
              <FormLabel>Code Snippet</FormLabel>
              <Textarea 
                value={codeSnippet} 
                onChange={(e) => setCodeSnippet(e.target.value)} 
                placeholder="Enter your code snippet here"
                minHeight="150px"
                fontFamily="monospace"
              />
            </FormControl>
            <FormControl>
              <FormLabel>Code Language</FormLabel>
              <Select value={codeLanguage} onChange={(e) => setCodeLanguage(e.target.value)}>
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
                <option value="csharp">C#</option>
                <option value="ruby">Ruby</option>
                <option value="php">PHP</option>
                <option value="swift">Swift</option>
                <option value="go">Go</option>
                <option value="rust">Rust</option>
              </Select>
            </FormControl>
            <Button type="submit" colorScheme="blue">
              Upload Article
            </Button>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
};

export default ArticleUploadPage;