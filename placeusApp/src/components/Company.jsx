import React from 'react';
import { Box, Container, Heading, Image, SimpleGrid, Text } from '@chakra-ui/react';
import microsoft from '../assets/download.png';
import amadeus from '../assets/Amadeus-Logo.png';
import gold from '../assets/Goldman-Sachs-Logo.png';
import google from '../assets/pngimg.com - google_PNG19644.png';
import world from '../assets/Worldline-New-Logo.png';

const AlumniSection = () => {
  const alumni = [
    { name: 'Amadeus', logo: amadeus },
    { name: 'Google', logo: google },
    { name: 'Goldman Sachs', logo: gold },
    { name: 'Worldline', logo: world },
    { name: 'Microsoft', logo: microsoft },
  ];

  return (
    <Box bg="gray.50" py={16}>
      <Container maxW="container.xl">
        <Heading as="h4" size="xl" textAlign="center" mb={12}>
          Learn the best from alumni
        </Heading>
        <SimpleGrid 
          columns={{ base: 1, sm: 2, md: 3, lg: 5 }} 
          spacing={12} 
          justifyItems="center"
        >
          {alumni.map((item, index) => (
            <Box key={index} display="flex" justifyContent="center" alignItems="center" h="100px">
              <Image 
                src={item.logo} 
                alt={item.name} 
                maxH="100px" 
                maxW="200px" 
                objectFit="contain" 
              />
            </Box>
          ))}
        </SimpleGrid>
        <Text textAlign="center" mt={12} fontSize="lg" fontStyle="italic">
          and many more...
        </Text>
      </Container>
    </Box>
  );
};

export default AlumniSection;
