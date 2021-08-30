import React from 'react';
import { Text, ActivityIndicator, StyleSheet, View, Platform } from 'react-native';
import { PRIMARYBUTTONCOLOR } from '../config';

export class Loading extends React.Component {
	render() {
		return (
			<View style={styles.wrapper} >
				<ActivityIndicator style={styles.loader} color={PRIMARYBUTTONCOLOR} size='large'/>
			</View>
		)
	}
}
const styles = StyleSheet.create({
	wrapper: {
		position: 'absolute',
		width: '100%',
		height: '100%',
		zIndex: 20,
	},
	loader: {
		position: 'absolute',
		zIndex: 30,
		left: '50%',
		top: '50%',
		marginTop: -20,
		marginLeft: -15,
	}
});