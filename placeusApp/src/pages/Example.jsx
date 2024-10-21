import React, { useState } from 'react';
import { Box, Text, Flex, VStack, useColorModeValue } from '@chakra-ui/react';

const roadmapData = {
  name: 'SDE Roadmap',
  children: [
    {
      name: 'Fundamentals',
      children: [
        { name: 'Data Structures' },
        { name: 'Algorithms' },
        { name: 'Computer Science Basics' },
      ],
    },
    {
      name: 'Programming Languages',
      children: [
        { name: 'JavaScript' },
        { name: 'Python' },
        { name: 'Java' },
      ],
    },
    {
      name: 'Web Development',
      children: [
        { name: 'HTML/CSS' },
        { name: 'Frontend Frameworks' },
        { name: 'Backend Development' },
      ],
    },
    {
      name: 'Advanced Topics',
      children: [
        { name: 'System Design' },
        { name: 'DevOps' },
        { name: 'Cloud Computing' },
      ],
    },
  ],
};

const TreeNode = ({ node, depth = 0 }) => {
  const [isOpen, setIsOpen] = useState(depth < 2);
  const bgColor = useColorModeValue('blue.50', 'blue.900');
  const borderColor = useColorModeValue('blue.200', 'blue.700');
  const textColor = useColorModeValue('gray.800', 'white');

  const handleToggle = () => setIsOpen(!isOpen);

  return (
    <VStack align="stretch" spacing={4} ml={depth * 8}>
      <Flex
        p={3}
        bg={bgColor}
        borderRadius="md"
        borderLeft="4px solid"
        borderColor={borderColor}
        cursor="pointer"
        onClick={handleToggle}
        _hover={{ bg: useColorModeValue('blue.100', 'blue.800') }}
        transition="all 0.2s"
        boxShadow="sm"
      >
        <Text fontWeight="bold" color={textColor}>
          {node.name}
        </Text>
      </Flex>
      {isOpen && node.children && (
        <VStack align="stretch" spacing={2}>
          {node.children.map((child, index) => (
            <TreeNode key={index} node={child} depth={depth + 1} />
          ))}
        </VStack>
      )}
    </VStack>
  );
};

const SDERoadmap = () => {
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  return (
    <Box bg={bgColor} minH="100vh" p={8}>
      <Text fontSize="3xl" fontWeight="bold" mb={8} textAlign="center" color={useColorModeValue('gray.800', 'white')}>
        Software Development Engineer Roadmap
      </Text>
      <Box overflowX="auto">
        <Box minW="fit-content" maxW="100%">
          <TreeNode node={roadmapData} />
        </Box>
      </Box>
    </Box>
  );
};

export default SDERoadmap;