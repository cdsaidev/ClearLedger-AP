import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Icon } from 'react-native-vector-icons/Icon';



interface Props {
    icon?:() => JSX.Element
  onPress: () => void;
  loading?: boolean;
  children: string;
  color:string;
  textColor:string;
  solid:boolean;
}


function CustomButton({icon,onPress, loading, children, color, solid, textColor }: Props) {
 
  return (
  <TouchableOpacity style={styles(color,solid,textColor).button} onPress={onPress}>
      {!icon ? (
        <View>
          <Text style={styles(color,solid,textColor).content}>{children}</Text>
        </View>
        
      ) : (
        <View style={stylesdefault.row}>
         {!loading && icon()}
        <Text style={[styles(color,solid,textColor).content,stylesdefault.withIcon]}>{children}</Text>
       </View>
      )}
     
  </TouchableOpacity>
  );
}

const stylesdefault = StyleSheet.create({
  row: {
    flexDirection:'row',
  },
  withIcon: {
    marginLeft:10
  }
})
const styles = (color:string,solid:boolean,textColor:string) => {
  let style = {
   
    button: {
      alignItems:'center',
      marginVertical:8,
      padding:13,
      width: 300,
      borderWidth:2,
      borderColor:color,
      backgroundColor:color,
      borderRadius: 150
    },
    content: {
       fontFamily:'Montserrat',
       fontSize:14,
       color:textColor
    }
  } as any
  if(!solid) style.button = {...style.button, backgroundColor:'transparent'}

  return StyleSheet.create(style)
}

 

export default CustomButton;