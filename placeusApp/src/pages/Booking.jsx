import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getFirestore, doc, getDoc, collection, addDoc } from 'firebase/firestore';
import {
  Container,
  Box,
  Heading,
  VStack,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  Button,
  useToast,
  Card,
  CardBody,
  HStack,
  Avatar,
  Text,
  Divider,
  FormErrorMessage,
} from '@chakra-ui/react';
import { app } from '../firebase/config';

const BookingPage = () => {
  const { alumniId } = useParams();
  const [alumni, setAlumni] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState({
    name: '', // Added name field
    date: '',
    time: '',
    duration: '1',
    topic: '',
    message: '',
    phoneNumber: '',
  });
  const [phoneError, setPhoneError] = useState('');
  const toast = useToast();
  const db = getFirestore(app);

  useEffect(() => {
    const fetchAlumniDetails = async () => {
      try {
        const alumniDoc = await getDoc(doc(db, 'alumni', alumniId));
        if (alumniDoc.exists()) {
          setAlumni({ id: alumniDoc.id, ...alumniDoc.data() });
        }
      } catch (error) {
        console.error("Error fetching alumni details:", error);
        toast({
          title: "Error",
          description: "Failed to load alumni details",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAlumniDetails();
  }, [alumniId, db, toast]);

  const validatePhoneNumber = (phone) => {
    // Basic phone number validation
    const phoneRegex = /^\+?[\d\s-()]{10,}$/;
    return phoneRegex.test(phone);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phoneNumber') {
      setPhoneError('');
      // Remove any non-numeric characters except +, (, ), -, and spaces
      const sanitizedValue = value.replace(/[^\d\s+()-]/g, '');
      setBookingData(prev => ({
        ...prev,
        [name]: sanitizedValue
      }));
    } else {
      setBookingData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate phone number before submission
    if (!validatePhoneNumber(bookingData.phoneNumber)) {
      setPhoneError('Please enter a valid phone number');
      return;
    }

    try {
      const bookingsRef = collection(db, 'bookings');
      await addDoc(bookingsRef, {
        alumniId,
        alumniName: alumni.name,
        alumniRole: alumni.jobRole,
        company: alumni.company,
        price: alumni.price,
        ...bookingData,
        status: 'pending',
        createdAt: new Date().toISOString(),
      });
      
      toast({
        title: "Booking Submitted",
        description: "Your booking request has been sent to the mentor",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error saving booking:", error);
      toast({
        title: "Error",
        description: "Failed to submit booking",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  if (loading) {
    return <Box>Loading...</Box>;
  }

  if (!alumni) {
    return <Box>Mentor not found</Box>;
  }

  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        <Card>
          <CardBody>
            <HStack spacing={4}>
              <Avatar
                name={alumni.name}
                bg="blue.500"
                color="white"
                size="lg"
              />
              <VStack align="start" spacing={1}>
                <Heading size="md">{alumni.name}</Heading>
                <Text color="gray.600">{alumni.jobRole} at {alumni.company}</Text>
                <Text color="blue.500">Rs.{alumni.price}</Text>
              </VStack>
            </HStack>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <VStack spacing={4} as="form" onSubmit={handleSubmit}>
              <Heading size="md" alignSelf="start">Booking Details</Heading>
              <Divider />
              
              <FormControl isRequired>
                <FormLabel>Your Name</FormLabel>
                <Input
                  name="name"
                  value={bookingData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Date</FormLabel>
                <Input
                  type="date"
                  name="date"
                  value={bookingData.date}
                  onChange={handleInputChange}
                  min={new Date().toISOString().split('T')[0]}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Time</FormLabel>
                <Input
                  type="time"
                  name="time"
                  value={bookingData.time}
                  onChange={handleInputChange}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Duration (hours)</FormLabel>
                <Select
                  name="duration"
                  value={bookingData.duration}
                  onChange={handleInputChange}
                >
                  <option value="1">1 hour</option>
                  <option value="1.5">1.5 hours</option>
                  <option value="2">2 hours</option>
                </Select>
              </FormControl>

              <FormControl isRequired isInvalid={!!phoneError}>
                <FormLabel>Phone Number</FormLabel>
                <Input
                  name="phoneNumber"
                  value={bookingData.phoneNumber}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  type="tel"
                />
                <FormErrorMessage>{phoneError}</FormErrorMessage>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Topic</FormLabel>
                <Input
                  name="topic"
                  value={bookingData.topic}
                  onChange={handleInputChange}
                  placeholder="What would you like to discuss?"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Message to Mentor</FormLabel>
                <Textarea
                  name="message"
                  value={bookingData.message}
                  onChange={handleInputChange}
                  placeholder="Any specific questions or areas you'd like to focus on?"
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                size="lg"
                width="full"
                mt={4}
              >
                Confirm Booking
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
};

export default BookingPage;