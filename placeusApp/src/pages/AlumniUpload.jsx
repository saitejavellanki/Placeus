import React, { useState } from 'react';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  Box,
  Container,
  VStack,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Button,
  useToast,
  Heading,
  Select,
  InputGroup,
  InputLeftAddon,
  Card,
  CardBody,
  Image,
  Center,
  IconButton,
  Switch,
  Text,
} from '@chakra-ui/react';
import { CloseIcon } from '@chakra-ui/icons';

const specializations = [
  "Web Development",
  "Mobile Development",
  "Data Science",
  "Machine Learning",
  "UI/UX Design",
  "DevOps",
  "Cybersecurity",
  "Cloud Computing",
  "Blockchain",
  "Other"
];

import { app } from '../firebase/config';

const AlumniUploadForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const [profilePic, setProfilePic] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  
  const db = getFirestore(app);
  const storage = getStorage(app);

  const [formData, setFormData] = useState({
    name: '',
    jobRole: '',
    company: '',
    specialization: '',
    experience: 0,
    price: 0,
    profilePicUrl: '',
    recentlyPlaced: false
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNumberChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: Number(value),
      // Reset recentlyPlaced if experience becomes > 0
      recentlyPlaced: Number(value) === 0 ? prev.recentlyPlaced : false
    }));
  };

  const handleRecentlyPlacedChange = (e) => {
    setFormData(prev => ({
      ...prev,
      recentlyPlaced: e.target.checked
    }));
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setProfilePic(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        toast({
          title: 'Invalid file type',
          description: 'Please upload an image file',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const removeProfilePic = () => {
    setProfilePic(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      jobRole: '',
      company: '',
      specialization: '',
      experience: 0,
      price: 0,
      profilePicUrl: '',
      recentlyPlaced: false
    });
    removeProfilePic();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (!formData.name || !formData.jobRole || !formData.company || !formData.specialization) {
        throw new Error('Please fill in all required fields');
      }

      let profilePicUrl = '';
      
      if (profilePic) {
        const storageRef = ref(storage, `profile-pics/${Date.now()}-${profilePic.name}`);
        const uploadResult = await uploadBytes(storageRef, profilePic);
        profilePicUrl = await getDownloadURL(uploadResult.ref);
      }

      const alumniCollectionRef = collection(db, 'alumni');
      await addDoc(alumniCollectionRef, {
        ...formData,
        profilePicUrl,
        createdAt: new Date().toISOString()
      });

      toast({
        title: 'Alumni Added',
        description: `Successfully added ${formData.name} to the database`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      resetForm();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="container.md" py={8}>
      <Card>
        <CardBody>
          <VStack spacing={6} align="stretch">
            <Heading size="lg" textAlign="center">Add New Alumni</Heading>

            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                {/* Profile Picture Upload */}
                <FormControl>
                  <FormLabel>Profile Picture</FormLabel>
                  <Center>
                    <VStack spacing={4}>
                      {previewUrl ? (
                        <Box position="relative">
                          <Image
                            src={previewUrl}
                            alt="Profile preview"
                            boxSize="150px"
                            objectFit="cover"
                            borderRadius="full"
                          />
                          <IconButton
                            icon={<CloseIcon />}
                            size="sm"
                            colorScheme="red"
                            aria-label="Remove photo"
                            onClick={removeProfilePic}
                            position="absolute"
                            top="-2"
                            right="-2"
                            borderRadius="full"
                          />
                        </Box>
                      ) : (
                        <Box
                          width="150px"
                          height="150px"
                          borderRadius="full"
                          bg="gray.100"
                          display="flex"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <Box as="span" color="gray.400" fontSize="2xl">
                            👤
                          </Box>
                        </Box>
                      )}
                      <Button
                        as="label"
                        htmlFor="profile-upload"
                        cursor="pointer"
                        colorScheme="blue"
                        variant="outline"
                      >
                        {previewUrl ? 'Change Photo' : 'Upload Photo'}
                        <Input
                          id="profile-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleProfilePicChange}
                          display="none"
                        />
                      </Button>
                    </VStack>
                  </Center>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Full Name</FormLabel>
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter full name"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Job Role</FormLabel>
                  <Input
                    name="jobRole"
                    value={formData.jobRole}
                    onChange={handleInputChange}
                    placeholder="e.g. Senior Software Engineer"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Company</FormLabel>
                  <Input
                    name="company"
                    value={formData.company}
                    onChange={handleInputChange}
                    placeholder="Current company"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Specialization</FormLabel>
                  <Select
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    placeholder="Select specialization"
                  >
                    {specializations.map((spec) => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Years of Experience</FormLabel>
                  <NumberInput
                    min={0}
                    max={50}
                    value={formData.experience}
                    onChange={(value) => handleNumberChange('experience', value)}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                {/* Recently Placed Switch - Only visible when experience is 0 */}
                {formData.experience === 0 && (
                  <FormControl display='flex' alignItems='center'>
                    <FormLabel htmlFor='recently-placed' mb='0'>
                      Recently Placed
                    </FormLabel>
                    <Switch
                      id='recently-placed'
                      isChecked={formData.recentlyPlaced}
                      onChange={handleRecentlyPlacedChange}
                      colorScheme="green"
                    />
                    {formData.recentlyPlaced && (
                      <Text ml={2} fontSize="sm" color="green.500">
                        ✓ Marked as recently placed
                      </Text>
                    )}
                  </FormControl>
                )}

                <FormControl isRequired>
                  <FormLabel>Hourly Rate</FormLabel>
                  <InputGroup>
                    <InputLeftAddon children="$" />
                    <NumberInput
                      min={0}
                      value={formData.price}
                      onChange={(value) => handleNumberChange('price', value)}
                      w="full"
                    >
                      <NumberInputField borderLeftRadius={0} />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </InputGroup>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="blue"
                  size="lg"
                  w="full"
                  isLoading={isLoading}
                  loadingText="Submitting"
                >
                  Add Alumni
                </Button>
              </VStack>
            </form>
          </VStack>
        </CardBody>
      </Card>
    </Container>
  );
};

export default AlumniUploadForm;