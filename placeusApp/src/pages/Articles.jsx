import React, { useState, useEffect } from 'react';
import { 
  Box, Container, Heading, Text, VStack, HStack, Divider, Spinner, Image, 
  Flex, LinkBox, LinkOverlay, SimpleGrid, useColorModeValue, Input, InputGroup, InputLeftElement,
  useDisclosure, Drawer, DrawerBody, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton,
  Button, Badge, Tab, TabList, TabPanel, TabPanels, Tabs, IconButton
} from '@chakra-ui/react';
import { SearchIcon, HamburgerIcon, ViewIcon, ViewOffIcon } from '@chakra-ui/icons';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useNavigate } from 'react-router-dom';

const ArticleDisplayPage = () => {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const cardBg = useColorModeValue('white', 'gray.800');
  const shadowColor = useColorModeValue('gray.200', 'gray.700');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const q = query(collection(db, 'articles'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        const fetchedArticles = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setArticles(fetchedArticles);
        setFilteredArticles(fetchedArticles);
        setSelectedArticle(fetchedArticles[0]);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching articles:', error);
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  useEffect(() => {
    const filtered = articles.filter(article =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredArticles(filtered);
    if (viewMode === 'list') {
      setSelectedArticle(filtered[0] || null);
    }
  }, [searchTerm, articles, viewMode]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const formatDate = (dateValue) => {
    if (!dateValue) return 'Unknown date';
    
    let date;
    if (typeof dateValue === 'string') {
      date = new Date(dateValue);
    } else if (dateValue instanceof Date) {
      date = dateValue;
    } else if (typeof dateValue.toDate === 'function') {
      date = dateValue.toDate();
    } else {
      return 'Invalid date';
    }
    
    return date.toLocaleDateString();
  };

  const GridView = () => (
    <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
      {filteredArticles.map((article) => (
        <LinkBox 
          key={article.id}
          as="article"
          cursor="pointer"
          onClick={() => setSelectedArticle(article)}
        >
          <VStack
            spacing={3}
            bg={cardBg}
            borderRadius="lg"
            overflow="hidden"
            boxShadow={`0 4px 6px ${shadowColor}`}
            transition="transform 0.2s"
            _hover={{
              transform: 'scale(1.02)',
            }}
            height="100%"
          >
            <Box position="relative" width="100%" paddingBottom="56.25%">
              <Image
                src={article.imageUrls?.[0] || 'https://via.placeholder.com/300x200'}
                alt={article.title}
                position="absolute"
                top={0}
                left={0}
                width="100%"
                height="100%"
                objectFit="cover"
              />
              <Box
                position="absolute"
                bottom={0}
                left={0}
                right={0}
                bg="rgba(0,0,0,0.7)"
                p={4}
                background="linear-gradient(to top, rgba(0,0,0,0.8), transparent)"
              >
                <Text color="white" fontSize="lg" fontWeight="bold" noOfLines={2}>
                  {article.title}
                </Text>
              </Box>
            </Box>
            
            <VStack align="stretch" p={4} spacing={2} flex={1}>
              <HStack justify="space-between">
                <Text fontSize="sm" color="gray.500">
                  By {article.author}
                </Text>
                <Badge colorScheme="blue">
                  {article.codeLanguage || 'Article'}
                </Badge>
              </HStack>
              <Text fontSize="sm" noOfLines={3} color="gray.600" flex={1}>
                {article.content}
              </Text>
              <Text fontSize="xs" color="gray.500">
                {formatDate(article.createdAt)}
              </Text>
            </VStack>
          </VStack>
        </LinkBox>
      ))}
    </SimpleGrid>
  );

  const Sidebar = () => (
    <VStack align="stretch" spacing={4}>
      <HStack justify="space-between">
        <Heading as="h2" size="md">
          Articles
        </Heading>
        <HStack>
          <IconButton
            icon={<ViewOffIcon />}
            aria-label="List view"
            size="sm"
            colorScheme={viewMode === 'list' ? 'blue' : 'gray'}
            onClick={() => setViewMode('list')}
          />
          <IconButton
            icon={<ViewIcon />}
            aria-label="Grid view"
            size="sm"
            colorScheme={viewMode === 'grid' ? 'blue' : 'gray'}
            onClick={() => setViewMode('grid')}
          />
        </HStack>
      </HStack>
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="gray.300" />
        </InputLeftElement>
        <Input
          type="text"
          placeholder="Search articles..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </InputGroup>
      {viewMode === 'list' && (
        <VStack align="stretch" spacing={2} maxHeight="calc(100vh - 200px)" overflowY="auto">
          {filteredArticles.map((article) => (
            <LinkBox key={article.id} as="article" p={2} borderRadius="md" _hover={{ bg: 'gray.100' }}>
              <LinkOverlay 
                href="#" 
                onClick={() => {
                  setSelectedArticle(article);
                  onClose();
                }}
              >
                <Text fontWeight={selectedArticle?.id === article.id ? "bold" : "normal"}>
                  {article.title}
                </Text>
              </LinkOverlay>
            </LinkBox>
          ))}
        </VStack>
      )}
    </VStack>
  );

  const DetailView = () => (
    selectedArticle ? (
      <VStack align="stretch" spacing={6}>
        <Heading as="h1" size="xl">
          {selectedArticle.title}
        </Heading>
        <HStack spacing={4} flexWrap="wrap">
          <Text fontSize="sm" color="gray.500">
            By {selectedArticle.author}
          </Text>
          <Text fontSize="sm" color="gray.500">
            {formatDate(selectedArticle.createdAt)}
          </Text>
        </HStack>
        {selectedArticle.imageUrls && selectedArticle.imageUrls.length > 0 && (
          <SimpleGrid columns={[1, 2, 3]} spacing={4}>
            {selectedArticle.imageUrls.map((url, index) => (
              <Image key={index} src={url} alt={`Article image ${index + 1}`} maxH="300px" objectFit="cover" />
            ))}
          </SimpleGrid>
        )}
        <Divider />
        <Text whiteSpace="pre-wrap">{selectedArticle.content}</Text>
        {selectedArticle.codeSnippet && (
          <Box>
            <Heading as="h3" size="md" mb={2}>
              Code Snippet
            </Heading>
            <Box borderRadius="md" overflow="hidden">
              <SyntaxHighlighter 
                language={selectedArticle.codeLanguage || 'javascript'}
                style={tomorrow}
                customStyle={{
                  margin: 0,
                  padding: '1rem',
                  backgroundColor: bgColor,
                }}
              >
                {selectedArticle.codeSnippet}
              </SyntaxHighlighter>
            </Box>
          </Box>
        )}
      </VStack>
    ) : (
      <Text>No article selected or found. Please try a different search term.</Text>
    )
  );

  if (loading) {
    return (
      <Container centerContent>
        <Spinner size="xl" />
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Flex direction={{ base: 'column', md: 'row' }}>
        {/* Mobile Drawer */}
        <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>Articles</DrawerHeader>
            <DrawerBody>
              <Sidebar />
            </DrawerBody>
          </DrawerContent>
        </Drawer>

        {/* Desktop Sidebar */}
        <Box display={{ base: 'none', md: 'block' }} width="300px" borderRight="1px" borderColor="gray.200" pr={4}>
          <Sidebar />
        </Box>

        {/* Main content */}
        <Box flex={1} pl={{ base: 0, md: 8 }} mt={{ base: 4, md: 0 }}>
          {/* Mobile menu button */}
          <Button 
            display={{ base: 'block', md: 'none' }} 
            onClick={onOpen} 
            leftIcon={<HamburgerIcon />} 
            mb={4}
          >
            Open Articles List
          </Button>

          {viewMode === 'grid' ? <GridView /> : <DetailView />}
        </Box>
      </Flex>
    </Container>
  );
};

export default ArticleDisplayPage;