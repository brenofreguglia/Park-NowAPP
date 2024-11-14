import React from "react";
import { TouchableOpacity, StyleSheet, Dimensions, Image} from "react-native";
import { Texto } from "./Textos";

const Lg = Dimensions.get('screen').width

const Button = ({texto, acao, color,  width, borda, height, texcolor, margin, padding}) => {
    return (

        <TouchableOpacity style = {[styles.botoes,
        {backgroundColor: color, 
        width: width, 
        height: height, 
        borderRadius: borda,
        margin:margin,
        padding: padding
        }]}  
        onPress={acao} >
            
            <Texto 
            msg={texto} 
            cor={texcolor} 
            tamanho={17}/>
    </TouchableOpacity>

    )
}

 const ButtonTitle = ({acao, Bordacolor,  width, borda, height, bordaWi}) => {
    return (

    <TouchableOpacity  onPress={acao}>
        <Image
            style = {{width: 50, height: 50, borderRadius: 50, borderColor: "#000000", borderWidth: 1,}}

            source={require("../../assets/Imgs/Avatar Home.png")}
        />
    </TouchableOpacity>
    )
 }

const styles = StyleSheet.create({
    texto:{
        textAlign: "center",
        fontWeight: "bold",
        color: "white",
        fontSize: 18,
    },

    botoes:{
        margin: 10,
        borderRadius: 20,
        width: Lg / 2,
        justifyContent: "center",
        alignItems: "center"

    },
})
export {Button, ButtonTitle}