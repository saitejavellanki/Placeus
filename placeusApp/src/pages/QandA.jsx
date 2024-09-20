import React, { useState, useEffect } from 'react';
import { Box, VStack, HStack, Input, Button, Text, Textarea, useToast, Heading, Divider, Flex, Badge, Container, InputGroup, InputLeftElement } from '@chakra-ui/react';
import { collection, addDoc, query, orderBy, onSnapshot, doc, updateDoc, arrayUnion, increment, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase/config';
import { SearchIcon } from '@chakra-ui/icons';
import { getAuth } from "firebase/auth";

const TruncatedText = ({ text, maxLines = 3 }) => {
  const [isTruncated, setIsTruncated] = useState(true);
  const toggleTruncate = () => setIsTruncated(!isTruncated);

  return (
    <>
      <Text
        noOfLines={isTruncated ? maxLines : undefined}
        mb={2}
      >
        {text}
      </Text>
      {text.split('\n').length > maxLines && (
        <Button size="xs" onClick={toggleTruncate} variant="link" colorScheme="blue">
          {isTruncated ? 'Show More' : 'Show Less'}
        </Button>
      )}
    </>
  );
};

const QAPage = () => {
  const [questions, setQuestions] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [userVotes, setUserVotes] = useState({});
  const toast = useToast();

  const auth = getAuth();
  const currentUserId = auth.currentUser ? auth.currentUser.uid : null;

  useEffect(() => {
    const q = query(collection(db, 'questions'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const questionsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setQuestions(questionsData);
      setFilteredQuestions(questionsData);
    });

    const savedVotes = localStorage.getItem('userVotes');
    if (savedVotes) {
      setUserVotes(JSON.parse(savedVotes));
    }

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const filtered = questions.filter(question =>
      question.text.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredQuestions(filtered);
  }, [searchQuery, questions]);

  const handleAskQuestion = async () => {
    if (newQuestion.trim() === '') {
      toast({
        title: 'Error',
        description: 'Question cannot be empty',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await addDoc(collection(db, 'questions'), {
        text: newQuestion,
        createdAt: new Date(),
        answers: [],
        votes: 0,
        votedBy: []
      });
      setNewQuestion('');
      toast({
        title: 'Success',
        description: 'Question posted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error adding question: ", error);
      toast({
        title: 'Error',
        description: 'Failed to post question',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleReply = async (questionId) => {
    if (replyText.trim() === '') {
      toast({
        title: 'Error',
        description: 'Reply cannot be empty',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const questionRef = doc(db, 'questions', questionId);
      await updateDoc(questionRef, {
        answers: arrayUnion({
          id: Date.now().toString(),
          text: replyText,
          createdAt: new Date(),
          votes: 0,
          votedBy: []
        })
      });
      setReplyText('');
      setReplyingTo(null);
      toast({
        title: 'Success',
        description: 'Reply posted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Error adding reply: ", error);
      toast({
        title: 'Error',
        description: 'Failed to post reply',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleVote = async (questionId, answerId = null, voteValue) => {
    if (!currentUserId) {
      toast({
        title: 'Error',
        description: 'You must be logged in to vote',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
  
    const voteKey = `${questionId}${answerId ? `-${answerId}` : ''}`;
    if (userVotes[voteKey]) {
      toast({
        title: 'Error',
        description: 'You have already voted on this item',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
  
    try {
      const questionRef = doc(db, 'questions', questionId);
      if (answerId === null) {
        await updateDoc(questionRef, {
          votes: increment(voteValue),
          votedBy: arrayUnion(currentUserId)
        });
      } else {
        const question = questions.find(q => q.id === questionId);
        const updatedAnswers = question.answers.map(answer => 
          answer.id === answerId 
            ? { ...answer, votes: (answer.votes || 0) + voteValue, votedBy: [...(answer.votedBy || []), currentUserId] }
            : answer
        );
        await updateDoc(questionRef, { answers: updatedAnswers });
      }
  
      setUserVotes(prev => ({...prev, [voteKey]: true}));
      localStorage.setItem('userVotes', JSON.stringify({...userVotes, [voteKey]: true}));
  
    } catch (error) {
      console.error("Error updating vote: ", error);
      toast({
        title: 'Error',
        description: 'Failed to update vote',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
    <Container maxWidth="95%" px={[2, 4, 6]}>
      <Flex direction={{ base: 'column', md: 'row' }}>
        <Box flex={1} mr={{ base: 0, md: 6 }} mb={{ base: 6, md: 0 }}>
          <Heading as="h1" size="xl" mt={5} mb={2} textAlign="left">Q&A Forum</Heading>
          
          <Box mb={2}>
            <Heading as="h2" size="sm" mb={3}>Ask a Question</Heading>
            <HStack spacing={2}>
              <Textarea
                placeholder="Type your question here..."
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
                mb={2}
                size="sm"
                resize="vertical"
                minHeight="50px"
              />
              <Button colorScheme="blue" onClick={handleAskQuestion} size="sm" width="auto">
                Post
              </Button>
            </HStack>
          </Box>

          <InputGroup mb={4}>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>

          <Divider mb={1} />
          <VStack spacing={1} align="stretch">
            {filteredQuestions.map((question) => (
              <Box key={question.id} borderWidth={1} p={3} borderRadius="md" boxShadow="sm">
                <Flex>
                  <Flex flexDirection="column" alignItems="center" mr={3}>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleVote(question.id, null, 1)}
                      isDisabled={userVotes[question.id]}
                    >
                      ▲
                    </Button>
                    <Text fontWeight="bold">{question.votes || 0}</Text>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      onClick={() => handleVote(question.id, null, -1)}
                      isDisabled={userVotes[question.id]}
                    >
                      ▼
                    </Button>
                  </Flex>
                  <Box flex={1}>
                    <Heading as="h3" size="sm" mb={2}>
                      <TruncatedText text={question.text} maxLines={2} />
                    </Heading>
                    <HStack spacing={2} mb={3}>
                      <Badge colorScheme="green" fontSize="xs">Asked</Badge>
                      <Text fontSize="xs" color="gray.500">
                        {question.createdAt?.toDate().toLocaleString() || 'Unknown date'}
                      </Text>
                    </HStack>
                    <Divider mb={3} />
                    {question.answers && question.answers.map((answer) => (
                      <Box key={answer.id} ml={2} mt={3} pb={3} borderBottomWidth={1}>
                        <Flex>
                          <Flex flexDirection="column" alignItems="center" mr={3}>
                            <Button 
                              size="xs" 
                              variant="ghost" 
                              onClick={() => handleVote(question.id, answer.id, 1)}
                              isDisabled={userVotes[`${question.id}-${answer.id}`]}
                            >
                              ▲
                            </Button>
                            <Text fontSize="sm" fontWeight="bold">{answer.votes || 0}</Text>
                            <Button 
                              size="xs" 
                              variant="ghost" 
                              onClick={() => handleVote(question.id, answer.id, -1)}
                              isDisabled={userVotes[`${question.id}-${answer.id}`]}
                            >
                              ▼
                            </Button>
                          </Flex>
                          <Box flex={1}>
                            <TruncatedText text={answer.text} maxLines={3} />
                            <HStack spacing={2}>
                              <Badge colorScheme="blue" fontSize="xs">Answered</Badge>
                              <Text fontSize="xs" color="gray.500">
                                {answer.createdAt?.toDate().toLocaleString() || 'Unknown date'}
                              </Text>
                            </HStack>
                          </Box>
                        </Flex>
                      </Box>
                    ))}
                    {replyingTo === question.id ? (
                      <Box mt={3}>
                        <Textarea
                          placeholder="Write your answer..."
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          mb={2}
                          size="sm"
                          resize="vertical"
                        />
                        <Button colorScheme="green" size="sm" mr={2} onClick={() => handleReply(question.id)}>
                          Post Your Answer
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>
                          Cancel
                        </Button>
                      </Box>
                    ) : (
                      <Button mt={3} colorScheme="blue" variant="outline" size="sm" onClick={() => setReplyingTo(question.id)}>
                        Add an Answer
                      </Button>
                    )}
                  </Box>
                </Flex>
              </Box>
            ))}
          </VStack>
        </Box>

        <Box width={{ base: '100%', md: '25%' }} p={1} pt={10}>
          <Heading as="h2" size="md" mb={4}>Latest News</Heading>
          <Box mb={4} borderWidth={1} p={2} borderRadius="md" boxShadow="sm">
            <Heading as="h3" size="sm" mb={2}>NASA's Artemis I Moon Mission Successfully Launches</Heading>
            <Text fontSize="sm">NASA's Artemis I mission has successfully launched, marking a significant milestone in the agency's efforts to return humans to the Moon. The mission aims to test new technologies and systems that will be crucial for future lunar exploration.</Text>
          </Box>
          <Box borderWidth={1} p={4} borderRadius="md" boxShadow="sm">
            <Heading as="h3" size="sm" mb={2}>Global Tech Conference Unveils New AI Innovations</Heading>
            <Text fontSize="sm">The Global Tech Conference has unveiled a series of groundbreaking AI innovations. Key announcements include advancements in machine learning algorithms and new tools for AI-powered data analysis, promising to reshape various industries.</Text>
          </Box>
        </Box>
      </Flex>
    </Container>
  );
};

export default QAPage;