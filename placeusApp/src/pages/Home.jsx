import React, { useState, useEffect } from 'react';
import {
  Box, Container, Heading, Text, SimpleGrid, Button, Input, InputGroup, InputRightElement,
  VStack, HStack, Image, Flex, Link, IconButton, Spinner, Grid,
  useColorModeValue,
  Icon
} from '@chakra-ui/react';
import { SearchIcon, StarIcon, ChevronRightIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';
import AlumniSection from '../components/Company';
import TestimonialCarousel from '../components/Testimonials';
import hero from "../assets/istockphoto-1207862144-612x612-removebg-preview.png"
import { FaInstagram, FaLinkedin, FaTwitter } from 'react-icons/fa';

const VideoCard = ({ title, instructor, rating, viewsCount, thumbnailUrl }) => (
  <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
    <Image src={thumbnailUrl || "/api/placeholder/300/200"} alt={title} objectFit="cover" h="150px" w="100%" />
    <Box p={4}>
      <Heading size="sm" mb={2} noOfLines={2}>{title || 'Untitled Video'}</Heading>
      <Text fontSize="xs" color="gray.500" mb={1}>{instructor || 'Unknown Instructor'}</Text>
      {rating !== undefined && (
        <Flex align="center" mb={1}>
          <Text fontWeight="bold" color="orange.400" mr={1}>{Number(rating).toFixed(1)}</Text>
          <Flex color="orange.400">
            {[...Array(5)].map((_, i) => (
              <StarIcon key={i} color={i < Math.floor(rating) ? "orange.400" : "gray.300"} />
            ))}
          </Flex>
          {viewsCount !== undefined && (
            <Text fontSize="xs" color="gray.500" ml={1}>({viewsCount} views)</Text>
          )}
        </Flex>
      )}
    </Box>
  </Box>
);

const CategoryCard = ({ title, videosCount, imageUrl }) => (
  <Box position="relative" overflow="hidden" borderRadius="lg">
    <Image src={imageUrl || "/api/placeholder/300/200"} alt={title} objectFit="cover" h="150px" w="100%" filter="brightness(70%)" />
    <Box position="absolute" bottom={4} left={4} color="white">
      <Heading size="sm" mb={1}>{title}</Heading>
      <Text fontSize="xs">{videosCount} videos</Text>
    </Box>
  </Box>
);

const Homepage = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const bgColor = useColorModeValue('black', 'black');
  const textColor = useColorModeValue('white', 'gray.400');
  const iconColor = useColorModeValue('white', 'black');
  const hoverColor = useColorModeValue('blue.500', 'blue.300');
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/all");
  };

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch('https://placeus-backend1.onrender.com/videos');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setVideos(data);
        setLoading(false);
      } catch (e) {
        console.error("An error occurred while fetching the videos:", e);
        setError("Failed to load videos. Please try again later.");
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const categories = [
    { id: 1, title: "Technology", videosCount: 1000, imageUrl: "/api/placeholder/300/200" },
    { id: 2, title: "Business", videosCount: 800, imageUrl: "/api/placeholder/300/200" },
    { id: 3, title: "Design", videosCount: 500, imageUrl: "/api/placeholder/300/200" },
    { id: 4, title: "Marketing", videosCount: 300, imageUrl: "/api/placeholder/300/200" },
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Box bg="gray.100" py={{ base: 6, md: 4 }}>
        <Container maxW="container.xl">
          <Flex direction={{ base: 'column', md: 'row' }} align="center" ml={{ base: 0, md: 6 }}>
            <Box flex={1} mr={{ base: 0, md: 8 }} mb={{ base: 8, md: 0 }} textAlign={{ base: 'center', md: 'left' }}>
              <Heading as="h1" size={{ base: "xl", md: "2xl" }} mb={4}>Learn from successful professionals</Heading>
              <Text fontSize={{ base: "lg", md: "xl" }} mb={6}>Gain insights and strategies from industry experts who've achieved career success</Text>
              <Button colorScheme="purple" size="lg" onClick={handleClick}>
                Explore Videos
              </Button>
            </Box>
            <Box flex={1} mt={{ base: 8, md: 0 }}>
              <Image src={hero} alt="Hero Image" borderRadius="lg" maxW="100%" h="auto" />
            </Box>
          </Flex>
        </Container>
      </Box>

      {/* Featured Videos Section */}
      <Container maxW="container.xl" py={{ base: 8, md: 7 }}>
        <Flex justify="space-between" align="center" mb={8} flexDirection={{ base: 'column', md: 'row' }}>
          <Heading as="h2" size={{ base: "lg", md: "xl" }} mb={{ base: 4, md: 0 }}>Featured Videos</Heading>
          <Button rightIcon={<ChevronRightIcon />} variant="link" colorScheme="purple" onClick={handleClick}>
            See all
          </Button>
        </Flex>
        {loading ? (
          <Flex justify="center" align="center" height="200px">
            <Spinner size="xl" color="purple.500" />
          </Flex>
        ) : error ? (
          <Text color="red.500" textAlign="center">{error}</Text>
        ) : videos.length > 0 ? (
          <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={8}>
            {videos.slice(0, 4).map((video, index) => (
              <VideoCard key={video.id || index} {...video} />
            ))}
          </SimpleGrid>
        ) : (
          <Text textAlign="center">No videos available at the moment.</Text>
        )}
      </Container>

      <AlumniSection />
      <TestimonialCarousel />

      {/* Footer */}
      <Box as="footer" bg={bgColor} py={4}>
      <Flex
        direction={{ base: 'column', md: 'row' }}
        maxW="container.xl"
        mx="auto"
        px={4}
        align="center"
        justify="space-between"
      >
        <Text color={textColor} fontSize="sm" mb={{ base: 2, md: 0 }}>
          © 2024 Placeus. All rights reserved.
        </Text>
        <Flex>
          <Link href="https://instagram.com" isExternal mx={2}>
            <Icon
              as={FaInstagram}
              w={5}
              h={5}
              color={iconColor}
              _hover={{ color: hoverColor }}
            />
          </Link>
          <Link href="https://linkedin.com" isExternal mx={2}>
            <Icon
              as={FaLinkedin}
              w={5}
              h={5}
              color={iconColor}
              _hover={{ color: hoverColor }}
            />
          </Link>
          <Link href="https://twitter.com" isExternal mx={2}>
            <Icon
              as={FaTwitter}
              w={5}
              h={5}
              color={iconColor}
              _hover={{ color: hoverColor }}
            />
          </Link>
        </Flex>
      </Flex>
    </Box>
    </Box>
  );
};

export default Homepage;