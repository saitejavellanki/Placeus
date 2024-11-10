import React, { useEffect, useState } from 'react';
import { 
  VStack, Box, Heading, Text, Spinner, Badge, Flex, Container, 
  Checkbox, Button, Input, HStack, useBreakpointValue, 
  IconButton, Collapse, useDisclosure, Wrap, WrapItem,
  Divider, useColorModeValue, Tag
} from '@chakra-ui/react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Filter, X, Search, Building2, User2 } from 'lucide-react';

function ExperiencesList() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState({});
  const [roles, setRoles] = useState({});
  const [filters, setFilters] = useState({ companies: {}, roles: {}, status: {} });
  const [searchTerm, setSearchTerm] = useState('');
  const { isOpen, onToggle } = useDisclosure();

  const isMobile = useBreakpointValue({ base: true, md: false });
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const highlightColor = useColorModeValue('green.50', 'green.900');

  useEffect(() => {
    const q = query(collection(db, 'experiences'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const experiencesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setExperiences(experiencesData);
      setLoading(false);

      const newCompanies = {};
      const newRoles = {};
      experiencesData.forEach(exp => {
        newCompanies[exp.company] = true;
        newRoles[exp.position] = true;
      });
      setCompanies(newCompanies);
      setRoles(newRoles);
    });

    return () => unsubscribe();
  }, []);

  const handleFilterChange = (type, value) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [type]: {
        ...prevFilters[type],
        [value]: !prevFilters[type][value]
      }
    }));
  };

  const clearFilters = () => {
    setFilters({ companies: {}, roles: {}, status: {} });
    setSearchTerm('');
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).reduce((count, filterType) => 
      count + Object.values(filterType).filter(Boolean).length, 0
    );
  };

  const filteredExperiences = experiences.filter(exp => {
    const companyFilter = Object.keys(filters.companies).length === 0 || filters.companies[exp.company];
    const roleFilter = Object.keys(filters.roles).length === 0 || filters.roles[exp.position];
    const statusFilter = Object.keys(filters.status).length === 0 || filters.status[exp.status];
    const searchFilter = exp.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        exp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        exp.experience.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        exp.authorName.toLowerCase().includes(searchTerm.toLowerCase());
    return companyFilter && roleFilter && statusFilter && searchFilter;
  });

  if (loading) {
    return (
      <Flex height="100vh" alignItems="center" justifyContent="center">
        <Spinner size="xl" thickness="4px" speed="0.65s" emptyColor="gray.200" color="green.500" />
      </Flex>
    );
  }

  const FilterSection = () => (
    <Box 
      bg={bgColor} 
      p={6} 
      borderRadius="xl" 
      boxShadow="sm"
      border="1px"
      borderColor={borderColor}
    >
      <VStack spacing={6} align="stretch">
        <Flex justify="space-between" align="center">
          <HStack>
            <Filter size={20} />
            <Heading size="md">Filters</Heading>
          </HStack>
          {isMobile && (
            <IconButton
              icon={<X size={20} />}
              size="sm"
              variant="ghost"
              onClick={onToggle}
              aria-label="Close filters"
            />
          )}
        </Flex>

        <Box position="relative">
          <Input
            placeholder="Search experiences..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            pl="40px"
            bg={useColorModeValue('white', 'gray.900')}
          />
          <Box position="absolute" left={3} top="50%" transform="translateY(-50%)">
            <Search size={20} color="gray" />
          </Box>
        </Box>

        <Box>
          <Heading size="sm" mb={3}>Companies</Heading>
          <VStack align="stretch" maxHeight="150px" overflowY="auto" spacing={2}>
            {Object.keys(companies).map(company => (
              <Checkbox 
                key={company} 
                onChange={() => handleFilterChange('companies', company)}
                isChecked={filters.companies[company]}
                colorScheme="green"
              >
                {company}
              </Checkbox>
            ))}
          </VStack>
        </Box>

        <Box>
          <Heading size="sm" mb={3}>Roles</Heading>
          <VStack align="stretch" maxHeight="150px" overflowY="auto" spacing={2}>
            {Object.keys(roles).map(role => (
              <Checkbox 
                key={role} 
                onChange={() => handleFilterChange('roles', role)}
                isChecked={filters.roles[role]}
                colorScheme="green"
              >
                {role}
              </Checkbox>
            ))}
          </VStack>
        </Box>

        <Box>
          <Heading size="sm" mb={3}>Status</Heading>
          <VStack align="stretch" spacing={2}>
            <Checkbox 
              onChange={() => handleFilterChange('status', 'selected')}
              isChecked={filters.status['selected']}
              colorScheme="green"
            >
              Selected
            </Checkbox>
            <Checkbox 
              onChange={() => handleFilterChange('status', 'rejected')}
              isChecked={filters.status['rejected']}
              colorScheme="green"
            >
              Rejected
            </Checkbox>
          </VStack>
        </Box>

        <Button 
          variant="outline"
          colorScheme="green"
          size="sm"
          onClick={clearFilters}
          isDisabled={getActiveFiltersCount() === 0 && !searchTerm}
        >
          Clear All Filters
        </Button>
      </VStack>
    </Box>
  );

  const ExperienceCard = ({ exp }) => (
    <Box 
      bg={bgColor}
      p={6} 
      borderRadius="xl"
      boxShadow="sm"
      border="1px"
      borderColor={borderColor}
      transition="all 0.2s"
      _hover={{ transform: 'translateY(-2px)', boxShadow: 'md' }}
    >
      <VStack align="stretch" spacing={4}>
        <Flex 
          direction={{ base: "column", sm: "row" }}
          justify="space-between"
          align={{ base: "flex-start", sm: "center" }}
          gap={3}
        >
          <Box>
            <HStack spacing={2} mb={1}>
              <Building2 size={16} />
              <Heading size="md" color="green.600">{exp.company}</Heading>
            </HStack>
            <HStack spacing={2}>
              <User2 size={14} />
              <Text fontSize="sm" color="gray.500">{exp.authorName}</Text>
            </HStack>
          </Box>
          
          <HStack spacing={2} flexWrap="wrap">
            <Badge 
              colorScheme="blue" 
              px={3}
              py={1}
              borderRadius="full"
              textTransform="none"
            >
              {exp.position}
            </Badge>
            <Badge 
              colorScheme={exp.status === 'selected' ? 'green' : 'red'} 
              px={3}
              py={1}
              borderRadius="full"
              textTransform="none"
            >
              {exp.status === 'selected' ? 'Selected' : 'Rejected'}
            </Badge>
          </HStack>
        </Flex>

        <Divider />

        <Box>
          <Text fontWeight="medium" mb={2} color="gray.600">Experience:</Text>
          <Box 
            bg={highlightColor}
            p={4}
            borderRadius="lg"
            fontSize={{ base: "xs", sm: "sm" }}
            whiteSpace="pre-wrap"
            wordBreak="break-word"
            lineHeight="1.6"
            maxHeight={{ base: "300px", sm: "none" }}
            overflowY={{ base: "auto", sm: "visible" }}
          >
            {exp.experience}
          </Box>
        </Box>

        <Text fontSize="sm" color="gray.500" alignSelf="flex-end">
          Posted on: {exp.createdAt.toDate().toLocaleDateString()}
        </Text>
      </VStack>
    </Box>
  );

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')} py={8}>
      {isMobile && (
        <Box position="fixed" bottom="4" right="4" zIndex="10">
          <IconButton
            icon={<Filter size={20} />}
            colorScheme="green"
            onClick={onToggle}
            isRound
            boxShadow="lg"
            size="lg"
            aria-label="Toggle filters"
          />
          {getActiveFiltersCount() > 0 && (
            <Box
              position="absolute"
              top="-2"
              right="-2"
              bg="red.500"
              color="white"
              borderRadius="full"
              w="6"
              h="6"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="xs"
              fontWeight="bold"
            >
              {getActiveFiltersCount()}
            </Box>
          )}
        </Box>
      )}

      <Container maxW="7xl">
        <VStack spacing={6} align="stretch">
          <Box textAlign="center" mb={6}>
            <Heading size="2xl" color="green.600" mb={4}>
              Interview Experiences
            </Heading>
            <HStack justify="center" spacing={2}>
              <Text fontSize="lg" color="gray.600">
                Showing {filteredExperiences.length} of {experiences.length} experiences
              </Text>
              {getActiveFiltersCount() > 0 && (
                <Tag colorScheme="green" size="md">
                  {getActiveFiltersCount()} active filters
                </Tag>
              )}
            </HStack>
          </Box>

          <Flex gap={8}>
            {/* Desktop Filters */}
            <Box 
              display={{ base: 'none', md: 'block' }}
              w="300px"
              flexShrink={0}
            >
              <Box position="sticky" top="4">
                <FilterSection />
              </Box>
            </Box>

            {/* Mobile Filters */}
            {isMobile && (
              <Collapse in={isOpen}>
                <Box mb={4}>
                  <FilterSection />
                </Box>
              </Collapse>
            )}

            {/* Main Content */}
            <VStack flex={1} spacing={6} align="stretch">
              {filteredExperiences.map((exp) => (
                <ExperienceCard key={exp.id} exp={exp} />
              ))}
              
              {filteredExperiences.length === 0 && (
                <Box 
                  textAlign="center" 
                  py={12}
                  bg={bgColor}
                  borderRadius="xl"
                  border="1px"
                  borderColor={borderColor}
                >
                  <Heading size="md" color="gray.500" mb={2}>
                    No experiences found
                  </Heading>
                  <Text color="gray.500">
                    Try adjusting your filters or search term
                  </Text>
                </Box>
              )}
            </VStack>
          </Flex>
        </VStack>
      </Container>
    </Box>
  );
}

export default ExperiencesList;