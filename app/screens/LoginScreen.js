import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'react-native';

const LoginScreen = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
  
    const handleLogin = () => {
      if (username === 'admin' && password === '1234') {
        onLogin();
      } else {
        Alert.alert('Incorrect Login', 'Username or password is incorrect');
      }
    };
  
    return (
      <View style={styles.container}>
          <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
        <Text style={styles.title}>Girls That Invest</Text>
        <TextInput
          style={styles.input}
          placeholder="User Name"
          value={username}
          onChangeText={setUsername}
          keyboardType="ascii-capable"
          autoFocus={true}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          keyboardType="ascii-capable"
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Sign in</Text>
        </TouchableOpacity>
      </View>
    );
  };
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f6bfe0',
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollContainer: {
      flex: 1,
      backgroundColor: '#f6bfe0',
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    logo: {
      justifyContent: 'center',
      alignItems: 'center',
      width: 130,
      height: 130,
      marginBottom: 20,
      resizeMode: 'contain',
      borderRadius: 20,
    },
    
    header: {
      position: 'absolute',
      top: 40,
      left: 20,
      right: 20,
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '90%',
      fontFamily: 'georgia'
    },
    iconLeft: {
      alignSelf: 'flex-start',
      top: -15,
    },
    iconRight: {
      alignSelf: 'flex-end',
      top: -15,
    },
    title: {
      top: 15,
      fontSize: 28,
      fontWeight: 'bold',
      marginBottom: 30,
      color: '#ff66b2',
      textShadowColor: 'rgba(255, 102, 178, 0.6)',
      textShadowOffset: { width: 1, height: 1 },
      textShadowRadius: 10,
      letterSpacing: 1,
      //textTransform: 'uppercase',
      fontFamily: 'georgia',
    },
    input: {
      justifyContent: 'center',
      alignItems: 'center',
      width: 200,
      height: 40,
      borderColor: 'pink',
      borderWidth: 3,
      marginBottom: 10,
      paddingLeft: 10,
      backgroundColor: 'white',
      borderRadius: 20,
      fontFamily: 'georgia'
    },
    button: {
      backgroundColor: '#ff66b2',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 20,
      marginTop: 10,
      width: '30%',
      alignItems: 'center',
      position: 'relative',
    },
    buttonText: {
      color: 'white',
      fontSize: 18,
      fontWeight: 'bold',
      fontFamily: 'georgia'
    },
  });
  export default LoginScreen;
