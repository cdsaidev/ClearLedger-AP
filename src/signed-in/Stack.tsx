import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React, { useContext } from 'react';
import { Theme, withTheme } from 'react-native-paper';
import Wander from './main/Wander';
import Settings from './main/Settings';
import { UserContext } from '../App';
import theme from '../theme';
import CompleteAccountCreation from './intro/CompleteAccountCreation';
import PublicProfile from './main/PublicProfile';
import { Animated } from 'react-native';
import Profile from './main/Profile';
interface Props {
  theme: Theme;
}
const { add, multiply } = Animated;
function conditional(
  condition: Animated.AnimatedInterpolation,
  main: Animated.AnimatedInterpolation,
  fallback: Animated.AnimatedInterpolation
) {
  // To implement this behavior, we multiply the main node with the condition.
  // So if condition is 0, result will be 0, and if condition is 1, result will be main node.
  // Then we multiple reverse of the condition (0 if condition is 1) with the fallback.
  // So if condition is 0, result will be fallback node, and if condition is 1, result will be 0,
  // This way, one of them will always be 0, and other one will be the value we need.
  // In the end we add them both together, 0 + value we need = value we need
  return add(
    multiply(condition, main),
    multiply(
      condition.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0],
      }),
      fallback
    )
  );
    }
const forFade =  ({closing, current, index, insets, inverted, next, layouts, swiping}:any) => {
 
  const progress = add(
    current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    }),
    next
      ? next.progress.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 1],
          extrapolate: 'clamp',
        })
      : 0
  );

  const opacity = progress.interpolate({
    inputRange: [0, 0.8, 1, 1.2, 2],
    outputRange: [0, 0.5, 1, 0.33, 0],
  });

  const scale = conditional(
    closing,
    current.progress.interpolate({
      inputRange: [0, 1],
      outputRange: [0.9, 1],
      extrapolate: 'clamp',
    }),
    progress.interpolate({
      inputRange: [0, 1, 2],
      outputRange: [0.85, 1, 1.1],
    })
  );

  return {
    containerStyle: {
      opacity,
      transform: [{ scale }],
    },
  }
}
const Stack = createStackNavigator();
function SignedInStack() {
  const user = useContext(UserContext);

  function main() {
    return <NavigationContainer>
      <Stack.Navigator

        screenOptions={{
          headerShown: false,
          headerStyle: {
            backgroundColor: theme.colors.light.primary,
          },
          headerTintColor: theme.colors.light.accent,
        }
        }

        >
        <Stack.Screen
          name="Wander"
          component={Wander}
  
        />
          <Stack.Screen
          name="Profile"
          component={Profile}
  
        />
           <Stack.Screen
          name="PublicProfile"
          component={PublicProfile}
          options={{ cardStyleInterpolator: forFade }}
      
          
        />
        <Stack.Screen name="Settings" component={Settings} />
      </Stack.Navigator>
    </NavigationContainer>
  }
  function intro() {
    return <NavigationContainer>
    <Stack.Navigator
    screenOptions={{
         
      headerTitle:"",
      headerBackTitle:"",            
      headerBackTitleVisible:false,
      headerTransparent:true,
      headerStyle: {
        height: 100,
        backgroundColor: theme.colors.light.background,
      },
      headerTintColor: theme.colors.light.text.heading,
    }}
      >
      <Stack.Screen
        name="CompleteAccountCreation"
        component={CompleteAccountCreation}
      />
    </Stack.Navigator>
  </NavigationContainer>
  }

  return !user?.email ? main() : intro()
}

export default SignedInStack
