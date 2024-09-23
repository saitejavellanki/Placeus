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
  Text
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

  // Check if user is logged in
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
        navigate('/login'); // Redirect to login page
      }
    });

    // Cleanup subscription on unmount
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
        userId: user.uid // Include user ID to track who uploaded the experience
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

  // Display the form only if the user is logged in
  return user ? (
    <VStack as="form" onSubmit={handleSubmit} spacing={4} align="stretch">
      <FormControl isRequired>
        <FormLabel>Company</FormLabel>
        <Input value={company} onChange={(e) => setCompany(e.target.value)} />
      </FormControl>
      <FormControl isRequired>
        <FormLabel>Position</FormLabel>
        <Input value={position} onChange={(e) => setPosition(e.target.value)} />
      </FormControl>
      <FormControl isRequired>
        <FormLabel>Experience</FormLabel>
        <Textarea value={experience} onChange={(e) => setExperience(e.target.value)} />
      </FormControl>
      <FormControl isRequired>
        <FormLabel>Selection Status</FormLabel>
        <RadioGroup onChange={setStatus} value={status}>
          <HStack spacing={4}>
            <Radio value="selected">Selected</Radio>
            <Radio value="rejected">Rejected</Radio>
          </HStack>
        </RadioGroup>
      </FormControl>
      <Button type="submit" colorScheme="blue">Submit</Button>
    </VStack>
  ) : (
    <Text>You must be logged in to upload your experience.</Text>
  );
}

export default UploadExperience;
