import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import {
  Box,
  Container,
  Grid,
  Heading,
  Text,
  VStack,
  HStack,
  Avatar,
  Badge,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Spinner,
  useColorModeValue,
  Center,
} from '@chakra-ui/react';
import { FaBuilding, FaGraduationCap, FaBriefcase, FaRupeeSign } from 'react-icons/fa';
import { app } from '../firebase/config';

const AlumniCards = () => {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const db = getFirestore(app);
  const cardBg = useColorModeValue('white', 'gray.700');
  const headerBg = useColorModeValue('gray.50', 'gray.600');
  const textColor = useColorModeValue('gray.600', 'gray.200');
  const iconColor = useColorModeValue('blue.500', 'blue.300');
  const taglineColor = useColorModeValue('green.600', 'green.200');

  useEffect(() => {
    const fetchAlumni = async () => {
      try {
        const alumniCollectionRef = collection(db, 'alumni');
        const alumniSnapshot = await getDocs(alumniCollectionRef);
        const alumniList = alumniSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAlumni(alumniList);
      } catch (error) {
        console.error("Error fetching alumni data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlumni();
  }, [db]);

  const handleBooking = (alumniId) => {
    navigate(`/booking/${alumniId}`);
  };

  const convertToRupees = (dollars) => {
    // Using an approximate conversion rate of 1 USD = 75 INR
    return Math.round(dollars * 75);
  };

  const InfoRow = ({ icon: Icon, children }) => (
    <HStack spacing={3} color={textColor}>
      <Icon color={iconColor} />
      <Text>{children}</Text>
    </HStack>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="100vh">
        <Spinner size="xl" color="blue.500" />
      </Box>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={4} mb={8}>
        <Heading textAlign="center" size="xl">
          Our Alumni Network
        </Heading>
        <Text color={taglineColor} fontSize="lg" fontWeight="medium">
          Pay only after your mentoring session is complete
        </Text>
      </VStack>
      
      <Grid
        templateColumns={{
          base: '1fr',
          md: 'repeat(2, 1fr)',
          lg: 'repeat(3, 1fr)'
        }}
        gap={6}
      >
        {alumni.map((alumnus) => (
          <Card
            key={alumnus.id}
            bg={cardBg}
            shadow="md"
            _hover={{ shadow: 'lg' }}
            transition="all 0.2s"
            overflow="hidden"
          >
            <CardHeader bg={headerBg} p={0} position="relative">
              <Box 
                bg="blue.500" 
                h="100px" 
                position="absolute" 
                top={0} 
                left={0} 
                right={0}
              />
              <Center position="relative" pt={8} pb={4} flexDirection="column">
                <Avatar
                  name={alumnus.name}
                  src={alumnus.profilePicUrl}
                  bg="blue.500"
                  color="white"
                  size="2xl"
                  border="4px solid white"
                  loading="lazy"
                />
                <VStack spacing={1} mt={3}>
                  <Heading size="md">{alumnus.name}</Heading>
                  <Text color={textColor} fontSize="md" fontWeight="medium">
                    {alumnus.jobRole}
                  </Text>
                  <Badge
                    colorScheme="blue"
                    px={3}
                    py={1}
                    borderRadius="full"
                    fontSize="sm"
                  >
                    Available for mentoring
                  </Badge>
                </VStack>
              </Center>
            </CardHeader>

            <CardBody p={6}>
              <VStack spacing={4} align="stretch">
                <InfoRow icon={FaBuilding}>
                  {alumnus.company}
                </InfoRow>
                <InfoRow icon={FaGraduationCap}>
                  {alumnus.specialization}
                </InfoRow>
                <InfoRow icon={FaBriefcase}>
                  {alumnus.experience} years experience
                </InfoRow>
                <InfoRow icon={FaRupeeSign}>
                  ₹{convertToRupees(alumnus.price)}
                </InfoRow>
              </VStack>
            </CardBody>

            <CardFooter p={4} borderTop="1px" borderColor="gray.200">
              <Button
                colorScheme="blue"
                width="full"
                size="lg"
                onClick={() => handleBooking(alumnus.id)}
                fontWeight="bold"
              >
                Start Booking
              </Button>
            </CardFooter>
          </Card>
        ))}
      </Grid>
    </Container>
  );
};

export default AlumniCards;