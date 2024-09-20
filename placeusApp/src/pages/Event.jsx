import React, { useState } from 'react';
import { Box, Button, FormControl, FormLabel, Input, Textarea, VStack, useToast } from '@chakra-ui/react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from "../firebase/config";

const EventUploadForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await addDoc(collection(db, 'events'), {
        title,
        description,
        date,
        createdAt: new Date()
      });

      toast({
        title: 'Event Created',
        description: 'Your event has been successfully added.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Clear form
      setTitle('');
      setDescription('');
      setDate('');
    } catch (error) {
      console.error('Error adding event: ', error);
      toast({
        title: 'Error',
        description: 'There was an error creating the event. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box maxWidth="500px" margin="auto" padding={8}>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl isRequired>
            <FormLabel>Event Title</FormLabel>
            <Input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter event title"
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Event Description</FormLabel>
            <Textarea 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter event description"
            />
          </FormControl>
          <FormControl isRequired>
            <FormLabel>Event Date</FormLabel>
            <Input 
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </FormControl>
          <Button 
            type="submit" 
            colorScheme="blue" 
            isLoading={isLoading}
            loadingText="Submitting"
          >
            Create Event
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default EventUploadForm;