import React from 'react';
import {StyleSheet, View, Dimensions} from 'react-native';
import Phone from '../providers/Phone';

function PhoneSignIn() {
  return (
    <View style={styles.container}>
      <View style={styles.main}>
      <Phone />
      </View>
      
    </View>
  );
}
let deviceHeight = Dimensions.get('window').height
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'#fff'
    // justifyContent:'flex-start'

  },
  main: {
    alignItems:'center',
    marginTop: deviceHeight * .09,
    marginHorizontal: deviceHeight * .14,
    // marginBottom: deviceHeight * .7
  }
});

export default PhoneSignIn;
