import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaGoogle } from "react-icons/fa";
import { GoogleAuthProvider, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth } from "../../firebase/config";
import { toast } from "react-toastify";
import { Box, Button, Flex, Heading, Input, Text, VStack, Image, useColorModeValue } from "@chakra-ui/react";
import login from "../../assets/register.png"
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const bgColor = useColorModeValue("gray.50", "gray.800");
  const cardBgColor = useColorModeValue("white", "gray.700");

  const loginUser = (e) => {
    e.preventDefault();
    setIsLoading(true);

    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        setIsLoading(false);
        toast.success("Login Successful");
        navigate("/");
      })
      .catch((error) => {
        setIsLoading(false);
        toast.error(error.message);
      });
  };

  const provider = new GoogleAuthProvider();
  const signInWithGoogle = () => {
    signInWithPopup(auth, provider)
      .then(() => {
        toast.success("Login Successfully");
        navigate("/");
      })
      .catch((error) => {
        toast.error(error.message);
      });
  };

  return (
    <Flex h="100vh">
      {/* Left side - Image */}
      <Box w="50%" display={{ base: "none", md: "block" }}>
        <Image
          src= {login}
          alt="Login"
          objectFit="cover"
          w="100%"
          h="100%"
        />
      </Box>

      {/* Right side - Login Form */}
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
          <VStack spacing="5" as="form" onSubmit={loginUser}>
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
              Welcome Back
            </Heading>
            <Input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              bg={useColorModeValue("gray.100", "gray.600")}
              border="none"
              _focus={{ boxShadow: "outline" }}
            />
            <Input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              bg={useColorModeValue("gray.100", "gray.600")}
              border="none"
              _focus={{ boxShadow: "outline" }}
            />
            <Button
              type="submit"
              colorScheme="blue"
              w="full"
              isLoading={isLoading}
              _hover={{ bg: "blue.600" }}
              _active={{ bg: "blue.700" }}
            >
              Login
            </Button>
            <Text as={Link} to="/reset" color="blue.500" _hover={{ textDecoration: "underline" }}>
              Forgot Password?
            </Text>
            <Button
              colorScheme="red"
              leftIcon={<FaGoogle />}
              w="full"
              onClick={signInWithGoogle}
              _hover={{ bg: "red.600" }}
              _active={{ bg: "red.700" }}
            >
              Login with Google
            </Button>
          </VStack>
          <Flex justify="center" mt="6">
            <Text mr="2">Don't have an account?</Text>
            <Text as={Link} to="/register" color="blue.500" fontWeight="bold" _hover={{ textDecoration: "underline" }}>
              Register
            </Text>
          </Flex>
        </Box>
      </Flex>
    </Flex>
  );
};

export default Login;