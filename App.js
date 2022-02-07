import React, {Component} from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {createAppContainer, createSwitchNavigator} from 'react-navigation';
import LoginScreen from './screens/LoginScreen';
import LoadingScreen from './screens/LoadingScreen';
import DashBoardScreen from './screens/DashBoardScreen';
import SettingsScreen from './screens/SettingsScreen';
import firebase from 'firebase'
import { firebaseConfig } from './config';

 //inizializa app in firebase
 firebase.initializeApp(firebaseConfig)


 export default function App() {

   return ( <
     AppNavigator / >
   );
 }

 //create an app navigator with all the screen
 const appSwitchNavigator = createSwitchNavigator({
   LoadingScreen: LoadingScreen,
   LoginScreen: LoginScreen,
   DashBoardScreen: DashBoardScreen,
   SettingsScreen: SettingsScreen
 });

 const AppNavigator = createAppContainer(appSwitchNavigator);

 const styles = StyleSheet.create({
   container: {
     flex: 1,
     backgroundColor: '#fff',
     alignItems: 'center',
     justifyContent: 'center',
   },
 });
