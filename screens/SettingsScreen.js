import React, {Component} from 'react';
import { StyleSheet, Text, View, Button, AppRegistry, Image } from 'react-native';
import firebase from 'firebase';
import { FontAwesome } from '@expo/vector-icons';

var user
var name, email, userPhoto;

class SettingsScreen extends Component {


  componentWillMount = () => {
    this.getUserInfo();
  };

  //get the user infos from firebase
  getUserInfo = () => {
    user = firebase.auth().currentUser;
    if (user != null) {
      name = user.displayName;
      email = user.email;
      userPhoto = user.photoURL;
    }
  };

  //show some informations about the user, TODO I want that the user can change this info
  render(){
      return(
        <View style={styles.container}>
          <View>
            <Text></Text>
            <Text></Text>
            <Text></Text>
            <FontAwesome.Button 
            name="chevron-left" 
            backgroundColor="transparent"
            color="black"
            size={30}
            onPress= {() => {this.props.navigation.navigate('DashBoardScreen')}}>
            </FontAwesome.Button>
          </View>  
          <View style={styles.titleBarView}>
            <Text style={styles.titleBarText}>Settings</Text>
          </View>
          <View style={styles.bodyView}> 

            <Image
              style={{ width: 100, height: 100, borderRadius:100 }}
              source={{ uri: userPhoto}}
            />
            <Text style={styles.bodyText}>Name: {name}</Text>
            <Text style={styles.bodyText}>E-mail: {email}</Text>
            <FontAwesome.Button 
                  name="power-off"
                  backgroundColor="#FF0000" 
                  onPress ={() => {firebase.auth().signOut()}}>
                  Log out
                </FontAwesome.Button>
            
          </View>
        </View>               
      );
  }
}

export default SettingsScreen;

const defaultFont = {
  fontWeight: 'bold',
  fontSize: 40,
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#add8e6',
    //alignItems: 'center',
    //justifyContent: 'center',
  },
  titleBarView: {
    flex: 2,
    backgroundColor: '#add8e6',
    alignItems: 'center',
    justifyContent:'flex-start',
  },
  titleBarText:{
    ...defaultFont,
  },
  bodyView:{
    flex:14,
    backgroundColor: 'rgb(255,255,255)',
    alignItems:'center',
    justifyContent: 'flex-start',
    paddingTop:10,
  },
  bodyText:{
    fontWeight: 'bold',
    fontSize: 20 ,
    paddingBottom:10,
  },
});
