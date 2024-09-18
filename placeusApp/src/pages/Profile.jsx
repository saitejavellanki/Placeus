// src/pages/ProfilePage.jsx
import React, { useState, useEffect } from 'react';
import { Box, Heading, Text, Input, Button, useToast, Select, Image } from '@chakra-ui/react';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

function ProfilePage() {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [status, setStatus] = useState('');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const auth = getAuth();
  const db = getFirestore();
  const storage = getStorage();
  const user = auth.currentUser;

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        try {
          const profileDoc = await getDoc(doc(db, 'profiles', user.uid));
          if (profileDoc.exists()) {
            const profileData = profileDoc.data();
            setName(profileData.name || '');
            setBio(profileData.bio || '');
            setProfileImage(profileData.profileImage || '');
            setStatus(profileData.status || '');
            setAdditionalInfo(profileData.additionalInfo || '');
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchProfile();
    }
  }, [user, db]);

  const handleSaveProfile = async () => {
    if (user) {
      try {
        await setDoc(doc(db, 'profiles', user.uid), {
          name,
          bio,
          profileImage,
          status,
          additionalInfo
        });
        toast({
          title: "Profile updated.",
          description: "Your profile has been successfully updated.",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        console.error("Error updating profile:", error);
        toast({
          title: "Error",
          description: "Failed to update profile. Please try again.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const storageRef = ref(storage, `profile_images/${user.uid}/${file.name}`);

      try {
        // Upload the file
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        setProfileImage(downloadURL); // Store the download URL
      } catch (error) {
        console.error("Error uploading image:", error);
        toast({
          title: "Error",
          description: "Failed to upload image. Please try again.",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  if (loading) return <Text>Loading...</Text>;

  return (
    <Box p={8} maxW="container.md" mx="auto">
      <Heading mb={6}>Profile</Heading>

      {profileImage && (
        <Box mb={4}>
          <Image src={profileImage} alt="Profile" boxSize="150px" objectFit="cover" borderRadius="md" />
        </Box>
      )}

      <Input
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        mb={4}
      />
      <Input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        mb={4}
      />
      <Input
        placeholder="Bio"
        value={bio}
        onChange={(e) => setBio(e.target.value)}
        mb={4}
      />
      <Select
        placeholder="Select status"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
        mb={4}
      >
        <option value="student">Student</option>
        <option value="employed">Employed</option>
      </Select>
      {status === 'student' && (
        <Input
          placeholder="University"
          value={additionalInfo}
          onChange={(e) => setAdditionalInfo(e.target.value)}
          mb={4}
        />
      )}
      {status === 'employed' && (
        <Input
          placeholder="Company and Role"
          value={additionalInfo}
          onChange={(e) => setAdditionalInfo(e.target.value)}
          mb={4}
        />
      )}
      <Button colorScheme="blue" onClick={handleSaveProfile}>
        Save Profile
      </Button>
    </Box>
  );
}

export default ProfilePage;
