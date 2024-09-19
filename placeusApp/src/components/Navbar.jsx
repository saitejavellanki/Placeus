import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Text,
  Stack,
  Collapse,
  Link,
  useDisclosure,
  Button,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase/config'; // Import Firebase authentication

export default function Navbar() {
  const { isOpen, onToggle } = useDisclosure();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
  };

  const extractNameFromEmail = (email) => {
    const namePart = email.split('@')[0];
    const formattedName = namePart.replace(/\./g, ' ').replace(/_/g, ' ');
    return formattedName.charAt(0).toUpperCase() + formattedName.slice(1);
  };

  return (
    <Box>
      <Flex
        bg="white" // Light orange background
        color="black" // Black text
        minH={'60px'}
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle={'solid'}
        borderColor="white" // Border color to match the background
        align={'center'}
        justify={'space-between'}
        boxShadow="0px 4px 6px rgba(0, 0, 0, 0.3)" // Light grey shadow
      >
        <Flex flex={{ base: 1 }} justify={{ base: 'start', md: 'start' }}>
          <Text
            textAlign={'left'}
            fontFamily={'heading'}
            as={RouterLink}
            to="/"
            fontWeight="bold"
            fontSize="4xl"
            ml={7}
          >
           𝗣𝗹𝗮𝗰𝗲<span style={{ color: 'orange' }}>u𝘀</span>.
          </Text>
        </Flex>

        <Flex display={{ base: 'none', md: 'flex' }} ml={10}>
          <DesktopNav />
        </Flex>

        <Flex
          flex={{ base: 1, md: 'auto' }}
          display={{ base: 'flex', md: 'none' }}
          justify={'flex-end'}
        >
          <Button
            onClick={onToggle}
            bg="transparent"
            _hover={{ bg: 'orange.200' }} // Change background on hover
          >
            {isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />}
          </Button>
        </Flex>

        <Flex alignItems="center">
          {user ? (
            <>
              <Text mr={4}>
  Hi, {user.displayName || extractNameFromEmail(user.email)}
</Text>
              <Button onClick={handleLogout} bg="red.400" color="white" size="sm" mr={2}>
                Logout
              </Button>
            </>
          ) : (
            <Button
              as={RouterLink}
              to="/login"
              bg="grey"
              color="black"
              borderColor="black"
              _hover={{ bg: 'grey' }}
              margin={1}
              size="sm"
            >
              Login
            </Button>
            
          )}
          <Button
              as={RouterLink}
              to="/register"
              bg="black"
              color="white"
              _hover={{ bg: 'grey' }}
              size="sm"
            >
              Register
            </Button>
        </Flex>
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <MobileNav />
      </Collapse>
    </Box>
  );
}

const DesktopNav = () => {
  const location = useLocation();

  return (
    <Stack direction={'row'} spacing={4}>
      {NAV_ITEMS.map((navItem) => (
        <NavLink
          key={navItem.label}
          {...navItem}
          isActive={location.pathname === navItem.href}
        />
      ))}
    </Stack>
  );
};

const NavLink = ({ label, href, isActive }) => {
  return (
    <Link
      as={RouterLink}
      p={2}
      to={href ?? '#'}
      fontSize={'sm'}
      fontWeight={500}
      color={isActive ? 'orange' : 'black'} // White text for active and inactive
      _hover={{
        textDecoration: 'none',
        bg: 'grey.500', // Background color on hover
      }}
      position="relative" // Add relative positioning for the active indicator
    >
      {label}
      {isActive && (
        <Box
          position="absolute"
          bottom={0}
          left={0}
          width="full"
          height="2px"
          bg="black" // White color for the active indicator
        />
      )}
    </Link>
  );
};

const MobileNav = () => {
  const location = useLocation();

  return (
    <Stack
      bg="orange.300" // Light orange background
      p={4}
      display={{ md: 'none' }}
    >
      {NAV_ITEMS.map((navItem) => (
        <MobileNavItem
          key={navItem.label}
          {...navItem}
          isActive={location.pathname === navItem.href}
        />
      ))}
    </Stack>
  );
};

const MobileNavItem = ({ label, href, isActive }) => {
  return (
    <Stack spacing={4}>
      <Flex
        py={2}
        as={RouterLink}
        to={href ?? '#'}
        justify={'space-between'}
        align={'center'}
        _hover={{
          textDecoration: 'none',
          bg: 'orange.400', // Background color on hover
        }}
        position="relative" // Add relative positioning for the active indicator
      >
        <Text
          fontWeight={600}
          color={isActive ? 'white' : 'white'} // White text for active and inactive
        >
          {label}
        </Text>
        {isActive && (
          <Box
            position="absolute"
            bottom={0}
            left={0}
            width="full"
            height="2px"
            bg="white" // White color for the active indicator
          />
        )}
      </Flex>
    </Stack>
  );
};

const NAV_ITEMS = [
  {
    label: 'Home',
    href: '/',
  },
  {
    label: 'Placements',
    href: '/all',
  },
  
  {
    label: 'Roadmaps',
    href: '/roadmaps',
  },
  {
    label: 'Q&A',
    href: '/qa',
  },
  {
    label: 'Community',
    href: '/comm',
  },
];
