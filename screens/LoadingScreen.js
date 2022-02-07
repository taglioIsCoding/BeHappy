import React, {Component} from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import firebase from 'firebase';


class LoadingScreen extends Component {

  componentDidMount() {
    this.checkIfLoggedIn();
  }

  //this method check if the user is alredy logged in 
  checkIfLoggedIn = () => {
    firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        this.props.navigation.navigate('DashBoardScreen')
      } else {
        this.props.navigation.navigate('LoginScreen')
      }
    }.bind(this))
  };

  //this screen render only a wheel during the execution
  render(){
      return(
          <View style ={styles.container}>
              <ActivityIndicator size='large'></ActivityIndicator>
          </View>
      );
  }
}

export default LoadingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#add8e6',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
