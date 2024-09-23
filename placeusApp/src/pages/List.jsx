import React, { useEffect, useState } from 'react';
import { VStack, Box, Heading, Text, Spinner, Badge, Flex, Container, Checkbox, Button, Input, HStack, useBreakpointValue } from '@chakra-ui/react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/config';

function ExperiencesList() {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState({});
  const [roles, setRoles] = useState({});
  const [filters, setFilters] = useState({ companies: {}, roles: {}, status: {} });
  const [searchTerm, setSearchTerm] = useState('');

  const sidebarWidth = useBreakpointValue({ base: '100%', md: '250px' });
  const sidebarPosition = useBreakpointValue({ base: 'static', md: 'sticky' });
  const sidebarTop = useBreakpointValue({ base: 'auto', md: '20px' });

  useEffect(() => {
    const q = query(collection(db, 'experiences'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const experiencesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setExperiences(experiencesData);
      setLoading(false);

      // Collect unique companies and roles
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

  const filteredExperiences = experiences.filter(exp => {
    const companyFilter = Object.keys(filters.companies).length === 0 || filters.companies[exp.company];
    const roleFilter = Object.keys(filters.roles).length === 0 || filters.roles[exp.position];
    const statusFilter = Object.keys(filters.status).length === 0 || filters.status[exp.status];
    const searchFilter = exp.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         exp.experience.toLowerCase().includes(searchTerm.toLowerCase());
    return companyFilter && roleFilter && statusFilter && searchFilter;
  });

  if (loading) {
    return <Spinner size="xl" />;
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Flex direction={{ base: 'column', md: 'row' }}>
        {/* Sidebar */}
        <Box width={sidebarWidth} pr={{ base: 0, md: 8 }} position={sidebarPosition} top={sidebarTop} alignSelf="flex-start">
          <VStack align="stretch" spacing={4} bg="gray.50" p={4} borderRadius="md" boxShadow="sm">
            <Heading size="md" color="green.600">Filter By</Heading>
            <Input 
              placeholder="Search experiences..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              mb={2}
            />
            <Box>
              <Heading size="sm" mb={2}>Companies</Heading>
              <VStack align="stretch" maxHeight="200px" overflowY="auto">
                {Object.keys(companies).map(company => (
                  <Checkbox 
                    key={company} 
                    onChange={() => handleFilterChange('companies', company)}
                    isChecked={filters.companies[company]}
                  >
                    {company}
                  </Checkbox>
                ))}
              </VStack>
            </Box>
            <Box>
              <Heading size="sm" mb={2}>Roles</Heading>
              <VStack align="stretch" maxHeight="200px" overflowY="auto">
                {Object.keys(roles).map(role => (
                  <Checkbox 
                    key={role} 
                    onChange={() => handleFilterChange('roles', role)}
                    isChecked={filters.roles[role]}
                  >
                    {role}
                  </Checkbox>
                ))}
              </VStack>
            </Box>
            <Box>
              <Heading size="sm" mb={2}>Status</Heading>
              <VStack align="stretch">
                <Checkbox 
                  onChange={() => handleFilterChange('status', 'selected')}
                  isChecked={filters.status['selected']}
                >
                  Selected
                </Checkbox>
                <Checkbox 
                  onChange={() => handleFilterChange('status', 'rejected')}
                  isChecked={filters.status['rejected']}
                >
                  Rejected
                </Checkbox>
              </VStack>
            </Box>
            <Button colorScheme="green" onClick={clearFilters}>Clear All Filters</Button>
          </VStack>
        </Box>

        {/* Main content */}
        <VStack spacing={8} align="stretch" flex={1} p={{ base: 4, md: 0 }}>
          <Heading as="h1" size="2xl" textAlign="center" color="green.600">
            Interview Experiences
          </Heading>
          <Text textAlign="center">Showing {filteredExperiences.length} of {experiences.length} experiences</Text>
          {filteredExperiences.map((exp) => (
            <Box key={exp.id} p={6} borderWidth={1} borderRadius="lg" boxShadow="md" bg="white">
              <Flex justifyContent="space-between" alignItems="center" mb={4}>
                <Heading size="lg" color="green.600">{exp.company}</Heading>
                <HStack>
                  <Badge colorScheme="green" fontSize={{ base: '0.6em', md: '0.8em' }} p={2} borderRadius="full">
                    {exp.position}
                  </Badge>
                  <Badge colorScheme={exp.status === 'selected' ? 'green' : 'red'} fontSize={{ base: '0.6em', md: '0.8em' }} p={2} borderRadius="full">
                    {exp.status === 'selected' ? 'Selected' : 'Rejected'}
                  </Badge>
                </HStack>
              </Flex>
              <Text fontWeight="bold" mb={2}>Experience:</Text>
              <Text whiteSpace="pre-wrap">{exp.experience}</Text>
              <Flex justifyContent="flex-end" mt={4}>
                <Text fontSize="sm" color="gray.500">
                  Posted on: {exp.createdAt.toDate().toLocaleDateString()}
                </Text>
              </Flex>
            </Box>
          ))}
        </VStack>
      </Flex>
    </Container>
  );
}

export default ExperiencesList;