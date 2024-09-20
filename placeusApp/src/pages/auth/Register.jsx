import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  Alert,
  AlertIcon,
  Flex,
  Image,
  useColorModeValue,
  Link,
} from '@chakra-ui/react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { useNavigate } from 'react-router-dom';
import register from "../../assets/login.png"

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const bgColor = useColorModeValue("gray.50", "gray.800");
  const cardBgColor = useColorModeValue("white", "gray.700");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      setSuccess('User registered successfully!');
      console.log('Registered User:', userCredential.user);
      setTimeout(() => navigate('/'), 2000); // Redirect to home page after 2 seconds
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Flex h="100vh">
      {/* Left side - Image */}
      <Box w="50%" display={{ base: "none", md: "block" }}>
        <Image
          src= {register}
          alt="Register"
          objectFit="cover"
          w="100%"
          h="100%"
        />
      </Box>

      {/* Right side - Register Form */}
      <Flex
        w={{ base: "100%", md: "50%" }}
        bg={bgColor}
        align="center"
        justify="center"
      >
        <Box
          p="8"
          w="full"
          maxW="400px"
          bg={cardBgColor}
          borderRadius="xl"
          boxShadow="xl"
        >
          <VStack spacing="5" as="form" onSubmit={handleSubmit}>
          <Text
            textAlign={'left'}
            fontFamily={'heading'}
            
            to="/"
            fontWeight="bold"
            fontSize="xl"
            
          >
            𝗣𝗹𝗮𝗰𝗲𝘂𝘀.
          </Text>
            <Heading size="xl" mb="6" textAlign="center">
              Create an Account
            </Heading>
            {error && (
              <Alert status="error" borderRadius="md">
                <AlertIcon />
                {error}
              </Alert>
            )}
            {success && (
              <Alert status="success" borderRadius="md">
                <AlertIcon />
                {success}
              </Alert>
            )}
            <FormControl id="email" isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                bg={useColorModeValue("gray.100", "gray.600")}
                border="none"
                _focus={{ boxShadow: "outline" }}
              />
            </FormControl>
            <FormControl id="password" isRequired>
              <FormLabel>Password</FormLabel>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                bg={useColorModeValue("gray.100", "gray.600")}
                border="none"
                _focus={{ boxShadow: "outline" }}
              />
            </FormControl>
            <Button
              type="submit"
              colorScheme="teal"
              w="full"
              isLoading={isLoading}
              _hover={{ bg: "teal.600" }}
              _active={{ bg: "teal.700" }}
            >
              Register
            </Button>
          </VStack>
          
        </Box>
      </Flex>
    </Flex>
  );
};

export default Register;