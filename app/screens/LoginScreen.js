import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Image, ActivityIndicator } from 'react-native';

const LoginScreen = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Sabit (hardcoded) kullanıcı bilgileri
    const validUsername = "1";
    const validPassword = "1";

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert('Uyarı', 'Kullanıcı adı ve şifre boş olamaz!');
            return;
        }

        setLoading(true);
        try {
            // Hardcoded giriş kontrolü
            if (username === validUsername && password === validPassword) {
                console.log("Giriş başarılı:", username);
                //Alert.alert("Başarılı", "Giriş başarılı!");
                onLogin(); // Ana ekrana yönlendirme
            } else {
                Alert.alert("Hata", "Kullanıcı adı veya şifre hatalı!");
            }
        } catch (error) {
            console.error("Bağlantı hatası:", error);
            Alert.alert("Bağlantı hatası", "Sunucuya ulaşılamıyor.");
        } finally {
            setLoading(false);
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
                autoCapitalize="none"
            />
            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                keyboardType="ascii-capable"
            />

            <TouchableOpacity 
                style={[styles.button, (loading || !username || !password) && styles.disabledButton]} 
                onPress={handleLogin}
                disabled={loading || !username || !password}
            >
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Sign in</Text>}
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
    logo: {
        width: 130,
        height: 130,
        marginBottom: 20,
        resizeMode: 'contain',
        borderRadius: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 30,
        color: '#ff66b2',
        fontFamily: 'georgia',
    },
    input: {
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
    },
    buttonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'georgia'
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
});

export default LoginScreen;
