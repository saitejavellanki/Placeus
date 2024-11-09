import React, { useState, useEffect, useRef } from 'react';
import { 
  Box, 
  VStack, 
  IconButton, 
  Text, 
  useColorModeValue, 
  Container, 
  Flex,
  Button, 
  Avatar,
  HStack
} from '@chakra-ui/react';
import {
  collection,
  getDocs,
  query,
  orderBy,
  updateDoc,
  doc,
  increment
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import {
  ThumbsUp,
  MessageCircle,
  Share,
  Music2,
  Upload,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DisplayPage = () => {
  const [reels, setReels] = useState([]);
  const [currentReelIndex, setCurrentReelIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const videoRefs = useRef({});
  const bgColor = useColorModeValue('black', 'black');

  useEffect(() => {
    const fetchReels = async () => {
      try {
        const q = query(collection(db, 'reels'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const fetchedReels = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setReels(fetchedReels);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching reels:', error);
        setLoading(false);
      }
    };

    fetchReels();
  }, []);

  useEffect(() => {
    // Pause all videos first
    Object.values(videoRefs.current).forEach(ref => {
      if (ref) ref.pause();
    });

    // Play the current video
    const currentVideo = videoRefs.current[currentReelIndex];
    if (currentVideo) {
      currentVideo.play().catch(error => {
        console.log('Auto-play prevented:', error);
      });
    }
  }, [currentReelIndex]);

  const handleScroll = (direction) => {
    if (direction === 'up' && currentReelIndex > 0) {
      setCurrentReelIndex(prev => prev - 1);
    } else if (direction === 'down' && currentReelIndex < reels.length - 1) {
      setCurrentReelIndex(prev => prev + 1);
    }
  };

  const handleLike = async (reelId) => {
    try {
      const reelRef = doc(db, 'reels', reelId);
      await updateDoc(reelRef, {
        likes: increment(1)
      });
      
      setReels(prevReels => 
        prevReels.map(reel => 
          reel.id === reelId 
            ? { ...reel, likes: (reel.likes || 0) + 1 }
            : reel
        )
      );
    } catch (error) {
      console.error('Error updating likes:', error);
    }
  };

  const handleShare = async (reelId) => {
    try {
      const reelRef = doc(db, 'reels', reelId);
      await updateDoc(reelRef, {
        shares: increment(1)
      });

      const shareUrl = `${window.location.origin}/reel/${reelId}`;
      await navigator.clipboard.writeText(shareUrl);
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  if (loading) {
    return (
      <Container centerContent py={8}>
        <Text color="white">Loading reels...</Text>
      </Container>
    );
  }

  if (reels.length === 0) {
    return (
      <Container centerContent py={8}>
        <Text color="white" mb={4}>No reels available</Text>
        <Button as={Link} to="/upload" colorScheme="blue">
          Upload a Reel
        </Button>
      </Container>
    );
  }

  return (
    <Box 
      bg={bgColor}
      h="100vh"
      w="100vw"
      overflow="hidden"
      position="relative"
    >
      {/* Navigation Buttons */}
      <Flex
        position="fixed"
        right="4"
        top="50%"
        transform="translateY(-50%)"
        zIndex={10}
        flexDirection="column"
        gap={2}
      >
        <IconButton
          icon={<ChevronUp size={24} />}
          onClick={() => handleScroll('up')}
          isDisabled={currentReelIndex === 0}
          colorScheme="whiteAlpha"
          variant="ghost"
          color="white"
          _hover={{ bg: 'whiteAlpha.300' }}
        />
        <IconButton
          icon={<ChevronDown size={24} />}
          onClick={() => handleScroll('down')}
          isDisabled={currentReelIndex === reels.length - 1}
          colorScheme="whiteAlpha"
          variant="ghost"
          color="white"
          _hover={{ bg: 'whiteAlpha.300' }}
        />
      </Flex>

      {/* Current Reel */}
      <Box
        h="100%"
        w="100%"
        position="relative"
      >
        <video
          ref={el => videoRefs.current[currentReelIndex] = el}
          src={reels[currentReelIndex].videoUrl}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
          loop
          playsInline
        />

        {/* Overlay Content */}
        <Flex
          position="absolute"
          bottom="0"
          left="0"
          right="0"
          p={4}
          bgGradient="linear(to-t, blackAlpha.900, blackAlpha.700, transparent)"
          color="white"
          alignItems="flex-end"
        >
          <Box flex="1" mr={4}>
            <HStack spacing={4} mb={4}>
              <Avatar 
                size="sm" 
                name={reels[currentReelIndex].userName || "User"}
                src={reels[currentReelIndex].userAvatar}
              />
              <Text fontWeight="bold">
                {reels[currentReelIndex].userName || "User"}
              </Text>
            </HStack>
            
            <Text mb={2}>{reels[currentReelIndex].caption}</Text>
            
            <HStack spacing={4} alignItems="center">
              <HStack spacing={2}>
                <Music2 size={16} />
                <Text fontSize="sm">
                  {reels[currentReelIndex].music || "Original Audio"}
                </Text>
              </HStack>
            </HStack>
          </Box>

          {/* Action Buttons */}
          <VStack spacing={4} align="center" minW="70px">
            <VStack spacing={1}>
              <IconButton
                icon={<ThumbsUp size={24} />}
                onClick={() => handleLike(reels[currentReelIndex].id)}
                variant="ghost"
                color="white"
                _hover={{ bg: 'whiteAlpha.300' }}
                aria-label="Like"
              />
              <Text fontSize="sm">{reels[currentReelIndex].likes || 0}</Text>
            </VStack>

            <VStack spacing={1}>
              <IconButton
                icon={<MessageCircle size={24} />}
                variant="ghost"
                color="white"
                _hover={{ bg: 'whiteAlpha.300' }}
                aria-label="Comment"
              />
              <Text fontSize="sm">{reels[currentReelIndex].comments || 0}</Text>
            </VStack>

            <VStack spacing={1}>
              <IconButton
                icon={<Share size={24} />}
                onClick={() => handleShare(reels[currentReelIndex].id)}
                variant="ghost"
                color="white"
                _hover={{ bg: 'whiteAlpha.300' }}
                aria-label="Share"
              />
              <Text fontSize="sm">{reels[currentReelIndex].shares || 0}</Text>
            </VStack>
          </VStack>
        </Flex>
      </Box>

      {/* Upload Button */}
      <Button
        as={Link}
        to="/upload"
        position="fixed"
        top="4"
        right="4"
        colorScheme="blue"
        leftIcon={<Upload size={20} />}
      >
        Upload New
      </Button>
    </Box>
  );
};

export default DisplayPage;