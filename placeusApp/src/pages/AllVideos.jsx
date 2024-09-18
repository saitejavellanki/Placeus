import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Image,
  Text,
  VStack,
  Heading,
  Checkbox,
  Stack,
  Flex,
  Tag,
  Input,
  InputGroup,
  InputLeftElement,
  Container,
  useColorModeValue,
  Icon,
  Button,
  Badge,
} from '@chakra-ui/react';
import { Search, Star } from 'lucide-react';
import { getFirestore, collection, getDocs, onSnapshot } from 'firebase/firestore';

function AllVideos() {
  const navigate = useNavigate();
  const [videoList, setVideoList] = useState([]);
  const [filteredVideos, setFilteredVideos] = useState([]);
  const [allTags, setAllTags] = useState([]);
  const [selectedTags, setSelectedTags] = useState([]);
  const [tagSearchQuery, setTagSearchQuery] = useState('');
  const [titleSearchQuery, setTitleSearchQuery] = useState('');

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    const fetchVideosAndRatings = async () => {
      try {
        // Fetch video data
        const response = await fetch("https://placeus-backend1.onrender.com/videos");
        const videoData = await response.json();

        // Fetch initial ratings from Firestore
        const db = getFirestore();
        const ratingsSnapshot = await getDocs(collection(db, 'videos'));
        const ratingsData = {};
        ratingsSnapshot.forEach(doc => {
          ratingsData[doc.id] = doc.data();
        });

        // Combine video data with ratings
        const combinedData = videoData.map(video => ({
          ...video,
          averageRating: ratingsData[video.lessonId]?.averageRating || 0,
          totalRatings: ratingsData[video.lessonId]?.totalRatings || 0
        }));

        setVideoList(combinedData);
        setFilteredVideos(combinedData);
        const tags = [...new Set(combinedData.flatMap(video => video.tags))];
        setAllTags(tags);

        // Set up real-time listener for ratings
        const unsubscribe = onSnapshot(collection(db, 'videos'), (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === "modified") {
              const updatedVideo = change.doc.data();
              setVideoList(prevList => 
                prevList.map(video => 
                  video.lessonId === change.doc.id 
                    ? { 
                        ...video, 
                        averageRating: updatedVideo.averageRating || 0,
                        totalRatings: updatedVideo.totalRatings || 0
                      }
                    : video
                )
              );
              setFilteredVideos(prevFiltered => 
                prevFiltered.map(video => 
                  video.lessonId === change.doc.id 
                    ? { 
                        ...video, 
                        averageRating: updatedVideo.averageRating || 0,
                        totalRatings: updatedVideo.totalRatings || 0
                      }
                    : video
                )
              );
            }
          });
        });

        // Clean up the listener on component unmount
        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching videos and ratings:", error);
      }
    };

    fetchVideosAndRatings();
  }, []);

  const handleTagChange = (tag) => {
    const updatedTags = selectedTags.includes(tag)
      ? selectedTags.filter(t => t !== tag)
      : [...selectedTags, tag];
    setSelectedTags(updatedTags);
    filterVideos(updatedTags, titleSearchQuery);
  };

  const handleTagSearchChange = (event) => {
    setTagSearchQuery(event.target.value);
  };

  const handleTitleSearchChange = (event) => {
    const query = event.target.value;
    setTitleSearchQuery(query);
    filterVideos(selectedTags, query);
  };

  const filterVideos = (tags, titleQuery) => {
    let filtered = videoList;

    if (tags.length > 0) {
      filtered = filtered.filter(video => 
        video.tags.some(t => tags.includes(t))
      );
    }

    if (titleQuery) {
      filtered = filtered.filter(video =>
        video.title.toLowerCase().includes(titleQuery.toLowerCase())
      );
    }

    setFilteredVideos(filtered);
  };

  const filteredTags = allTags.filter(tag =>
    tag.toLowerCase().includes(tagSearchQuery.toLowerCase())
  );

  return (
    <Container maxW="container.xl" py={8}>
      <Flex direction={{ base: "column", lg: "row" }} gap={8}>
        {/* Filter Sidebar */}
        <Box width={{ base: "100%", lg: "18%" }} p={4} bg={bgColor} borderRadius="md" boxShadow="sm">
          <Heading size="md" mb={4}>Filter by Tags</Heading>
          
          <InputGroup mb={4}>
            <InputLeftElement pointerEvents="none">
              <Search color="gray.300" />
            </InputLeftElement>
            <Input 
              placeholder="Search tags..." 
              value={tagSearchQuery} 
              onChange={handleTagSearchChange}
            />
          </InputGroup>

          <Stack spacing={3} maxH="400px" overflowY="auto">
            {filteredTags.map(tag => (
              <Checkbox 
                key={tag} 
                isChecked={selectedTags.includes(tag)} 
                onChange={() => handleTagChange(tag)}
                colorScheme="teal"
              >
                {tag}
              </Checkbox>
            ))}
          </Stack>
        </Box>

        {/* Main Video Grid */}
        <Box width={{ base: "100%", lg: "75%" }}>
          <Heading size="lg" mb={6}>Explore Our Video Library</Heading>
          
          <InputGroup mb={6}>
            <InputLeftElement pointerEvents="none">
              <Search color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search videos by title..."
              value={titleSearchQuery}
              onChange={handleTitleSearchChange}
              size="lg"
            />
          </InputGroup>

          <Grid templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(2, 1fr)", xl: "repeat(3, 1fr)" }} gap={8}>
            {filteredVideos.length > 0 ? (
              filteredVideos.map(video => (
                <Box 
                  key={video.lessonId} 
                  onClick={() => navigate(`/video/${video.lessonId}`)} 
                  cursor="pointer" 
                  borderWidth="1px" 
                  borderRadius="lg" 
                  overflow="hidden"
                  bg={bgColor}
                  borderColor={borderColor}
                  _hover={{ boxShadow: "xl", transform: "translateY(-4px)" }}
                  transition="all 0.3s ease"
                >
                  <Image 
                    src={video.thumbnailUrl} 
                    alt={video.lessonId} 
                    width="100%" 
                    height="200px"
                    objectFit="cover"
                  />
                  <VStack align="start" p={4} spacing={2}>
                    <Heading size="md" noOfLines={2}>{video.title || video.lessonId}</Heading>
                    <Text fontSize="sm" color="gray.500" noOfLines={2}>
                      {video.description}
                    </Text>
                    <Flex align="center" width="100%">
                      <Icon as={Star} color="yellow.400" mr={1} />
                      <Text fontWeight="bold" mr={2}>{video.averageRating.toFixed(1)}</Text>
                      
                    </Flex>
                    
                    <Stack direction="row" spacing={2} mt={2} flexWrap="wrap">
                      {video.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} colorScheme="teal" variant="subtle">
                          {tag}
                        </Badge>
                      ))}
                    </Stack>
                  </VStack>
                </Box>
              ))
            ) : (
              <Text>No videos available</Text>
            )}
          </Grid>
          {filteredVideos.length > 0 && (
            <Flex justify="center" mt={8}>
              <Button colorScheme="teal" size="lg">Load More</Button>
            </Flex>
          )}
        </Box>
      </Flex>
    </Container>
  );
}

export default AllVideos;