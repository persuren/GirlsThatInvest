import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Image, ActivityIndicator, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ onLogin, navigation }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Sabit kullanıcı bilgileri
    const validUsername = "admin";
    const validPassword = "1234";

    const handleLogin = async () => {
        if (!username || !password) {
            Alert.alert("Error", "Username or password is incorrect!");
            return;
        }

        setLoading(true);
        try {
            const response = await fetch("http://10.0.2.2:5001/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();
            if (response.ok) {
                onLogin(); // Ana ekrana yönlendirme
            } else {
                Alert.alert("Error", data.error || "Username or password is incorrect!");
            }
        } catch (error) {
            Alert.alert("Connection error", "The server cannot be reached.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.spacer} />
            <Text style={styles.header}>Girls That Invest</Text>
            <View style={styles.centerBox}>
                <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
                <Text style={styles.label}>USERNAME</Text>
                <TextInput
                    style={styles.input}
                    placeholder="johndoe"
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                />
                <Text style={styles.label}>PASSWORD</Text>
                <TextInput
                    style={styles.input}
                    placeholder="******"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                {/* Butonlar */}
                <View style={styles.buttonsContainer}>
                    <TouchableOpacity 
                        style={[styles.button, (loading || !username || !password) && styles.disabledButton]} 
                        onPress={handleLogin}
                        disabled={loading || !username || !password}
                    >
                        {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Log in</Text>}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.googleButton}>
                        <Text style={styles.googleButtonText}>sign in with GOOGLE</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.bottomLinks}>
                <TouchableOpacity>
                    <Text style={styles.bottomLinkText}>Forgot Password?</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                    <Text style={styles.bottomLinkText}>Signup!</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const INPUT_WIDTH = Math.min(width * 0.7, 300);
const BUTTON_WIDTH = Math.min(width * 0.35, 150);
const GOOGLE_BUTTON_WIDTH = Math.min(width * 0.425, 175);

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f6bfe0',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    spacer: {
        height: height * 0.10,
    },
    header: {
        fontSize: 36,
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
    centerBox: {
        width: '100%',
        alignItems: 'center',
        marginTop: 40,
    },
    logo: {
        width: 110,
        height: 110,
        marginBottom: 18,
        borderRadius: 24,
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
        marginLeft: (width - INPUT_WIDTH) / 2,
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 12,
        paddingHorizontal: 14,
        paddingVertical: 10,
        fontSize: 16,
        marginBottom: 6,
        borderWidth: 2,
        borderColor: '#a8326e',
        fontFamily: 'georgia',
        width: INPUT_WIDTH,
    },
    buttonsContainer: {
        marginTop: 40,
        width: '100%',
        paddingHorizontal: (width - INPUT_WIDTH) / 2,
    },
    button: {
        backgroundColor: '#bb0073', // PEMBE renk
        borderRadius: 12,
        paddingVertical: 12,
        width: BUTTON_WIDTH,
        alignItems: 'center',
        alignSelf: 'flex-end', // sağa yaslı
        marginBottom: 120,
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
    disabledButton: {
        backgroundColor: '#ccc',
    },
    googleButton: {
        backgroundColor: '#b24e8b',
        borderRadius: 10,
        paddingVertical: 10,
        alignItems: 'center',
        alignSelf: 'center', // ortala
        width: GOOGLE_BUTTON_WIDTH,
        marginTop: 40,
    },
    googleButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: 'bold',
        letterSpacing: 1.1,
    },
    bottomLinks: {
        position: 'absolute',
        bottom: 32,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        width: '100%',
        paddingHorizontal: 8,
    },
    bottomLinkText: {
        color: '#a8326e',
        textDecorationLine: 'underline',
        fontSize: 14,
        fontWeight: 'bold',
        marginHorizontal: 16,
    },
});

export default LoginScreen;
