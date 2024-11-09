import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Select,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  SimpleGrid,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Text,
  Spinner,
  Alert,
  AlertIcon,
  VStack
} from '@chakra-ui/react';
import { SearchIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { 
  getFirestore, 
  collection, 
  query, 
  getDocs, 
  updateDoc, 
  doc, 
  orderBy, 
  where,
  onSnapshot 
} from 'firebase/firestore';
import { app } from '../firebase/config';

const AdminBookingDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    completed: 0,
    cancelled: 0,
    revenue: 0
  });

  const toast = useToast();
  const db = getFirestore(app);

  useEffect(() => {
    const bookingsRef = collection(db, 'bookings');
    const q = query(bookingsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const fetchedBookings = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setBookings(fetchedBookings);
        updateStats(fetchedBookings);
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching bookings:", error);
        setError(error.message);
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const updateStats = (bookingsData) => {
    const stats = bookingsData.reduce((acc, booking) => {
      acc.total++;
      acc[booking.status]++;
      if (['approved', 'completed'].includes(booking.status)) {
        acc.revenue += parseFloat(booking.price) * parseFloat(booking.duration);
      }
      return acc;
    }, {
      total: 0,
      pending: 0,
      approved: 0,
      completed: 0,
      cancelled: 0,
      revenue: 0
    });
    setStats(stats);
  };

  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const bookingRef = doc(db, 'bookings', bookingId);
      await updateDoc(bookingRef, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });

      toast({
        title: "Status Updated",
        description: `Booking status changed to ${newStatus}`,
        status: "success",
        duration: 3000,
        isClosable: true
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update booking status",
        status: "error",
        duration: 3000,
        isClosable: true
      });
    }
  };

  // Filter bookings based on status and search query
  useEffect(() => {
    let filtered = [...bookings];

    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.alumniName?.toLowerCase().includes(query) ||
        booking.name?.toLowerCase().includes(query) || // Added name search
        booking.topic?.toLowerCase().includes(query) ||
        booking.company?.toLowerCase().includes(query)
      );
    }

    setFilteredBookings(filtered);
  }, [statusFilter, searchQuery, bookings]);

  const getStatusColor = (status) => {
    const colors = {
      pending: 'yellow',
      approved: 'green',
      completed: 'blue',
      cancelled: 'red'
    };
    return colors[status] || 'gray';
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minH="60vh">
        <Spinner size="xl" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        <Heading>Bookings Dashboard</Heading>

        {/* Stats Cards */}
        <SimpleGrid columns={{ base: 1, md: 3, lg: 5 }} spacing={4}>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Bookings</StatLabel>
                <StatNumber>{stats.total}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Pending</StatLabel>
                <StatNumber>{stats.pending}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Approved</StatLabel>
                <StatNumber>{stats.approved}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Completed</StatLabel>
                <StatNumber>{stats.completed}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <Stat>
                <StatLabel>Total Revenue</StatLabel>
                <StatNumber>${stats.revenue.toFixed(2)}</StatNumber>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Filters */}
        <HStack spacing={4}>
          <InputGroup maxW="300px">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search by student or mentor name, topic, or company"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </InputGroup>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            maxW="200px"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </HStack>

        {/* Bookings Table */}
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Student</Th>
                <Th>Mentor</Th>
                <Th>Topic</Th>
                <Th>Date & Time</Th>
                <Th>Duration</Th>
                <Th>Price</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredBookings.map((booking) => (
                <Tr key={booking.id}>
                  <Td>
                    <Text fontWeight="bold">{booking.name}</Text>
                    <Text fontSize="sm" color="gray.600">{booking.phoneNumber}</Text>
                  </Td>
                  <Td>
                    <Text fontWeight="bold">{booking.alumniName}</Text>
                    <Text fontSize="sm" color="gray.600">{booking.company}</Text>
                  </Td>
                  <Td>
                    <Text>{booking.topic}</Text>
                    <Text fontSize="sm" color="gray.600" noOfLines={2}>
                      {booking.message}
                    </Text>
                  </Td>
                  <Td>
                    <Text>{booking.date}</Text>
                    <Text fontSize="sm" color="gray.600">{booking.time}</Text>
                  </Td>
                  <Td>{booking.duration}h</Td>
                  <Td>${(booking.price * booking.duration).toFixed(2)}</Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(booking.status)}>
                      {booking.status}
                    </Badge>
                  </Td>
                  <Td>
                    <Menu>
                      <MenuButton
                        as={IconButton}
                        icon={<ChevronDownIcon />}
                        variant="outline"
                        size="sm"
                      />
                      <MenuList>
                        {booking.status === 'pending' && (
                          <MenuItem onClick={() => updateBookingStatus(booking.id, 'approved')}>
                            Approve
                          </MenuItem>
                        )}
                        {booking.status === 'approved' && (
                          <MenuItem onClick={() => updateBookingStatus(booking.id, 'completed')}>
                            Mark Completed
                          </MenuItem>
                        )}
                        {['pending', 'approved'].includes(booking.status) && (
                          <MenuItem onClick={() => updateBookingStatus(booking.id, 'cancelled')}>
                            Cancel
                          </MenuItem>
                        )}
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </VStack>
    </Container>
  );
};

export default AdminBookingDashboard;