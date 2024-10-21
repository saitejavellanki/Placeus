import React, { useState, useEffect } from 'react';
import {
  VStack,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  useToast,
  RadioGroup,
  Radio,
  HStack,
  Text,
  Box,
  Heading,
  Container,
  Divider,
} from '@chakra-ui/react';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

function UploadExperience() {
  const [company, setCompany] = useState('');
  const [position, setPosition] = useState('');
  const [experience, setExperience] = useState('');
  const [status, setStatus] = useState('');
  const [user, setUser] = useState(null);
  const [authorName, setAuthorName] = useState('');
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        // Extract username from email
        const username = currentUser.email.split('@')[0];
        setAuthorName(username);
      } else {
        setUser(null);
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!status) {
      toast({
        title: 'Selection status is required.',
        description: "Please indicate whether you were selected or rejected.",
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    try {
      await addDoc(collection(db, 'experiences'), {
        company,
        position,
        experience,
        status,
        authorName,
        createdAt: new Date(),
        userId: user.uid
      });
      toast({
        title: 'Experience uploaded.',
        description: "We've added your interview experience.",
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      setCompany('');
      setPosition('');
      setExperience('');
      setStatus('');
    } catch (error) {
      toast({
        title: 'An error occurred.',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (!user) {
    return null; // Don't render anything if user is not logged in
  }

  return (
    <Container maxW="container.md" py={8}>
      <VStack as="form" onSubmit={handleSubmit} spacing={6} align="stretch">
        <Heading as="h1" size="xl" textAlign="center">Upload Your Interview Experience</Heading>
        <Divider />
        <FormControl isRequired>
          <FormLabel fontWeight="bold">Author</FormLabel>
          <Input 
            value={authorName}
            isReadOnly
            size="lg"
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel fontWeight="bold">Company</FormLabel>
          <Input 
            value={company} 
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Enter company name"
            size="lg"
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel fontWeight="bold">Position</FormLabel>
          <Input 
            value={position} 
            onChange={(e) => setPosition(e.target.value)}
            placeholder="Enter job position"
            size="lg"
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel fontWeight="bold">Experience</FormLabel>
          <Textarea 
            value={experience} 
            onChange={(e) => setExperience(e.target.value)}
            placeholder="Describe your interview experience..."
            size="lg"
            rows={10}
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel fontWeight="bold">Selection Status</FormLabel>
          <RadioGroup onChange={setStatus} value={status}>
            <HStack spacing={4}>
              <Radio value="selected" size="lg">Selected</Radio>
              <Radio value="rejected" size="lg">Rejected</Radio>
            </HStack>
          </RadioGroup>
        </FormControl>
        <Button type="submit" colorScheme="blue" size="lg">
          Submit Experience
        </Button>
      </VStack>
    </Container>
  );
}

export default UploadExperience;