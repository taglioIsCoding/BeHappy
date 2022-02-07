import React, {Component} from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import * as Google from 'expo-google-app-auth';
import firebase from 'firebase';
import { FontAwesome } from '@expo/vector-icons';

class LoginScreen extends Component {

  isUserEqual = (googleUser, firebaseUser) => {
    if (firebaseUser) {
      var providerData = firebaseUser.providerData;
      for (var i = 0; i < providerData.length; i++) {
        if (
          providerData[i].providerId ===
          firebase.auth.GoogleAuthProvider.PROVIDER_ID &&
          providerData[i].uid === googleUser.getBasicProfile().getId()
        ) {
          // We don't need to reauth the Firebase connection.
          return true;
        }
      }
    }
    return false;
  };

  onSignIn = googleUser => {
    console.log('Google Auth Response', googleUser);
    // We need to register an Observer on Firebase Auth to make sure auth is initialized.
    var unsubscribe = firebase.auth().onAuthStateChanged(
      function (firebaseUser) {
        unsubscribe();
        // Check if we are already signed-in Firebase with the correct user.
        if (!this.isUserEqual(googleUser, firebaseUser)) {
          // Build Firebase credential with the Google ID token.
          var credential = firebase.auth.GoogleAuthProvider.credential(
            googleUser.idToken,
            googleUser.accessToken
          );
          // Sign in with credential from the Google user.
          firebase
            .auth()
            .signInAndRetrieveDataWithCredential(credential)
            .then(function (result) {
              console.log('user signed in ');
              if (result.additionalUserInfo.isNewUser) {
                firebase
                  .database()
                  .ref('/users/' + result.user.uid)
                  .set({
                    gmail: result.user.email,
                    profile_picture: result.additionalUserInfo.profile.picture,
                    first_name: result.additionalUserInfo.profile.given_name,
                    last_name: result.additionalUserInfo.profile.family_name,
                    created_at: Date.now()
                  })
                  .then(function (snapshot) {
                    // console.log('Snapshot', snapshot);
                  });
              } else {
                firebase
                  .database()
                  .ref('/users/' + result.user.uid)
                  .update({
                    last_logged_in: Date.now()
                  });
              }
            })
            .catch(function (error) {
              // Handle Errors here.
              var errorCode = error.code;
              var errorMessage = error.message;
              // The email of the user's account used.
              var email = error.email;
              // The firebase.auth.AuthCredential type that was used.
              var credential = error.credential;
              // ...
            });
        } else {
          console.log('User already signed-in Firebase.');
        }
      }.bind(this)
    );
  };

  //this method check in the users using firebase and google sing in method
  signInWithGoogleAsync = async () => {
    try {
      const result = await Google.logInAsync({
        androidClientId: '1003788420516-07epd1uvdk2d22gil74v5538im6h3ckc.apps.googleusercontent.com',
        iosClientId: '1003788420516-7923k9kfok0vp84sob40li1jnlegff1j.apps.googleusercontent.com',
        behavior: 'web',
        scopes: ['profile', 'email'],
      });
      if (result.type === 'success') {
        this.onSignIn(result);
        return result.accessToken;
      } else {
        return {
          cancelled: true
        };
      }
    } catch (e) {
      return {
        error: true
      };
    }
  }

    //this screen render only button for the login 
    render(){
        return(
          <View style={styles.container}>
            <Text></Text>
            <Text></Text>
            <Text></Text>
            <Text size={50}></Text>
            <View style={styles.titleBarView}>
            <Text style={styles.titleBarText}>Welcome!</Text>
            </View>
            <View style={styles.bodyView}>
              <FontAwesome.Button 
                name="google"
                backgroundColor="#FF0000" 
                onPress={() => this.signInWithGoogleAsync()}>
                Login with Google
              </FontAwesome.Button>
            </View>
          </View>
        );
    }
}

export default LoginScreen;

const defaultFont = {
  fontWeight: 'bold',
  fontSize: 50,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#add8e6',
    //alignItems: 'center',
    //justifyContent:'center',
  },
  titleBarView: {
    flex: 2,
    backgroundColor: '#add8e6',
    alignItems: 'center',
    justifyContent:'flex-end',
  },
  titleBarText:{
    ...defaultFont,
  },
  bodyView:{
    flex:14,
    backgroundColor: 'rgb(255,255,255)',
    alignItems:'center',
    justifyContent: 'center',
  },
});
