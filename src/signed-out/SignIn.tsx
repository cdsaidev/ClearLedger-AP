import React, { Fragment } from 'react';
import { StyleSheet, View, Dimensions } from 'react-native';
import { Button, Theme, withTheme } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { NavigationParams } from 'react-navigation';
import Hero from '../components/Hero';
import ProviderButton from '../components/ProviderButton';
import EmailPassword from '../providers/EmailPassword';
import Facebook from '../providers/Facebook';
import theme from '../theme'
interface Props {
  navigation: NavigationParams;
}

function SignIn({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.main}>

        <Facebook />
        <ProviderButton
          type="phone"
          onPress={() => navigation.navigate('PhoneSignIn')}>
          Sign in with phone number
        </ProviderButton>
      </View>
    </View>



  );
}
let deviceHeight = Dimensions.get('window').height
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor:'#fff',
    // justifyContent:'flex-start'

  },
  main: {
    alignItems:'center',
    marginTop: deviceHeight * .09,
    marginHorizontal: deviceHeight * .14,
    // marginBottom: deviceHeight * .7
  }
});

export default SignIn;
