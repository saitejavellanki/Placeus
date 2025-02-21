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
  useBreakpointValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Portal,
} from '@chakra-ui/react';
import { HamburgerIcon, CloseIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase/config';

export default function Navbar() {
  const { isOpen, onToggle } = useDisclosure();
  const [user, setUser] = useState(null);
  const isMobile = useBreakpointValue({ base: true, md: false });

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
        bg="white"
        color="black"
        minH={'60px'}
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle={'solid'}
        borderColor="white"
        align={'center'}
        justify={'space-between'}
        boxShadow="0px 4px 6px rgba(0, 0, 0, 0.3)"
        flexWrap="wrap"
      >
        <Flex flex={{ base: 1, md: 'auto' }} justify={{ base: 'start', md: 'start' }}>
          <Text
            textAlign={'left'}
            fontFamily={'heading'}
            as={RouterLink}
            to="/"
            fontWeight="bold"
            fontSize={{ base: "2xl", md: "4xl" }}
            ml={{ base: 2, md: 7 }}
          >
            𝗣𝗹𝗮𝗰𝗲<span style={{ color: '#32CD32' }}>u𝘀</span>.
          </Text>
        </Flex>

        <Flex display={{ base: 'flex', md: 'none' }}>
          <Button
            onClick={onToggle}
            bg="transparent"
            _hover={{ bg: 'orange.200' }}
          >
            {isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />}
          </Button>
        </Flex>

        <Flex
          display={{ base: 'none', md: 'flex' }}
          flex={{ base: 1, md: 'auto' }}
          justify="flex-end"
          ml={10}
        >
          <DesktopNav />
        </Flex>

        <Stack
          direction={'row'}
          spacing={4}
          display={{ base: 'none', md: 'flex' }}
          alignItems="center"
        >
          {user ? (
            <>
              <Text fontSize={{ base: "sm", md: "md" }}>
                Hi, {user.displayName || extractNameFromEmail(user.email)}
              </Text>
              <Button onClick={handleLogout} bg="red.400" color="white" size="sm">
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                as={RouterLink}
                to="/login"
                bg="grey"
                color="black"
                borderColor="black"
                _hover={{ bg: 'grey' }}
                size="sm"
              >
                Login
              </Button>
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
            </>
          )}
        </Stack>
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <MobileNav user={user} handleLogout={handleLogout} />
      </Collapse>
    </Box>
  );
}

const DesktopNav = () => {
  const location = useLocation();

  return (
    <Stack direction={'row'} spacing={4}>
      {NAV_ITEMS.map((navItem) => (
        navItem.children ? (
          <DropdownMenu key={navItem.label} navItem={navItem} isActive={location.pathname === navItem.href} />
        ) : (
          <NavLink
            key={navItem.label}
            {...navItem}
            isActive={location.pathname === navItem.href}
          />
        )
      ))}
    </Stack>
  );
};

const DropdownMenu = ({ navItem, isActive }) => {
  return (
    <Menu>
      <MenuButton
        as={Button}
        rightIcon={<ChevronDownIcon />}
        p={2}
        fontSize={'sm'}
        fontWeight={500}
        color={isActive ? 'orange' : 'black'}
        bg="transparent"
        _hover={{
          textDecoration: 'none',
          bg: 'grey.500',
        }}
        _expanded={{ bg: 'grey.500' }}
      >
        {navItem.label}
      </MenuButton>
      <Portal>
        <MenuList>
          {navItem.children.map((child) => (
            <MenuItem key={child.label} as={RouterLink} to={child.href}>
              {child.label}
            </MenuItem>
          ))}
        </MenuList>
      </Portal>
    </Menu>
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
      color={isActive ? 'orange' : 'black'}
      _hover={{
        textDecoration: 'none',
        bg: 'grey.500',
      }}
      position="relative"
    >
      {label}
      {isActive && (
        <Box
          position="absolute"
          bottom={0}
          left={0}
          width="full"
          height="2px"
          bg="black"
        />
      )}
    </Link>
  );
};

const MobileNav = ({ user, handleLogout }) => {
  const location = useLocation();

  return (
    <Stack bg="orange.300" p={4} display={{ md: 'none' }}>
      {NAV_ITEMS.map((navItem) => (
        navItem.children ? (
          <MobileDropdownMenu key={navItem.label} navItem={navItem} />
        ) : (
          <MobileNavItem
            key={navItem.label}
            {...navItem}
            isActive={location.pathname === navItem.href}
          />
        )
      ))}
      <Stack spacing={4} mt={4}>
        {user ? (
          <>
            <Text fontWeight={600} color="white">
              Hi, {user.displayName || (user.email && user.email.split('@')[0])}
            </Text>
            <Button onClick={handleLogout} bg="red.400" color="white" size="sm">
              Logout
            </Button>
          </>
        ) : (
          <>
            <Button
              as={RouterLink}
              to="/login"
              bg="grey"
              color="black"
              borderColor="black"
              _hover={{ bg: 'grey' }}
              size="sm"
            >
              Login
            </Button>
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
          </>
        )}
      </Stack>
    </Stack>
  );
};

const MobileDropdownMenu = ({ navItem }) => {
  return (
    <Stack spacing={4}>
      <Text fontWeight={600} color="white">{navItem.label}</Text>
      {navItem.children.map((child) => (
        <Link key={child.label} as={RouterLink} to={child.href} pl={4} color="white">
          {child.label}
        </Link>
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
          bg: 'orange.400',
        }}
        position="relative"
      >
        <Text
          fontWeight={600}
          color={isActive ? 'white' : 'white'}
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
            bg="white"
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
  // {
  //   label: 'Placements',
  //   href: '/all',
  // },
  // {
  //   label: 'Articles',
  //   children: [
  //     {
  //       label: 'View Articles',
  //       href: '/articles',
  //     },
  //     {
  //       label: 'Upload Article',
  //       href: '/articlesupload',
  //     },
  //   ],
  // },
  {
    label: 'Experiences',
    children: [
      {
        label: 'View Experiences',
        href: '/list',
      },
      {
        label: 'Upload Experiences',
        href: '/experience',
      },
    ],
  },
  // {
  //   label: 'Alumni',
  //   href: '/alumni',
  // },
  {
    label: 'Q&A',
    href: '/qa',
  },
  {
    label: 'Community',
    href: '/comm',
  },
];