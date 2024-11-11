import React from 'react';
import { 
  Box, 
  Container, 
  Heading, 
  SimpleGrid, 
  Text, 
  Image, 
  VStack,
  Button,
  useColorModeValue,
  LinkBox,
  LinkOverlay,
  Badge
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const AllArticlesPage = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const cardBg = useColorModeValue('white', 'gray.800');
  const shadowColor = useColorModeValue('gray.200', 'gray.700');

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
        setLoading(false);
      } catch (error) {
        console.error('Error fetching articles:', error);
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  const handleArticleClick = (articleId) => {
    navigate(`/article/${articleId}`);
  };

  if (loading) {
    return (
      <Container centerContent py={20}>
        <Spinner size="xl" />
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading size="xl" mb={6}>All Articles</Heading>
        
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }} spacing={6}>
          {articles.map((article) => (
            <LinkBox 
              key={article.id}
              as="article"
              cursor="pointer"
              onClick={() => handleArticleClick(article.id)}
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
              >
                <Box position="relative" width="100%" paddingBottom="56.25%">
                  <Image
                    src={article.imageUrls?.[0] || '/placeholder-image.jpg'}
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
                
                <VStack align="stretch" p={4} spacing={2}>
                  <HStack justify="space-between">
                    <Text fontSize="sm" color="gray.500">
                      By {article.author}
                    </Text>
                    <Badge colorScheme="blue">
                      {article.codeLanguage || 'Article'}
                    </Badge>
                  </HStack>
                  <Text fontSize="sm" noOfLines={2} color="gray.600">
                    {article.content}
                  </Text>
                </VStack>
              </VStack>
            </LinkBox>
          ))}
        </SimpleGrid>
      </VStack>
    </Container>
  );
};

export default AllArticlesPage;