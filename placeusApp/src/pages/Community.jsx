import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  VStack,
  Button,
  Text,
  useToast,
  Input,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Container,
  Flex
} from '@chakra-ui/react';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const CommunityEventsPage = () => {
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [name, setName] = useState('');
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [registeredEvents, setRegisteredEvents] = useState({});
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchUserRegistrations(currentUser.uid);
      }
    });

    fetchEvents();

    return () => unsubscribe();
  }, []);

  const fetchEvents = async () => {
    const eventsCollection = collection(db, 'events');
    const eventsSnapshot = await getDocs(eventsCollection);
    const eventsList = eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setEvents(eventsList);
  };

  const fetchUserRegistrations = async (userId) => {
    const registrationsQuery = query(collection(db, 'registrations'), where('userId', '==', userId));
    const registrationsSnapshot = await getDocs(registrationsQuery);
    const userRegistrations = {};
    registrationsSnapshot.forEach(doc => {
      userRegistrations[doc.data().eventId] = true;
    });
    setRegisteredEvents(userRegistrations);
  };

  const handleRegisterClick = (eventId) => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You must be logged in to register for an event.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    if (registeredEvents[eventId]) {
      toast({
        title: "Already registered",
        description: "You have already registered for this event.",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    setSelectedEventId(eventId);
    onOpen();
  };

  const handleRegister = async () => {
    if (!name.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name to register.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await addDoc(collection(db, 'registrations'), {
        userId: user.uid,
        eventId: selectedEventId,
        name: name.trim(),
        timestamp: new Date()
      });
      toast({
        title: "Registration successful",
        description: "You have been registered for the event.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
      setName('');
      setRegisteredEvents(prev => ({...prev, [selectedEventId]: true}));
    } catch (error) {
      console.error("Error registering for event:", error);
      toast({
        title: "Registration failed",
        description: "There was an error registering for the event. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Box>
      <Box
        backgroundImage="url('https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1600&q=80')"
        backgroundSize="cover"
        backgroundPosition="center"
        height={["200px", "200px", "200px"]}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Box
          backgroundColor="rgba(0, 0, 0, 0.6)"
          padding={6}
          borderRadius="md"
        >
          <Heading
            as="h1"
            size={["xl", "2xl", "3xl"]}
            color="white"
            textAlign="center"
          >
            Community Events
          </Heading>
        </Box>
      </Box>

      <Container maxW="800px" py={8}>
        <VStack spacing={6} align="stretch">
          {events.length > 0 ? (
            events.map((event) => (
              <Box key={event.id} borderWidth={1} borderRadius="lg" padding={4} boxShadow="md">
                <Heading as="h2" size="lg">{event.title}</Heading>
                <Text mt={2}>{event.description}</Text>
                <Text fontWeight="bold" mt={2}>Date: {event.date}</Text>
                <Flex justifyContent="space-between" alignItems="center" mt={4}>
                  <Text fontSize="sm" color="gray.500">
                    {registeredEvents[event.id] ? "You're registered!" : "Spots available"}
                  </Text>
                  <Button
                    colorScheme={registeredEvents[event.id] ? "green" : "blue"}
                    onClick={() => handleRegisterClick(event.id)}
                    isDisabled={registeredEvents[event.id]}
                  >
                    {registeredEvents[event.id] ? "Registered" : "Register"}
                  </Button>
                </Flex>
              </Box>
            ))
          ) : (
            <Text fontSize="xl" textAlign="center">No events available at the moment. Stay tuned!</Text>
          )}
        </VStack>
      </Container>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Register for Event</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Your Name</FormLabel>
              <Input 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="Enter your name"
              />
            </FormControl>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleRegister}>
              Register
            </Button>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default CommunityEventsPage;