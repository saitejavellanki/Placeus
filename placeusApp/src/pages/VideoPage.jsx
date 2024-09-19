import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Box, VStack, Heading, Text, Textarea, Button, 
  Flex, Spacer, Divider, Tag, TagLabel, Wrap, useToast, Modal, ModalOverlay, 
  ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure,
  Container, Avatar, IconButton, Tooltip, useColorModeValue, HStack, useClipboard
} from '@chakra-ui/react';
import { FaTrash, FaThumbsUp, FaComment, FaEye, FaShare } from 'react-icons/fa';
import VideoPlayer from '../VideoPlayer';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc, increment, getDoc, setDoc } from 'firebase/firestore';

function VideoPage() {
  const { lessonId } = useParams();
  const playerRef = useRef(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [videoTitle, setVideoTitle] = useState('');
  const [videoTags, setVideoTags] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [user, setUser] = useState(null);
  const [viewCount, setViewCount] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const auth = getAuth();
  const db = getFirestore();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const { hasCopied, onCopy } = useClipboard(window.location.href);

  useEffect(() => {
    fetchVideo();
    fetchComments();
    fetchViewCount();

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        incrementViewCount();
      }
    });

    return () => unsubscribe();
  }, [lessonId]);

  const fetchVideo = async () => {
    try {
      const response = await fetch(`https://placeus-backend1.onrender.com/videos/${lessonId}`);
      const data = await response.json();
      setVideoUrl(data.videoUrl);
      setVideoTitle(data.title);
      setVideoTags(data.tags || []);
    } catch (error) {
      console.error("Error fetching video:", error);
      toast({
        title: "Error",
        description: "Failed to load video. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const fetchComments = async () => {
    try {
      const commentsSnapshot = await getDocs(collection(db, 'videos', lessonId, 'comments'));
      const commentsList = commentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setComments(commentsList);
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast({
        title: "Error",
        description: "Failed to load comments. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const fetchViewCount = async () => {
    try {
      const viewCountDoc = await getDoc(doc(db, 'videos', lessonId));
      if (viewCountDoc.exists()) {
        setViewCount(viewCountDoc.data().viewCount || 0);
      } else {
        setViewCount(0);
      }
    } catch (error) {
      console.error("Error fetching view count:", error);
    }
  };

  const incrementViewCount = async () => {
    try {
      const viewCountRef = doc(db, 'videos', lessonId);
      await setDoc(viewCountRef, { viewCount: increment(1) }, { merge: true });
      setViewCount(prevCount => prevCount + 1);
    } catch (error) {
      console.error("Error incrementing view count:", error);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    try {
      const commentData = {
        text: newComment,
        author: user.displayName || user.email,
        timestamp: new Date(),
      };
      await addDoc(collection(db, 'videos', lessonId, 'comments'), commentData);
      setComments([...comments, commentData]);
      setNewComment('');
      toast({
        title: "Comment added.",
        description: "Your comment has been successfully added.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error adding comment:", error);
      toast({
        title: "Error",
        description: "Failed to add comment. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!user) return;

    try {
      await deleteDoc(doc(db, 'videos', lessonId, 'comments', commentId));
      setComments(comments.filter(comment => comment.id !== commentId));
      toast({
        title: "Comment deleted.",
        description: "The comment has been successfully deleted.",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast({
        title: "Error",
        description: "Failed to delete comment. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const videoPlayerOptions = {
    controls: true,
    responsive: true,
    fluid: true,
    sources: [{ src: videoUrl, type: "video/mp4" }]
  };

  const handlePlayerReady = (player) => {
    playerRef.current = player;

    player.on('error', (e) => {
      console.error('Video Player Error:', e);
      toast({
        title: "Error",
        description: "Failed to load video. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    });
  };

  const handleShare = () => {
    onCopy();
    toast({
      title: "Link Copied!",
      description: "The video link has been copied to your clipboard.",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/login");
  };

  return (
    <Container maxW="container.xl" py={8}>
      <Flex direction={{ base: "column", lg: "row" }} gap={8}>
        {/* Video Section */}
        <Box flex="2">
          {videoUrl ? (
            <VStack align="stretch" spacing={4}>
              <Box borderRadius="lg" overflow="hidden" boxShadow="md">
                {user ? (
                  <VideoPlayer options={videoPlayerOptions} onReady={handlePlayerReady} />
                ) : (
                  <Box
                    height="300px"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    bg="gray.100"
                    color="gray.600"
                    borderRadius="lg"
                  >
                    <VStack>
                      <Text fontSize="xl" fontWeight="bold">Please log in to watch this video</Text>
                      <Button colorScheme="blue" onClick={handleClick}>
                        Log In
                      </Button>
                    </VStack>
                  </Box>
                )}
              </Box>
              <Flex justify="space-between" align="center">
                <Heading as="h1" size="lg">{videoTitle}</Heading>
                <Tooltip label="Share Video" placement="top">
                  <IconButton
                    icon={<FaShare />}
                    aria-label="Share Video"
                    onClick={handleShare}
                    colorScheme="blue"
                  />
                </Tooltip>
              </Flex>
              <Wrap spacing={2}>
                {videoTags.map((tag, index) => (
                  <Tag key={index} size="md" colorScheme="blue" borderRadius="full">
                    <TagLabel>{tag}</TagLabel>
                  </Tag>
                ))}
              </Wrap>
              <Flex align="center" color="gray.500" justify="space-between">
                <HStack>
                  <FaComment />
                  <Text ml={2}>{comments.length} Comments</Text>
                </HStack>
                <HStack>
                  <FaEye />
                  <Text ml={2}>{viewCount} Views</Text>
                </HStack>
              </Flex>
            </VStack>
          ) : (
            <Text>Loading video...</Text>
          )}
        </Box>

        {/* Comments Section */}
        <Box flex="1">
          <VStack align="stretch" spacing={4} bg={bgColor} p={4} borderRadius="lg" boxShadow="md">
            <Heading as="h2" size="lg">Comments</Heading>
            {user ? (
              <HStack as="form" onSubmit={handleAddComment} spacing={4} align="start">
                <Avatar size="sm" name={user.displayName || user.email} />
                <VStack flex={1} align="stretch" spacing={2}>
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a public comment..."
                    size="sm"
                    rows={1}
                    resize="none"
                    bg={useColorModeValue('white', 'gray.700')}
                    borderColor={borderColor}
                    _focus={{
                      borderColor: 'blue.500',
                      boxShadow: '0 0 0 1px blue.500',
                    }}
                  />
                  <Flex justify="flex-end">
                    <Button size="sm" variant="ghost" mr={2} onClick={() => setNewComment('')}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      size="sm" 
                      colorScheme="blue" 
                      isDisabled={!newComment.trim()}
                    >
                      Comment
                    </Button>
                  </Flex>
                </VStack>
              </HStack>
            ) : (
              <Text fontStyle="italic">Please log in to add comments.</Text>
            )}

            <Divider />

            <VStack spacing={4} align="stretch" maxH="600px" overflowY="auto">
              {comments.map(comment => (
                <Box key={comment.id} py={2}>
                  <Flex>
                    <Avatar size="sm" name={comment.author} mr={2} />
                    <VStack align="start" flex={1} spacing={1}>
                      <HStack>
                        <Text fontWeight="bold" fontSize="sm">{comment.author}</Text>
                        <Text fontSize="xs" color="gray.500">
                          {new Date(comment.timestamp.seconds * 1000).toLocaleString()}
                        </Text>
                      </HStack>
                      <Text fontSize="sm">{comment.text}</Text>
                      {user && comment.author === (user.displayName || user.email) && (
                        <Tooltip label="Delete comment" placement="top">
                          <IconButton
                            size="xs"
                            variant="ghost"
                            colorScheme="red"
                            icon={<FaTrash />}
                            onClick={() => handleDeleteComment(comment.id)}
                            aria-label="Delete comment"
                          />
                        </Tooltip>
                      )}
                    </VStack>
                  </Flex>
                </Box>
              ))}
            </VStack>
          </VStack>
        </Box>
      </Flex>
    </Container>
  );
}

export default VideoPage;