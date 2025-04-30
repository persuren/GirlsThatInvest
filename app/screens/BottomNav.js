import React, { useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function BottomNav({ navigation, active, onLogout }) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity
        style={[styles.navButton, active === "Home" && styles.activeNavButton]}
        onPress={() => navigation.navigate("Home")}
      >
        <Ionicons name="home" size={24} color="#ff1493" />
        <Text style={styles.navText}>Home</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.navButton, active === "Favorites" && styles.activeNavButton]}
        onPress={() => navigation.navigate("Favorites")}
      >
        <Ionicons name="heart" size={24} color="#ff1493" />
        <Text style={styles.navText}>Favorites</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.profileButton}
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="person-circle" size={30} color="#ff1493" />
        <Text style={styles.navText}>Profil</Text>
      </TouchableOpacity>
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={styles.menuBox}>
            {/* <TouchableOpacity style={styles.menuItem}><Text style={styles.menuText}>Ayarlar</Text></TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}><Text style={styles.menuText}>Bildirimler</Text></TouchableOpacity> */}
            <TouchableOpacity style={styles.menuItem} onPress={() => { setModalVisible(false); onLogout && onLogout(); }}>
              <Text style={[styles.menuText, { color: 'red' }]}>Oturumu Kapat</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 6,
    backgroundColor: '#fff0f5',
    width: '100%',
  },
  navButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    flexDirection: 'column',
  },
  activeNavButton: {
    borderBottomWidth: 2,
    borderBottomColor: '#ff1493',
  },
  navText: {
    color: '#ff1493',
    fontSize: 14,
    marginTop: 2,
    fontFamily: 'georgia',
  },
  profileButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
    flexDirection: 'column',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  menuBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 16,
    padding: 12,
    minWidth: 160,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  menuText: {
    fontSize: 16,
    fontFamily: 'georgia',
    color: '#333',
  },
}); 
