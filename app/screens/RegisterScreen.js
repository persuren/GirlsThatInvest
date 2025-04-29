import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, ActivityIndicator } from "react-native";

export default function RegisterScreen({ navigation }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      const response = await fetch("http://10.0.2.2:5001/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
      });
      const data = await response.json();
      if (response.ok) {
        setSuccess("Registration successful! You can log in.");
        setUsername("");
        setEmail("");
        setPassword("");
      } else {
        setError(data.error || "Registration failed.");
      }
    } catch (e) {
      setError("Sunucu hatası.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Girls That Invest</Text>
      <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
      <Text style={styles.label}>USERNAME</Text>
      <TextInput
        style={styles.input}
        placeholder="johndoe"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <Text style={styles.label}>E-MAIL</Text>
      <TextInput
        style={styles.input}
        placeholder="example@mail.com"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <Text style={styles.label}>PASSWORD</Text>
      <TextInput
        style={styles.input}
        placeholder="******"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
      {success ? <Text style={styles.success}>{success}</Text> : null}
      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading || !username || !email || !password}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign up</Text>}
      </TouchableOpacity>
      <TouchableOpacity style={styles.link} onPress={() => navigation.goBack()}>
        <Text style={styles.linkText}>Sign in</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f6bfe0',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#a8326e',
    fontFamily: 'georgia',
    marginBottom: 10,
    marginTop: 10,
    textAlign: 'center',
    letterSpacing: 1.5,
    textShadowColor: '#fff',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  logo: {
    width: 90,
    height: 90,
    marginBottom: 18,
    borderRadius: 20,
    resizeMode: 'contain',
  },
  label: {
    color: '#a8326e',
    fontWeight: 'bold',
    marginBottom: 4,
    marginTop: 10,
    fontSize: 13,
    letterSpacing: 1.2,
    alignSelf: 'flex-start',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 6,
    borderWidth: 1.5,
    borderColor: '#f6bfe0',
    fontFamily: 'georgia',
    width: '100%',
  },
  button: {
    backgroundColor: '#bb0073',
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 18,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#a8326e',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'georgia',
    letterSpacing: 1.1,
  },
  error: {
    color: 'red',
    marginBottom: 8,
    marginTop: 4,
    textAlign: 'center',
  },
  success: {
    color: 'green',
    marginBottom: 8,
    marginTop: 4,
    textAlign: 'center',
  },
  link: {
    marginTop: 18,
    alignItems: 'center',
  },
  linkText: {
    color: '#a8326e',
    textDecorationLine: 'underline',
    fontSize: 15,
    fontWeight: 'bold',
  },
}); 
