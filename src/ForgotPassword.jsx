import { useState } from 'react';
import {Box, Button, FormControl, FormLabel, Input, Text, VStack, useToast} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const toast = useToast();
  const navigate = useNavigate();

  const handleSendCode = () => {
    if (!email) {
      toast({
        title: 'Email is required.',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    //Add API call to send verification code
    toast({
      title: 'Verification code sent!',
      description: 'Check your inbox to continue resetting your password.',
      status: 'success',
      duration: 4000,
      isClosable: true,
    });
  };

  return (
        <Box maxW="md" mx="auto" mt={20} p={6} borderWidth="1px" borderRadius="lg" boxShadow="md">
            <VStack spacing={4} align="stretch">
                <Text fontSize="2xl" fontWeight="bold" textAlign="center">
                    Forgot Password
                </Text>
                <Text fontSize="sm" textAlign="center">
                    Please enter your email to receive a verification code
                </Text>

                <FormControl isRequired>
                    <FormLabel>Email</FormLabel>
                    <Input
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </FormControl>

                <Text fontSize="xs" color="gray.500" textAlign="center">
                    Never share your new password and verification code.
                </Text>
                <Text fontSize="sm" fontStyle="italic" textAlign="center">
                    Secure access to your Working Journey!
                </Text>

                <Button colorScheme="purple" onClick={handleSendCode}>
                    Send a Verification Code
                </Button>
                <Button variant="outline" onClick={() => navigate('/login')}>
                    Back to Login
                </Button>
            </VStack>
        </Box>
    );
}