import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button } from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
// import { Camera } from 'react-native-vision-camera';
// import { RNCamera } from 'react-native-camera';
import * as FileSystem from 'expo-file-system';
import { Audio } from 'expo-av';
import { SelectList } from 'react-native-dropdown-select-list';
import { Device } from 'expo-device';
import { Camera, CameraType } from 'expo-camera';

const API_URL = 'https://your-api-endpoint'; // Replace with your API endpoint

export default function App() {
  const [language, setLanguage] = useState(''); 
  const [isRecording, setIsRecording] = useState(false);
  const cameraRef = useRef(null); 
  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();

  const handleLanguageChange = (selectedLanguage) => {
    setLanguage(selectedLanguage);
  };

  const startRecording = async () => {
    setIsRecording(true);
  };

  const stopRecording = async () => {
    setIsRecording(false);
  };

  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(captureImageAndSend, 5000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const captureImageAndSend = async () => {
    if (cameraRef.current) {
      const options = { base64: true };
      const data = await cameraRef.current.takePictureAsync(options);
      if (data.base64) {
        sendImageToAPI(data.base64);
      }
    }
  };

  const sendImageToAPI = async (base64Data) => {
    try {
      const response = await axios.post(`${API_URL}/uploadImage`, {
        image: base64Data,
        language: language,
      });

      // Handle the response and play the audio if received
      if (response.data && response.data.audio) {
        playAudio(response.data.audio);
      }
    } catch (error) {
      console.error('Error sending image to API:', error);
    }
  };

  const playAudio = async (audioData) => {
    try {
      const soundObject = new Audio.Sound();
      await soundObject.loadAsync({ uri: audioData });
      await soundObject.playAsync();
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Select Language:</Text>
      <SelectList 
        data={[
          { key: 'en', value: 'English' },
          { key: 'es', value: 'Spanish' },
          // Add more language options here as needed
        ]}
        defaultValue={language}
        onSelect={(selectedItem) => handleLanguageChange(selectedItem.value)}
      />
      <Button title="Start" onPress={startRecording} />
      <Button title="Stop" onPress={stopRecording} />
      <Camera
        ref={cameraRef}
        style={{ width: 200, height: 200 }}
        type={type}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#708090',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: 'white',
    fontWeight: 'bold'
  },
  dropdown: {
    color: 'white',
    backgroundColor: 'white',
    width: 150,
  }
});
