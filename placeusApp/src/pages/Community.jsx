import React from 'react';
import { Box, Heading, Text, Button, VStack, useColorModeValue } from '@chakra-ui/react';

function ComingSoonPage() {
  const background = useColorModeValue("gray.100", "gray.900");
  const textColor = useColorModeValue("gray.800", "white");

  return (
    <Box 
      height="100vh" 
      display="flex" 
      justifyContent="center" 
      alignItems="center" 
      bg={background}
    >
      <VStack spacing={4} textAlign="center">
        <Heading 
          as="h1" 
          size="2xl" 
          fontWeight="bold" 
          color={textColor}
          animation="fadeIn 2s ease-in-out"
        >
          Coming Soon
        </Heading>
        <Text fontSize="lg" color={textColor} opacity="0.7">
          We’re working hard to finish the development of this page.
        </Text>
        <Text fontSize="md" color={textColor} opacity="0.6">
          Stay tuned for something amazing!
        </Text>
        <Button 
          size="lg" 
          colorScheme="blue" 
          variant="solid" 
          onClick={() => alert('You will be notified soon!')}
        >
          Notify Me
        </Button>
      </VStack>

      <style jsx>{`
        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
      `}</style>
    </Box>
  );
}

export default ComingSoonPage;
