// src/components/UserStatus.jsx
import React, { useState, useEffect } from 'react';
import { Box, Text, Avatar, VStack, Flex } from '@chakra-ui/react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

function UserStatus() {
  const [users, setUsers] = useState([]);
  const db = getFirestore();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const profilesSnapshot = await getDocs(collection(db, 'profiles'));
        const profilesList = profilesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setUsers(profilesList);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsers();
  }, [db]);

  return (
    <Box p={4} borderWidth={1} borderRadius="md" shadow="md">
      <Text fontSize="lg" fontWeight="bold" mb={4}>User Status</Text>
      <VStack spacing={4} align="stretch">
        {users.map(user => (
          <Flex key={user.id} align="center">
            <Avatar src={user.profileImage} name={user.name} mr={4} />
            <Box>
              <Text fontWeight="bold">{user.name}</Text>
              <Text>{user.bio}</Text>
            </Box>
          </Flex>
        ))}
      </VStack>
    </Box>
  );
}

export default UserStatus;
