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
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
        toast({
          title: 'Authentication required',
          description: "You must be logged in to upload your experience.",
          status: 'warning',
          duration: 5000,
          isClosable: true,
        });
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [toast, navigate]);

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

  return user ? (
    <Container maxW="container.md" py={8}>
      <VStack as="form" onSubmit={handleSubmit} spacing={6} align="stretch">
        <Heading as="h1" size="xl" textAlign="center">Upload Your Interview Experience</Heading>
        <Divider />
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
  ) : (
    <Container centerContent>
      <Box padding="4" bg="red.100" color="red.500" borderRadius="md">
        <Text fontSize="lg">You must be logged in to upload your experience.</Text>
      </Box>
    </Container>
  );
}

export default UploadExperience;