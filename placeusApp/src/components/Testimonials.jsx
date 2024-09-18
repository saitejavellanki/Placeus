import React, { useState } from 'react';
import { Box, Text, Flex, Image, Icon, VStack, HStack } from '@chakra-ui/react';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';

const testimonials = [
    {
      name: 'Avichal Gupta',
      role: 'Software Engineer (Intern)',
      company: 'JPMORGAN CHASE & CO.',
      image: '/api/placeholder/100/100',
      quote: 'I would definitely recommend this amazing platform to the juniors. It teaches you the essentials to crack any top tech interview.'
    },
    {
      name: 'Radhika Sharma',
      role: 'Data Analyst',
      company: 'GOOGLE',
      image: '/api/placeholder/100/100',
      quote: 'The structured learning paths and hands-on practice are what helped me land my dream job at Google.'
    },
    {
      name: 'Siddharth Menon',
      role: 'Full Stack Developer',
      company: 'MICROSOFT',
      image: '/api/placeholder/100/100',
      quote: 'This platform played a huge role in shaping my technical skills, especially for system design interviews.'
    },
    {
      name: 'Priya Agarwal',
      role: 'Product Manager',
      company: 'FACEBOOK',
      image: '/api/placeholder/100/100',
      quote: 'The real-world examples and mock interviews prepared me perfectly for my role at Facebook.'
    },
    {
      name: 'Rohan Verma',
      role: 'Software Engineer',
      company: 'AMAZON',
      image: '/api/placeholder/100/100',
      quote: 'I gained immense confidence after using this platform, which helped me ace my interviews at Amazon.'
    },
    {
      name: 'Ankita Patel',
      role: 'DevOps Engineer',
      company: 'IBM',
      image: '/api/placeholder/100/100',
      quote: 'The practical knowledge I acquired here was exactly what top tech companies like IBM were looking for.'
    },
    {
      name: 'Kunal Singh',
      role: 'Cloud Engineer',
      company: 'ORACLE',
      image: '/api/placeholder/100/100',
      quote: 'This platform made cloud computing concepts so simple. It was crucial in helping me secure my job at Oracle.'
    },
    {
      name: 'Neha Desai',
      role: 'Machine Learning Engineer',
      company: 'TESLA',
      image: '/api/placeholder/100/100',
      quote: 'I loved the comprehensive ML modules that got me job-ready for a challenging role at Tesla.'
    },
    {
      name: 'Akshay Kumar',
      role: 'Cybersecurity Analyst',
      company: 'CISCO',
      image: '/api/placeholder/100/100',
      quote: 'The cybersecurity courses on this platform prepared me thoroughly for my role at Cisco.'
    },
    {
      name: 'Shweta Nair',
      role: 'UI/UX Designer',
      company: 'ADOBE',
      image: '/api/placeholder/100/100',
      quote: 'The design-focused courses really helped me develop a portfolio that got noticed by Adobe.'
    },
    {
      name: 'Rahul Mehta',
      role: 'Backend Developer',
      company: 'NETFLIX',
      image: '/api/placeholder/100/100',
      quote: 'The platforms focus on backend technologies gave me a strong foundation to succeed at Netflix.'
    }
  ];

const TestimonialCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <Box py={16} bg="gray.50">
      <Box maxW="4xl" mx="auto" px={4}>
        <Flex direction="column" align="center">
          <Icon viewBox="0 0 24 24" boxSize={16} color="gray.500" mb={6}>
            <path
              fill="currentColor"
              d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"
            />
          </Icon>
          <Text fontSize="2xl" fontWeight="bold" textAlign="center" mb={6} color="blue.700">
            {testimonials[currentIndex].quote}
          </Text>
          <VStack spacing={1} align="center" mb={8}>
            <Text fontWeight="bold">{testimonials[currentIndex].name}</Text>
            <Text color="gray.500">{testimonials[currentIndex].role}</Text>
            <Text color="gray.500">{testimonials[currentIndex].company}</Text>
          </VStack>
          <HStack spacing={4}>
            <Icon
              as={ChevronLeftIcon}
              w={8}
              h={8}
              cursor="pointer"
              onClick={prevTestimonial}
            />
            <HStack spacing={2}>
              {testimonials.map((_, index) => (
                <Image
                  key={index}
                  src={testimonials[index].image}
                  alt={testimonials[index].name}
                  boxSize={index === currentIndex ? "50px" : "40px"}
                  borderRadius="full"
                  border={index === currentIndex ? "2px solid" : "none"}
                  borderColor="blue.500"
                  opacity={index === currentIndex ? 1 : 0.5}
                />
              ))}
            </HStack>
            <Icon
              as={ChevronRightIcon}
              w={8}
              h={8}
              cursor="pointer"
              onClick={nextTestimonial}
            />
          </HStack>
        </Flex>
      </Box>
    </Box>
  );
};

export default TestimonialCarousel;