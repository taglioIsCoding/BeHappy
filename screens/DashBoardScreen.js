import React, {Component} from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity, Alert } from 'react-native';
import * as Permissions from 'expo-permissions';
import {Notifications} from 'expo';
import firebase from 'firebase';
import { FontAwesome } from '@expo/vector-icons';
import CountDown from 'react-native-countdown-component';
//ExponentPushToken[vJDebiNLSVcQd9JGJHRiCt]
let token
let complimentToUse

class DashBoardScreen extends Component {

  async componentWillMount() {
    this.currentUser = await firebase.auth().currentUser
    await this.registerForPushNotificationsAsync()
    
  }

  registerForPushNotificationsAsync = async () => {
    const {
      status
    } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
    // only asks if permissions have not already been determined, because
    // iOS won't necessarily prompt the user a second time.
    // On Android, permissions are granted on app installation, so
    // `askAsync` will never prompt the user

    // Stop here if the user did not grant permissions
    if (status !== 'granted') {
      alert('No notification permissions!');
      return;
    }

    try {
      // Get the token that identifies this device
      token = await Notifications.getExpoPushTokenAsync();

      // POST the token to your backend server from where you can retrieve it to send push notifications.
      firebase.database().ref('users/' + this.currentUser.uid + '/push_token')
        .set(token)
    } catch (error) {
      console.log(error)
    }
  }


  calculateHour = () => {
      var today = new Date();
      var time = today.getHours()*60*60+today.getMinutes()*60+today.getSeconds()
      var timeToTommorow = 60*60*24 - time
      var timeTo12 = timeToTommorow + 60*60*12
      //console.log('time: '+time)
      //console.log('one day: '+60*60*24)
      //console.log('time to tomerrow: '+timeToTommorow)
      //console.log('time to use: '+timeTo12)
      if (timeTo12>60*60*24){
        return timeTo12-60*60*24
      }else{
        return timeTo12
      }
  }

  bonusComplimet = () =>{
    //console.log('onNameSelected', e);
    //console.log(e.nativeEvent.text);
    fetch('https://complimentr.com/api')
      .then(r => r.json())
      .then( body => {
        console.log(body.compliment);
        complimentToUse = body.compliment;
        this.alertToUser();
      });
  };

  alertToUser =() =>{
    Alert.alert(
      'Hey! ',
      /*'Welcome!',*/
      complimentToUse,
      [
        {
          text: 'Oh, Thank you',
          onPress: () => {this.setState({name:''}); 
          console.log('Thank u')}, 
          style: 'cancel'
        },
      ],
      { cancelable: false }
    )
  }

  render(){
      return(
        <View style={styles.container}>
          <Text></Text>
          <Text></Text>
          <Text></Text>
          <FontAwesome.Button 
            name="gear" 
            backgroundColor="transparent"
            color="black"
            size={30}
            onPress= {() => {this.props.navigation.navigate('SettingsScreen')}}>
            </FontAwesome.Button>
          <View style={styles.titleBarView}>
              <Text style={styles.titleBarText}>Be Happy!</Text>
          </View>
          <View style={styles.bodyView}> 
            <Text
              style={styles.countDownText}>
              The next complimet will arrive in:
              </Text>
            <CountDown
              until={this.calculateHour()}
              onFinish={() => console.log('')}
              onPress={() => Alert.alert('Hi', 'Thak u for your download')}
              size={25}
              digitStyle={{backgroundColor: '#add8e6'}}
              digitTxtStyle={{color: '#000000'}}
            />
            <TouchableOpacity 
              style={styles.complimentButton}
              /*title='Give me a bonus compliment'
              onPress= {() => console.log('cioa') }
              style={styles.complimentButton}*/
              title="press me"
              onPress={() => this.bonusComplimet()}
              underlayColor='#000000'>
              <Text 
              style={styles.complimentButtonText}>
                Give me a bonus complimet!
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
  }
}

export default DashBoardScreen;

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
    justifyContent: 'center',
  },
  complimentButton:{
    marginRight:40,
    marginLeft:40,
    marginTop:10,
    paddingTop:10,
    paddingBottom:10,
    backgroundColor:'#add8e6',
    borderRadius:10,
    borderWidth: 1,
    borderColor: '#fff'
  },
  complimentButtonText:{
    color:'black',
    textAlign:'center',
    paddingLeft : 10,
    paddingRight : 10,
    fontSize: 20,
    fontWeight:'bold'
  },
  countDownText:{
    fontWeight:'bold'
  },
});
/**
 * curl -H "Content-Type: application/json" -X POST "https://exp.host/--/api/v2/push/send" -d '{
  "to": 'ExponentPushToken[vJDebiNLSVcQd9JGJHRiCt]',
  "title":"hello",
  "body": "world"
}'
 */