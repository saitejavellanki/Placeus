import { useState } from "react";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase/config";
import { toast } from "react-toastify";
import { Box, Button, Flex, Heading, Input, VStack, Text } from "@chakra-ui/react";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const resetPassword = (e) => {
    e.preventDefault();
    setIsLoading(true);

    sendPasswordResetEmail(auth, email)
      .then(() => {
        setIsLoading(false);
        toast.success("Password reset email sent");
      })
      .catch((error) => {
        setIsLoading(false);
        toast.error(error.message);
      });
  };

  return (
    <Flex minH="100vh" align="center" justify="center">
      <Box p="8" boxShadow="lg" borderRadius="md" w="400px">
        <VStack spacing="6" as="form" onSubmit={resetPassword}>
          <Heading>Reset Password</Heading>
          <Input
            placeholder="Enter your email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button type="submit" colorScheme="blue" w="full" isLoading={isLoading}>
            Reset Password
          </Button>
        </VStack>
        <Flex justify="center" mt="4">
          <Text mr="2">Remember your password?</Text>
          <Text as={Link} to="/login" color="blue.500">
            Login
          </Text>
        </Flex>
      </Box>
    </Flex>
  );
};

export default ResetPassword;
